document.addEventListener("DOMContentLoaded", () => {
    const searchResults = document.getElementById("searchResults");
    const suggested = document.getElementById("suggested");
    const searchBar = document.querySelector(".searchBtn");
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
            console.log(`Fetching data from: ${API_BASE}${endpoint}`);
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
            const data = await response.json();
            console.log(`Response data from ${endpoint}:`, data);
            return data;
        } catch (err) {
            console.error(`Error fetching ${endpoint}:`, err);
            return null;
        }
    }

    // Display suggested users
    async function displaySuggested() {
        const suggestedUsers = await fetchData("/suggest-friends");
        if (suggestedUsers && suggestedUsers.length > 0) {
            console.log("Suggested users:", suggestedUsers);
            suggested.innerHTML = ""; // Clear previous results
            suggestedUsers.forEach(user => {
                const container = document.createElement("div");
                container.classList.add("suggProf");

                // Profile picture and link
                const profileLink = document.createElement("a");
                profileLink.href = `profile.html?userId=${user._id}`;
                const profileImg = document.createElement("img");
                profileImg.src = user.profilePicture || "images/default.jpg"; // Use default image if none
                profileImg.alt = "Profile Picture";
                profileLink.appendChild(profileImg);
                container.appendChild(profileLink);

                // User info
                const userInfo = document.createElement("div");
                userInfo.classList.add("userInfo");
                userInfo.innerHTML = `
                    <h1 class="name">${user.firstName} ${user.lastName}</h1>
                    <p class="username">@${user.username}</p>
                `;
                container.appendChild(userInfo);

                // Add click event to navigate to profile
                container.addEventListener("click", () => {
                    window.location.href = `profile.html?userId=${user._id}`;
                });

                suggested.appendChild(container);
            });
        } else {
            console.log("No suggested users available.");
            suggested.innerHTML = "<p>No suggested users available.</p>";
        }
    }

    // Search functionality
    searchBar.addEventListener('click', async (e) => {
        const query = e.target.value.trim();
        if (query) {
            const users = await fetchData(`/search`);
            console.log("Search results:", users);
            if (users) displaySearchResults(users);
        } else {
            searchResults.innerHTML = ""; // Clear results on empty query
        }
    });

    function displaySearchResults(users) {
        searchResults.style.visibility = 'visible';
        searchResults.innerHTML = ""; // Clear previous results
        users.forEach((user) => {
            const searchItem = document.createElement("div");
            searchItem.classList.add("searchResultItem");

            // Profile picture and link
            const profileLink = document.createElement("a");
            profileLink.href = `profile.html?userId=${user._id}`;
            const profileImg = document.createElement("img");
            profileImg.src = user.profilePicture || "images/default.jpg"; // Use default image if none
            profileImg.alt = "Profile Picture";
            profileLink.appendChild(profileImg);
            searchItem.appendChild(profileLink);

            // User info
            const userInfo = document.createElement("div");
            userInfo.classList.add("userInfo");
            userInfo.innerHTML = `
                <h1 class="name">${user.firstName} ${user.lastName}</h1>
                <p class="username">@${user.username}</p>
            `;
            searchItem.appendChild(userInfo);

            // Add click event to navigate to profile
            searchItem.addEventListener("click", () => {
                window.location.href = `profile.html?userId=${user._id}`;
            });

            searchResults.appendChild(searchItem);
        });
    }

    // Fetch and display top contributors
    async function fetchTopContributors() {
        const contributors = await fetchData("/top-contributor");
        console.log("Top contributors:", contributors);
        if (contributors) displayTopContributors(contributors);
    }

    // Display top contributors
    function displayTopContributors(contributors) {
        if (contributors.length === 0) {
            console.log("No top contributors available.");
            topContributorsContainer.innerHTML = "<p>No top contributors available.</p>";
            return;
        }

        const rankings = ["first", "second", "third"];
        topContributorsContainer.innerHTML = "<h1>🏆Top Contributors🏆</h1>";
        contributors.forEach((contributor, index) => {
            const container = document.createElement("div");
            container.classList.add("contributorProf", rankings[index]);

            // Profile picture and link
            const profileLink = document.createElement("a");
            profileLink.href = `profile.html?userId=${contributor._id}`;
            const profileImg = document.createElement("img");
            profileImg.src = contributor.profilePicture ; // Use default image if none
            profileImg.alt = "Profile Picture";
            profileImg.classList.add('contributorProf');
            profileLink.appendChild(profileImg);
            container.appendChild(profileLink);

            // User info
            const userInfo = document.createElement("div");
            userInfo.classList.add("userInfo");
            userInfo.innerHTML = `
                <h1 class="name">${contributor.firstName} ${contributor.lastName}</h1>
                <p class="username">@${contributor.username}</p>
            `;
            container.appendChild(userInfo);

            // Add ranking
            container.innerHTML += `<div class="afterStuff">${["🥇", "🥈", "🥉"][index]}</div>`;

            topContributorsContainer.appendChild(container);
        });
    }

    // Fetch and display most active friend
    async function fetchMostActiveFriend() {
        const [friend] = await fetchData("/most-active-friend");
        console.log("Most active friend:", friend);
        if (friend) displayMostActiveFriend(friend);
    }

    // Display most active friend
    function displayMostActiveFriend(friend) {
        if (!friend) {
            console.log("No most active friend available.");
            mostActiveFriendContainer.innerHTML = "<p>No active friend found.</p>";
            return;
        }

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
        const requests = await fetchData("/pending-friend-requests");
        console.log("Friend Requests:", requests); // Log the data for debugging
        if (requests) displayFriendRequests(requests);
    }

    // Display friend requests
    function displayFriendRequests(requests) {
        console.log("Displaying Friend Requests:", requests);  // Log data before rendering
    
        friendRequestsContainer.innerHTML = "<h1>Friend Requests</h1>";
    
        // Check if requests is an array (or an object containing an array)
        if (Array.isArray(requests.requests) && requests.requests.length > 0) {
            requests.requests.forEach((req) => {
                console.log("Request:", req);  // Log each friend request to ensure it contains correct data
                
                const container = document.createElement("div");
                container.classList.add("friendReq");
    
                // Profile picture and link
                const profileLink = document.createElement("a");
                profileLink.href = `profile.html?userId=${req._id}`;
                const profileImg = document.createElement("img");
                profileImg.src = req.profilePicture || "images/default.jpg"; // Use default image if none
                profileImg.alt = "Profile Picture";
                profileLink.appendChild(profileImg);
                container.appendChild(profileLink);
    
                // User info
                const userInfo = document.createElement("div");
                userInfo.classList.add("userInfo");
                userInfo.innerHTML = `
                   
                    <p class="username">@${req.username}</p>
                `;
                container.appendChild(userInfo);
    
                // Accept/Reject buttons
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
                acceptBtn.addEventListener("click", () => updateFriendRequest("accept", req._id));
                rejectBtn.addEventListener("click", () => updateFriendRequest("reject", req._id));
    
                friendRequestsContainer.appendChild(container);
            });
        } else {
            friendRequestsContainer.innerHTML += "<p>No friend requests available.</p>";
        }
    }
    

    // Update friend request status
    async function updateFriendRequest(action, userId) {
        console.log(`Updating friend request: ${action} for userId: ${userId}`);
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
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json(); // Parse JSON from the response
            console.log("Profile info:", data); // Log profile info for debugging

            const { profile } = data; // Destructure to get the profile object
            const { profilePicture } = profile;

            if (profilePicture) {
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
