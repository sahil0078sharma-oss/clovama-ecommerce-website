
const links = document.querySelectorAll('a[href^="#"]');
for (const link of links) {
  link.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}


const fadeSections = document.querySelectorAll('.hero, .categories, .product-listing, .why-choose-clovama');
const fadeInOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};
const fadeInOnScroll = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = 1;
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, fadeInOptions);

fadeSections.forEach(section => {
  section.style.opacity = 0;
  section.style.transform = 'translateY(40px)';
  section.style.transition = 'opacity 1.2s cubic-bezier(.23,1.01,.32,1), transform 1.2s cubic-bezier(.23,1.01,.32,1)';
  fadeInOnScroll.observe(section);
});

// === CART FUNCTIONALITY ===
const CART_KEY = 'clovama_cart';
const cartIcon = document.getElementById('cartIcon');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartSidebar = document.getElementById('closeCartSidebar');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartSummary = document.getElementById('cartSummary');

// Get all add-to-cart buttons
const addToCartBtns = document.querySelectorAll('.add-to-cart');

// Product data from DOM (for homepage only)
const getProductData = (btn) => {
  const card = btn.closest('.product-card');
  if (!card) return null;
  const img = card.querySelector('img');
  const name = card.querySelector('h3')?.textContent?.trim();
  const priceText = card.querySelector('.price')?.textContent?.replace(/[^\d]/g, '');
  const price = priceText ? parseInt(priceText, 10) : 0;
  return {
    id: name?.toLowerCase().replace(/\s+/g, '-'),
    name,
    price,
    img: img?.getAttribute('src') || '',
  };
};

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
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = count;
}
function addToCart(product) {
  let cart = getCart();
  const idx = cart.findIndex(item => item.id === product.id);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  setCart(cart);
  updateCartCount();
}
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  setCart(cart);
  updateCartCount();
}
function changeQty(productId, delta) {
  let cart = getCart();
  const idx = cart.findIndex(item => item.id === productId);
  if (idx > -1) {
    cart[idx].qty += delta;
    if (cart[idx].qty < 1) cart[idx].qty = 1;
    setCart(cart);
    updateCartCount();
  }
}
function renderCartSidebar() {
  const cart = getCart();
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p style="color:#b81b58;text-align:center;">Your cart is empty.</p>';
    cartSummary.innerHTML = '';
    return;
  }
  cartItemsContainer.innerHTML = cart.map(item => `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      <img src="${item.img}" alt="${item.name}" style="width:60px;height:60px;object-fit:contain;border-radius:12px;background:#ffeef2;box-shadow:0 2px 8px #d6236a11;">
      <div style="flex:1;">
        <div style="font-weight:700;color:#d6236a;font-size:1.05rem;">${item.name}</div>
        <div style="color:#b81b58;font-size:0.98rem;">₹${item.price.toLocaleString()}</div>
        <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem;">
          <button class="cart-qty-btn" data-id="${item.id}" data-action="decrease" style="width:28px;height:28px;border:none;background:#ffeef2;color:#d6236a;font-size:1.2rem;border-radius:50%;cursor:pointer;">-</button>
          <span style="min-width:24px;display:inline-block;text-align:center;">${item.qty}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-action="increase" style="width:28px;height:28px;border:none;background:#ffeef2;color:#d6236a;font-size:1.2rem;border-radius:50%;cursor:pointer;">+</button>
          <button class="cart-remove-btn" data-id="${item.id}" style="margin-left:1rem;background:none;border:none;color:#b81b58;font-size:1.2rem;cursor:pointer;">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartSummary.innerHTML = `
    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;margin-bottom:1rem;">
      <span>Total</span>
      <span>₹${total.toLocaleString()}</span>
    </div>
    <button onclick="window.location.href='checkout.html'" style="width:100%;padding:1rem 0;background:linear-gradient(90deg,#d6236a,#b81b58);color:#fff;font-weight:700;font-size:1.1rem;border:none;border-radius:12px;box-shadow:0 4px 18px #d6236a22;cursor:pointer;transition:all 0.3s ease;">Proceed to Checkout</button>
  `;
}
function openCartSidebar() {
  cartSidebar.style.display = 'block';
  cartOverlay.style.display = 'block';
  setTimeout(() => {
    cartSidebar.style.transform = 'translateX(0)';
    cartOverlay.style.opacity = 1;
  }, 10);
  renderCartSidebar();
}
function closeCartSidebarFn() {
  cartSidebar.style.transform = 'translateX(100%)';
  cartOverlay.style.opacity = 0;
  setTimeout(() => {
    cartSidebar.style.display = 'none';
    cartOverlay.style.display = 'none';
  }, 300);
}
// Add to Cart button click
addToCartBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const product = getProductData(btn);
    if (product) {
      addToCart(product);
      openCartSidebar();
    }
  });
});
// Cart icon click
cartIcon.addEventListener('click', openCartSidebar);
// Overlay and close button
cartOverlay.addEventListener('click', closeCartSidebarFn);
closeCartSidebar.addEventListener('click', closeCartSidebarFn);
// Cart quantity and remove
cartSidebar.addEventListener('click', (e) => {
  if (e.target.classList.contains('cart-qty-btn')) {
    const id = e.target.getAttribute('data-id');
    const action = e.target.getAttribute('data-action');
    if (action === 'increase') changeQty(id, 1);
    if (action === 'decrease') changeQty(id, -1);
    renderCartSidebar();
  }
  if (e.target.classList.contains('cart-remove-btn')) {
    const id = e.target.getAttribute('data-id');
    removeFromCart(id);
    renderCartSidebar();
  }
});
// On page load
updateCartCount();

// === CONTACT FORM VALIDATION ===
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
const submitBtn = document.getElementById('submitBtn');

// Only run contact form validation if the form exists
if (contactForm && formMessage && submitBtn) {
  // Validation patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;

  // Real-time validation
  function validateField(field, pattern = null) {
    const value = field.value.trim();
    const errorMessage = field.nextElementSibling;
    
    // Remove existing error class
    field.classList.remove('error');
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
      field.classList.add('error');
      return false;
    }
    
    // Check email pattern
    if (field.type === 'email' && value && !emailPattern.test(value)) {
      field.classList.add('error');
      return false;
    }
    
    // Check phone pattern (if provided)
    if (field.type === 'tel' && value && !phonePattern.test(value.replace(/\s/g, ''))) {
      field.classList.add('error');
      return false;
    }
    
    // Check select field
    if (field.tagName === 'SELECT' && field.hasAttribute('required') && value === '') {
      field.classList.add('error');
      return false;
    }
    
    return true;
  }

  // Add event listeners for real-time validation
  const formFields = contactForm.querySelectorAll('input, select, textarea');
  formFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        validateField(field);
      }
    });
  });

  // Form submission
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    formFields.forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showMessage('Please fix the errors in the form.', 'error');
      return;
    }
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Simulate form submission (replace with actual form handling)
    setTimeout(() => {
      showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you soon.', 'success');
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }, 2000);
  });

  function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        formMessage.style.display = 'none';
      }, 5000);
    }
  }
}
