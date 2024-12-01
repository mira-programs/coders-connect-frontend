document.addEventListener('DOMContentLoaded', () => {
    const changePassBtn = document.getElementById('changePassBtn');
    const deactAccBtn = document.getElementById('deactAccBtn');
    const deleteAccBtn = document.getElementById('deleteAccBtn');
    const passBox = document.getElementById('passBox');
    const passBtn = document.getElementById('passBtn');
    const deactBox = document.getElementById('deactBox');
    const yesDeactBtn = document.getElementById('yesDeactBtn');
    const noDeactBtn = document.getElementById('noDeactBtn');
    const deleteBox = document.getElementById('deleteBox');
    const yesDeleteBtn = document.getElementById('yesDeleteBtn');
    const noDeleteBtn = document.getElementById('noDeleteBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const oldPass = document.getElementById('oldPass');
    const newPass = document.getElementById('newPass');
    const confPass = document.getElementById('confPass');
    const noMatch = document.getElementById('noMatch');
    const retryBtn = document.getElementById('retry');
    const idek = document.getElementById('idek');

    const userToken = localStorage.getItem('authToken');
    window.addEventListener('click', (event) => {
        if (event.target === passBox) {
            oldPass.value = '';
            newPass.value = '';
            confPass.value = '';
            passBox.style.display = 'none';
        }
        if (event.target === deactBox) {
            deactBox.style.display = 'none';
        }
        if (event.target === deleteBox) {
            deleteBox.style.display = 'none';
        }
    });

    changePassBtn.addEventListener('click', () => {
        passBox.style.display = 'flex';
    });
    passBtn.addEventListener('click', () => {
        const oldPassword = oldPass.value;
        const newPassword = newPass.value;
        const confirmPassword = confPass.value;

        if (newPassword !== confirmPassword) {
            noMatch.style.display = 'flex';
            return;
        }

        changePassword(oldPassword, newPassword);
        
        passBox.style.display = 'none';
    });
    retryBtn.addEventListener('click', () => {
        noMatch.style.display = 'none';
    });
    closePB.addEventListener('click', () => {
        oldPass.value = '';
        newPass.value = '';
        confPass.value = '';
        passBox.style.display = 'none';
    });

    deactAccBtn.addEventListener('click', () => {
        deactBox.style.display = 'flex';
    });
    yesDeactBtn.addEventListener('click', () => {
        deactivateAccount();
        deactBox.style.display = 'none';
    });
    noDeactBtn.addEventListener('click', () => {
        deactBox.style.display = 'none';
    });

    closeDTB.addEventListener('click', () => {
        deactBox.style.display = 'none';
    });

    deleteAccBtn.addEventListener('click', () => {
        deleteBox.style.display = 'flex';
    });
    yesDeleteBtn.addEventListener('click', () => {
        deleteAccount();
        deleteBox.style.display = 'none';
    });
    noDeleteBtn.addEventListener('click', () => {
        deleteBox.style.display = 'none';
    });
    closeDB.addEventListener('click', () => {
        deactBox.style.display = 'none';
    });
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    });
    

    async function changePassword(oldPassword, newPassword) {
        try {
            const response = await fetch('http:localhost:3000/account/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    currentPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Password changed successfully');
            } else {
                alert(data.message || 'Error updating password');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the password.');
        }
    }

    async function deactivateAccount() {
        try {
            const response = await fetch('http:localhost:3000/account/deactivateAccount', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert('Account deactivated successfully');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Error deactivating account');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deactivating the account.');
        }
    }

    async function deleteAccount() {
        try {
            const response = await fetch('http:localhost:3000/account/deleteAccount', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert('Account deleted successfully');
                window.location.href = 'login.html';
            } else {
                alert(data.message || 'Error deleting account');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while deleting the account.');
        }
    }

    async function loadSideBarPfp () {
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
});
