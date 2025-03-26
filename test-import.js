// Test file to check how to use the Playwright MCP package
import * as fs from "fs";
import * as path from "path";

// Extract the real exports paths from the package.json
const packageJsonPath = path.resolve(
  "./node_modules/@playwright/mcp/package.json"
);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

console.log("Available exports:", packageJson.exports);

// Explore the lib directory
const libPath = path.resolve("./node_modules/@playwright/mcp/lib");
fs.readdirSync(libPath).forEach((file) => {
  console.log(`File in lib directory: ${file}`);
});

// Look at the server.js file
const serverPath = path.resolve("./node_modules/@playwright/mcp/lib/server.js");
try {
  const serverContent = fs.readFileSync(serverPath, "utf8");
  const exportLines = serverContent
    .split("\n")
    .filter((line) => line.includes("exports."));
  console.log("Server.js exports:", exportLines);
} catch (error) {
  console.error("Error reading server.js:", error);
}
