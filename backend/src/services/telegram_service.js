import axios from "axios";

export const sendTelegramMessage = async (text) => {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    console.log("Telegram URL:", url);
    console.log("Chat ID:", process.env.TELEGRAM_CHAT_ID);

    try {
        const res = await axios.post(url, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text
        });

        console.log("Telegram success:", res.data);
        return res.data;
    } catch (err) {
        if (err.response) {
            console.error("Telegram API error:", err.response.data);
        } else {
            console.error("Telegram error:", err.message);
        }
    }
};
