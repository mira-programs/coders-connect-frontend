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

    async function fetchUserProfile() {
        try {
            const response = await fetch('http://localhost:3000/account/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
    
            const data = await response.json(); // Parse JSON from the response
            console.log('Parsed data:', data); // Log the parsed data
    
            if (data.message) {
                console.log(data.message); // Log the success message
            }
    
            // Access the individual fields from the profile
            const { profile } = data; // Destructure to get the profile object
    
            // Access individual profile properties
            const { username, firstName, lastName, email, bio, occupation, profilePicture } = profile;
            // Populate the HTML elements with the data
            document.getElementById('profileName').innerText = `${firstName} ${lastName}`;
            document.getElementById('profileUsername').innerText = `@${username}`;
            // document.getElementById('profileEmail').innerText = email;
            document.getElementById('profileBio').innerText = bio || "No bio available";
            document.getElementById('profileOccupation').innerText = occupation || "No occupation provided";
    
            const profilePic = document.getElementById('mainPfp');
            if (profilePic) {
                profilePic.src = profilePicture || "default_profile_pic.jpg"; // Default image if none provided
            }
    
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }
    
    // Call the function
    fetchUserProfile();    
});

