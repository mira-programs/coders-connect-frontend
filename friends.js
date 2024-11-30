document.addEventListener("DOMContentLoaded", () => {
    const searchResults = document.getElementById("searchResults");
    const searchBar = document.querySelector(".searchBar");
    const topContributorsContainer = document.querySelector(".maxPost");
    const mostActiveFriendContainer = document.querySelector(".maxFriend .actFriend");
    const friendRequestsContainer = document.querySelector(".reqCont");

    const API_BASE = "http://localhost:5000/api/friendship"; // Update with your server's base API URL

    // Fetch function helper
    async function fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is set
                },
                ...options,
            });
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

    // Initial data fetch
    fetchTopContributors();
    fetchMostActiveFriend();
    fetchFriendRequests();
});
