document.addEventListener("DOMContentLoaded", () => {
    const socket = io("#"); // Update this to match Socket.IO server
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

    let activeChatUsername = null;
    let activeChatUserId = null;

    // Load sidebar chats
    async function loadSidebarChats() {
        try {
            const response = await fetch("http://localhost:3000/message/getUsersForSidebar", {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });
            const users = await response.json();

            chatsDiv.innerHTML = ""; // Clear existing chats
            users.forEach((user) => {
                const chatDiv = document.createElement("div");
                chatDiv.classList.add("singlechat");
                chatDiv.dataset.userId = user._id; // Store user ID for chat
                chatDiv.dataset.username = user.username;
                chatDiv.dataset.profilePicture = user.profilePicture || "default.png"; // Fallback if no profile picture

                chatDiv.innerHTML = `
                    <div class="pfpwrap">
                        <img src="${user.profilePicture || "default.png"}" class="profile offline"/>
                    </div>
                    <p class="username">${user.username}</p>
                    <p class="newmesssage"></p>
                `;

                // Add event listener for opening chat
                chatDiv.addEventListener("click", () => {
                    updateMessagingHeader(user.username, user.profilePicture);
                    loadMessages(user._id);
                });

                chatsDiv.appendChild(chatDiv);
            });
        } catch (error) {
            console.error("Error loading sidebar chats:", error);
        }
    }

    // Update the messaging header
    function updateMessagingHeader(username, profilePicture) {
        profileImage.src = profilePicture || "default.png";
        usernameDisplay.textContent = username;
        activeChatUsername = username;
    }

    // Load messages for a specific user
    async function loadMessages(userId) {
        try {
            activeChatUserId = userId;
            const response = await fetch(`http://localhost:3000/message/messages/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
            });
            const messages = await response.json();

            displayTextsDiv.innerHTML = ""; // Clear previous messages
            messages.forEach((message) => {
                addMessageToDisplay(message);
            });
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    }

    // Add a single message to the display
    function addMessageToDisplay(message) {
        const messageDiv = document.createElement("div");
        const isSender = message.senderId === localStorage.getItem("userId");

        messageDiv.classList.add("message", isSender ? "me" : "them");
        messageDiv.id = `message-${message._id}`;

        if (message.message) {
            messageDiv.innerHTML = `
                <p class="${isSender ? "mymessage" : "theirmessage"}">
                    ${message.message}
                </p>`;
        }

        displayTextsDiv.appendChild(messageDiv);
    }

    // Handle sending a message
    sendButton.addEventListener("click", async () => {
        const messageContent = textBox.value.trim();
        if (!messageContent || !activeChatUserId) return;

        try {
            const response = await fetch(`http://localhost:3000/message/messages/send/${activeChatUserId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ message: messageContent }),
            });
            const newMessage = await response.json();

            socket.emit("newMessage", newMessage); // Emit new message event
            addMessageToDisplay(newMessage); // Add message locally

            // Clear the input field
            textBox.value = "";
            previewImage.style.display = "none";
            filenameText.textContent = "no contents uploaded";
            fileInput.value = "";
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    // Listen new message events
    socket.on("newMessage", (message) => {
        if (message.receiverId === localStorage.getItem("userId") || message.senderId === activeChatUserId) {
            addMessageToDisplay(message);
        }
    });

    // Listen for chat status updates
    socket.on("updateChatStatus", (userId, isOnline) => {
        const chatDiv = [...chatsDiv.children].find(
            (div) => div.dataset.userId === userId
        );
        if (chatDiv) {
            const profileImg = chatDiv.querySelector(".profile");
            profileImg.classList.toggle("online", isOnline);
            profileImg.classList.toggle("offline", !isOnline);
        }
    });
    async function loadSideBarPfp () {
        try {
          const response = await fetch(
            "http://localhost:3000/account/profile",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "authToken"
                )}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }

          const data = await response.json(); // Parse JSON from the response

          if (data.message) {
            console.log(data.message); // Log the success message
          }

          const { profile } = data; // Destructure to get the profile object

          // Access individual profile properties
          const {
            username,
            firstName,
            lastName,
            email,
            bio,
            occupation,
            profilePicture,
            post_count,
            friend_count,
          } = profile;

          if (profilePic) {
            document.getElementById("sidebarPfp").src = profilePicture;
          }
        } catch (error) {
          console.error("Error fetching profile info:", error);
        }
      };
      loadSideBarPfp();
      
    // Initial load
    loadSidebarChats();
});
