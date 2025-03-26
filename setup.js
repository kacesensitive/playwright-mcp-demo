// Setup script for installing Playwright browsers
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Setting up Playwright MCP demo...");

// Check if package.json exists
if (!fs.existsSync("package.json")) {
  console.error(
    "package.json not found. Please run this script in the project root directory."
  );
  process.exit(1);
}

try {
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync("node_modules")) {
    console.log("Installing dependencies...");
    execSync("npm install", { stdio: "inherit" });
  }

  // Install Playwright browsers
  console.log("Installing Playwright browsers...");
  execSync("npx playwright install chromium", { stdio: "inherit" });

  // Update README with information about the package structure
  console.log("Updating documentation...");
  const readmePath = path.resolve("./README.md");

  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, "utf8");

    // Add a note about the package structure
    if (!readme.includes("## Note About Package Structure")) {
      const note = `\n## Note About Package Structure

This demo uses the current @playwright/mcp package structure which may differ from previous versions.
The implementation uses direct imports from the package with CommonJS:

\`\`\`javascript
const { chromium } = require('@playwright/test');
const { Server } = require('@playwright/mcp/lib/server');
\`\`\`

Rather than the previously documented approach:

\`\`\`javascript
import { createServer } from '@playwright/mcp';
\`\`\`

The package structure may change in future versions, so please check the official documentation
for the most up-to-date usage information.

As of the current version, we recommend using the simple demo approach which avoids direct programmatic usage
of the internal MCP API:

\`\`\`javascript
// Start the Playwright MCP server in a separate process
const mcpProcess = spawn('npx', ['@playwright/mcp'], {
  stdio: 'inherit'
});

// Then use Playwright directly
const browser = await chromium.launch();
const page = await browser.newPage();
// ... continue with standard Playwright API
\`\`\`
`;

      // Insert before the Learn More section
      const learnMoreIndex = readme.indexOf("## Learn More");
      if (learnMoreIndex !== -1) {
        readme =
          readme.slice(0, learnMoreIndex) + note + readme.slice(learnMoreIndex);
      } else {
        readme += note;
      }

      fs.writeFileSync(readmePath, readme);
    }
  }

  console.log("\n✅ Setup completed successfully!");
  console.log("\nYou can now run the demos:");
  console.log("  npm run demo:simple    - Run the simple demo (recommended)");
  console.log("  npm start              - Run the basic demo");
  console.log("  npm run demo:website   - Run the website interaction demo");
  console.log("  npm run demo:form      - Run the form filling demo");
} catch (error) {
  console.error("Setup failed:", error.message);
  process.exit(1);
}
