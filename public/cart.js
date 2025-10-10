const cartTableBody = document.getElementById('cart-table-body');
const cartTotalElement = document.getElementById('cart-total');
const subtotalElement = document.getElementById('subtotal');
const cartCountElement = document.getElementById('cart-count');

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
    cartTableBody.innerHTML = '';
    let total = 0;
    let cartCount = 0; // To track total items

    cart.forEach((item, index) => {
        if (!item.name || isNaN(item.price) || !item.image) {
            console.error("Invalid cart item:", item);
            return;
        }

        const subtotal = item.price * item.quantity;
        total += subtotal;
        cartCount += item.quantity; // Count items

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="cart_product_img">
                <a href="#"><img src="${item.image}" alt="${item.name}" width="80"></a>
            </td>
            <td class="cart_product_desc">
                <h5>${item.name}</h5>
            </td>
            <td class="price">
                <span>₹${item.price.toFixed(2)}</span>
            </td>
            <td class="qty">
                <div class="qty-btn d-flex">
                    <p>Qty</p>
                    <div class="quantity">
                        <span class="qty-minus" data-index="${index}"><i class="fa fa-minus"></i></span>
                        <input type="number" class="qty-text" value="${item.quantity}" readonly>
                        <span class="qty-plus" data-index="${index}"><i class="fa fa-plus"></i></span>
                    </div>
                </div>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    cartTotalElement.textContent = `₹${total.toFixed(2)}`;
    subtotalElement.textContent = `₹${total.toFixed(2)}`;

    updateCartCount(cartCount);
    attachQuantityEvents();
}

function attachQuantityEvents() {
    document.querySelectorAll('.qty-plus').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            cart[index].quantity += 1;
            saveCart();
            renderCart();
            updateCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

        });
    });

    document.querySelectorAll('.qty-minus').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1); // Remove item if quantity reaches 0
            }
            saveCart();
            renderCart();
            updateCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

        });
    });
}


function updateCartCount(count) {
    cartCountElement.textContent = count > 0 ? `(${count})` : `(0)`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.getElementById('cart-count');

    function updateCartCount(count = null) {
        let totalItems = count !== null ? count : (JSON.parse(localStorage.getItem('cart')) || []).reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems > 0 ? `(${totalItems})` : `(0)`;
    }
    
    

    // Call function to update cart count on page load
    updateCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

});


renderCart();

