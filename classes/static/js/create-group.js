'use strict';

const userList = document.querySelector("#users");
const createGroupForm = document.querySelector("#create-group-form");

const nickname = localStorage.getItem("nickname");


let currentUser = null;

const socket = new SockJS('/chat');
const stompClient = Stomp.over(socket);


async function fetchUsers() {
    try {
        const response = await fetch("/allUsers");

        const data = await response.json();
        console.log(data);

        const params = new URLSearchParams();
        params.append("nickname", nickname);

        const currentUserRes = await fetch(`/getUserByNickname?${params.toString()}`);
        currentUser = await currentUserRes.json();
        console.log(currentUser);

        for (let i = 0; i < data.length; i++) {
            const user = data[i];

            // Skip adding the current user to the list
            if (user.nickname !== nickname ) { // Assuming the user ID is stored in the "id" property
                const option = document.createElement("option");
                option.value = user.id;
                option.text = user.nickname; // Assuming the username is stored in the "nickname" property
                userList.appendChild(option);
            }
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        // Handle fetch error appropriately (e.g., display an error message to the user)
    }
}

// Fetch users on page load
fetchUsers();



async function createGroup(event) {
    event.preventDefault(); // Prevent default form submission

    const groupName = document.querySelector("#group-name").value;
    const selectedUserIds = Array.from(document.querySelector("#users").selectedOptions)
        .map((option) => option.value); // Get selected user IDs
    selectedUserIds.push(currentUser.id);


    if (!groupName || selectedUserIds.length === 0) {
        // Handle missing group name or selected users (optional: display error message)
        alert("Please enter a group name and select participants!");
        return;
    }

    try {

        const groupChatRoom = {
            name: groupName,
            adminId: currentUser.id,
            participtians: selectedUserIds // Array of participant user IDs
        };

        console.log(groupChatRoom);

        // Send a WebSocket message to the server to create the group
        // Replace with the appropriate WebSocket library and endpoint
        stompClient.send("/app/groupChat.createRoom", {}, JSON.stringify(groupChatRoom)); // Example using SockJS with Spring

        createGroupForm.reset();

        window.location.href = "/index.html";
    } catch (error) {
        console.error("Error creating group:", error);
        // Handle errors appropriately (e.g., display error message to the user)
    }
}


createGroupForm.addEventListener("submit", createGroup);




