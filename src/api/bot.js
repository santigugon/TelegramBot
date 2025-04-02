import { Telegraf } from "telegraf";

const bot = new Telegraf("7868323607:AAGcBigihJZe7O5D0Uj1sDuz_U6QhYgiTBE"); // Replace with your bot token from BotFather

bot.start((ctx) => {
  const chatId = ctx.chat.id;
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Web App",
            web_app: {
              url: "https://telegram-webapp-next.vercel.app",
            }, // Use the deployed URL for your web app
          },
        ],
      ],
    },
  };

  // Send a message with a button to open the React Web App
  ctx.reply("Click below to open the Web App:", options);
});

bot.launch();

export default function handler(req, res) {
  if (req.method === "POST") {
    bot.handleUpdate(req.body, res);
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
