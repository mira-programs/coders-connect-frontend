document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.querySelector('.posts');
    const postTextBox = document.getElementById('posttextbox');
    const postButton = document.querySelector('.buttons');
    const privacySelect = document.createElement('select');
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
                const response = await fetch(`http://localhost:3000/post/feed`, { //REPLACE W PUBLIC
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
            postsContainer.innerHTML = '';

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <div class="post-header" data-post-id="${post._id}"> <!-- Highlighted change: added data-post-id attribute -->
                        <div class="post-pfp">
                            <img src="${post.userProfilePic}" alt="profile" />
                        </div>
                        <div class="post-content">
                            <p class="username clickable">${post.username}</p> <!-- Highlighted change: added 'clickable' class for event listener -->
                            <p>${post.content}</p>
                            ${post.media ? `<div class="imagesposted"><img src="${post.media}" alt="post media" /></div>` : ''}
                            <div class="post-footer">
                                <img class="footerpostspics like-button" src="images/like.png" alt="like" /> 
                                <p>${post.likes.length}</p>
                                <img class="footerpostspics dislike-button" src="images/dislike.png" alt="dislike" />
                                <p>${post.dislikes.length}</p>
                                <img class="footerpostspics comment-button" src="images/comment.png" alt="comment" />
                                <p class="optionsposts">...</p>
                            </div>
                            <div class="commentssection" style="display: none;">
                             <div class="sharecomment" >
                                            <textarea class="commenttextbox" rows="2" cols="50" placeholder="comment!"></textarea>
                                            <button class="cbutton">comment!</button>
                                        </div>
                                ${post.comments.map(comment => `

                                    <div class="commentwrap" data-comment-id="${comment._id}">
                                        <div class="commentpfp">
                                            <img src="${comment.userProfilePic}" alt="profile" />
                                        </div>
                                        <div class="commentcontent">
                                            <p class="commentusername clickable">${comment.username}</p> <!-- Highlighted change: added 'clickable' class for event listener -->
                                            <p class="contentcomment">${comment.text}</p>
                                            <div class="likes">
                                                <img class="commentlike" src="images/like.png" alt="like" /> 
                                                <p class="likes-count">${comment.likes.length}</p>
                                                <img class="replytocomments" src="images/comment.png" alt="reply" /> <!-- Highlighted change: added event listener for reply -->
                                            </div>
                                            <div class="sharereply" style="display: none;">
                                                <textarea class="replytextbox" rows="2" cols="50" placeholder="Reply!"></textarea>
                                                <button class="rbutton">Reply!</button>
                                            </div>
                                            <div class="replies">
                                                ${comment.replies.map(reply => `
                                                    <div class="replywrap">
                                                        <p class="replyusername clickable">${reply.username}</p> <!-- Highlighted change: added 'clickable' class for event listener -->
                                                        <p class="replycontent">${reply.text}</p>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                postsContainer.appendChild(postElement);



                // Event listeners for like and reply buttons in comments
                const commentLikes = postElement.querySelectorAll('.commentlike');
                commentLikes.forEach(like => {
                    like.addEventListener('click', () => {

                        const postId = postElement.getAttribute('data-post-id');
                        const commentId = postElement.getAttribute('data-comment-id');
                        toggleLikeDislikecomment(postId, like, commentId);
                    });
                });

                const replyButtons = postElement.querySelectorAll('.replytocomments');
                replyButtons.forEach(replyBtn => {
                    const replyBox = replyBtn.closest('.commentcontent').querySelector('.sharereply');
                    replyBtn.addEventListener('click', () => {
                        replyBox.style.display = replyBox.style.display === 'none' ? 'block' : 'none';
                    });
                    // Event listener for adding a reply
                    const replyButton = replyBox.querySelector('.rbutton');
                    replyButton.addEventListener('click', () => {
                        const postId = postElement.getAttribute('data-post-id');
                        const commentId = replyBtn.closest('.commentwrap').getAttribute('data-comment-id');
                        const replyText = replyBox.querySelector('.replytextbox').value;
                        addReply(postId, commentId, replyText);
                    });
                });
                // Toggle comments section visibility
                const commentButton = postElement.querySelector('.comment-button');
                const commentsSection = postElement.querySelector('.commentssection');
                commentButton.addEventListener('click', () => {
                    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
                });
                //Event listener for likepost
                const likeimage = postElement.querySelector('.like-button');
                likeimage.addEventListener('click', () => {
                    const postId = postElement.getAttribute('data-post-id');
                    toggleLikeDislike(likeimage, postId);
                });
                //event listener dislike
                const dislikeimage = postElement.querySelector('.dislike-button');
                likeimage.addEventListener('click', () => {
                    const postId = postElement.getAttribute('data-post-id');
                    toggleLikeDislike(dislikeimage, postId);
                });

                // Event listener for adding a comment
                const commentTextBox = postElement.querySelector('.commenttextbox');
                const commentSubmitButton = postElement.querySelector('.cbutton');
                if (commentSubmitButton) {
                    commentSubmitButton.addEventListener('click', () => {
                        const postId = postElement.getAttribute('data-post-id');
                        const commentText = commentTextBox.value;
                        addComment(postId, commentText);
                    });
                }

                // Event listener for username clicks
                const usernames = postElement.querySelectorAll('.clickable');
                usernames.forEach(username => {
                    username.addEventListener('click', (e) => {
                        const selectedUsername = e.target.textContent;
                        window.location.href = `profile.html?user=${selectedUsername}`;
                    });
                });
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    // Function to add a new post
    async function addPost(content, privacy, media) {
        try {
            const response = await fetch('/api/posts/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content,
                    privacy,
                    media,
                }),
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
    }
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

    // Event listener for the Post button
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const upload = document.getElementById('uploading');
    const fileNameDisplay = document.getElementById('fileName');

    const resetButton = document.getElementById('resetButton');

    fileInput.addEventListener('change', function () {
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
    postButton.addEventListener('click', async () => {
        const content = postTextBox.value.trim();
        const selectedPrivacy = privacySelect.value;

        if (content) {
            await addPost(content, selectedPrivacy, fileInput); // Add the post

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

    loadPosts('public'); // Load initial posts
});
