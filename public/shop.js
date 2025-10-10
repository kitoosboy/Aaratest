document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    // Load cart from localStorage or initialize
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Update cart count on page load
    updateCartCount();

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');

            if (!name || isNaN(price) || !image) {
                console.error("Invalid product data:", { name, price, image });
                return;
            }

            // Check if product already in cart
            const existingProduct = cart.find(item => item.name === name);

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.push({ name, price, image, quantity: 1 });
            }

            // Save to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            updateCartCount();
        });
    });

    function updateCartCount() {
        let count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = `(${count})`;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = `(${totalItems})`;
    }

    // Call function to update cart count on page load
    updateCartCount();
});
