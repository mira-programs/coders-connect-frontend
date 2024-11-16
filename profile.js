document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const editBox = document.getElementById('editBox');
    const closeEB = document.getElementById('closeEB');
    const nameFr = document.querySelector('.name');
    const bioFr = document.querySelector('.bio');
    const occupationFr = document.querySelector('.occupation');
    const pfpMain = document.querySelector('#mainPfp');
    const sidebarPfp = document.getElementById('sidebarPfp');
    const profilePicInput = document.getElementById('profilePicInput');
    const fileInput = document.getElementById('fileInput');
    const frndBtn = document.getElementById('frndBtn');

    let newPfp = null;

    if (frndBtn) {
        frndBtn.addEventListener('click', () => {
            toggleFriendRequest();
        });
    }

    function toggleFriendRequest() {
        if (frndBtn.textContent === "Request Friendship?") {
            frndBtn.textContent = "Requested";
            frndBtn.classList.add('frndReq');

            //backend to send friend request
        } else {
            frndBtn.textContent = "Request Friendship?";
            frndBtn.classList.remove('frndReq');

            //backend to cancel friend request
        }
    }

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                profilePicInput.src = e.target.result;
                newPfp = file;
            };
            reader.readAsDataURL(file);
        }
    });

    editBtn.addEventListener('click', () => {
        document.getElementById('editName').value = nameFr.textContent;
        document.getElementById('editBio').value = bioFr.textContent;
        document.getElementById('editOccupation').value = occupationFr.textContent;
        
        editBox.style.display = 'flex';
    });
    saveBtn.addEventListener('click', () => {
        
        const newName = document.getElementById('editName').value;
        const newBio = document.getElementById('editBio').value;
        const newOccupation = document.getElementById('editOccupation').value;

        nameFr.textContent = newName;
        bioFr.textContent = newBio;
        occupationFr.textContent = newOccupation;

        if (newPfp) {
            const reader = new FileReader();
            reader.onload = function(e) {
                pfpMain.src = e.target.result;
                sidebarPfp.src = e.target.result;
            };
            reader.readAsDataURL(newPfp);
        }
        editBox.style.display = 'none';
    });

    closeEB.addEventListener('click', () => {
        editBox.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === editBox) {
            editBox.style.display = 'none';
        }
    });


    fetch('http://localhost:3000/account', {
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
        document.getElementById('profilePic').src = pfp;
        document.getElementById('profilePicMain').src = pfp;
        document.getElementById('numPosts').textContent = data.numPosts;
        document.getElementById('numFriends').textContent = data.numFriends;
        
        const postGrid = document.querySelector('.postGrid');
        data.posts.forEach(post => {
            const postStuff = document.createElement('div');
            postStuff.classList.add('post');
            if (post.type === 'text') {
                const textContent = document.createElement('p');
                textContent.textContent = post.content;
                postStuff.appendChild(textContent);
            }
            else if (post.type === 'image') {
                const imageContent = document.createElement('img');
                imageContent.src = post.content;
                imageContent.alt = `Post ${post.id}`;
                postStuff.appendChild(imageContent);
            }
            else if (post.type === 'text_and_image') {
                const textContent = document.createElement('p');
                textContent.textContent = post.content.text;
                const imageContent = document.createElement('img');
                imageContent.src = post.content.imageUrl;
                imageContent.alt = `Post ${post.id}`;
                postStuff.appendChild(textContent);
                postStuff.appendChild(imageContent);
            }
            postGrid.appendChild(postStuff);
        });
    })
    .catch(error => {
        console.error('Error fetching user profile:', error);
    });
});

