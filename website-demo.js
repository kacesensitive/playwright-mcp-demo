// Website interaction demo with Playwright MCP
const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * This demo shows how to interact with a more complex website using Playwright.
 * It navigates to a search engine, performs a search, and interacts with results.
 *
 * It runs the Playwright MCP server in the background as a CLI process.
 */
async function main() {
  console.log("Starting Playwright MCP website interaction demo...");

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
    // Navigate to a search engine (using Google instead of Bing which may be more reliable)
    console.log("Navigating to Google...");
    await page.goto("https://www.google.com");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Get the page title
    const title = await page.title();
    console.log("Page title:", title);

    // Take a screenshot of the initial page
    await page.screenshot({ path: "search-page.png" });
    console.log("Screenshot of search page saved to search-page.png");

    // Find and interact with the search input
    console.log("Finding search input...");

    // Try multiple selectors to find the search input
    // Some search engines have different structures
    const searchInput = await Promise.any(
      [
        page.getByRole("combobox", { name: "Search" }).first(),
        page.getByRole("searchbox").first(),
        page.locator("input[type='text']").first(),
        page.locator("input[name='q']").first(),
        page.locator("input[aria-label*='Search']").first(),
      ].map((selector) =>
        selector
          .waitFor({ timeout: 2000 })
          .then(() => selector)
          .catch(() => null)
          .then((result) =>
            result ? Promise.resolve(result) : Promise.reject()
          )
      )
    );

    if (searchInput) {
      console.log("Found search input, clicking on it...");

      // Click on the search box and type a query
      await searchInput.click();

      console.log("Typing search query...");
      await searchInput.fill("Playwright MCP GitHub");

      // Press Enter to submit the search
      console.log("Submitting search...");
      await searchInput.press("Enter");

      // Wait for results to load
      console.log("Waiting for search results...");
      await page.waitForLoadState("networkidle");

      // Take a screenshot of the search results
      await page.screenshot({ path: "search-results.png" });
      console.log("Screenshot of search results saved to search-results.png");

      // Find a result to click
      console.log(
        "Looking for search result with 'playwright' in the title..."
      );
      const searchResults = await page
        .getByRole("link")
        .filter({ hasText: /playwright/i })
        .all();

      if (searchResults.length > 0) {
        const searchResult = searchResults[0];
        console.log("Found result, clicking on it...");

        // Click on the search result
        await searchResult.click();

        // Wait for the page to load
        console.log("Waiting for page to load...");
        await page.waitForLoadState("networkidle");

        // Get the new page title
        const newTitle = await page.title();
        console.log("Navigated to:", newTitle);

        // Take a screenshot of the destination page
        await page.screenshot({ path: "destination-page.png" });
        console.log(
          "Screenshot of destination page saved to destination-page.png"
        );

        // Save the page as PDF
        console.log("Saving page as PDF...");
        await page.pdf({ path: "page.pdf" });
        console.log("PDF saved to page.pdf");
      } else {
        console.log("No suitable search result found");
      }
    } else {
      console.log("Search input not found");
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
