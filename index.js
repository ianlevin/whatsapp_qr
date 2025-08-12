require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot conectado a WhatsApp.');
});

client.on('message', async msg => {
    const userText = msg.body;
    const number = msg.from.split('@')[0]
    console.log(`📩 Mensaje de ${number}: ${userText}`);

    try {
        const respuesta = await axios.post(process.env.ENDPOINT_GPT, {
            text: userText,
            number: number
        });

        const reply = respuesta.data.reply || "No tengo respuesta 😅";
        await msg.reply(reply);
    } catch (error) {
        console.error("❌ Error al contactar al endpoint GPT:", error.message);
        await msg.reply("Lo siento, hubo un error procesando tu mensaje.");
    }
});

client.initialize();
