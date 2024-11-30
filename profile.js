document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const editBox = document.getElementById('editBox');
    const closeEB = document.getElementById('closeEB');
    const firstName = document.getElementById('profileFirstName');
    const lastName = document.getElementById('profileLastName');
    const bioFr = document.querySelector('.bio');
    const occupationFr = document.querySelector('.occupation');
    const pfpMain = document.querySelector('#mainPfp');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const frndBtn = document.getElementById('frndBtn');

    let newPfp = null;

    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profilePicInput.src = e.target.result;
                newPfp = file;
            };
            reader.readAsDataURL(file);
        }
    });

    editBtn.addEventListener('click', () => {
        document.getElementById('profileFirstName').value = firstName.textContent;
        document.getElementById('profileLastName').value = lastName.textContent;
        document.getElementById('editBio').value = bioFr.textContent;
        document.getElementById('editOccupation').value = occupationFr.textContent;

        editBox.style.display = 'flex';
    });
    saveBtn.addEventListener('click', async () => {
        const newFirstName = document.getElementById('editFirstName').value;
        const newLastName = document.getElementById('editLastName').value;
        const newBio = document.getElementById('editBio').value;
        const newOccupation = document.getElementById('editOccupation').value;

        // Update the UI immediately (Optimistic UI Update)
        firstName.textContent = newFirstName;
        lastName.textContent = newLastName;
        bioFr.textContent = newBio;
        occupationFr.textContent = newOccupation;

        // Update Name (Only send new values if they exist)
        if (newFirstName || newLastName) {
            await fetch('http://localhost:3000/account/update-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ firstName: newFirstName, lastName: newLastName })
            });
        }

        if (newPfp) {
            const reader = new FileReader();
            reader.onload = function (e) {
                pfpMain.src = e.target.result;
                sidebarPfp.src = e.target.result;
            };
            reader.readAsDataURL(newPfp);
        }

        // Close the edit box
        editBox.style.display = 'none';

        // API Calls
        try {
            // Update Bio
            if (newBio) {
                await fetch('http://localhost:3000/account/update-bio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ bio: newBio })
                });
            }

            // Update Occupation
            if (newOccupation) {
                await fetch('http://localhost:3000/account/update-occupation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify({ occupation: newOccupation })
                });
            }

            // Update Profile Picture
            if (newPfp) {
                const formData = new FormData();
                formData.append('profilePicture', newPfp);

                await fetch('http://localhost:3000/account/update-profilepicture', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: formData
                });
            }

            console.log('Profile updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });

    closeEB.addEventListener('click', () => {
        editBox.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === editBox) {
            editBox.style.display = 'none';
        }
    });

    async function fetchUserProfile() {
        try {
            const response = await fetch('http://localhost:3000/account/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json(); // Parse JSON from the response

            if (data.message) {
                console.log(data.message); // Log the success message
            }

            const { profile } = data; // Destructure to get the profile object

            // Access individual profile properties
            const { username, firstName, lastName, email, bio, occupation, profilePicture, post_count, friend_count } = profile;

            // Populate the HTML elements with the data
            document.getElementById('profileFirstName').innerText = `${firstName}`;
            document.getElementById('profileLastName').innerText = `${lastName}`;
            document.getElementById('profileUsername').innerText = `@${username}`;
            document.getElementById('profileBio').innerText = bio;
            document.getElementById('profileOccupation').innerText = occupation;
            document.getElementById('numPosts').innerText = post_count || 0; // Update post count
            document.getElementById('numFriends').innerText = friend_count || 0;

            // Update profile picture
            const profilePic = document.getElementById('mainPfp');
            if (profilePic) {
                profilePic.src = profilePicture || "default_profile_pic.jpg"; // Default image if none provided
                sidebarPfp.src = profilePicture; // Update sidebar profile picture
            }

        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    // Get the logged-in user's profile data and posts
    async function loadMyPosts() {
        // Replace this with actual token or get the logged-in user from your session

        // Get the token from localStorage
        const token = localStorage.getItem('authToken');
        try {
            // Fetch user's posts using the /user-posts API
            const postsResponse = await fetch('http://localhost:3000/post/user-posts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                //body: JSON.stringify({ userId: userId }),  
            });

            if (!postsResponse.ok) {
                throw new Error('Failed to fetch posts');
            }

            const postsData = await postsResponse.json();
            const posts = postsData.data;

            // Render the posts dynamically in the postGrid
            const postGrid = document.getElementById('postGrid');
            postGrid.innerHTML = ''; // Clear the existing content

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');

                // Create post content (you can customize this layout)
                postElement.innerHTML = `
                <div class="postHeader">
                    <span class="postUser">${post.userId.name}</span>
                    <span class="postDate">${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="postContent">
                    <p>${post.content}</p>
                </div>
                <div class="postActions">
                    <button class="likeBtn">Like</button>
                    <button class="commentBtn">Comment</button>
                </div>
            `;

                // Append the post to the grid
                postGrid.appendChild(postElement);
            });

        } catch (error) {
            console.error('Error fetching profile or posts:', error);
        }
    };

        // Call the function
        fetchUserProfile();
        loadMyPosts();
});

