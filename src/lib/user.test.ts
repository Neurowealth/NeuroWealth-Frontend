import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  adaptMockAuthUser,
  adaptApiUser,
  getUserInitials,
  truncateWalletAddress,
  getUserAddressLabel,
} from "./user";

describe("user module", () => {
  describe("getUserInitials", () => {
    it("extracts initials correctly", () => {
      assert.equal(getUserInitials("John Doe"), "JD");
      assert.equal(getUserInitials("Jane"), "J");
      assert.equal(getUserInitials("  foo  bar  "), "FB");
      assert.equal(getUserInitials(""), "??");
      assert.equal(getUserInitials("  "), "??");
    });
  });

  describe("truncateWalletAddress", () => {
    it("truncates long addresses", () => {
      assert.equal(truncateWalletAddress("0x1234567890abcdef1234567890abcdef"), "0x1234...cdef");
    });

    it("returns short addresses as is", () => {
      assert.equal(truncateWalletAddress("0x1234567890"), "0x1234567890");
    });

    it("returns already truncated addresses as is", () => {
      assert.equal(truncateWalletAddress("0x12...cdef"), "0x12...cdef");
    });
  });

  describe("getUserAddressLabel", () => {
    it("returns truncated label when address exists", () => {
      assert.equal(getUserAddressLabel({ walletAddress: "0x1234567890abcdef1234567890abcdef" }), "0x1234...cdef");
    });

    it("returns undefined when address is missing", () => {
      assert.equal(getUserAddressLabel({ walletAddress: undefined }), undefined);
    });
  });

  describe("adaptMockAuthUser", () => {
    it("uses name for display name", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "foo@example.com",
        name: "Foo Bar",
        createdAt: "2023-01-01",
      });
      assert.equal(user.displayName, "Foo Bar");
      assert.equal(user.avatarInitials, "FB");
    });

    it("falls back to email prefix for display name", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "foo@example.com",
        name: "",
        createdAt: "2023-01-01",
      });
      assert.equal(user.displayName, "foo");
      assert.equal(user.avatarInitials, "F");
    });

    it("falls back to wallet address", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "",
        name: "",
        walletAddress: "0xabc",
        createdAt: "2023-01-01",
      });
      assert.equal(user.displayName, "0xabc");
    });

    it("falls back to id", () => {
      const user = adaptMockAuthUser({
        id: "usr-123",
        email: "",
        name: "",
        createdAt: "2023-01-01",
      });
      assert.equal(user.displayName, "usr-123");
    });

    it("defaults role to user", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "test@example.com",
        name: "Test",
        createdAt: "2023-01-01",
      });
      assert.equal(user.role, "user");
    });

    it("passes through explicit role", () => {
      const user = adaptMockAuthUser({
        id: "1",
        email: "test@example.com",
        name: "Test",
        createdAt: "2023-01-01",
        role: "admin",
      });
      assert.equal(user.role, "admin");
    });
  });

  describe("adaptApiUser", () => {
    it("uses displayName", () => {
      const user = adaptApiUser({
        id: "1",
        displayName: "API Name",
        name: "Other Name",
      });
      assert.equal(user.displayName, "API Name");
    });

    it("falls back to name, then email, then wallet, then id", () => {
      assert.equal(adaptApiUser({ id: "1", name: "Other Name" }).displayName, "Other Name");
      assert.equal(adaptApiUser({ id: "1", email: "test@x.com" }).displayName, "test");
      assert.equal(adaptApiUser({ id: "1", address: "0xabc" }).displayName, "0xabc");
      assert.equal(adaptApiUser({ id: "1" }).displayName, "1");
    });

    it("picks walletAddress or address", () => {
      assert.equal(adaptApiUser({ id: "1", walletAddress: "0x123" }).walletAddress, "0x123");
      assert.equal(adaptApiUser({ id: "1", address: "0x456" }).walletAddress, "0x456");
    });

    it("picks avatarUrl or avatar", () => {
      assert.equal(adaptApiUser({ id: "1", avatarUrl: "url1" }).avatarUrl, "url1");
      assert.equal(adaptApiUser({ id: "1", avatar: "url2" }).avatarUrl, "url2");
    });

    it("defaults to 'User' if everything is empty or whitespace", () => {
      const user = adaptApiUser({
        id: "  ",
        displayName: "  ",
        name: "",
        email: null,
      });
      assert.equal(user.displayName, "User");
    });

    it("defaults role to user", () => {
      const user = adaptApiUser({
        id: "1",
      });
      assert.equal(user.role, "user");
    });

    it("passes through explicit role", () => {
      const user = adaptApiUser({
        id: "1",
        role: "admin",
      });
      assert.equal(user.role, "admin");
    });
  });
});
