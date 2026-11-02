const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');

// Ваш нік у TikTok із собачкою (@)
const tiktokUsername = "@scrp_lab"; 

// Створюємо WebSocket-сервер для зв'язку з грою на порті 8080
const wss = new WebSocket.Server({ port: 8080 });
console.log('🟢 WebSocket міст запущено на порту ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('🎮 Успішно! Гра підключилася до сервера!');
    ws.send(JSON.stringify({ status: 'Connected successfully' }));
});

// Пряме підключення до TikTok Live
const tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

tiktokLiveConnection.connect().then(state => {
    console.log(`✅ Підключено до ефіру ${tiktokUsername} (roomId: ${state.roomId})`);
}).catch(err => {
    console.error('❌ Помилка підключення (перевірте, чи запущено стрім у TikTok):', err);
});

// Ловимо подарунки під час ефіру
tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) return;

    const giftName = data.giftName;
    const username = data.uniqueId;
    const count = data.repeatCount || 1;

    console.log(`🎁 Отримано подарунок: ${giftName} від ${username} (к-ть: ${count})`);

    const gamePayload = JSON.stringify({
        username: username,
        giftName: giftName,
        count: count
    });

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gamePayload);
        }
    });
});
