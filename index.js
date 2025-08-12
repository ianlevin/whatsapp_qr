require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');
const express = require('express');

let latestQR = '';

const client = new Client();

client.on('qr', async qr => {
    latestQR = await qrcode.toDataURL(qr); // lo guardamos como imagen base64
    console.log('🔗 Escaneá el QR en: https://TU-APP.onrender.com/qr');
});

client.on('ready', () => {
    console.log('✅ Bot conectado a WhatsApp.');
});

client.on('message', async msg => {
    const userText = msg.body;
    const number = msg.from.split('@')[0];
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

// Servidor web para mostrar el QR
const app = express();
app.get('/qr', (req, res) => {
    if (!latestQR) {
        return res.send('Aún no hay un QR generado.');
    }
    res.send(`<img src="${latestQR}" />`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`🌐 Servidor iniciado en puerto ${process.env.PORT || 3000}`);
});
