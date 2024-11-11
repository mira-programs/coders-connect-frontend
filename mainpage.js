// i made chatgpt help debugg a bit and still not done im working 
// on the fetching i still dont fully understand it
document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.querySelector('.posts');
    const postTextBox = document.getElementById('posttextbox');
    const postButton = document.querySelector('.buttons');
    const privacySelect = document.createElement('select');
    const exploreSection = document.querySelector('.explore-section');

    // Simulated fetchPosts function (replace with real API call)
    async function fetchPosts(filterType) {
        try {
            const response = await fetch(`/api/posts?privacy=${filterType}`);
            const posts = await response.json();
            return posts;
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
                    <div class="post-header">
                        <div class="post-pfp">
                            <img src="${post.userProfilePic}" alt="profile" />
                        </div>
                        <div class="post-content">
                            <p>${post.username}</p>
                            <p>${post.content}</p>
                            ${post.media ? `<div class="imagesposted"><img src="${post.media}" alt="post media" /></div>` : ''}
                            <div class="post-footer">
                                <img class="footerpostspics like-button" src="images/imageforposting.png" alt="like" />
                                <img class="footerpostspics dislike-button" src="images/imageforposting.png" alt="dislike" />
                                <img class="footerpostspics comment-button" src="images/imageforposting.png" alt="comment" />
                                <p class="optionsposts">...</p>
                            </div>
                            <div class="commentssection" style="display: none;">
                                ${post.comments.map(comment => `
                                    <div class="commentwrap">
                                        <div class="commentpfp">
                                            <img src="${comment.userProfilePic}" alt="profile" />
                                        </div>
                                        <div class="commentcontent">
                                            <p class="commentusername">${comment.username}</p>
                                            <p class="contentcomment">${comment.text}</p>
                                            <p class="likes-count">Likes: ${comment.likes.length}</p>
                                            <div class="replies">
                                                ${comment.replies.map(reply => `
                                                    <div class="replywrap">
                                                        <p class="replyusername">${reply.username}</p>
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

                // Toggle comments section visibility
                const commentButton = postElement.querySelector('.comment-button');
                const commentsSection = postElement.querySelector('.commentssection');
                commentButton.addEventListener('click', () => {
                    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
                });

                // Event listener for like/dislike buttons
                const likeButton = postElement.querySelector('.like-button');
                const dislikeButton = postElement.querySelector('.dislike-button');
                likeButton.addEventListener('click', () => toggleLikeDislike(post._id, 'like'));
                dislikeButton.addEventListener('click', () => toggleLikeDislike(post._id, 'dislike'));

                // Event listener for adding a comment
                const commentTextbox = postElement.querySelector('.commenttextbox');
                const commentButtonPost = postElement.querySelector('.cbutton');
                commentButtonPost.addEventListener('click', () => addComment(post._id, commentTextbox.value));
            });
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    }

    // Function to add a new post
    async function addPost(content, privacy) {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    privacy,
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
                const response = await fetch(`/api/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text,
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
                const response = await fetch(`/api/posts/${postId}/comments/${commentId}/replies`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text,
                    }),
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

    // Function to toggle like or dislike
    async function toggleLikeDislike(postId, type) {
        try {
            const response = await fetch(`/api/posts/${postId}/${type}`, {
                method: 'POST',
            });

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
    postButton.addEventListener('click', async () => {
        const content = postTextBox.value.trim();
        const selectedPrivacy = privacySelect.value;

        if (content) {
            await addPost(content, selectedPrivacy); // Add the post
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
