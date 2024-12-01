document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.querySelector('.posts');
    const exploreSection = document.querySelector('.explore-section');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const privacySelect = document.getElementById('privacySelect');
    const postTextBox = document.getElementById('posttextbox');
    const postButton = document.getElementById('postButton');
    const resetButton = document.getElementById('resetButton');

    async function fetchPosts(filterType) {
        try {
            const endpoint = filterType === "friends" ? "feed" : "explore";
            const response = await fetch(`http://localhost:3000/post/${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    }
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
                    postTextBox.value = '';
                    preview.src = '';
                    preview.style.display = 'none';
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
                postPfp.src = post.userId.profilePicture || 'default-pfp.png';
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
                    media.src = post.media;
                    media.alt = 'Post Media';
                    postElement.appendChild(media);
                }

                // Post footer (likes/dislikes/comments)
                const postFooter = document.createElement('div');
                postFooter.classList.add('post-footer');

                const likeButton = document.createElement('img');
                likeButton.src = 'like.png';
                likeButton.alt = 'Like';
                likeButton.classList.add('footerpostspics');
                postFooter.appendChild(likeButton);

                const likeCount = document.createElement('p');
                likeCount.textContent = post.likes.length;
                likeCount.classList.add('likes-count');
                postFooter.appendChild(likeCount);

                likeButton.addEventListener('click', () => toggleLikeDislike(post._id, likeButton));

                const dislikeButton = document.createElement('img');
                dislikeButton.src = 'dislike.png';
                dislikeButton.alt = 'Dislike';
                dislikeButton.classList.add('footerpostspics');
                postFooter.appendChild(dislikeButton);

                const dislikeCount = document.createElement('p');
                dislikeCount.textContent = post.dislikes.length;
                dislikeCount.classList.add('likes-count');
                postFooter.appendChild(dislikeCount);

                dislikeButton.addEventListener('click', () => toggleLikeDislike(post._id, dislikeButton));

                const commentButton = document.createElement('img');
                commentButton.src = 'comment.png';
                commentButton.alt = 'Comment';
                commentButton.classList.add('footerpostspics');
                postFooter.appendChild(commentButton);

               

                // Display comments section
                commentButton.addEventListener('click', () => {
                    if (!postElement.querySelector('.comments-section')) {
                        const commentsSection = createCommentsSection(post);
                        postElement.appendChild(commentsSection);
                    }
                });

                postElement.appendChild(postFooter);
                postsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    function createCommentsSection(post) {
        const commentsSection = document.createElement('div');
        commentsSection.classList.add('commentssection');

        const commentsHTML = post.comments.map(comment => `
            <div class="commentwrap" data-comment-id="${comment._id}">
                <div class="commentpfp">
                    <img src="${comment.userProfilePic}" alt="profile" />
                </div>
                <div class="commentcontent">
                    <p class="commentusername">${comment.username}</p>
                    <p class="contentcomment">${comment.text}</p>
                    <div class="likes">
                        <img src="images/like.png" alt="like" class="commentlike" />
                        <p class="likes-count">${comment.likes.length}</p>
                        <img src="images/comment.png" alt="reply" class="replytocomments" />
                    </div>
                    <div class="sharereply">
                        <textarea class="replytextbox" rows="2" cols="50" placeholder="Reply!"></textarea>
                        <button class="rbutton">Reply!</button>
                    </div>
                </div>
            </div>
        `).join('');

        commentsSection.innerHTML = `
            <textarea class="commenttextbox" rows="2" cols="50" placeholder="comment!"></textarea>
            <button class="cbutton">Comment!</button>
            ${commentsHTML}
        `;

        const submitCommentButton = commentsSection.querySelector('.cbutton');
        submitCommentButton.addEventListener('click', () => {
            const commentText = commentsSection.querySelector('.commenttextbox').value;
            addComment(post._id, commentText);
        });

        const replyButtons = commentsSection.querySelectorAll('.rbutton');
        replyButtons.forEach(replyButton => {
            replyButton.addEventListener('click', (event) => {
                const commentWrap = event.target.closest('.commentwrap');
                const commentId = commentWrap.dataset.commentId;
                const replyText = commentWrap.querySelector('.replytextbox').value;
                addReply(post._id, commentId, replyText);
            });
        });

        return commentsSection;
    }

    async function addComment(postId, text) {
        try {
            const response = await fetch(`http://localhost:3000/post/comment-post`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId, text })
            });
            if (response.ok) {
                loadPosts('public');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }

    async function addReply(postId, commentId, text) {
        try {
            const response = await fetch(`http://localhost:3000/post/comment-reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId, commentId, text })
            });
            if (response.ok) {
                loadPosts('public');
            }
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    }

    async function toggleLikeDislike(postId, button) {
        try {
            // Check current state based on the image source
            const isLiked = button.src.includes('liked.png');
            const isDisliked = button.src.includes('disliked.png');
            const postFooter = button.closest('.post-footer');
    
            let action = '';
            let oppositeButton = null;
    
            if (isLiked || isDisliked) {
                // If already liked/disliked, the action is to remove the reaction
                action = isLiked ? 'remove-like' : 'remove-dislike';
            } else {
                // If not liked/disliked, the action depends on the clicked button
                action = button.alt === 'Like' ? 'like-post' : 'dislike-post';
                oppositeButton = button.alt === 'Like'
                    ? postFooter.querySelector('img[alt="Dislike"]')
                    : postFooter.querySelector('img[alt="Like"]');
            }
    
            // Send API request for the determined action
            const response = await fetch(`http://localhost:3000/post/${action}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ postId })
            });
    
            if (response.ok) {
                // Update the image states based on the new action
                if (action === 'like-post') {
                    button.src = 'liked.png';
                    if (oppositeButton) oppositeButton.src = 'dislike.png';
                } else if (action === 'dislike-post') {
                    button.src = 'disliked.png';
                    if (oppositeButton) oppositeButton.src = 'like.png';
                } else {
                    // Remove like or dislike
                    button.src = button.alt === 'Like' ? 'like.png' : 'dislike.png';
                }
            } else {
                console.error('Failed to toggle like/dislike');
            }
        } catch (error) {
            console.error('Error toggling like/dislike:', error);
        }
    }
    

    loadPosts('public');

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});
resetButton.addEventListener('click', () => {
    fileInput.value = '';
    preview.src = '';
    preview.style.display = 'none';
    postTextBox.value = '';
});

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
                postTextBox.value = '';
                preview.src = '';
                preview.style.display = 'none';
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

    loadPosts('public'); // Load initial posts

});