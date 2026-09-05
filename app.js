// Starbucks Matcha Fusion - Interactive Features
const PRODUCTS = [
  {
    id: 1,
    title1: 'MATCHA',
    title2: 'FUSION',
    price: 5.99,
    img: 'assets/matcha.jpg',
    desc: 'The Matcha & Espresso Fusion Offers A Surprising And Delightful Combination Of Earthy Matcha Creamy Notes And Natural Sweetness Mixed With Espresso Bitterness For A Complex Taste.',
    badge: 'Best Seller',
  },
  {
    id: 2,
    title1: 'COLD BREW',
    title2: 'CREAM',
    price: 4.49,
    img: 'assets/caramel.jpg',
    desc: 'A Smooth Layers Of Velvety Cream Swirled Into Bold Slow-Steeped Cold Brew Coffee For A Rich And Refreshing Treat.',
    badge: 'New',
  },
  {
    id: 3,
    title1: 'MATCHA',
    title2: 'FRAPP',
    price: 5.29,
    img: 'assets/frapp.jpg',
    desc: 'A Frosty Blended Matcha Frappuccino With Creamy Milk And A Whipped Cream Finish, Perfect For A Cool Afternoon Pick-Me-Up.',
    badge: 'Trending',
  },
  {
    id: 4,
    title1: 'GREEN',
    title2: 'TEA',
    price: 4.79,
    img: 'assets/greentea.jpg',
    desc: 'A Delicate Blend Of Ceremonial Green Tea Leaves Steeped To Perfection, Light And Fragrant In Every Sip.',
    badge: 'Classic',
  },
];

const CART_KEY = 'starbucks_cart';

