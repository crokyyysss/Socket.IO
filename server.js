const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const users = {};

io.on('connection', (socket) => {
    console.log('Користувач підключився:', socket.id);

    socket.on('register', (username) => {
        users[socket.id] = username;
        socket.broadcast.emit('user-connected', username);
    });

    socket.on('chat-message', (data) => {
        console.log('Отримано повідомлення:', data); // Додано для дебагу
        const messageData = {
            message: data.message,
            username: users[socket.id]
        };
        if (data.room) {
            io.to(data.room).emit('chat-message', messageData);
        } else {
            io.emit('chat-message', messageData);
        }
    });

    socket.on('private-message', ({ message, to }) => {
        const recipientId = Object.keys(users).find(id => users[id] === to);
        if (recipientId) {
            socket.to(recipientId).emit('private-message', {
                message,
                from: users[socket.id]
            });
        }
    });

    socket.on('join-room', (room) => {
        socket.join(room);
        socket.emit('room-joined', room);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    });
});

const PORT = 3000;
http.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});