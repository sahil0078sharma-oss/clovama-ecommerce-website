// === CHECKOUT FUNCTIONALITY ===

// Constants
const CART_KEY = 'clovama_cart';

// DOM Elements
const checkoutForm = document.getElementById('checkoutForm');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

// Payment method elements
const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
const cardPaymentSection = document.getElementById('cardPaymentSection');
const upiPaymentSection = document.getElementById('upiPaymentSection');

// Order summary elements
const checkoutItems = document.getElementById('checkoutItems');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');

// Success modal elements
const successModal = document.getElementById('successModal');
const orderIdElement = document.getElementById('orderId');
const orderTotalElement = document.getElementById('orderTotal');
const continueShoppingBtn = document.getElementById('continueShopping');
const viewOrderBtn = document.getElementById('viewOrder');

// Validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
const cardNumberPattern = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
const cvvPattern = /^\d{3,4}$/;
const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;

// Initialize checkout
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    
    // Check if required elements exist
    if (!checkoutForm) {
        console.error('Checkout form not found');
        showMessage('Checkout form not found. Please refresh the page.', 'error');
        return;
    }
    
    if (!checkoutItems) {
        console.error('Checkout items container not found');
        showMessage('Checkout items container not found. Please refresh the page.', 'error');
        return;
    }
    
    // Ensure modal is hidden by default
    if (successModal) {
        successModal.classList.remove('show');
        successModal.style.display = 'none';
        successModal.style.opacity = '0';
        successModal.style.visibility = 'hidden';
        console.log('Modal hidden on load');
    } else {
        console.error('Success modal not found');
    }
    
    // Check for cart overlay issues
    const cartOverlay = document.getElementById('cartOverlay');
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (cartOverlay) {
        cartOverlay.style.display = 'none';
        console.log('Cart overlay hidden');
    }
    
    if (cartSidebar) {
        cartSidebar.style.display = 'none';
        console.log('Cart sidebar hidden');
    }
    
    // Initialize all components
    try {
        loadOrderSummary();
        setupPaymentMethodHandlers();
        setupFormValidation();
        setupFormSubmission();
        setupModalHandlers();
        console.log('All checkout components initialized successfully');
    } catch (error) {
        console.error('Error initializing checkout:', error);
        showMessage('Error initializing checkout. Please refresh the page.', 'error');
    }
});

