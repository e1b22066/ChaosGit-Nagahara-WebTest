import express from 'express';
import { WebSocketServer } from 'ws';

const app = express();
const wss = new WebSocketServer({ port: 6060 });

const maxPlayersPerRoom = 3;
const rooms = {}; // 各ルームごとにプレイヤー情報とゲーム状態を保持

// プレイヤー数を全員に通知
const updatePlayerCount = (roomKey) => {
    const room = rooms[roomKey];
    const message = JSON.stringify({
        type: 'playerCount',
        count: room.numPlayers,
    });
    room.connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

// ルーム全体にメッセージを送信
const broadcastToRoom = (roomKey, message) => {
    const room = rooms[roomKey];
    room.connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

wss.on('connection', (ws) => {
    let currentRoomKey = null;

    // ルームに参加
    ws.on('message', (data) => {
        const message = JSON.parse(data);

        // ルームの作成または参加
        if (message.type === 'joinRoom') {
            const roomKey = message.roomKey;

            // ルームがなければ作成
            if (!rooms[roomKey]) {
                rooms[roomKey] = {
                    connections: [],
                    players: {},
                    numPlayers: 0,
                };
            }

            const room = rooms[roomKey];

            // ルームがいっぱいの場合、参加拒否
            if (room.numPlayers >= maxPlayersPerRoom) {
                ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
                return;
            }

            // プレイヤーをルームに追加
            currentRoomKey = roomKey;
            room.connections.push(ws);
            room.players[ws] = { playerId: ws, x: 0, y: 0 };
            room.numPlayers++;

            // 全員にプレイヤー数を通知
            updatePlayerCount(roomKey);

            // プレイヤー数が最大に達した場合、ゲーム開始を通知
            if (room.numPlayers === maxPlayersPerRoom) {
                broadcastToRoom(roomKey, { type: 'startGame' });
            }
        }

        // プレイヤー移動時の情報更新
        if (message.type === 'playerMovement' && currentRoomKey) {
            const { x, y } = message;
            rooms[currentRoomKey].players[ws].x = x;
            rooms[currentRoomKey].players[ws].y = y;

            // 他のプレイヤーに移動を通知
            broadcastToRoom(currentRoomKey, {
                type: 'playerMoved',
                playerId: ws,
                x,
                y,
            });
        }
    });

    // クライアントが切断した場合の処理
    ws.on('close', () => {
        if (currentRoomKey && rooms[currentRoomKey]) {
            const room = rooms[currentRoomKey];
            room.numPlayers--;
            delete room.players[ws];
            room.connections = room.connections.filter(client => client !== ws);

            // プレイヤー数更新通知
            updatePlayerCount(currentRoomKey);

            // ルームが空になったら削除
            if (room.numPlayers === 0) {
                delete rooms[currentRoomKey];
            }
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
