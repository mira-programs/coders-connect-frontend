document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.querySelector('.posts');
    const exploreSection = document.querySelector('.explore-section');

    async function fetchPosts(filterType) {
        try {
            if (filterType === "friends") {
                const response = await fetch(`http://localhost:3000/post/feed`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const result = await response.json();
                return result.data;
            }
            else {
                const response = await fetch(`http://localhost:3000/post/explore`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const result = await response.json();
                return result.data;
            }

        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    }

    // Function to load posts
    async function loadPosts(filterType) {
        try {
            const posts = await fetchPosts(filterType);
            postsContainer.innerHTML = ''; // Clear previous posts

            posts.forEach(post => {
                // Create post element
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                // Post header (user info)
                const postHeader = document.createElement('div');
                postHeader.classList.add('post-header');

                const postPfp = document.createElement('img');
                postPfp.src = post.userId.profilePicture; // Assuming profile picture URL
                postPfp.alt = 'Profile Picture';
                postHeader.appendChild(postPfp);

                const postContent = document.createElement('div');
                postContent.classList.add('post-content');
                postContent.innerHTML = `<p>${post.userId.username}</p><p>${post.content}</p>`;
                postHeader.appendChild(postContent);

                postElement.appendChild(postHeader);

                // Post media (if available)
                if (post.media) {
                    const media = document.createElement('img');
                    media.src = post.media; // Assuming media is an image URL
                    media.alt = 'Post Image';
                    postElement.appendChild(media);
                }

                // Post footer (likes/dislikes)
                const postFooter = document.createElement('div');
                postFooter.classList.add('post-footer');

                const likeButton = document.createElement('img');
                likeButton.src = 'like.png'; // Placeholder, replace with actual icon/image
                likeButton.alt = 'Like';
                postFooter.appendChild(likeButton);

                const dislikeButton = document.createElement('img');
                dislikeButton.src = 'dislike.png'; // Placeholder, replace with actual icon/image
                dislikeButton.alt = 'Dislike';
                postFooter.appendChild(dislikeButton);

                postElement.appendChild(postFooter);

                // Add post to the container
                postsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }
    {//pack of consts
        const fileInput = document.getElementById('fileInput');
        const preview = document.getElementById('preview');
        const upload = document.getElementById('uploading');
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        const privacySelect = document.getElementById('privacySelect');
        const postTextBox = document.getElementById('posttextbox');
        const postButton = document.querySelector('.buttons');
        const resetButton = document.getElementById('resetButton');
    }
    { //things for the post preview reset etc
        fileInput.addEventListener('change', function () { //for previewing the image uploaded for the post
            const file = this.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (file.type.startsWith('image/')) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                        fileNameDisplay.textContent = ''; // Clear file name if it is an image
                    } else {
                        preview.src = 'placeholder-image.png'; // Reset to placeholder if not an image
                        preview.style.display = 'none';
                        fileNameDisplay.textContent = file.name; // Display file name
                    }
                }
                reader.readAsDataURL(file);
            } else {
                preview.src = 'placeholder-image.png'; // Reset to placeholder
                preview.style.display = 'none';
                fileNameDisplay.textContent = '';
            }
        });

        resetButton.addEventListener('click', function () {
            fileInput.value = ''; // Clear the file input
            preview.src = 'placeholder-image.png'; // Reset the preview image
            preview.style.display = 'none';
            fileNameDisplay.textContent = ''; // Reset file name display
        });
    }
    //creating a new post
    postButton.addEventListener('click', async () => {
        const newPostContent = postTextBox.value.trim();
        const newPostPrivacy = privacySelect.value;
        const newPostMedia = fileInput.files[0];

        if (newPostContent) {
            const formData = new FormData();
            formData.append('content', newPostContent);
            formData.append('privacy', newPostPrivacy);
            if (newPostMedia) {
                formData.append('media', newPostMedia);
            }
            try {
                const response = await fetch('http://localhost:3000/post/create', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: formData,
                });

                if (response.ok) {
                    postTextBox.value = ''; // Clear the input
                    loadPosts('public'); // Reload posts
                } else {
                    console.error('Failed to post');
                }
            } catch (error) {
                console.error('Error posting content:', error);
            }

        } else {
            alert('Please write something to post.');
        }
    });

    // Function to add a comment to a post
    async function addComment(postId, text) {
        if (text.trim()) {
            try {
                const response = await fetch(`/api/post/comment-post`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        text,
                        postId,
                    }),
                });

                if (response.ok) {
                    loadPosts('public'); // Reload posts to include new comment
                } else {
                    console.error('Failed to add comment');
                }
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
    }
    // Function to add a reply to a comment
    async function addReply(postId, commentId, text) {
        if (text.trim()) {
            try {
                const response = await fetch(`/api/post/comment-reply`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        text,
                        commentId,
                        postId,
                    })
                });

                if (response.ok) {
                    loadPosts('public'); // Reload posts to include new reply
                } else {
                    console.error('Failed to add reply');
                }
            } catch (error) {


                console.error('Error adding reply:', error);
            }
        }
    }
    // Function to toggle like or dislike comments
    async function toggleLikeDislikecomment(postId, likeButton, commentId) {
        try {
            if (likeButton.src === 'images/like.png') {
                const response = await fetch(`/api/post/like-post`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        commentId,
                        postId,
                    })
                });
                likeButton.src = 'images/liked.png';
            }
            else {
                const response = await fetch(`/api/post/dislike-post`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        commentId,
                        postId,
                    })
                });
                likeButton.src = 'images/disliked.png';
            }

            if (response.ok) {
                loadPosts('public'); // Reload posts to reflect like/dislike change

            } else {
                console.error('Failed to toggle like/dislike');

            }
        } catch (error) {
            console.error('Error toggling like/dislike:', error);
        }
    }
    // Function to toggle like or dislike
    async function toggleLikeDislike(postId, likeButton) {
        try {
            if (likeButton.src === 'images/like.png') {
                const response = await fetch(`/api/post/like-post`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({

                        postId,
                    })
                });
                likeButton.src = 'images/liked.png';
            }
            else {
                const response = await fetch(`/api/post/dislike-post`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({

                        postId,
                    })
                });
                likeButton.src = 'images/disliked.png';
            }

            if (response.ok) {
                loadPosts('public'); // Reload posts to reflect like/dislike change

            } else {
                console.error('Failed to toggle like/dislike');

            }
        } catch (error) {
            console.error('Error toggling like/dislike:', error);
        }
    }

    // Event listener for explore section (clicking on 'Explore' or 'Friends')
    exploreSection.addEventListener('click', (event) => {
        if (event.target.textContent === 'Explore') {
            loadPosts('public');
            document.getElementById('explore').classList.add("chosensection");
            document.getElementById('friends').classList.remove("chosensection");

        } else if (event.target.textContent === 'Friends') {
            loadPosts('friends');
            document.getElementById('friends').classList.add("chosensection");
            document.getElementById('explore').classList.remove("chosensection");
        }
    });

    loadPosts('public'); // Load initial posts
});