// Load order summary from cart
function loadOrderSummary() {
    console.log('Loading order summary...');
    
    // Show loading state
    if (checkoutItems) {
        checkoutItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;"><div style="margin-bottom: 1rem;">🔄</div>Loading your order...</div>';
    }
    
    const cart = getCart();
    console.log('Cart data:', cart);
    
    if (!cart || cart.length === 0) {
        console.log('Cart is empty, redirecting to home');
        if (checkoutItems) {
            checkoutItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;"><div style="margin-bottom: 1rem;">🛒</div>Your cart is empty</div>';
        }
        showMessage('Your cart is empty. Redirecting to home page...', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Validate cart data
    const validCart = cart.filter(item => {
        if (!item || !item.name || !item.price || !item.qty) {
            console.error('Invalid cart item:', item);
            return false;
        }
        return true;
    });

    if (validCart.length === 0) {
        console.log('No valid items in cart');
        if (checkoutItems) {
            checkoutItems.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;"><div style="margin-bottom: 1rem;">⚠️</div>No valid items in cart</div>';
        }
        showMessage('No valid items in cart. Redirecting to home page...', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }

    // Small delay to show loading state
    setTimeout(() => {
        displayCheckoutItems(validCart);
        calculateTotals(validCart);
        console.log('Order summary loaded successfully');
    }, 500);
}

// Display checkout items
function displayCheckoutItems(cart) {
    if (!checkoutItems) {
        console.error('Checkout items container not found');
        return;
    }
    
    checkoutItems.innerHTML = '';
    
    if (!cart || cart.length === 0) {
        checkoutItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No items in cart</p>';
        return;
    }
    
    cart.forEach((item, index) => {
        console.log(`Processing item ${index + 1}:`, item);
        
        // Validate item data
        if (!item || !item.name || !item.price || !item.qty) {
            console.error('Invalid item data:', item);
            return;
        }
        
        // Ensure price and quantity are numbers
        const price = parseInt(item.price) || 0;
        const qty = parseInt(item.qty) || 0;
        const total = price * qty;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'checkout-item';
        itemElement.innerHTML = `
            <div class="item-image">
                <img src="${item.img || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyMEMyNC40NzcgMjAgMjAgMjQuNDc3IDIwIDMwQzIwIDM1LjUyMyAyNC40NzcgNDAgMzAgNDBDMzUuNTIzIDQwIDQwIDM1LjUyMyA0MCAzMEM0MCAyNC40NzcgMzUuNTIzIDIwIDMwIDIwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K'}" alt="${item.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyMEMyNC40NzcgMjAgMjAgMjQuNDc3IDIwIDMwQzIwIDM1LjUyMyAyNC40NzcgNDAgMzAgNDBDMzUuNTIzIDQwIDQwIDM1LjUyMyA0MCAzMEM0MCAyNC40NzcgMzUuNTIzIDIwIDMwIDIwWiIgZmlsbD0iI0Q5RDlEOSIvPgo8L3N2Zz4K'">
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-price">₹${price.toLocaleString()}</p>
                <p class="item-quantity">Qty: ${qty}</p>
            </div>
            <div class="item-total">
                ₹${total.toLocaleString()}
            </div>
        `;
        checkoutItems.appendChild(itemElement);
    });
    
    console.log(`Displayed ${cart.length} items in order summary`);
}

// Calculate order totals
function calculateTotals(cart) {
    if (!subtotalElement || !shippingElement || !taxElement || !totalElement) {
        console.error('Total elements not found');
        return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    }
    
    if (!cart || cart.length === 0) {
        subtotalElement.textContent = '₹0';
        shippingElement.textContent = '₹0';
        taxElement.textContent = '₹0';
        totalElement.textContent = '₹0';
        return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    }
    
    const subtotal = cart.reduce((total, item) => {
        if (item && item.price && item.qty) {
            const price = parseInt(item.price) || 0;
            const qty = parseInt(item.qty) || 0;
            return total + (price * qty);
        }
        return total;
    }, 0);
    
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shipping + tax;

    console.log('Calculating totals:', { subtotal, shipping, tax, total });

    // Update display with proper formatting
    subtotalElement.textContent = `₹${subtotal.toLocaleString()}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`;
    taxElement.textContent = `₹${tax.toLocaleString()}`;
    totalElement.textContent = `₹${total.toLocaleString()}`;

    console.log('Order totals updated successfully');
    return { subtotal, shipping, tax, total };
}

// Setup payment method handlers
function setupPaymentMethodHandlers() {
    if (!paymentMethods.length) {
        console.error('Payment methods not found');
        return;
    }
    
    // Ensure proper initial state
    if (cardPaymentSection) {
        cardPaymentSection.style.display = 'block';
        console.log('Card payment section shown initially');
    }
    
    if (upiPaymentSection) {
        upiPaymentSection.style.display = 'none';
        console.log('UPI payment section hidden initially');
    }
    
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            const selectedMethod = this.value;
            console.log('Payment method changed to:', selectedMethod);
            
            // Hide all payment sections
            if (cardPaymentSection) cardPaymentSection.style.display = 'none';
            if (upiPaymentSection) upiPaymentSection.style.display = 'none';
            
            // Show selected payment section
            if (selectedMethod === 'card' && cardPaymentSection) {
                cardPaymentSection.style.display = 'block';
                console.log('Card payment section shown');
            } else if (selectedMethod === 'upi' && upiPaymentSection) {
                upiPaymentSection.style.display = 'block';
                console.log('UPI payment section shown');
            }
            // Cash on delivery doesn't need additional fields
        });
    });
}

