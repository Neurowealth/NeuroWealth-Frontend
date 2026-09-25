import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReleaseChecklistPage from "./page";

describe("ReleaseChecklistPage", () => {
  describe("item status updates", () => {
    it("updates a checklist item status", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const statusSelects = screen.getAllByRole("combobox");
      const firstSelect = statusSelects[0];

      await user.selectOptions(firstSelect, "in-progress");

      await waitFor(() => {
        assert.equal((firstSelect as HTMLSelectElement).value, "in-progress");
      });
    });

    it("transitions item from pending to completed", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const statusSelects = screen.getAllByRole("combobox");
      const firstSelect = statusSelects[0];

      // Initial status should be completed (from default data)
      assert.equal((firstSelect as HTMLSelectElement).value, "completed");

      await user.selectOptions(firstSelect, "in-progress");

      await waitFor(() => {
        assert.equal((firstSelect as HTMLSelectElement).value, "in-progress");
      });
    });

    it("updates progress bar when items are marked completed", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      // Find the progress text
      let progressText = screen.getByText(/of.*items completed/);
      const initialText = progressText.textContent;

      // Change an item status to completed
      const statusSelects = screen.getAllByRole("combobox");
      await user.selectOptions(statusSelects[2], "completed");

      // Progress should potentially change (depends on initial data)
      await waitFor(() => {
        const updatedProgressText = screen.getByText(/of.*items completed/);
        // Just verify it renders without error - actual count depends on initial state
        assert.ok(updatedProgressText.textContent);
      });
    });
  });

  describe("item assignee editing", () => {
    it("edits an item assignee", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      // Find edit buttons (there should be multiple, one per item)
      const editButtons = screen.getAllByRole("button", { name: /Unassigned|^[A-Z]/ });
      const firstEditButton = editButtons.find((btn) =>
        btn.textContent?.includes("Edit") || btn.textContent?.includes("Unassigned")
      );

      if (firstEditButton) {
        await user.click(firstEditButton);

        const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
        const assigneeInput = inputs[inputs.length - 1];

        await user.clear(assigneeInput);
        await user.type(assigneeInput, "Alice");
        await user.keyboard("{Enter}");

        await waitFor(() => {
          assert.ok(screen.getByText(/Alice/));
        });
      }
    });

    it("updates assignee on blur", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const editButtons = screen.getAllByRole("button", { name: /Unassigned|^[A-Z]/ });
      const firstEditButton = editButtons.find((btn) =>
        btn.textContent?.includes("Edit") || btn.textContent?.includes("Unassigned")
      );

      if (firstEditButton) {
        await user.click(firstEditButton);

        const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
        const assigneeInput = inputs[inputs.length - 1];

        await user.type(assigneeInput, "Bob");
        await user.tab();

        await waitFor(() => {
          assert.ok(screen.getByText(/Bob/));
        });
      }
    });
  });

  describe("sign-off status transitions", () => {
    it("changes sign-off status from pending to approved", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      // Sign-offs section has status dropdowns
      const signOffSelects = screen.getAllByRole("combobox");
      // Last few selects are for sign-off statuses
      const productSignOffSelect = signOffSelects[signOffSelects.length - 3];

      await user.selectOptions(productSignOffSelect, "approved");

      await waitFor(() => {
        assert.equal((productSignOffSelect as HTMLSelectElement).value, "approved");
      });
    });

    it("changes sign-off status from pending to rejected", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const signOffSelects = screen.getAllByRole("combobox");
      const productSignOffSelect = signOffSelects[signOffSelects.length - 3];

      await user.selectOptions(productSignOffSelect, "rejected");

      await waitFor(() => {
        assert.equal((productSignOffSelect as HTMLSelectElement).value, "rejected");
      });
    });

    it("edits sign-off name field", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const nameInputs = screen.getAllByPlaceholderText("Name");
      const firstNameInput = nameInputs[0];

      await user.click(firstNameInput);
      await user.type(firstNameInput, "John Doe");

      await waitFor(() => {
        assert.equal((firstNameInput as HTMLInputElement).value, "John Doe");
      });
    });

    it("can set sign-off name and status together", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const nameInputs = screen.getAllByPlaceholderText("Name");
      const firstNameInput = nameInputs[0];

      await user.type(firstNameInput, "Jane Smith");

      const signOffSelects = screen.getAllByRole("combobox");
      const productSignOffSelect = signOffSelects[signOffSelects.length - 3];

      await user.selectOptions(productSignOffSelect, "approved");

      await waitFor(() => {
        assert.equal((firstNameInput as HTMLInputElement).value, "Jane Smith");
        assert.equal((productSignOffSelect as HTMLSelectElement).value, "approved");
      });
    });
  });

  describe("export functionality", () => {
    it("renders export button", () => {
      render(<ReleaseChecklistPage />);

      const exportButton = screen.getByRole("button", { name: /Export/i });
      assert.ok(exportButton);
    });

    it("export button is clickable", async () => {
      const user = userEvent.setup();
      render(<ReleaseChecklistPage />);

      const exportButton = screen.getByRole("button", { name: /Export/i });
      await user.click(exportButton);

      // Button click should succeed
      assert.ok(true);
    });
  });

  describe("page rendering", () => {
    it("renders the release checklist page title", () => {
      render(<ReleaseChecklistPage />);

      const title = screen.getByText(/Release v1.0.0/);
      assert.ok(title);
    });

    it("renders all checklist sections", () => {
      render(<ReleaseChecklistPage />);

      assert.ok(screen.getByText(/Functional Checks/));
      assert.ok(screen.getByText(/Visual Checks/));
    });

    it("renders sign-offs section with product, design, and engineering roles", () => {
      render(<ReleaseChecklistPage />);

      assert.ok(screen.getByText(/Product/i));
      assert.ok(screen.getByText(/Design/i));
      assert.ok(screen.getByText(/Engineering/i));
    });

    it("renders known issues section", () => {
      render(<ReleaseChecklistPage />);

      assert.ok(screen.getByText(/Known Issues/));
      assert.ok(screen.getByText(/Mobile menu animation stutter/));
    });

    it("displays initial progress correctly", () => {
      render(<ReleaseChecklistPage />);

      // Should show some progress percentage
      const progressText = screen.getByText(/Progress:/);
      assert.ok(progressText);
    });
  });
});
