// Hacker News crawler demo with Playwright MCP
const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

/**
 * This demo shows how to perform a more complex task using Playwright:
 * 1. Navigate to Hacker News
 * 2. Find the top 5 articles
 * 3. For each article, visit its comments section
 * 4. Extract and log the top 5 root comments for each article
 * 5. Save the results to a JSON file
 *
 * It runs the Playwright MCP server in the background as a CLI process.
 */
async function main() {
  console.log("Starting Hacker News crawler demo...");

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

  // Store all the results
  const results = [];

  try {
    // Navigate to Hacker News
    console.log("Navigating to Hacker News...");
    await page.goto("https://news.ycombinator.com/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Take a screenshot of the Hacker News homepage
    await page.screenshot({ path: "hackernews-home.png" });
    console.log(
      "Screenshot of Hacker News homepage saved to hackernews-home.png"
    );

    // Find all stories with their score and comment count
    console.log("Finding the top 5 articles...");

    // Get all the story links - these are what we'll click to go to comments
    const stories = await page.getByRole("link", { name: "comments" }).all();
    const topStories = stories.slice(0, 5);

    console.log(`Found ${topStories.length} stories with comments to process`);

    // For each of the top stories with comments
    for (let i = 0; i < topStories.length; i++) {
      // For each comment link, we need to:
      // 1. Get the title (several elements above)
      // 2. Click on the comments link
      const commentLink = topStories[i];

      // Get the parent story's title - we go up to the row and then find the title
      const row = await commentLink.evaluate(
        (el) => el.closest("tr").previousElementSibling
      );
      let title = `Story ${i + 1}`; // Default title in case we can't get it

      try {
        // Try to get the article title associated with this comment link
        const titleElement = await page
          .locator("tr.athing")
          .nth(i)
          .locator(".titleline > a")
          .first();
        title = await titleElement.textContent();
      } catch (err) {
        console.log(`Couldn't get title for article ${i + 1}: ${err.message}`);
      }

      console.log(`\nArticle ${i + 1}: ${title}`);

      // Get the comment count text
      const commentText = await commentLink.textContent();
      console.log(`Comment link text: ${commentText}`);

      // Click on the comments link
      console.log(`Clicking comments link for article: ${title}`);
      await commentLink.click();

      // Wait for the comments page to load
      await page.waitForLoadState("networkidle");

      // Take a screenshot of the comments page
      await page.screenshot({ path: `hackernews-comments-${i + 1}.png` });
      console.log(
        `Screenshot of comments page saved to hackernews-comments-${i + 1}.png`
      );

      // Extract the top 5 root comments (those at indent level 0)
      console.log("Extracting top 5 root comments...");

      // Look for comments with indent="0"
      const rootComments = await page
        .locator(".comtr:has(.ind[indent='0'])")
        .all();
      console.log(`Found ${rootComments.length} root comments`);

      const topComments = rootComments.slice(0, 5);
      const commentsData = [];

      // Extract text from each comment
      for (let j = 0; j < topComments.length; j++) {
        const comment = topComments[j];
        try {
          // The actual comment text is in the child with class 'commtext'
          const commentText = await comment.locator(".commtext").textContent();
          // Get the author from the class 'hnuser'
          const author = await comment.locator(".hnuser").textContent();

          console.log(
            `Comment ${j + 1} by ${author}: ${commentText.slice(0, 100)}${
              commentText.length > 100 ? "..." : ""
            }`
          );

          commentsData.push({
            author,
            text: commentText.trim(),
          });
        } catch (e) {
          console.log(`Error extracting comment ${j + 1}: ${e.message}`);
        }
      }

      // Store the article data with its comments
      results.push({
        articleTitle: title,
        url: page.url(),
        comments: commentsData,
      });

      // Go back to the main page for the next article
      console.log("Going back to the main page...");
      await page.goto("https://news.ycombinator.com/");
      await page.waitForLoadState("networkidle");
    }

    // Save the results to a JSON file
    console.log("\nSaving results to hackernews-comments.json");
    await fs.writeFile(
      "hackernews-comments.json",
      JSON.stringify(results, null, 2)
    );
    console.log("Results saved successfully");

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
