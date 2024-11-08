document.getElementById('log').addEventListener('click', function(){
    document.getElementById('contForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupBut').style.display = "block";
    document.getElementById('loginBut').style.display = "none";
    document.querySelector('.welcomeScreen').classList.add('hidden');
});

document.getElementById('sign').addEventListener('click', function(){
    document.getElementById('contForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginBut').style.display = "block"; 
    document.getElementById('signupBut').style.display = "none";
    document.querySelector('.welcomeScreen').classList.add('hidden');
});

document.getElementById('loginBut').addEventListener('click', function(){
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupBut').style.display = "block"; 
    document.getElementById('loginBut').style.display = "none"; 
});

document.getElementById('signupBut').addEventListener('click', function(){
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginBut').style.display = "block";
    document.getElementById('signupBut').style.display = "none"; 
});

document.getElementById('loserPass').addEventListener('click', function(){
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('passForm').classList.remove('hidden');
});
document.getElementById('loserPass2').addEventListener('click', function(){
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('passForm').classList.remove('hidden');
});


document.getElementById('backBtn').addEventListener('click', function(){
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('passForm').classList.add('hidden');
    document.getElementById('contForm').classList.add('hidden');
    document.querySelector('.welcomeScreen').classList.remove('hidden');
});
document.getElementById('backBtn2').addEventListener('click', function(){
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('passForm').classList.add('hidden');
    document.getElementById('contForm').classList.add('hidden');
    document.querySelector('.welcomeScreen').classList.remove('hidden');
});
document.getElementById('backBtn3').addEventListener('click', function(){
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('passForm').classList.add('hidden');
    document.getElementById('contForm').classList.add('hidden');
    document.querySelector('.welcomeScreen').classList.remove('hidden');
});

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Gather all the input fields using querySelector and check for empty values
    const username = document.querySelector('#signupForm input[placeholder="Username"]').value.trim();
    const email = document.querySelector('#signupForm input[placeholder="Email"]').value.trim();
    const password = document.querySelector('#signupForm input[placeholder="Password"]').value.trim();
    const firstName = document.querySelector('#signupForm input[placeholder="First Name"]').value.trim();
    const lastName = document.querySelector('#signupForm input[placeholder="Last Name"]').value.trim();
    const occupation = document.querySelector('#signupForm input[placeholder="Occupation"]').value.trim();
    const bio = document.querySelector('#signupForm input[placeholder="Bio"]').value.trim();
    const profilePicture = document.querySelector('#signupForm input[accept="image/*"]').files[0];

    const missingFields = [];
    if (!username) missingFields.push('Username');
    if (!email) missingFields.push('Email');
    if (!password) missingFields.push('Password');
    if (!firstName) missingFields.push('First Name');
    if (!lastName) missingFields.push('Last Name');
    if (!occupation) missingFields.push('Occupation');
    if (!bio) missingFields.push('Bio');
    if (!profilePicture) missingFields.push('Profile Picture');

    if (missingFields.length > 0) {
        alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
        return;
    }

    // Submit the form data to the backend if all fields are filled
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('occupation', occupation);
    formData.append('bio', bio);
    formData.append('profilePicture', profilePicture);

    try {
        const response = await fetch('http://localhost:3000/user/signup', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.status === "SUCCESS") {
            alert("Signup successful!");
            // Redirect or update the UI as needed
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert("An error occurred. Please try again.");
    }
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.querySelector('#loginForm input[type="email"]').value;
    const password = document.querySelector('#loginForm input[type="password"]').value;
    
    try {
        const response = await fetch('http://localhost:3000/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        
        if (result.status === "SUCCESS") {
            alert("Login successful!");
            // Redirect or update the UI as needed
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("An error occurred. Please try again.");
    }
});
