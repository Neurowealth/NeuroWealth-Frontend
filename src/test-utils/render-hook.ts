/**
 * Re-exports renderHook and act from @testing-library/react
 * after ensuring jsdom globals are initialized.
 */
import { setupDomGlobals } from "../test-setup";
setupDomGlobals();

export { renderHook, act } from "@testing-library/react";
