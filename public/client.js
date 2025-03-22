const socket = io();

function register() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('register', username);
        document.getElementById('username-form').style.display = 'none';
        document.getElementById('chat-container').style.display = 'flex';
    }
}

function joinRoom() {
    const room = prompt('Введіть назву кімнати:');
    if (room) {
        socket.emit('join-room', room);
    }
}

const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');
const chat = document.getElementById('chat');
const recipientInput = document.getElementById('recipient');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    const recipient = recipientInput.value.trim();

    if (message) {
        if (recipient) {
            socket.emit('private-message', { message, to: recipient });
        } else {
            socket.emit('chat-message', { message }); // Надсилаємо об'єкт із полем message
        }
        messageInput.value = '';
        recipientInput.value = '';
    }
});

socket.on('chat-message', (data) => {
    console.log('Отримано публічне повідомлення:', data); // Додано для дебагу
    addMessage(`${data.username}: ${data.message}`, 'public');
});

socket.on('private-message', (data) => {
    console.log('Отримано приватне повідомлення:', data); // Додано для дебагу
    addMessage(`Приватно від ${data.from}: ${data.message}`, 'private');
});

socket.on('user-connected', (username) => {
    addMessage(`${username} приєднався до чату`, 'system');
});

socket.on('user-disconnected', (username) => {
    addMessage(`${username} покинув чат`, 'system');
});

socket.on('room-joined', (room) => {
    addMessage(`Ви приєдналися до кімнати: ${room}`, 'system');
});

function addMessage(message, type) {
    const div = document.createElement('div');
    div.textContent = message;
    div.classList.add('message', type);
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}