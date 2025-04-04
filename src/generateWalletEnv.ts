// ./generateWalletEnv.ts
const fs = require("fs");
const path = require("path");

// Path to the wallet folder
const walletPath = path.join(process.cwd(), "wallet");

// Function to read a file and convert it to base64
function fileToBase64(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      return fileContent.toString("base64");
    }
    return null;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// List of all possible wallet files
const files = [
  { name: "CWALLET_SSO", file: "cwallet.sso" },
  { name: "TNSNAMES_ORA", file: "tnsnames.ora" },
  { name: "SQLNET_ORA", file: "sqlnet.ora" },
  { name: "EWALLET_P12", file: "ewallet.p12" },
  { name: "KEYSTORE_JKS", file: "keystore.jks" },
  { name: "OJDBC_PROPERTIES", file: "ojdbc.properties" },
  { name: "EWALLET_PEM", file: "ewallet.pem" },
  { name: "CWALLET_PEM", file: "cwallet.pem" },
  { name: "TRUSTSTORE_JKS", file: "truststore.jks" },
];

// Generate .env content
let envContent = "";

// Process each file
files.forEach(({ name, file }) => {
  const filePath = path.join(walletPath, file);
  const base64Content = fileToBase64(filePath);

  if (base64Content) {
    envContent += `${name}=${base64Content}\n`;
  }
});

// Check if .env file already exists
const envPath = path.join(process.cwd(), ".env");
let currentEnv = "";

if (fs.existsSync(envPath)) {
  currentEnv = fs.readFileSync(envPath, "utf8");

  // Remove old variables if they exist
  currentEnv = currentEnv
    .split("\n")
    .filter((line) => !files.some(({ name }) => line.startsWith(name)))
    .join("\n");
}

// Combine existing content with new variables
const newEnv =
  currentEnv +
  (currentEnv && currentEnv.endsWith("\n") ? "" : "\n") +
  envContent;

// Save the updated .env file
fs.writeFileSync(envPath, newEnv);

console.log("✅ .env file updated successfully!");
console.log(
  "\nVariables added:",
  files
    .filter(({ name }) => envContent.includes(name))
    .map(({ name }) => `- ${name}`)
    .join("\n")
);
