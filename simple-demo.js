// Simple demo using Playwright MCP via CLI
const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");
const path = require("path");

/**
 * This demo shows how to use Playwright MCP in a simplified way:
 * 1. We launch the Playwright MCP CLI as a separate process
 * 2. We use Playwright directly to interact with a website
 */
async function main() {
  console.log("Starting simple Playwright MCP demo...");

  // Start the Playwright MCP server in a separate process
  const mcpProcess = spawn("npx", ["@playwright/mcp"], {
    stdio: "inherit",
  });

  console.log("Playwright MCP server started in a separate process");
  console.log("Wait a few seconds for it to initialize...");

  // Wait for the server to start
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Now use Playwright directly
  console.log("Launching browser with Playwright...");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to a URL
    console.log("Navigating to example.com...");
    await page.goto("https://example.com");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Get the page title
    const title = await page.title();
    console.log("Page title:", title);

    // Find and click on a link
    console.log("Finding and clicking on a link...");
    const link = await page.getByRole("link").first();

    if (link) {
      const linkText = await link.textContent();
      console.log("Found link:", linkText);

      // Click on the link
      await link.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Get the new page title
      const newTitle = await page.title();
      console.log("New page title:", newTitle);
    }

    // Wait a moment before closing
    console.log("Demo completed. Closing browser in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error("Error during demo:", error);
  } finally {
    // Close the browser
    await browser.close();

    // Kill the MCP process
    mcpProcess.kill();

    console.log("Demo finished.");
  }
}

main().catch(console.error);
