/**
 * Side-effect-only import that initializes jsdom globals before any other
 * module in the importing file evaluates. This matters specifically for
 * `@testing-library/user-event`, which reads `globalThis.document` once at
 * its own module-evaluation time (not lazily when `userEvent.setup()` is
 * called). Because ES module dependencies are evaluated in import order
 * before the importing file's own top-level statements run, a plain
 * `import { setupDomGlobals } from "@/test-setup"; setupDomGlobals();` in the
 * test file is always too late — user-event's import is also hoisted and
 * evaluates before that call. Importing this module *before* importing
 * `@testing-library/user-event` ensures jsdom globals exist first.
 */
import { setupDomGlobals } from "../test-setup";

setupDomGlobals();
