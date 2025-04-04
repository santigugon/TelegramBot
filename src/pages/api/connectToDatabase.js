import oracledb from "oracledb";
import fs from "fs";
import os from "os";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let walletDir = null;

export default async function handler(req, res) {
  // Check if the request method is POST (optional based on your needs)
  if (req.method === "POST") {
    try {
      // await getConnection();
      await connectWithWallet();

      // Return result as JSON
      res.status(200).json("good");
    } catch (error) {
      console.error("Error connecting to database:", error);
      res
        .status(500)
        .json({ error: "Failed to connect to Oracle Autonomous Database" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

// src/lib/db.ts

function createWalletFiles() {
  try {
    // Create temporary directory if it doesn't exist
    if (!walletDir) {
      walletDir = path.join(
        os.tmpdir(),
        "oracle-wallet-" + Math.random().toString(36).substring(7)
      );
      fs.mkdirSync(walletDir, { recursive: true });

      console.log("Creating wallet files in:", walletDir);
      // Complete list of Oracle wallet files
      const files = [
        { name: "cwallet.sso", content: process.env.CWALLET_SSO },
        { name: "tnsnames.ora", content: process.env.TNSNAMES_ORA },
        { name: "sqlnet.ora", content: process.env.SQLNET_ORA },
        { name: "ewallet.p12", content: process.env.EWALLET_P12 },
        { name: "keystore.jks", content: process.env.KEYSTORE_JKS },
        { name: "ojdbc.properties", content: process.env.OJDBC_PROPERTIES },
        { name: "ewallet.pem", content: process.env.EWALLET_PEM },
        { name: "cwallet.pem", content: process.env.CWALLET_PEM },
        { name: "truststore.jks", content: process.env.TRUSTSTORE_JKS },
      ];

      files.forEach(({ name, content }) => {
        if (content) {
          // Only create the file if the content exists
          fs.writeFileSync(
            path.join(walletDir, name),
            Buffer.from(content, "base64")
          );
        }
      });

      // Set TNS_ADMIN
      process.env.TNS_ADMIN = walletDir;
    }

    return walletDir;
  } catch (error) {
    console.error("Error creating wallet files:", error);
    throw error;
  }
}

export async function getConnection() {
  try {
    // Create wallet files before establishing connection
    const walletLocation = createWalletFiles();

    console.log("Connecting to Oracle Autonomous Database...");
    // Establish connection using wallet settings
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECT_STRING,
      walletLocation: walletLocation,
    });

    return connection;
  } catch (error) {
    console.error("Connection error:", error);
    throw error;
  }
}

// Clean up temporary files when the application exits
process.on("exit", () => {
  if (walletDir && fs.existsSync(walletDir)) {
    try {
      fs.rmSync(walletDir, { recursive: true });
    } catch (error) {
      console.error("Error cleaning up temporary directory:", error);
    }
  }
});

// Also clean up in case of unhandled exceptions
process.on("uncaughtException", () => {
  if (walletDir && fs.existsSync(walletDir)) {
    try {
      fs.rmSync(walletDir, { recursive: true });
    } catch (error) {
      console.error("Error cleaning up temporary directory:", error);
    }
  }
});

async function connectWithWallet() {
  try {
    console.log("Connecting to Oracle Autonomous Database...");
    // Define your Oracle Autonomous Database connection details
    const user = process.env.DB_USER; // e.g., "admin"
    const password = process.env.DB_PASSWORD; // your password for the user
    const connectString = process.env.DB_CONNECT_STRING; // Use the correct connection string for ADB

    // Define the wallet directory location
    const walletLocation = "@/wallet"; // Path where you extracted your Oracle Wallet files

    // Establish the connection using the Oracle wallet
    const connection = await oracledb.getConnection({
      user: user,
      password: password,
      connectString: connectString,
      ssl: {
        wallet: walletLocation, // Point to the directory where your wallet files are
      },
    });

    console.log("Connected to Oracle Autonomous Database");

    // Example: Fetching data from the database
    const result = await connection.execute("SELECT * FROM your_table");
    console.log(result.rows);

    // Close the connection
    await connection.close();
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
}
