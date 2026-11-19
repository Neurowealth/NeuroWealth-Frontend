#!/usr/bin/env node

/**
 * Validate package.json and tsconfig.json for common issues.
 * Can be used as a pre-commit hook or CI step.
 */

const fs = require("fs");
const path = require("path");

const errors = [];

// Validate package.json
try {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  console.log("Validating package.json...");

  if (!pkg.name) errors.push("package.json: Missing required field 'name'");
  if (!pkg.packageManager)
    errors.push("package.json: Missing required field 'packageManager'");
  if (!pkg.scripts)
    errors.push("package.json: Missing required field 'scripts'");
  if (!pkg.dependencies)
    errors.push("package.json: Missing required field 'dependencies'");

  console.log("✓ package.json is valid");
} catch (e) {
  errors.push(`package.json: ${e.message}`);
}

// Validate tsconfig.json
try {
  const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));

  console.log("Validating tsconfig.json...");

  if (!tsconfig.compilerOptions)
    errors.push("tsconfig.json: Missing required field 'compilerOptions'");
  if (!tsconfig.include)
    errors.push("tsconfig.json: Missing required field 'include'");

  // Check for duplicate keys (common merge conflict issue)
  const content = fs.readFileSync(tsconfigPath, "utf8");
  const lines = content.split("\n");
  const keys = {};

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/"([^"]+)"\s*:/);
    if (match) {
      const key = match[1];
      if (keys[key]) {
        errors.push(
          `tsconfig.json: Duplicate key '${key}' at lines ${keys[key]} and ${i + 1}`
        );
      } else {
        keys[key] = i + 1;
      }
    }
  }

  console.log("✓ tsconfig.json is valid");
} catch (e) {
  errors.push(`tsconfig.json: ${e.message}`);
}

// Report results
if (errors.length > 0) {
  console.error("\n❌ Validation failed:\n");
  errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log("\n✅ All config files are valid");
  process.exit(0);
}
