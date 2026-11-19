import assert from "node:assert/strict";
import test from "node:test";
import { Networks } from "@stellar/stellar-sdk";
import {
  getConfiguredStellarNetwork,
  getConfiguredNetworkPassphrase,
  formatConfiguredNetworkLabel,
  networkPassphrasesMatch,
} from "./stellar-network";

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("getConfiguredStellarNetwork defaults to testnet when unset", () => {
  delete process.env.NEXT_PUBLIC_STELLAR_NETWORK;
  assert.equal(getConfiguredStellarNetwork(), "testnet");
  assert.equal(getConfiguredNetworkPassphrase(), Networks.TESTNET);
  assert.equal(formatConfiguredNetworkLabel(), "TESTNET");
});

test("getConfiguredStellarNetwork resolves mainnet and public to mainnet", () => {
  process.env.NEXT_PUBLIC_STELLAR_NETWORK = "mainnet";
  assert.equal(getConfiguredStellarNetwork(), "mainnet");
  assert.equal(getConfiguredNetworkPassphrase(), Networks.PUBLIC);
  assert.equal(formatConfiguredNetworkLabel(), "PUBLIC");

  process.env.NEXT_PUBLIC_STELLAR_NETWORK = "public";
  assert.equal(getConfiguredStellarNetwork(), "mainnet");
  assert.equal(getConfiguredNetworkPassphrase(), Networks.PUBLIC);
  assert.equal(formatConfiguredNetworkLabel(), "PUBLIC");

  process.env.NEXT_PUBLIC_STELLAR_NETWORK = "MAINNET";
  assert.equal(getConfiguredStellarNetwork(), "mainnet");
});

test("getConfiguredStellarNetwork resolves unknown or testnet to testnet", () => {
  process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
  assert.equal(getConfiguredStellarNetwork(), "testnet");
  assert.equal(getConfiguredNetworkPassphrase(), Networks.TESTNET);
  assert.equal(formatConfiguredNetworkLabel(), "TESTNET");

  process.env.NEXT_PUBLIC_STELLAR_NETWORK = "futurenet";
  assert.equal(getConfiguredStellarNetwork(), "testnet");
});

test("networkPassphrasesMatch validates matching passphrases", () => {
  assert.equal(networkPassphrasesMatch(Networks.PUBLIC, Networks.PUBLIC), true);
  assert.equal(networkPassphrasesMatch(Networks.TESTNET, Networks.TESTNET), true);
  assert.equal(networkPassphrasesMatch(Networks.PUBLIC, Networks.TESTNET), false);
  assert.equal(networkPassphrasesMatch(Networks.PUBLIC, null), true);
  assert.equal(networkPassphrasesMatch(Networks.PUBLIC, undefined), true);
});
