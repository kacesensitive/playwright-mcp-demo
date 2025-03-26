# Playwright MCP Demo

This demo showcases how to use Playwright MCP (Model Context Protocol) for browser automation.

The Model Context Protocol enables Large Language Models (LLMs) to interact with web pages through structured accessibility snapshots, instead of screenshots or visually-tuned models.

## What is Playwright MCP?

Playwright MCP is a Model Context Protocol server that provides browser automation capabilities using Playwright. It allows LLMs to interact with web pages through structured accessibility snapshots without requiring screenshots or visually-tuned models.

Key features:

- Fast and lightweight: Uses Playwright's accessibility tree, not pixel-based input
- LLM-friendly: No vision models needed, operates purely on structured data
- Deterministic tool application: Avoids ambiguity common with screenshot-based approaches

## Project Structure

- `simple-demo.js` - Recommended demo that runs the MCP server as a separate process
- `index.js` - Basic demo showing core MCP functionality with a simple website
- `website-demo.js` - Demo showing search engine interaction and navigation
- `form-demo.js` - Demo showing automated form filling and submission
- `hackernews-demo.js` - Advanced demo showing web scraping of Hacker News comments
- `setup.js` - Script to install dependencies and Playwright browsers

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Quick Start

The easiest way to get started is to run the setup script:

```bash
# Clone this repository
git clone https://github.com/yourusername/playwright-mcp-demo.git
cd playwright-mcp-demo

# Run the setup script to install dependencies and Playwright browsers
npm run setup
```

## Running the Demos

After setup, run any of these commands:

```bash
# Run the simple demo (recommended approach)
npm run demo:simple

# Run the basic demo
npm start

# Run the website interaction demo
npm run demo:website

# Run the form filling demo
npm run demo:form

# Run the Hacker News crawler demo
npm run demo:hackernews
```

Or directly:

```bash
node simple-demo.js
node index.js
node website-demo.js
node form-demo.js
node hackernews-demo.js
```

## Demo Features Demonstrated

- **Simple Demo (simple-demo.js)** - Recommended

  - Runs the MCP server as a separate process
  - Uses standard Playwright API directly
  - Simpler approach that avoids package export issues

- **Basic Demo (index.js)**

  - Browser navigation to a website
  - Capturing accessibility snapshots
  - Clicking on elements
  - Waiting for navigation events

- **Website Demo (website-demo.js)**

  - Searching on a search engine
  - Interacting with search results
  - Navigating between pages
  - Saving page as PDF

- **Form Demo (form-demo.js)**

  - Creating a local HTML form
  - Filling in text fields
  - Selecting dropdown options
  - Checking checkboxes
  - Submitting forms
  - Verifying form submission

- **Hacker News Demo (hackernews-demo.js)**
  - Advanced web scraping techniques
  - Navigating to Hacker News
  - Finding and clicking on multiple article comments
  - Extracting comment text and author information
  - Processing and saving structured data to JSON
  - Taking screenshots at various stages

## Note About Package Structure

This demo uses the current @playwright/mcp package structure which may differ from previous versions.
The implementation uses direct imports from the package with CommonJS:

```javascript
const { chromium } = require("@playwright/test");
const { Server } = require("@playwright/mcp/lib/server");
```

Rather than the previously documented approach:

```javascript
import { createServer } from "@playwright/mcp";
```

The package structure may change in future versions, so please check the official documentation
for the most up-to-date usage information.

As of the current version, we recommend using the simple demo approach which avoids direct programmatic usage
of the internal MCP API:

```javascript
// Start the Playwright MCP server in a separate process
const mcpProcess = spawn("npx", ["@playwright/mcp"], {
  stdio: "inherit",
});

// Then use Playwright directly
const browser = await chromium.launch();
const page = await browser.newPage();
// ... continue with standard Playwright API
```

## Using Playwright MCP in VS Code

To use Playwright MCP directly in VS Code for your GitHub Copilot agent:

```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

For VS Code Insiders:

```bash
code-insiders --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

## Learn More

- [Playwright MCP GitHub Repository](https://github.com/microsoft/playwright-mcp)
- [Playwright Documentation](https://playwright.dev/)
