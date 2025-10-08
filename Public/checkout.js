document.addEventListener('DOMContentLoaded', function () {
    const checkoutCartItems = document.getElementById('checkout-cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const cartTotalElement = document.getElementById('cart-total');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = 0;

    checkoutCartItems.innerHTML = '';

    cart.forEach(item => {
        let subtotal = item.price * item.quantity;
        total += subtotal;

        let itemRow = document.createElement('div');
        itemRow.classList.add('checkout-cart-item');
        itemRow.innerHTML = `
            <div class="cart-item d-flex justify-content-between">
                <img src="${item.image}" alt="${item.name}" width="50">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
        `;
        checkoutCartItems.appendChild(itemRow);
    });

    subtotalElement.textContent = `₹${total.toFixed(2)}`;
    cartTotalElement.textContent = `₹${total.toFixed(2)}`;
});

//form to db

document.addEventListener('DOMContentLoaded', async () => {
    const checkbox = document.getElementById('customCheck2');
    const username = localStorage.getItem('loggedInUser');

    // 🔁 AUTO-FILL user details from DB on page load
    if (username) {
        try {
            const response = await fetch(`/get-user-details/${username}`);
            const data = await response.json();

            if (response.ok) {
                document.getElementById('first_name').value = data.first_name || '';
                document.getElementById('last_name').value = data.last_name || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('country').value = data.country || '';
                document.getElementById('street_address').value = data.address || '';
                document.getElementById('city').value = data.city || '';
                document.getElementById('zipCode').value = data.zip_code || '';
                document.getElementById('phone_number').value = data.phone || '';
                document.getElementById('comment').value = data.comment || '';
            } else {
                console.warn(data.message);
            }
        } catch (error) {
            console.error('Failed to load user details:', error);
        }
    }

    // ✅ SAVE USER DETAILS on checkbox
    checkbox.addEventListener('change', async () => {
        const isChecked = checkbox.checked;

        if (!username) {
            alert("Please log in first.");
            checkbox.checked = false;
            return;
        }

        // Collect form data
        const formData = {
            username,
            first_name: document.getElementById('first_name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            email: document.getElementById('email').value.trim(),
            country: document.getElementById('country').value.trim(),
            address: document.getElementById('street_address').value.trim(),
            city: document.getElementById('city').value.trim(),
            zip_code: document.getElementById('zipCode').value.trim(),
            phone: document.getElementById('phone_number').value.trim(),
            comment: document.getElementById('comment').value.trim()
        };

        const requiredFields = ['first_name', 'last_name', 'email', 'country', 'address', 'city', 'zip_code', 'phone'];
        const emptyFields = requiredFields.filter(key => !formData[key]);

        if (emptyFields.length > 0) {
            alert("Please fill out the form before saving your details.");
            checkbox.checked = false;
            return;
        }

        if (isChecked) {
            const confirmSave = confirm("Do you want to save your details?");
            if (!confirmSave) {
                checkbox.checked = false;
                return;
            }

            try {
                const response = await fetch('/save-user-details', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message || "Details saved successfully!");
                } else {
                    alert(result.error || "Failed to save details.");
                    checkbox.checked = false;
                }
            } catch (error) {
                console.error("Error saving details:", error);
                alert("Network error. Try again.");
                checkbox.checked = false;
            }
        }
    });
});

//remove
document.addEventListener('DOMContentLoaded', () => {
    const shipDifferentCheckbox = document.getElementById('customCheck3');

    shipDifferentCheckbox.addEventListener('change', () => {
        const isChecked = shipDifferentCheckbox.checked;

        if (isChecked) {
            // Clear all form fields
            document.getElementById('first_name').value = '';
            document.getElementById('last_name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('country').value = '';
            document.getElementById('street_address').value = '';
            document.getElementById('city').value = '';
            document.getElementById('zipCode').value = '';
            document.getElementById('phone_number').value = '';
            document.getElementById('comment').value = '';
        } else {
            // Optional: Re-fetch saved user details and repopulate (if still logged in)
            const username = localStorage.getItem('loggedInUser');
            if (username) {
                fetch(`/get-user-details/${username}`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('first_name').value = data.first_name || '';
                        document.getElementById('last_name').value = data.last_name || '';
                        document.getElementById('email').value = data.email || '';
                        document.getElementById('country').value = data.country || '';
                        document.getElementById('street_address').value = data.address || '';
                        document.getElementById('city').value = data.city || '';
                        document.getElementById('zipCode').value = data.zip_code || '';
                        document.getElementById('phone_number').value = data.phone || '';
                        document.getElementById('comment').value = data.comment || '';
                    })
                    .catch(error => {
                        console.error('Error reloading user details:', error);
                    });
            }
        }
    });
});




