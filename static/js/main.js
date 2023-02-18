const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const socket = io();

// messages from server
socket.on('message', message => {
    outputMessage(message);

    //scrolling
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', e => {
    e.preventDefault();

    //get message from DOM
    const user = e.target.elements.username.value;
    const message = e.target.elements.message.value;

    //showing message to server
    socket.emit('chatMessage', user, message);

    // clearing input
    e.target.elements.message.value = '';
    e.target.elements.message.focus()
});

//outputting message to dom

function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.user} <span>${message.time}</span></p><p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
};
