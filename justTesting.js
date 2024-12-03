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
    const updatedText = document.getElementById('modalPostText').value;
    const modalPostImage = document.getElementById('modalPostImage');
    const addImageBox = document.getElementById('addImageBox');
    const removeImageBtn = document.getElementById('removeImageBtn');

    let newPfp = null;
    let currentPostId = null; // Store the current post ID for editing

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

    // Edit button for profile info
    editBtn.addEventListener('click', () => {
        document.getElementById('editFirstName').value = firstName.textContent;
        document.getElementById('editLastName').value = lastName.textContent;
        document.getElementById('editBio').value = bioFr.textContent;
        document.getElementById('editOccupation').value = occupationFr.textContent;

        editBox.style.display = 'flex';
    });

    // Save profile changes
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

        // Update Profile Picture (if changed)
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

            // Update the UI immediately (for the profile picture)
            const reader = new FileReader();
            reader.onload = function (e) {
                pfpMain.src = e.target.result;
                sidebarPfp.src = e.target.result;
            };
            reader.readAsDataURL(newPfp);
        }

        // Close the edit box
        editBox.style.display = 'none';

        // API Calls to update Bio and Occupation
        try {
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

            console.log('Profile updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });

    // Close the edit box when clicked outside
    closeEB.addEventListener('click', () => {
        editBox.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editBox) {
            editBox.style.display = 'none';
        }
    });

    // Fetch user profile data
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

            const data = await response.json();
            const { profile } = data;
            const { username, firstName, lastName, bio, occupation, profilePicture, post_count, friend_count } = profile;

            document.getElementById('profileFirstName').innerText = firstName;
            document.getElementById('profileLastName').innerText = lastName;
            document.getElementById('profileUsername').innerText = `@${username}`;
            document.getElementById('profileBio').innerText = bio;
            document.getElementById('profileOccupation').innerText = occupation;
            document.getElementById('numPosts').innerText = post_count || 0;
            document.getElementById('numFriends').innerText = friend_count || 0;

            const profilePic = document.getElementById('mainPfp');
            profilePic.src = profilePicture || "default_profile_pic.jpg";
            sidebarPfp.src = profilePicture || "default_profile_pic.jpg";  // Handle case when no picture is available
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }

    // Load user posts
    async function loadMyPosts() {
        const token = localStorage.getItem('authToken');
        try {
            const postsResponse = await fetch('http://localhost:3000/post/user-posts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!postsResponse.ok) {
                throw new Error('Failed to fetch posts');
            }

            const postsData = await postsResponse.json();
            const posts = postsData.data;

            const postGrid = document.querySelector('.postGrid');
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.dataset.postId = post._id;

                const content = document.createElement('p');
                content.classList.add('content');
                content.textContent = post.content;

                postElement.appendChild(content);

                if (post.media) {
                    const image = document.createElement('img');
                    image.classList.add('media');
                    image.src = post.media;
                    postElement.appendChild(image);
                }

                postGrid.appendChild(postElement);

                // Add click event to open the post modal for editing
                postElement.addEventListener('click', () => {
                    openPostModal(post);
                });
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    // Open post modal for editing
    function openPostModal(post) {
        currentPostId = post._id;
        const modalPostText = document.getElementById('modalPostText');
        const modalPostImage = document.getElementById('modalPostImage');
        const addImageBox = document.getElementById('addImageBox');
        const removeImageBtn = document.getElementById('removeImageBtn');

        modalPostText.value = post.content || '';
        if (post.media) {
            modalPostImage.src = post.media;
            modalPostImage.style.display = 'block';
            addImageBox.style.display = 'none';
            removeImageBtn.style.display = 'block';
        } else {
            modalPostImage.style.display = 'none';
            addImageBox.style.display = 'block';
            removeImageBtn.style.display = 'none';
        }

        document.getElementById('postModal').style.display = 'flex';
    }

    // Save post edits
    window.savePost = async function () {
        const postContent = document.getElementById('modalPostText').value;
        const postImage = document.getElementById('modalPostImage');

        const updatedPost = { content: postContent };

        if (postImage && postImage.style.display !== 'none') {
            updatedPost.media = postImage.src;
        }

        try {
            await fetch(`http://localhost:3000/post/update/${currentPostId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(updatedPost)
            });

            const postElement = document.querySelector(`.post[data-post-id="${currentPostId}"]`);
            postElement.querySelector('.content').textContent = postContent;

            const existingImage = postElement.querySelector('.media');
            if (existingImage) {
                existingImage.src = postImage.src;
            } else {
                const newImage = document.createElement('img');
                newImage.classList.add('media');
                newImage.src = postImage.src;
                postElement.appendChild(newImage);
            }

            closePostModal();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post.');
        }
    };

    // Trigger post modal image upload
    window.changeImage = function (event) {
        const file = event.target.files[0];
        const addImageBox = document.getElementById('addImageBox');
        const modalImage = document.getElementById('modalPostImage');
        const removeImageBtn = document.getElementById('removeImageBtn');

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                modalImage.src = e.target.result;
                modalImage.style.display = 'block';
                addImageBox.style.display = 'none';
                removeImageBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            modalImage.style.display = 'none';
            addImageBox.style.display = 'block';
            removeImageBtn.style.display = 'none';
        }
    };

    window.removeImage = function () {
        const modalPostImage = document.getElementById('modalPostImage');
        const addImageBox = document.getElementById('addImageBox');
        const removeImageBtn = document.getElementById('removeImageBtn');
        modalPostImage.style.display = 'none';
        addImageBox.style.display = 'block';
        removeImageBtn.style.display = 'none';
        document.getElementById('imageInput').value = '';
    };

    // Fetch user profile and posts when the page loads
    fetchUserProfile();
    loadMyPosts();
});