// ---- State ----
let currentIndex = 0;
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---- Toast ----
let toastTimer = null;
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ---- Render Product ----
function renderProduct(index) {
  const p = PRODUCTS[index];
  $('#title-matcha').textContent = p.title1;
  $('#title-fusion').textContent = p.title2;
  $('#price').textContent = '$' + p.price.toFixed(2);
  $('#description').textContent = p.desc;
  $('#product-img').src = p.img;
  $('#product-img').alt = p.title1 + ' ' + p.title2;
  $$('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
}

// ---- Slider ----
function nextSlide() {
  currentIndex = (currentIndex + 1) % PRODUCTS.length;
  renderProduct(currentIndex);
}
function prevSlide() {
  currentIndex = (currentIndex -  1 + PRODUCTS.length) % PRODUCTS.length;
  renderProduct(currentIndex);
}
$('#arrow-left').addEventListener('click', prevSlide);
$('#arrow-right').addEventListener('click', nextSlide);
$$('.dot').forEach((d) => d.addEventListener('click', () => {
  currentIndex = Number(d.dataset.index);
  renderProduct(currentIndex);
}));

// ---- Cart ----
function cartCount() {
  return Object.values(cart).reduce((a, v) => a + v, 0);
}
function updateBadge() {
  const c = cartCount();
  $('#cart-badge').textContent = c;
  $('#cart-badge').style.display = c ? 'flex' : 'none';
}
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateBadge();
  const p = PRODUCTS.find(x => x.id === id);
  showToast(p.title1 + ' ' + p.title2 + ' added to cart!');
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => sum + (PRODUCTS.find(p => p.id === Number(id))?.price || 0) * qty,  0);
}
function renderCart() {
  const box = $('#cart-items');
  const entries = Object.entries(cart);
  if (entries.length === 0) {
    box.innerHTML = '<p class="empty-cart">Your cart is empty. Browse our menu to add items!</p>';
    $('#cart-total').textContent = 'Total: $0.00';
    return;
  }
  box.innerHTML = entries.map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === Number(id));
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.title1}">
        <div class="cart-item-info">
          <div class="cart-item-name">${p.title1} ${p.title2}</div>
          <div class="cart-item-price">$${p.price.toFixed(2)}</div>
        </div>
        <div class="cart-qty">
          <button class="qty-btn" data-id="${id}" data-act="minus">-</button>
          <span>${qty}</span>
          <button class="qty-btn" data-id="${id}" data-act="plus">+</button>
        </div>
        <button class="remove-item" data-id="${id}">&times;</button>
      </div>`;
  }).join('');
  $('#cart-total').textContent = 'Total: $' + cartTotal().toFixed(2);
}

function changeQty(id, act) {
  const numId = Number(id);
  if (act === 'plus') cart[numId] = (cart[numId] || 0) + 1;
  else if (act === 'minus') {
    cart[numId] = (cart[numId] || 0) - 1;
    if (cart[numId] <= 0) delete cart[numId];
  }
  saveCart();
  updateBadge();
  renderCart();
}
$('#cart-items').addEventListener('click', (e) => {
  const btn = e.target.closest('.qty-btn');
  if (btn) {
    changeQty(btn.dataset.id, btn.dataset.act);
    return;
  }
  const rm = e.target.closest('.remove-item');
  if (rm) {
    delete cart[Number(rm.dataset.id)];
    saveCart();
    updateBadge();
    renderCart();
    showToast('Item removed from cart.');
  }
});

// ---- Cart Modal ----
function openCart() {
  renderCart();
  $('#cart-modal').classList.add('show');
}
function closeCart() {
  $('#cart-modal').classList.remove('show');
}
$('#cart-btn').addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
$('#cart-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeCart();
});
$('#btn-add').addEventListener('click', () => addToCart(PRODUCTS[currentIndex].id));
$('#link-cart').addEventListener('click', (e) => {
  e.preventDefault();
  openCart();
});

// ---- Checkout ----
$('#btn-checkout').addEventListener('click', () => {
  const count = cartCount();
  if (count === 0) {
    showToast('Your cart is empty.');
    return;
  }
  cart = {};
  saveCart();
  updateBadge();
  renderCart();
  showToast('Order placed successfully. Thank you!');
  closeCart();
});

// ---- Search ----
const searchBox = $('#search-input');
searchBox.addEventListener('input', () => {
  const q = searchBox.value.trim().toLowerCase();
  if (!q) {
    $('#page-overlay').classList.remove('show');
    return;
  }
  const matches = PRODUCTS.filter(p =>
    (p.title1 + ' ' + p.title2).toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q));
  if (matches.length === 0) {
    $('#page-title').textContent = 'Search';
    $('#page-body').innerHTML = '<p class="empty-cart">No products found for &quot;' + searchBox.value + '&quot;.</p>';
  } else {
    $('#page-title').textContent = 'Search Results (' + matches.length + ')';
    $('#page-body').innerHTML = matches.map((p) => `
      <div class="grid-product" data-goto="${p.id}">
        <img src="${p.img}" alt="${p.title1}">
        <div>
          <div class="grid-product-name">${p.title1} ${p.title2}</div>
          <div class="grid-product-price">$${p.price.toFixed(2)}</div>
        </div>
      </div>`).join('');
  }
  $('#page-overlay').classList.add('show');
});

// ---- Page Navigation (Menu, Orders, Trending, Account, About) ----
const PAGES = {
  menu: {
    title: 'Menu',
    render: () => `
      <div class="grid-products">
        ${PRODUCTS.map((p) => `
          <div class="grid-product" data-goto="${p.id}">
            <img src="${p.img}" alt="${p.title1}">
            <div>
              <div class="grid-product-name">${p.title1} ${p.title2}</div>
              <div class="grid-product-price">$${p.price.toFixed(2)}</div>
            </div>
          </div>`).join('')}
      </div>`,
  },

  orders: {
    title: 'Orders',
    render: () => {
      const count = cartCount();
      if (count === 0) {
        return '<p class="empty-cart">No orders yet. Add items to your cart and checkout to place your first order!</p>';
      }
      return '<p>You have <b>' + count + '</b> item(s) in your cart.</p><p>Proceed to checkout to complete your order.</p>';
    },
  },

  trending: {
    title: 'Trending',
    render: () => `
      <div class="grid-products">
        ${PRODUCTS.filter((p) => p.badge === 'Trending' || p.badge === 'Best Seller').map((p) => `
          <div class="grid-product" data-goto="${p.id}">
            <img src="${p.img}" alt="${p.title1}">
            <div>
              <div class="grid-product-name">${p.title1} ${p.title2} <span style="font-size:10px;color:#e74c3c;">(${p.badge})</span></div>
              <div class="grid-product-price">$${p.price.toFixed(2)}</div>
            </div>
          </div>`).join('')}
      </div>`,
  },

  account: {
    title: 'Account',
    render: () => `
      <div class="page-content">
        <h4>Account</h4>
        <p>Order History: <b>${Object.keys(cart).length > 0 ? Object.values(cart).reduce((a, v) => a + v, 0) : 0}</b> item(s) in cart.</p>
        <p>You can manage your cart via the cart icon on the top right.</p>
      </div>`,
  },

  about: {
    title: 'About Us',
    render: () => `
      <div class="page-content">
        <h4>Welcome to Starbucks</h4>
        <p>We craft handcrafted matcha and espresso beverages with the finest ingredients, served fresh every day.</p>
        <h4>Our Promise</h4>
        <p>Quality, sustainability, and community are at the heart of everything we do.</p>
        <h4>Visit Us</h4>
        <p>Open daily: 6:00 AM - 10:00 PM</p>
      </div>`,
  },
};

function openPage(name) {
  const page = PAGES[name];
  if (!page) return;
  $('#page-title').textContent = page.title;
  $('#page-body').innerHTML = page.render();
  $('#page-overlay').classList.add('show');
  $$('.nav-links a').forEach((a) => a.classList.toggle('active', a.dataset.page === name));
}
$$('.nav-links a').forEach((a) => a.addEventListener('click', (e) => {
  e.preventDefault();
  openPage(a.dataset.page);
}));
$('.about-btn').addEventListener('click', (e) => {
  e.preventDefault();
  openPage('about');
});
$('#page-close').addEventListener('click', () => {
  $('#page-overlay').classList.remove('show');
  searchBox.value = '';
});
$('#page-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    $('#page-overlay').classList.remove('show');
    searchBox.value = '';
  }
});

// ---- Click grid product navigates slider ----
$('#page-body').addEventListener('click', (e) => {
  const el = e.target.closest('[data-goto]');
  if (el) {
    const id = Number(el.dataset.goto);
    const idx = PRODUCTS.findIndex(p => p.id === id);
    if (idx >= 0) {
      currentIndex = idx;
      renderProduct(currentIndex);
      $('#page-overlay').classList.remove('show');
      searchBox.value = '';
    }
  }
});

// ---- Keyboard navigation ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'Escape') {
    $('#cart-modal').classList.remove('show');
    $('#page-overlay').classList.remove('show');
    searchBox.value = '';
  }
});

// ---- Init ----
renderProduct(currentIndex);
updateBadge();
