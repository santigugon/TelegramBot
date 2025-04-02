"use client";
import React, { useEffect, useState } from "react";

const WebApp = () => {
  const [tele, setTele] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ensure Telegram WebApp is available
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp
    ) {
      const telegramWebApp = window.Telegram.WebApp;
      setTele(telegramWebApp);

      // Initialize the WebApp
      telegramWebApp.ready();

      // Access user data correctly
      setUser(telegramWebApp.initDataUnsafe?.user || {});

      // Customize appearance
      telegramWebApp.setHeaderColor("#FF5733");
    } else {
      console.error("Telegram WebApp is not available.");
    }
  }, []);

  const handleCloseApp = () => {
    if (tele) {
      tele.close();
    }
  };

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
      <button onClick={handleCloseApp}>Close App</button>
    </div>
  );
};

export default WebApp;
