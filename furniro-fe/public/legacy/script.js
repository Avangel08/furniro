/* Legacy script: copied from original script.js with minimal changes */
/* For brevity in scaffold, load-time errors may occur if referenced elements are missing on some pages. */
/* Paste of original file is recommended for full parity. */

// ----- Ngăn Kéo Giỏ Hàng Mini -----
const CART_STORAGE_KEY = 'furniro_cart_v1';
const cartState = { items: [] };

function loadCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) {
            cartState.items = parsed.items.map(it => ({ ...it, qty: Math.max(1, parseInt(it.qty || 1)) }));
        }
    } catch (e) { /* ignore */ }
}

function saveCartToStorage() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cartState.items }));
    } catch (e) { /* ignore */ }
}

function updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    if (!badge) return;
    const count = cartState.items.reduce((sum, it) => sum + (it.qty || 1), 0);
    if (count > 0) {
        badge.textContent = String(count);
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function openCart() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay) overlay.classList.add('active');
    if (drawer) drawer.classList.add('active');
}

function closeCart() {
    const overlay = document.getElementById('cartOverlay');
    const drawer = document.getElementById('cartDrawer');
    if (overlay) overlay.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
}

function formatPrice(p) { return p; }

function renderCart() {
    const itemsEl = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    if (!itemsEl) return;
    itemsEl.innerHTML = '';
    let subtotal = 0;
    cartState.items.forEach((it, idx) => {
        subtotal += it.numericPrice * it.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${it.image}" alt="${it.name}">
            <div class="cart-item-content">
                <div class="cart-item-title">${it.name}</div>
                <div class="cart-item-meta">
                    <div class="cart-qty" role="group" aria-label="Quantity selector">
                        <button class="cart-qty-btn minus" aria-label="Decrease">−</button>
                        <span class="cart-qty-num">${it.qty}</span>
                        <button class="cart-qty-btn plus" aria-label="Increase">+</button>
                    </div>
                    <span>×</span>
                    <strong>${it.price}</strong>
                </div>
            </div>
            <button class="cart-item-remove" aria-label="Remove">×</button>
        `;
        // Quantity handlers
        const minusBtn = row.querySelector('.cart-qty-btn.minus');
        const plusBtn = row.querySelector('.cart-qty-btn.plus');
        const qtyNum = row.querySelector('.cart-qty-num');
        if (minusBtn && plusBtn && qtyNum) {
            minusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = cartState.items[idx];
                if (!item) return;
                item.qty = Math.max(1, (item.qty || 1) - 1);
                renderCart();
            });
            plusBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = cartState.items[idx];
                if (!item) return;
                item.qty = Math.min(99, (item.qty || 1) + 1);
                renderCart();
            });
        }
        row.querySelector('.cart-item-remove').addEventListener('click', () => {
            cartState.items.splice(idx, 1);
            renderCart();
        });
        itemsEl.appendChild(row);
    });
    if (subtotalEl) subtotalEl.textContent = `$ ${subtotal.toLocaleString('en-US')}`;
    updateCartBadge();
    saveCartToStorage();
}

function addToCartFromProduct(productId, quantity = 1) {
    const p = PRODUCT_DATA[productId];
    if (!p) return;
    const numeric = parseInt((p.price || '0').replace(/[^0-9]/g, '')) || 0;
    const existing = cartState.items.find(i => i.id === p.id);
    const qtyToAdd = Math.max(1, parseInt(quantity || 1));
    if (existing) existing.qty += qtyToAdd; else cartState.items.push({ id: p.id, name: p.name, image: p.image, price: p.price, numericPrice: numeric, qty: qtyToAdd });
    renderCart();
    openCart();
}

function initCartDrawer() {
    const icon = document.getElementById('cartIconBtn');
    const closeBtn = document.getElementById('cartCloseBtn');
    const overlay = document.getElementById('cartOverlay');
    if (icon) icon.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    initCartDrawer();
    updateCartBadge();
});

// Hàm Include HTML để tải các file HTML bên ngoài (có callback khi hoàn tất)
function includeHTML(done) {
    var z, i, elmnt, file, xhttp, found = false;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            found = true;
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML(done);
                }
            };
            xhttp.open("GET", file, true);
            xhttp.send();
            return; // important: wait for async load then recurse
        }
    }
    if (!found && typeof done === 'function') done();
}

// Chức năng Hero Carousel
let heroCurrentSlide = 0;
const heroTotalSlides = 3;

function updateHeroCarousel() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');
    
    // Update slides
    heroSlides.forEach((slide, index) => {
        slide.classList.toggle('active', index === heroCurrentSlide);
    });
    
    // Update dots
    heroDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === heroCurrentSlide);
    });
}

function nextHeroSlide() {
    heroCurrentSlide = (heroCurrentSlide + 1) % heroTotalSlides;
    updateHeroCarousel();
}

function prevHeroSlide() {
    heroCurrentSlide = (heroCurrentSlide - 1 + heroTotalSlides) % heroTotalSlides;
    updateHeroCarousel();
}

function goToHeroSlide(slideIndex) {
    heroCurrentSlide = slideIndex;
    updateHeroCarousel();
}

// Khởi tạo hero carousel khi DOM được tải
function initHeroCarousel() {
    const heroNext = document.getElementById('heroNext');
    const heroPrev = document.getElementById('heroPrev');
    const heroDots = document.querySelectorAll('.hero-dot');

    if (heroNext) {
        heroNext.addEventListener('click', nextHeroSlide);
    }

    if (heroPrev) {
        heroPrev.addEventListener('click', prevHeroSlide);
    }

    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToHeroSlide(index));
    });

    // Auto-play hero carousel
    setInterval(nextHeroSlide, 3500);
}

// Chức năng Rooms Carousel (hiện có)
let currentSlide = 0;
const totalSlides = 3;

function updateCarousel() {
    const carouselContainer = document.getElementById('carouselContainer');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (carouselContainer) {
        const translateX = -currentSlide * 100;
        carouselContainer.style.transform = `translateX(${translateX}%)`;
    }
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

// Khởi tạo rooms carousel khi DOM được tải
function initCarousel() {
    const carouselNext = document.getElementById('carouselNext');
    const dots = document.querySelectorAll('.carousel-dot');

    if (carouselNext) {
        carouselNext.addEventListener('click', nextSlide);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Auto-play carousel (optional)
    setInterval(nextSlide, 5000);
}
/*
// Chức năng đăng ký bản tin
function initNewsletter() {
    const subscribeBtn = document.querySelector('.subscribe-btn');
    const emailInput = document.querySelector('.newsletter-input');

    if (subscribeBtn && emailInput) {
        subscribeBtn.addEventListener('click', function() {
            const email = emailInput.value.trim();
            if (email && isValidEmail(email)) {
                // Here you would typically send the email to your server
                alert('Thank you for subscribing!');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });

        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeBtn.click();
            }
        });
    }
}

// Hàm xác thực email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
*/
// Tương tác thẻ sản phẩm
function initProductCards() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Try to infer product id from nearest product card links (image/name)
            const card = this.closest('.product-card');
            let productId = null;
            if (card) {
                const link = card.querySelector('a[href*="productdetails.html?id="]') || card.querySelector('a[href^="/product/"]');
                if (link) {
                    try {
                        const url = new URL(link.getAttribute('href'), document.baseURI || window.location.href);
                        productId = new URLSearchParams(url.search).get('id');
                    } catch (_) { /* noop */ }
                }
            }
            if (productId && PRODUCT_DATA[productId]) {
                addToCartFromProduct(productId);
            } else {
                // Fallback: try using data-id on button if provided
                const fallbackId = this.getAttribute('data-id');
                if (fallbackId && PRODUCT_DATA[fallbackId]) {
                    addToCartFromProduct(fallbackId);
                } else {
                    alert('Unable to add this product to cart.');
                }
            }
        });
    });

    // Make entire product card clickable → navigate to details link
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (card.getAttribute('data-click-init') === '1') return;
        card.setAttribute('data-click-init', '1');
        card.addEventListener('click', function() {
            const link = card.querySelector('a[href*="productdetails.html?id="]') || card.querySelector('a[href^="/product/"]');
            if (link) {
                const href = link.getAttribute('href');
                if (href) window.location.href = href;
            }
        });
    });

    const actionItems = document.querySelectorAll('.action-item');
    actionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent.trim();
            alert(`${action} functionality would be implemented here.`);
        });
    });
}

// Ủy quyền click cho nút Add to cart để hỗ trợ các thẻ tạo động
document.addEventListener('click', function(e) {
    const addBtn = e.target.closest('.add-to-cart-btn');
    if (!addBtn) return;
    e.preventDefault();
    e.stopPropagation();

    // Ưu tiên data-id nếu có
    let productId = addBtn.getAttribute('data-id');

    if (!productId) {
        const card = addBtn.closest('.product-card');
        if (card) {
            const link = card.querySelector('a[href*="productdetails.html?id="]') || card.querySelector('a[href^="/product/"]');
            if (link) {
                try {
                    const url = new URL(link.getAttribute('href'), document.baseURI || window.location.href);
                    productId = new URLSearchParams(url.search).get('id');
                } catch (_) { /* noop */ }
            }
        }
    }

    if (productId && PRODUCT_DATA[productId]) {
        addToCartFromProduct(productId);
    } else {
        alert('Unable to add this product to cart.');
    }
});

// Ủy quyền click cho nút đóng (X) và overlay để đảm bảo luôn hoạt động sau khi include header
document.addEventListener('click', function(e) {
    const closeBtn = e.target.closest('#cartCloseBtn');
    if (closeBtn) {
        e.preventDefault();
        closeCart();
        return;
    }
    if (e.target && e.target.id === 'cartOverlay') {
        closeCart();
    }
});

// Ủy quyền click cho icon giỏ hàng trên header để luôn mở giỏ hàng
document.addEventListener('click', function(e) {
    const cartIcon = e.target.closest('#cartIconBtn');
    if (cartIcon) {
        e.preventDefault();
        openCart();
    }
});

// Đóng giỏ bằng phím Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCart();
    }
});

// Bổ sung: Ủy quyền sự kiện để đảm bảo click trên thẻ sản phẩm luôn điều hướng
document.addEventListener('click', function(e) {
    const targetButton = e.target.closest('.add-to-cart-btn, .action-item, .cart-qty-btn, .cart-item-remove');
    if (targetButton) return; // bỏ qua các nút thao tác

    const card = e.target.closest('.product-card');
    if (!card) return;

    const link = card.querySelector('a[href*="productdetails.html?id="]') || card.querySelector('a[href^="/product/"]');
    if (link) {
        const href = link.getAttribute('href');
        if (href) {
            window.location.href = href;
        }
    }
});

// Chức năng hiển thị thêm sản phẩm
function initShowMore() {
    const showMoreBtn = document.querySelector('.show-more-btn');
    
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function() {
            // Here you would load more products
            alert('Loading more products...');
        });
    }
}

// Chức năng khám phá thêm phòng
function initExploreMore() {
    const exploreMoreBtn = document.querySelector('.explore-more-btn');
    
    if (exploreMoreBtn) {
        exploreMoreBtn.addEventListener('click', function() {
            // Here you would navigate to rooms gallery
            alert('Exploring more rooms...');
        });
    }
}

// Khởi tạo tất cả chức năng khi DOM được tải
document.addEventListener('DOMContentLoaded', function() {
    // Tải header/footer, sau đó khởi tạo và đồng bộ badge giỏ hàng
    includeHTML(function() {
        initHeroCarousel();
        initCarousel();
        if (typeof initNewsletter === 'function') { try { initNewsletter(); } catch(_) {} }
        initProductCards();
        initShowMore();
        initExploreMore();
        initStickyHeader();
        initCartDrawer();
        renderCart(); // đồng bộ danh sách + badge sau khi phần tử trong header đã có
        updateCartBadge();
    });
});

// Cuộn mượt cho liên kết neo
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Khởi tạo cuộn mượt
document.addEventListener('DOMContentLoaded', initSmoothScrolling);

// Chức Năng Trang Shop
function initShopPage() {
    initViewToggle();
    initFilterSort();
    initPagination();
}

// Chuyển Đổi Chế Độ Xem (Lưới/Danh Sách)
function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            viewBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            
            if (view === 'list') {
                productsGrid.classList.add('list-view');
            } else {
                productsGrid.classList.remove('list-view');
            }
        });
    });
}

// Chức năng Lọc và Sắp xếp
function initFilterSort() {
    const filterBtn = document.querySelector('.filter-btn');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            alert('Filter functionality would be implemented here.');
        });
    }
    
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            const value = this.value;
            const label = this.previousElementSibling.textContent;
            console.log(`${label}: ${value}`);
            // Here you would implement the actual filtering/sorting logic
        });
    });
}

// Chức năng phân trang
function initPagination() {
    const paginationNumbers = document.querySelectorAll('.pagination-number');
    const prevBtn = document.querySelector('.pagination-btn.prev');
    const nextBtn = document.querySelector('.pagination-btn.next');
    
    paginationNumbers.forEach(number => {
        number.addEventListener('click', function() {
            // Remove active class from all numbers
            paginationNumbers.forEach(n => n.classList.remove('active'));
            // Add active class to clicked number
            this.classList.add('active');
            
            const page = parseInt(this.textContent);
            console.log(`Navigate to page ${page}`);
            // Here you would implement the actual pagination logic
        });
    });
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            const activeNumber = document.querySelector('.pagination-number.active');
            const currentPage = parseInt(activeNumber.textContent);
            
            if (currentPage > 1) {
                const prevNumber = document.querySelector(`.pagination-number:nth-child(${currentPage - 1})`);
                if (prevNumber) {
                    activeNumber.classList.remove('active');
                    prevNumber.classList.add('active');
                }
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const activeNumber = document.querySelector('.pagination-number.active');
            const currentPage = parseInt(activeNumber.textContent);
            
            if (currentPage < paginationNumbers.length) {
                const nextNumber = document.querySelector(`.pagination-number:nth-child(${currentPage + 1})`);
                if (nextNumber) {
                    activeNumber.classList.remove('active');
                    nextNumber.classList.add('active');
                }
            }
        });
    }
}

// Khởi tạo chức năng trang shop
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem chúng ta có đang ở trang shop không
    if (document.querySelector('.shop-banner-section') || document.querySelector('.product-breadcrumb-section')) {
        initShopPage();
    }
});

// Header dính: thêm shadow/kiểu compact khi cuộn
function initStickyHeader() {
    const header = document.querySelector('header.header');
    if (!header) return;

    // Thêm padding cho body để bù cho chiều cao header cố định
    document.body.classList.add('has-fixed-header');

    const onScroll = () => {
        if (window.scrollY > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------------- Trang Chi Tiết Sản Phẩm ----------------
const PRODUCT_DATA = {
    syltherine: {
        id: 'syltherine',
        name: 'Syltherine',
        description: 'Stylish cafe chair',
        price: '$ 2.500.000',
        oldPrice: '$ 3.500.000',
        image: 'image/image 1.png',
        category: 'Chair',
        sku: 'SYLT-001',
        tags: ['chair', 'cafe', 'stylish']
    },
    leviosa: {
        id: 'leviosa',
        name: 'Leviosa',
        description: 'Stylish cafe chair',
        price: '$ 2.500.000',
        image: 'image/image 2.png',
        category: 'Chair',
        sku: 'LEVI-002',
        tags: ['chair', 'minimal']
    },
    lolito: {
        id: 'lolito',
        name: 'Lolito',
        description: 'Luxury big sofa',
        price: '$ 7.000.000',
        oldPrice: '$ 14.000.000',
        image: 'image/image 3.png',
        category: 'Sofa',
        sku: 'LOLI-003',
        tags: ['sofa', 'luxury']
    },
    respira: {
        id: 'respira',
        name: 'Respira',
        description: 'Outdoor bar table and stool',
        price: '$ 500.000',
        image: 'image/image 7.png',
        category: 'Table',
        sku: 'RESP-004',
        tags: ['outdoor', 'bar']
    },
    grifo: {
        id: 'grifo',
        name: 'Grifo',
        description: 'Night lamp',
        price: '$ 1.500.000',
        image: 'image/Image 5.png',
        category: 'Lamp',
        sku: 'GRIF-005',
        tags: ['lamp', 'night']
    },
    muggo: {
        id: 'muggo',
        name: 'Muggo',
        description: 'Small mug',
        price: '$ 150.000',
        image: 'image/image 6.png',
        category: 'Mug',
        sku: 'MUGG-006',
        tags: ['mug']
    },
    pingky: {
        id: 'pingky',
        name: 'Pingky',
        description: 'Cute bed set',
        price: '$ 7.000.000',
        oldPrice: '$ 14.000.000',
        image: 'image/image 7.png',
        category: 'Bed',
        sku: 'PING-007',
        tags: ['bed', 'cute']
    },
    potty: {
        id: 'potty',
        name: 'Potty',
        description: 'Minimalist flower pot',
        price: '$ 500.000',
        image: 'image/Images (2).png',
        category: 'Decor',
        sku: 'POTT-008',
        tags: ['pot', 'minimal']
    }
};

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function renderProductDetail() {
    const id = getQueryParam('id');
    if (!id || !PRODUCT_DATA[id]) return;

    const product = PRODUCT_DATA[id];

    const imgEl = document.getElementById('productImage');
    const nameEl = document.getElementById('productName');
    const descEl = document.getElementById('productDescription');
    const priceEl = document.getElementById('productPrice');
    const oldPriceEl = document.getElementById('productOldPrice');
    const badgeEl = document.getElementById('productBadge');
    const skuEl = document.getElementById('productSku');
    const categoryEl = document.getElementById('productCategory');
    const tagsEl = document.getElementById('productTags');
    const bannerTitleEl = document.getElementById('productTitleBanner');
    const breadcrumbProductEl = document.getElementById('breadcrumbProduct');

    if (imgEl) {
        imgEl.src = product.image;
        imgEl.alt = product.name;
    }
    if (nameEl) nameEl.textContent = product.name;
    if (bannerTitleEl) bannerTitleEl.textContent = product.name;
    if (breadcrumbProductEl) breadcrumbProductEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description;
    if (priceEl) priceEl.textContent = product.price;

    if (oldPriceEl) {
        if (product.oldPrice) {
            oldPriceEl.textContent = product.oldPrice;
            oldPriceEl.style.display = '';
        } else {
            oldPriceEl.style.display = 'none';
        }
    }

    if (badgeEl) {
        if (product.oldPrice) {
            badgeEl.textContent = '-';
            badgeEl.style.display = 'none';
        } else {
            badgeEl.style.display = 'none';
        }
    }

    if (skuEl) skuEl.textContent = product.sku || '-';
    if (categoryEl) categoryEl.textContent = product.category || '-';
    if (tagsEl) tagsEl.textContent = (product.tags || []).join(', ');

    const addBtn = document.getElementById('detailAddToCart');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById('qtyInput');
            const qty = qtyInput ? parseInt(qtyInput.value || '1') : 1;
            addToCartFromProduct(product.id, qty);
        });
    }

    renderRelatedProducts(id);
}

function renderRelatedProducts(activeId) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    container.innerHTML = '';

    const related = Object.values(PRODUCT_DATA).filter(p => p.id !== activeId).slice(0, 4);
    related.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <a href="productdetails.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" class="product-img"></a>
                <div class="product-overlay">
                    <button class="add-to-cart-btn" data-id="${p.id}">Add to cart</button>
                    <div class="product-actions">
                        <span class="action-item"><i class="icon">↗</i> Share</span>
                        <span class="action-item"><i class="icon">⚖</i> Compare</span>
                        <span class="action-item"><i class="icon">♡</i> Like</span>
                    </div>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name"><a href="productdetails.html?id=${p.id}">${p.name}</a></h3>
                <p class="product-description">${p.description}</p>
                <div class="product-price">
                    <span class="current-price">${p.price}</span>
                    ${p.oldPrice ? `<span class="old-price">${p.oldPrice}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function initProductPage() {
    if (document.getElementById('productDetailContainer')) {
        renderProductDetail();
    }
}

document.addEventListener('DOMContentLoaded', initProductPage);

// ----- Tương tác chi tiết sản phẩm (số lượng, tùy chọn, tab) -----
function initProductDetailsInteractions() {
    if (!document.getElementById('productDetailContainer')) return;

    // Điều khiển số lượng
    const minus = document.getElementById('qtyMinus');
    const plus = document.getElementById('qtyPlus');
    const input = document.getElementById('qtyInput');
    if (minus && plus && input) {
        minus.addEventListener('click', () => {
            const v = Math.max(1, parseInt(input.value || '1') - 1);
            input.value = String(v);
        });
        plus.addEventListener('click', () => {
            const v = Math.min(99, parseInt(input.value || '1') + 1);
            input.value = String(v);
        });
    }

    // Lựa chọn kích thước
    const sizePills = document.querySelectorAll('.size-pill');
    sizePills.forEach(pill => {
        pill.addEventListener('click', () => {
            sizePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
        });
    });

    // Lựa chọn màu sắc
    const colorDots = document.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });

    // Thumbnail → hình ảnh chính (thumbnail tĩnh làm placeholder)
    const mainImg = document.getElementById('productImage');
    const thumbs = document.querySelectorAll('.product-thumb');
    thumbs.forEach(t => {
        t.addEventListener('click', () => {
            thumbs.forEach(x => x.classList.remove('active'));
            t.classList.add('active');
            if (mainImg) mainImg.src = t.src;
        });
    });

    // Tab
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-tab');
            tabs.forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`tab-${key}`);
            if (target) target.classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', initProductDetailsInteractions);

// In Next.js, this script may load after DOMContentLoaded. Run initializers immediately if DOM is already ready.
if (document.readyState !== 'loading') {
    try {
        includeHTML(function() {
            initHeroCarousel();
            initCarousel();
            if (typeof initNewsletter === 'function') { try { initNewsletter(); } catch(_) {} }
            initProductCards();
            initShowMore();
            initExploreMore();
            initStickyHeader();
            initCartDrawer();
            renderCart();
            updateCartBadge();
        });
        initSmoothScrolling();
        if (document.querySelector('.shop-banner-section') || document.querySelector('.product-breadcrumb-section')) {
            initShopPage();
        }
        initProductPage();
        initProductDetailsInteractions();
    } catch (_) {}
}

