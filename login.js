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

