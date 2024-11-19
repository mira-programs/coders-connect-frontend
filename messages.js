document.addEventListener("DOMContentLoaded", () => {
    const chatsDiv = document.querySelector(".chats");
    const displayTextsDiv = document.querySelector(".displaytexts");
    const sendButton = document.getElementById("send");
    const fileInput = document.getElementById("fileinput");
    const previewImage = document.querySelector(".imagedisplayed");
    const filenameText = document.getElementById("filename");
    const textBox = document.getElementById("textbox");
    const messagingHeader = document.querySelector(".messagingpage .header");
    const profileImage = messagingHeader.querySelector(".pfpwrap .profile");
    const usernameDisplay = messagingHeader.querySelector(".username");

    // Fetch chats and populate the sidebar
    function loadChats() {
        fetch("https://api.example.com/chats") // Replace with your actual endpoint
            .then((response) => response.json())
            .then((chats) => {
                chatsDiv.innerHTML = ""; // Clear existing chats
                chats.forEach((chat) => {
                    const chatDiv = document.createElement("div");
                    chatDiv.classList.add("singlechat");
                    chatDiv.dataset.username = chat.username; // Use username as ID
                    chatDiv.dataset.profilePicture = chat.profilePicture; // Store profile picture for easy access

                    chatDiv.innerHTML = `
                        <div class="pfpwrap">
                            <img src="${chat.profilePicture}" class="profile online"/>
                        </div>
                        <p class="username">${chat.username}</p>
                        <p class="newmesssage">${chat.newMessages ? "!" : ""}</p>
                    `;

                    // Add event listener for loading messages
                    chatDiv.addEventListener("click", () => {
                        updateMessagingPage(chat.username, chat.profilePicture);
                        loadMessages(chat.username);
                    });

                    chatsDiv.appendChild(chatDiv);
                });
            })
            .catch((error) => console.error("Error loading chats:", error));
    }

    // Update the messaging page header with the selected chat details
    function updateMessagingPage(username, profilePicture) {
        profileImage.src = profilePicture;
        usernameDisplay.textContent = username;
    }

    // Fetch messages for a specific chat
    function loadMessages(username) {
        fetch(`https://api.example.com/messages?username=${username}`) // Replace with your actual endpoint
            .then((response) => response.json())
            .then((messages) => {
                displayTextsDiv.innerHTML = ""; // Clear existing messages
                messages.forEach((message) => {
                    const messageDiv = document.createElement("div");
                    messageDiv.classList.add("message");
                    messageDiv.id = `message-${message.id}`; // Set HTML ID to match message ID from the API

                    messageDiv.innerHTML = `
                        <p class="theirmessage">${message.sender === "them" ? message.content : ""}</p>
                        <p class="mymessage">${message.sender === "me" ? message.content : ""}</p>
                        ${message.image ? `<img src="${message.image}" class="${message.sender === "them" ? "theirimage" : "myimage"}"/>` : ""}
                    `;

                    displayTextsDiv.appendChild(messageDiv);
                });
            })
            .catch((error) => console.error("Error loading messages:", error));
    }

    // Handle sending a message
    sendButton.addEventListener("click", () => {
        const messageContent = textBox.value.trim();
        const file = fileInput.files[0];

        if (!messageContent && !file) return;

        const formData = new FormData();
        formData.append("message", messageContent);
        if (file) formData.append("file", file);

        const activeChatUsername = usernameDisplay.textContent;

        fetch("https://api.example.com/messages", { // Replace with your actual endpoint
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then(() => {
                textBox.value = "";
                previewImage.src = "";
                previewImage.style.display = "none";
                filenameText.textContent = "no contents uploaded";
                fileInput.value = "";

                // Reload messages after sending
                if (activeChatUsername) {
                    loadMessages(activeChatUsername);
                }
            })
            .catch((error) => console.error("Error sending message:", error));
    });

    // Handle file input changes
    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => {
                    previewImage.src = reader.result;
                    previewImage.style.display = "block";
                    filenameText.textContent = "";
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.style.display = "none";
                filenameText.textContent = file.name;
            }
        } else {
            previewImage.style.display = "none";
            filenameText.textContent = "no contents uploaded";
        }
    });

    // Initial load of chats
    loadChats();
});
