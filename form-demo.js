// Form filling demo with Playwright MCP
const { chromium } = require("@playwright/test");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs/promises");

/**
 * This demo shows how to use Playwright to fill out a form.
 * It creates a simple HTML form locally and then interacts with it.
 *
 * It runs the Playwright MCP server in the background as a CLI process.
 */
async function main() {
  console.log("Starting Playwright MCP form filling demo...");

  // Create a simple HTML form for demonstration
  const formPath = path.join(__dirname, "demo-form.html");
  await createDemoForm(formPath);
  const formUrl = `file://${formPath}`;

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
    // Navigate to our local form
    console.log(`Navigating to the local form: ${formUrl}`);
    await page.goto(formUrl);

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Get the page title
    const title = await page.title();
    console.log("Page title:", title);

    // Process the form fields
    console.log("Filling out the form...");

    // Find and fill the name field
    console.log("Filling name field...");
    await page.getByLabel("Full Name:").fill("Jane Doe");

    // Find and fill the email field
    console.log("Filling email field...");
    await page.getByLabel("Email Address:").fill("jane.doe@example.com");

    // Find and select an option from the dropdown
    console.log("Selecting country from dropdown...");
    await page.selectOption("select#country", "ca");

    // Find and check a checkbox
    console.log("Checking the agreement checkbox...");
    await page.getByLabel("I agree to the terms and conditions").check();

    // Take a screenshot of the filled form
    console.log("Taking screenshot of filled form...");
    await page.screenshot({ path: "filled-form.png" });

    // Find and click the submit button
    console.log("Submitting the form...");
    await page.getByRole("button", { name: "Submit Form" }).click();

    // Wait a moment for the submission to process
    await page.waitForTimeout(1000);

    // Check if submission was successful
    const successMessage = page.getByText("Thank you for your submission!");
    if (await successMessage.isVisible()) {
      console.log("Form submission successful!");
      // Take a screenshot of the success message
      await page.screenshot({ path: "form-submitted.png" });
      console.log("Screenshot of success message saved to form-submitted.png");
    } else {
      console.log("Form submitted, but success message not found.");
    }

    // Wait a moment before closing
    console.log("Demo completed. Closing browser in 5 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } catch (error) {
    console.error("Error during demo:", error);
  } finally {
    // Clean up - delete the temporary form file
    try {
      await fs.unlink(formPath);
      console.log("Cleaned up demo form file");
    } catch (err) {
      console.error("Error cleaning up demo form:", err);
    }

    // Close the browser
    await browser.close();

    // Kill the MCP process
    mcpProcess.kill();

    console.log("Demo finished.");
  }
}

// Helper to create a demo form HTML file
async function createDemoForm(filePath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright MCP Demo Form</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
    }
    .checkbox-group input {
      width: auto;
      margin-right: 10px;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .success-message {
      display: none;
      background-color: #dff0d8;
      color: #3c763d;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>Contact Information Form</h1>
  <form id="contactForm">
    <div class="form-group">
      <label for="name">Full Name:</label>
      <input type="text" id="name" name="name" required>
    </div>
    
    <div class="form-group">
      <label for="email">Email Address:</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div class="form-group">
      <label for="country">Country:</label>
      <select id="country" name="country">
        <option value="">-- Select Country --</option>
        <option value="us">United States</option>
        <option value="ca">Canada</option>
        <option value="uk">United Kingdom</option>
        <option value="au">Australia</option>
      </select>
    </div>
    
    <div class="form-group checkbox-group">
      <input type="checkbox" id="agree" name="agree" required>
      <label for="agree">I agree to the terms and conditions</label>
    </div>
    
    <button type="submit">Submit Form</button>
  </form>
  
  <div id="successMessage" class="success-message">
    <h2>Thank you for your submission!</h2>
    <p>We have received your information and will contact you soon.</p>
  </div>
  
  <script>
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      // Hide the form
      this.style.display = 'none';
      // Show success message
      document.getElementById('successMessage').style.display = 'block';
    });
  </script>
</body>
</html>`;

  await fs.writeFile(filePath, html);
  console.log(`Created demo form at ${filePath}`);
}

main().catch(console.error);