// Setup form validation
function setupFormValidation() {
    const formFields = checkoutForm.querySelectorAll('input, select, textarea');
    
    formFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });

    // Special handling for card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }

    // Special handling for expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', formatExpiryDate);
    }
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const errorElement = field.parentNode.querySelector('.error-message');
    
    // Clear previous error
    clearFieldError(field);
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Validate based on field type
    switch (field.type) {
        case 'email':
            if (value && !emailPattern.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'tel':
            if (value && !phonePattern.test(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
            break;
        case 'text':
            if (field.id === 'cardNumber' && value && !cardNumberPattern.test(value)) {
                showFieldError(field, 'Please enter a valid card number');
                return false;
            }
            if (field.id === 'cvv' && value && !cvvPattern.test(value)) {
                showFieldError(field, 'Please enter a valid CVV');
                return false;
            }
            if (field.id === 'upiId' && value && !upiPattern.test(value)) {
                showFieldError(field, 'Please enter a valid UPI ID');
                return false;
            }
            break;
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// Format card number with spaces
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

// Format expiry date
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

// Setup form submission
function setupFormSubmission() {
    checkoutForm.addEventListener('submit', handleFormSubmission);
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate all fields
    const formFields = checkoutForm.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    formFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showMessage('Please fix the errors in the form', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        // Simulate order processing
        await processOrder();
        
        // Show success modal
        showSuccessModal();
        
        // Clear cart
        setCart([]);
        updateCartCount();
        
    } catch (error) {
        console.error('Order processing error:', error);
        showMessage('There was an error processing your order. Please try again.', 'error');
        setLoadingState(false);
    }
}

// Process order
async function processOrder() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000); // Simulate 2-second processing time
    });
}

// Set loading state
function setLoadingState(loading) {
    if (!btnText || !btnLoading || !placeOrderBtn) {
        console.error('Loading state elements not found');
        return;
    }
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        placeOrderBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        placeOrderBtn.disabled = false;
    }
}

// Show success modal
function showSuccessModal() {
    if (!successModal || !orderIdElement || !orderTotalElement) {
        console.error('Modal elements not found');
        return;
    }
    
    const cart = getCart();
    const { total } = calculateTotals(cart);
    const orderId = generateOrderId();
    
    orderIdElement.textContent = orderId;
    orderTotalElement.textContent = `₹${total.toLocaleString()}`;
    
    // Use the new class-based system
    successModal.classList.add('show');
    successModal.style.display = 'flex';
    successModal.style.opacity = '1';
    successModal.style.visibility = 'visible';
}

// Generate order ID
function generateOrderId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `CLV${timestamp}${random}`;
}

// Setup modal handlers
function setupModalHandlers() {
    if (!successModal || !continueShoppingBtn || !viewOrderBtn) {
        console.error('Modal handler elements not found');
        return;
    }
    
    continueShoppingBtn.addEventListener('click', () => {
        successModal.classList.remove('show');
        successModal.style.display = 'none';
        successModal.style.opacity = '0';
        successModal.style.visibility = 'hidden';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    });
    
    viewOrderBtn.addEventListener('click', () => {
        successModal.classList.remove('show');
        successModal.style.display = 'none';
        successModal.style.opacity = '0';
        successModal.style.visibility = 'hidden';
        setTimeout(() => {
            // In a real app, this would redirect to order details page
            alert('Order details page would be implemented here');
        }, 300);
    });
    
    // Close modal when clicking outside
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('show');
            successModal.style.display = 'none';
            successModal.style.opacity = '0';
            successModal.style.visibility = 'hidden';
        }
    });
}

// Show message
function showMessage(message, type) {
    // Create temporary message element
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        ${type === 'error' ? 'background: #e74c3c;' : 'background: #27ae60;'}
    `;
    
    document.body.appendChild(messageElement);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Cart functions (reused from script.js)
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.reduce((total, item) => total + (item.qty || 0), 0);
    }
} 