import { Telegraf } from "telegraf";

const bot = new Telegraf("7868323607:AAGcBigihJZe7O5D0Uj1sDuz_U6QhYgiTBE"); // Replace with your bot token from BotFather

// Store phone numbers by user ID
const userPhones = {};

// Start command
bot.start((ctx) => {
  const userId = ctx.from.id;

  // Request phone number with keyboard button
  ctx.reply("Welcome! Please share your phone number to continue.", {
    reply_markup: {
      keyboard: [[{ text: "Share My Phone Number", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Handle received contact/phone number
bot.on("contact", (ctx) => {
  const userId = ctx.from.id;
  const contact = ctx.message.contact;

  // Verify the contact belongs to the user
  if (contact.user_id === userId) {
    // Store the phone number
    userPhones[userId] = contact.phone_number;

    // Now send the web app button
    ctx.reply("Thanks! Now you can open the web app:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open Web App",
              web_app: {
                url: `https://telegram-webapp-next.vercel.app?phone=${encodeURIComponent(
                  contact.phone_number
                )}`,
              },
            },
          ],
        ],
        remove_keyboard: true,
      },
    });
  } else {
    ctx.reply("Please share your own contact.");
  }
});

bot.launch({
  drop_pending_updates: true,
});
// For webhook deployment (e.g. Vercel)
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Error handling update:", error);
      res.status(500).send("Error handling update");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
