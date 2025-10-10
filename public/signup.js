document.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('loggedInUser');
    updateAuthUI(savedUser);
    enforceLoginForCheckout(savedUser);

    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('signupBtn').addEventListener('click', handleSignup);

    document.querySelector('#signupForm .modal-link a').addEventListener('click', (event) => {
        event.preventDefault();
        switchForm('login');
    });
});

document.querySelector('#loginForm .modal-link a').addEventListener('click', (event) => {
    event.preventDefault();
    switchForm('signup');
});


function openModal(type) {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('modalOverlay');
    const allProducts = document.querySelectorAll('.single-products-catagory');

    modal.style.display = 'flex';
    overlay.style.display = 'block';
    modal.style.zIndex = '1000001';
    overlay.style.zIndex = '1000000';

    allProducts.forEach(product => product.style.zIndex = '-1');
    switchForm(type);
}

function closeModal() {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('modalOverlay');
    const allProducts = document.querySelectorAll('.single-products-catagory');

    modal.style.display = 'none';
    overlay.style.display = 'none';
    modal.style.zIndex = '-1';
    allProducts.forEach(product => product.style.zIndex = '1');
}

function switchForm(type) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm.style.display = type === 'login' ? 'block' : 'none';
    signupForm.style.display = type === 'signup' ? 'block' : 'none';
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (email && password) {
        const username = email.split('@')[0];
        localStorage.setItem('loggedInUser', username);
        updateAuthUI(username);
        closeModal();
        enforceLoginForCheckout(username);
    } else {
        alert("Please enter a valid email and password.");
    }
}

function handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (username && email && password) {
        localStorage.setItem('loggedInUser', username);
        updateAuthUI(username);
        closeModal();
        enforceLoginForCheckout(username);
    } else {
        alert("Please fill out all fields.");
    }
}

function handleLogout() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if (confirmLogout) {
        localStorage.removeItem('loggedInUser');
        updateAuthUI(null);
        enforceLoginForCheckout(null);
    }
}

function updateAuthUI(username) {
    const authButtons = document.getElementById('authButtons');
    if (!authButtons) return;

    if (username) {
        authButtons.innerHTML = `
            <span class="welcome-text" style="margin-right: 15px; font-size: 18px; font-weight: bold;">
                <span style="color: black;">Welcome,</span> 
                <span style="color: #BA0000;">${username}!</span>
            </span>
            <a href="#" class="btn amado-btn active" onclick="handleLogout()">Logout</a>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="#" class="btn amado-btn mb-15" onclick="openModal('signup')">Sign Up</a>
            <a href="#" class="btn amado-btn active" onclick="openModal('login')">Login</a>
        `;
    }
}

function enforceLoginForCheckout(savedUser) {
    const checkoutFields = document.querySelectorAll(".checkout_details_area input, .checkout_details_area textarea");
    const selectFields = document.querySelectorAll(".checkout_details_area select");

    if (!savedUser) {
        // Not logged in — block interaction
        checkoutFields.forEach((field) => {
            field.setAttribute("readonly", true);
            field.classList.add("disabled-checkout-field");

            // Only add listeners if not already added
            if (!field.classList.contains("blocked-listener")) {
                field.addEventListener("focus", handleBlockedInteraction);
                field.addEventListener("click", handleBlockedInteraction);
                field.addEventListener("keydown", blockTyping);
                field.classList.add("blocked-listener");
            }
        });

        selectFields.forEach((field) => {
            field.setAttribute("tabindex", "-1");
            field.style.pointerEvents = "none";
            field.classList.add("disabled-checkout-field");

            if (!field.classList.contains("blocked-listener")) {
                field.addEventListener("click", handleBlockedInteraction);
                field.classList.add("blocked-listener");
            }
        });

    } else {
        // Logged in — allow full interaction
        checkoutFields.forEach((field) => {
            field.removeAttribute("readonly");
            field.classList.remove("disabled-checkout-field");

            // Remove previous blocking listeners
            field.removeEventListener("focus", handleBlockedInteraction);
            field.removeEventListener("click", handleBlockedInteraction);
            field.removeEventListener("keydown", blockTyping);
            field.classList.remove("blocked-listener");
        });

        selectFields.forEach((field) => {
            field.removeAttribute("tabindex");
            field.style.pointerEvents = "auto";
            field.classList.remove("disabled-checkout-field");

            field.removeEventListener("click", handleBlockedInteraction);
            field.classList.remove("blocked-listener");
        });
    }
}

// 🔒 Blocked field handler
function handleBlockedInteraction(e) {
    e.preventDefault();
    e.target.blur();
    alert("Please sign up or log in to proceed with checkout.");
    openModal("login");
}

function blockTyping(e) {
    e.preventDefault();
}
