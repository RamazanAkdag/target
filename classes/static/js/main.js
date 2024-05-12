'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const connectingElement = document.querySelector('.connecting');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');

let stompClient = null;
let nickname = null;
let fullname = null;
let selectedUserId = null;
let currentUser = null;

let selectedGroupId;

function connect(event) {
    nickname = document.querySelector('#nickname').value.trim();
    fullname = document.querySelector('#fullname').value.trim();

    if (nickname && fullname) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/chat');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


/*async function onConnected(options) {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);



    console.log("nickname : " , nickname)
    const currentUserRes = await fetch(`/getUserByNickname/${nickname}`);
    console.log(currentUserRes);
    currentUser = await currentUserRes.json();

    console.log("current_user : ",currentUser);

    localStorage.setItem("nickname", nickname);
    // register the connected user
    stompClient.send("/app/user.addUser",
        {},
        JSON.stringify({nickname: nickname, fullname: fullname, status: 'ONLINE'})
    );
    document.querySelector('#connected-user-fullname').textContent = fullname;
    findAndDisplayConnectedUsers().then();

    // find and display groups
    console.log("curr user id : " + currentUser.id);
    const joinedRes = await fetch(`/groupChat/fetchJoinedGroups/${currentUser.id}`,{
        method: 'POST'
    });
    const joinedGroups = await joinedRes.json();
    // katılınmış tüm grup sohbetlerine abone olundu
    joinedGroups.forEach(group => {
        stompClient.subscribe(`/topic/groupChats.${group.id}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log("Received Message for Group", group.id, ":", receivedMessage);
        });
    });




   console.log("jg : ", joinedGroups);
    // Grupları HTML'de göster
    const groupsList = document.getElementById('groups');
    groupsList.innerHTML = '';

    joinedGroups.forEach(group => {
        //const groupItem = document.createElement('li');
        //groupItem.classList.add('group-item');
        //groupItem.id = group.id;
        //groupItem.textContent = group.name;

        const listItem = document.createElement('li');
        listItem.classList.add('group-item');
        listItem.id = group.id;
        listItem.name = group.name;

        //const userImage = document.createElement('img');
        //userImage.src = '../img/user_icon.png';


        const groupnameSpan = document.createElement('span');
        groupnameSpan.textContent = group.name;

        const receivedMsgs = document.createElement('span');
        receivedMsgs.textContent = '0';
        receivedMsgs.classList.add('nbr-msg', 'hidden');

        //listItem.appendChild(userImage);
        listItem.appendChild(groupnameSpan);
        listItem.appendChild(receivedMsgs);


        listItem.addEventListener('click', groupItemClick);

        groupsList.appendChild(listItem)

    });
}*/

async function onConnected(options) {
    stompClient.subscribe(`/user/${nickname}/queue/messages`, onMessageReceived);
    stompClient.subscribe(`/user/public`, onMessageReceived);

    console.log("nickname : ", nickname);

    // Kullanıcının var olup olmadığını kontrol et
    const checkUserRes = await fetch(`/checkUserByNickname/${nickname}`);
    const userExists = await checkUserRes.json();
    console.log("exists :",userExists)

    if (userExists) {
        // Kullanıcı varsa çek
        const currentUserRes = await fetch(`/getUserByNickname/${nickname}`);
        const currentUser = await currentUserRes.json();
        console.log("current_user : ", currentUser);

        localStorage.setItem("nickname", nickname);
        // register the connected user

        document.querySelector('#connected-user-fullname').textContent = fullname;
        findAndDisplayConnectedUsers().then();

        // find and display groups
        console.log("curr user id : " + currentUser.id);
        const joinedRes = await fetch(`/groupChat/fetchJoinedGroups/${currentUser.id}`, {
            method: 'POST'
        });
        const joinedGroups = await joinedRes.json();
        // katılınmış tüm grup sohbetlerine abone olundu
        joinedGroups.forEach(group => {
            stompClient.subscribe(`/topic/groupChats.${group.id}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("Received Message for Group", group.id, ":", receivedMessage);
            });
        });

        console.log("jg : ", joinedGroups);
        // Grupları HTML'de göster
        const groupsList = document.getElementById('groups');
        groupsList.innerHTML = '';

        joinedGroups.forEach(group => {
            const listItem = document.createElement('li');
            listItem.classList.add('group-item');
            listItem.id = group.id;
            listItem.name = group.name;

            const groupnameSpan = document.createElement('span');
            groupnameSpan.textContent = group.name;

            const receivedMsgs = document.createElement('span');
            receivedMsgs.textContent = '0';
            receivedMsgs.classList.add('nbr-msg', 'hidden');

            listItem.appendChild(groupnameSpan);
            listItem.appendChild(receivedMsgs);

            listItem.addEventListener('click', groupItemClick);

            groupsList.appendChild(listItem);
        });
    } else {
        // Kullanıcı yoksa ekleme işlemi yapabilirsiniz
        console.log("Kullanıcı veritabanında bulunamadı. Ekleme işlemi yapabilirsiniz.");

         /*stompClient.send("/app/user.addUser",
            {},
            JSON.stringify({nickname: nickname, fullname: fullname, status: 'ONLINE'})
        );*/


        const currentUserData = { nickname: nickname, fullname: fullname, status: 'ONLINE' };

        const currentUserRes = await fetch('/user/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentUserData)
        });

        const currentUser = await currentUserRes.json();
        console.log("current_user : ", currentUser);

        document.querySelector('#connected-user-fullname').textContent = fullname;
        findAndDisplayConnectedUsers().then();

        // find and display groups
        console.log("curr user id : " + currentUser.id);
        const joinedRes = await fetch(`/groupChat/fetchJoinedGroups/${currentUser.id}`, {
            method: 'POST'
        });
        const joinedGroups = await joinedRes.json();
        // katılınmış tüm grup sohbetlerine abone olundu
        joinedGroups.forEach(group => {
            stompClient.subscribe(`/topic/groupChats.${group.id}`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("Received Message for Group", group.id, ":", receivedMessage);
            });
        });

        console.log("jg : ", joinedGroups);
        // Grupları HTML'de göster
        const groupsList = document.getElementById('groups');
        groupsList.innerHTML = '';

        joinedGroups.forEach(group => {
            const listItem = document.createElement('li');
            listItem.classList.add('group-item');
            listItem.id = group.id;
            listItem.name = group.name;

            const groupnameSpan = document.createElement('span');
            groupnameSpan.textContent = group.name;

            const receivedMsgs = document.createElement('span');
            receivedMsgs.textContent = '0';
            receivedMsgs.classList.add('nbr-msg', 'hidden');

            listItem.appendChild(groupnameSpan);
            listItem.appendChild(receivedMsgs);

            listItem.addEventListener('click', groupItemClick);

            groupsList.appendChild(listItem);
        });
    }
}

async function groupItemClick(event) {
    const clickedGroup = event.currentTarget;
    selectedGroupId = clickedGroup.id;
    selectedUserId = "";


    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    clickedGroup.classList.add('active');

    messageForm.classList.remove('hidden');

    // Seçili gruba göre sohbet geçmişini getir
    await fetchAndDisplayGroupChat();

    // Diğer sohbet geçmişlerini temizle
    chatArea.innerHTML = clickedGroup.name;
}

async function fetchAndDisplayGroupChat() {
    if (!selectedGroupId) return;

    const groupChatHistoryResponse = await fetch(`/groupChat/fetchGroupChatHistory/${selectedGroupId}`, {
        method: 'POST'
    });

    console.log("groupChatHist : " ,groupChatHistoryResponse);

    const groupChatHistory = await groupChatHistoryResponse.json();

    console.log("groupChatHist : " , groupChatHistory);

    groupChatHistory.forEach(chat => {
        displayGroupMessage(chat.senderId, chat.content);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}

async function displayGroupMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === currentUser.id) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const senderRes = await fetch(`getUserById/${senderId}`);
    const sender = await senderRes.json()

    const message = document.createElement('p');
    const messageNickname = document.createElement("b");
    const msgContent = document.createElement('p')
    messageNickname.textContent = sender.nickname;
    msgContent.textContent = content;

    message.appendChild(messageNickname);
    message.appendChild(document.createElement('br'));
    message.appendChild(msgContent);




    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);

}



async function findAndDisplayConnectedUsers() {
    const connectedUsersResponse = await fetch('/allUsers');
    let connectedUsers = await connectedUsersResponse.json();
    console.log(connectedUsers)
    connectedUsers = connectedUsers.filter(user => user.nickname !== nickname);
    const connectedUsersList = document.getElementById('connectedUsers');
    connectedUsersList.innerHTML = '';

    connectedUsers.forEach(user => {
        appendUserElement(user, connectedUsersList);
        if (connectedUsers.indexOf(user) < connectedUsers.length - 1) {
            const separator = document.createElement('li');
            separator.classList.add('separator');
            connectedUsersList.appendChild(separator);
        }
    });
}

function appendUserElement(user, connectedUsersList) {
    const listItem = document.createElement('li');
    listItem.classList.add('user-item');
    listItem.id = user.nickname;

    const userImage = document.createElement('img');
    userImage.src = '../img/user_icon.png';
    userImage.alt = user.fullname;

    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = user.fullname;

    const receivedMsgs = document.createElement('span');
    receivedMsgs.textContent = '0';
    receivedMsgs.classList.add('nbr-msg', 'hidden');

    listItem.appendChild(userImage);
    listItem.appendChild(usernameSpan);
    listItem.appendChild(receivedMsgs);

    listItem.addEventListener('click', userItemClick);

    connectedUsersList.appendChild(listItem);
}

function userItemClick(event) {
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    messageForm.classList.remove('hidden');

    const clickedUser = event.currentTarget;
    clickedUser.classList.add('active');

    selectedUserId = clickedUser.getAttribute('id');
    fetchAndDisplayUserChat().then();

    const nbrMsg = clickedUser.querySelector('.nbr-msg');
    nbrMsg.classList.add('hidden');
    nbrMsg.textContent = '0';

}

function displayMessage(senderId, content) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message');
    if (senderId === nickname) {
        messageContainer.classList.add('sender');
    } else {
        messageContainer.classList.add('receiver');
    }
    const message = document.createElement('p');
    message.textContent = content;
    messageContainer.appendChild(message);
    chatArea.appendChild(messageContainer);
}

async function fetchAndDisplayUserChat() {
    const userChatResponse = await fetch(`/messages/${nickname}/${selectedUserId}`);
    const userChat = await userChatResponse.json();
    chatArea.innerHTML = '';
    userChat.forEach(chat => {
        displayMessage(chat.senderId, chat.content);
    });
    chatArea.scrollTop = chatArea.scrollHeight;
}


function onError() {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    if (!selectedUserId && selectedGroupId){
        sendGroupMessage(event)
        return;
    }

    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: nickname
,
            recipientId: selectedUserId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };
        stompClient.send("/app/chat", {}, JSON.stringify(chatMessage));
        displayMessage(nickname
, messageInput.value.trim());
        messageInput.value = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}
function sendGroupMessage(event) {
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        const chatMessage = {
            senderId: currentUser.id,
            groupId: selectedGroupId,
            content: messageInput.value.trim(),
            timestamp: new Date()
        };
        stompClient.send("/app/groupChat", {}, JSON.stringify(chatMessage));
        displayMessage(nickname
            , messageInput.value.trim());
        messageInput.value = '';
    }
    chatArea.scrollTop = chatArea.scrollHeight;
    event.preventDefault();
}


async function onMessageReceived(payload) {
    await findAndDisplayConnectedUsers();
    console.log('Message received', payload);
    const message = JSON.parse(payload.body);
    if (selectedUserId && selectedUserId === message.senderId) {
        displayMessage(message.senderId, message.content);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    if (selectedUserId) {
        document.querySelector(`#${selectedUserId}`).classList.add('active');
    } else {
        messageForm.classList.add('hidden');
    }

    const notifiedUser = document.querySelector(`#${message.senderId}`);
    if (notifiedUser && !notifiedUser.classList.contains('active')) {
        const nbrMsg = notifiedUser.querySelector('.nbr-msg');
        nbrMsg.classList.remove('hidden');
        nbrMsg.textContent = '';
    }
}

function onLogout() {
    stompClient.send("/app/user.disconnectUser",
        {},
        JSON.stringify({nickname
: nickname
, fullname: fullname, status: 'OFFLINE'})
    );
    window.location.reload();
}



usernameForm.addEventListener('submit', connect, true); // step 1
messageForm.addEventListener('submit', sendMessage, true);
logout.addEventListener('click', onLogout, true);
window.onbeforeunload = () => onLogout();