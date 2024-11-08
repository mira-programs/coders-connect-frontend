document.addEventListener('DOMContentLoaded', () => {
    fetch('http:localhost:3000/account', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message){
            console.error(data.message);
            return;
        }
        document.querySelector('.name').textContent = data.name;
        document.querySelector('.username').textContent = data.username;
        document.querySelector('.bio').textContent = data.bio;
        document.querySelector('.occupation').textContent = data.occupation;
        document.getElementById('profilePic').src = data.pfp;
        document.getElementById('profilePicMain').src = data.pfp;
        document.getElementById('numPosts').textContent = data.numPosts;
        document.getElementById('numFriends').textContent = data.numFriends;
        
        const postGrid = document.querySelector('.postGrid');
        data.posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            if (post.type === 'text') {
                const textContent = document.createElement('p');
                textContent.textContent = post.content;
                postElement.appendChild(textContent);
            }
            else if (post.type === 'image') {
                const imageContent = document.createElement('img');
                imageContent.src = post.content;
                imageContent.alt = `Post ${post.id}`;
                postElement.appendChild(imageContent);
            }
            else if (post.type === 'text_and_image') {
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
