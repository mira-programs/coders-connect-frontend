document.addEventListener("DOMContentLoaded", () => {
    const searchResults = document.getElementById("searchResults");
    const suggested = document.getElementById("suggested");
    const searchBar = document.querySelector(".searchBar");
    const topContributorsContainer = document.querySelector(".maxPost");
    const mostActiveFriendContainer = document.querySelector(".maxFriend .actFriend");
    const friendRequestsContainer = document.querySelector(".reqCont");

    const API_BASE = "http://localhost:3000/friendship"; // Update with your server's base API URL

    // Clear all sections
    function clearAll() {
        searchBar.value = ""; // Clear search bar
        searchResults.innerHTML = ""; // Clear search results
        topContributorsContainer.innerHTML = "<h1>🏆Top Contributors🏆</h1>"; // Reset top contributors
        mostActiveFriendContainer.innerHTML = ""; // Clear most active friend
        friendRequestsContainer.innerHTML = "<h1>Friend Requests</h1>"; // Reset friend requests
    }
    clearAll();

    // Fetch data from API
    async function fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Ensure token is set
                },
                ...options,
            });

            if (!response.ok) {
                console.error(`Error fetching ${endpoint}: ${response.statusText}`);
                return null;
            }
            return await response.json();
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return null;
        }
    }

    // Function to create reusable friend elements
    function createFriendElement(friend, type) {
        const container = document.createElement("div");
        container.classList.add(type);

        // Profile picture and link
        const profileLink = document.createElement("a");
        profileLink.href = `profile.html?userId=${friend._id}`;
        const profileImg = document.createElement("img");
        profileImg.src = friend.profilePicture || "images/default.jpg"; // Use default image if none
        profileImg.alt = "Profile Picture";
        profileLink.appendChild(profileImg);
        container.appendChild(profileLink);

        // User info
        const userInfo = document.createElement("div");
        userInfo.classList.add("userInfo");
        userInfo.innerHTML = `
            <h1 class="name">${friend.firstName} ${friend.lastName}</h1>
            <p class="username">@${friend.username}</p>
        `;
        container.appendChild(userInfo);

        // Actions for friend requests
        if (type === "friendReq") {
            const actions = document.createElement("div");
            actions.classList.add("afterfrndStuff");

            const acceptBtn = document.createElement("button");
            acceptBtn.classList.add("butt", "accept");
            acceptBtn.textContent = "Accept";
            actions.appendChild(acceptBtn);

            const rejectBtn = document.createElement("button");
            rejectBtn.classList.add("butt", "reject");
            rejectBtn.textContent = "Reject";
            actions.appendChild(rejectBtn);

            container.appendChild(actions);

            // Event listeners for accept and reject
            acceptBtn.addEventListener("click", () => updateFriendRequest("accept", friend._id));
            rejectBtn.addEventListener("click", () => updateFriendRequest("reject", friend._id));
        }

        return container;
    }

    // Display suggested users
    async function displaySuggested() {
        const suggestedUsers = await fetchData("/suggested-users");
        if (suggestedUsers && suggestedUsers.length > 0) {
            suggested.innerHTML = ""; // Clear previous results
            suggestedUsers.forEach(user => {
                const suggest = createFriendElement(user, "suggProf");
                suggested.appendChild(suggest);

                // Add click event to navigate to profile
                suggest.addEventListener("click", () => {
                    window.location.href = `profile.html?userId=${user._id}`;
                });
            });
        } else {
            suggested.innerHTML = "<p>No suggested users available.</p>";
        }
    }

    // Search functionality
    searchBar.addEventListener("input", async (e) => {
        const query = e.target.value.trim();
        if (query) {
            const users = await fetchData(`/search-users?q=${query}`);
            if (users) displaySearchResults(users);
        } else {
            searchResults.innerHTML = ""; // Clear results on empty query
        }
    });

    function displaySearchResults(users) {
        searchResults.style.visibility= 'visible';
        searchResults.innerHTML = ""; // Clear previous results
        users.forEach((user) => {
            const searchItem = createFriendElement(user, "searchResultItem");
            searchResults.appendChild(searchItem);

            // Add click event to navigate to profile
            searchItem.addEventListener("click", () => {
                window.location.href = `profile.html?userId=${user._id}`;
            });
        });
    }

    // Fetch and display top contributors
    async function fetchTopContributors() {
        const contributors = await fetchData("/top-contributor");
        if (contributors) displayTopContributors(contributors);
    }

    // Display top contributors
    function displayTopContributors(contributors) {
        const rankings = ["first", "second", "third"];
        topContributorsContainer.innerHTML = "<h1>🏆Top Contributors🏆</h1>";
        contributors.forEach((contributor, index) => {
            const contributorElement = createFriendElement(contributor, "contributorProf");
            contributorElement.classList.add(rankings[index]); // Add ranking class
            contributorElement.innerHTML += `<div class="afterStuff">${["🥇", "🥈", "🥉"][index]}</div>`;
            topContributorsContainer.appendChild(contributorElement);
        });
    }

    // Fetch and display most active friend
    async function fetchMostActiveFriend() {
        const [friend] = await fetchData("/most-active-friend");
        if (friend) displayMostActiveFriend(friend);
    }

    // Display most active friend
    function displayMostActiveFriend(friend) {
        mostActiveFriendContainer.innerHTML = `
            <a class="thePfpFriend" href="profile.html?userId=${friend._id}">
                <img src="${friend.profilePicture || "images/default.jpg"}" alt="Profile Picture">
            </a>
            <div class="attFriend">
                <h1 class="name">${friend.firstName} ${friend.lastName}</h1>
                <p class="username">@${friend.username}</p>
            </div>`;
    }

    // Fetch and display friend requests
    async function fetchFriendRequests() {
        const requests = await fetchData("/friend-requests");
        if (requests) displayFriendRequests(requests);
    }

    // Display friend requests
    function displayFriendRequests(requests) {
        friendRequestsContainer.innerHTML = "<h1>Friend Requests</h1>";
        requests.forEach((req) => {
            const requestElement = createFriendElement(req, "friendReq");
            friendRequestsContainer.appendChild(requestElement);
        });
    }

    // Update friend request status
    async function updateFriendRequest(action, userId) {
        const result = await fetchData(`/${action}-friend-request`, {
            method: "POST",
            body: JSON.stringify({ userId }),
        });
        if (result) fetchFriendRequests(); // Refresh requests after action
    }

    // Load profile picture for the sidebar
    async function loadSideBarPfp() {
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

    // Initial data fetch
    fetchTopContributors();
    fetchMostActiveFriend();
    fetchFriendRequests();
    displaySuggested(); // Call the function to display suggested users
});
