require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');
const express = require('express');

let latestQR = '';
let latestQRString = '';

const client = new Client();

client.on('qr', async qr => {
    latestQRString = qr; // Guardamos el QR crudo
    latestQR = await qrcode.toDataURL(qr); // Guardamos como imagen base64

    console.log('====================================');
    console.log('📱 Abre este enlace en el navegador para escanear el QR:');
    console.log(`https://${process.env.RENDER_EXTERNAL_URL || 'TU-APP.onrender.com'}/qr`);
    console.log('------------------------------------');
    console.log('📝 Si no podés abrir el enlace, copia este texto y pegalo en cualquier generador de QR online:');
    console.log(qr);
    console.log('====================================');
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

// Servidor web para mostrar el QR y el texto
const app = express();

app.get('/qr', (req, res) => {
    if (!latestQR) {
        return res.send('Aún no hay un QR generado.');
    }
    res.send(`
        <h1>Escanea este QR con WhatsApp</h1>
        <img src="${latestQR}" />
        <p>O copia este texto y conviértelo en QR en cualquier generador online:</p>
        <textarea style="width:100%;height:150px;">${latestQRString}</textarea>
    `);
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`🌐 Servidor iniciado en puerto ${process.env.PORT || 3000}`);
});
