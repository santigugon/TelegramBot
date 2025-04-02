"use client";
import React, { useEffect, useState } from "react";

const WebApp = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.TelegramWebApp) {
      window.TelegramWebApp.ready();

      // Access user data from Telegram Web App SDK
      const userData = window.TelegramWebApp.initDataUnsafe;
      setUser(userData);

      // Customize appearance (e.g., header color)
      window.TelegramWebApp.setHeaderColor("#FF5733"); // Set custom header color
    }
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to the Telegram Web App</h1>
      {user ? (
        <div>
          <p>User info:</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <button onClick={() => window.TelegramWebApp.close()}>Close App</button>
    </div>
  );
};

export default WebApp;
