document.addEventListener('DOMContentLoaded', () => {
    fetch('http:localhost:3000/account")
        .then(response => response.json())
        .then(data => {
            const {name, username, occupation, bio, numPosts, numFriends, pfp, posts} = data;
            document.getElementById('name').textContent = name;
            document.getElementById('username').textContent = `@${username}`;
            document.getElementById('occupation').textContent = occupation;
            document.getElementById('bio').textContent = bio;
            document.getElementById('numPosts').textContent = numPosts;
            document.getElementById('numFriends').textContent = numFriends;
            document.getElementById('profilePic').src = pfp;
            document.getElementById('profilePicMain').src = pfp;

            const postGrid = document.getElementById('postGrid');
            posts.forEach(post =>{
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                if (post.type === 'text'){
                    const textContent = document.createElement('p');
                    textContent.textContent = post.content;
                    postElement.appendChild(textContent);
                }
                else if (post.type === 'image'){
                    const imageContent = document.createElement('img');
                    imageContent.src = post.content;
                    imageContent.alt = `Post ${post.id}`;
                    postElement.appendChild(imageContent);
                }
                else if (post.type === 'text_and_image'){ //Im so unsure about posttype like I lirly copied it from google
                    const textContent = document.createElement('p');
                    textContent.textContent = post.content.text;
                    const imageContent = document.createElement('img');
                    imageContent.src = post.content.imageUrl;
                    imageContent.alt = `Post ${post.id}`;
                    postElement.appendChild(textContent);
                    postElement.appendChild(imageContent);
                }
                postGrid.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
        });
});
