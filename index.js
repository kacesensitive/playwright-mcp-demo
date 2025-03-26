// Basic Playwright MCP Demo
const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");

/**
 * This demo shows how to programmatically use Playwright to:
 * 1. Navigate to a website
 * 2. Interact with elements
 * 3. Close the browser
 *
 * It runs the Playwright MCP server in the background as a CLI process.
 */
async function main() {
  console.log("Starting Playwright MCP demo...");

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

    // Find a link to click on
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

    // Take a screenshot
    console.log("Taking a screenshot...");
    await page.screenshot({ path: "example-page.png" });
    console.log("Screenshot saved to example-page.png");

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
