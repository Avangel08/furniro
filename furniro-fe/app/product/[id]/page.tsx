import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Script from 'next/script';
import { notFound } from 'next/navigation';

const PRODUCT_DATA = {
  syltherine: { id: 'syltherine', name: 'Syltherine', description: 'Stylish cafe chair', price: '$ 2.500.000', oldPrice: '$ 3.500.000', image: '/image/image 1.png', category: 'Chair', sku: 'SYLT-001', tags: ['chair','cafe','stylish'] },
  leviosa: { id: 'leviosa', name: 'Leviosa', description: 'Stylish cafe chair', price: '$ 2.500.000', oldPrice: undefined, image: '/image/image 2.png', category: 'Chair', sku: 'LEVI-002', tags: ['chair','minimal'] },
  lolito: { id: 'lolito', name: 'Lolito', description: 'Luxury big sofa', price: '$ 7.000.000', oldPrice: '$ 14.000.000', image: '/image/image 3.png', category: 'Sofa', sku: 'LOLI-003', tags: ['sofa','luxury'] },
  respira: { id: 'respira', name: 'Respira', description: 'Outdoor bar table and stool', price: '$ 500.000', oldPrice: undefined, image: '/image/image 7.png', category: 'Table', sku: 'RESP-004', tags: ['outdoor','bar'] },
  grifo: { id: 'grifo', name: 'Grifo', description: 'Night lamp', price: '$ 1.500.000', oldPrice: undefined, image: '/image/Image 5.png', category: 'Lamp', sku: 'GRIF-005', tags: ['lamp','night'] },
  muggo: { id: 'muggo', name: 'Muggo', description: 'Small mug', price: '$ 150.000', oldPrice: undefined, image: '/image/image 6.png', category: 'Mug', sku: 'MUGG-006', tags: ['mug'] },
  pingky: { id: 'pingky', name: 'Pingky', description: 'Cute bed set', price: '$ 7.000.000', oldPrice: '$ 14.000.000', image: '/image/image 7.png', category: 'Bed', sku: 'PING-007', tags: ['bed','cute'] },
  potty: { id: 'potty', name: 'Potty', description: 'Minimalist flower pot', price: '$ 500.000', oldPrice: undefined, image: '/image/Images (2).png', category: 'Decor', sku: 'POTT-008', tags: ['pot','minimal'] },
} as const;

export default function ProductPage({ params }: { params: { id: string } }) {
  const id = params.id as keyof typeof PRODUCT_DATA;
  const p = PRODUCT_DATA[id];
  if (!p) return notFound();

  return (
    <>
      <Header />
      <main>
        <section className="product-breadcrumb-section">
          <div className="product-breadcrumb-container">
            <nav className="breadcrumb breadcrumb-light">
              <a href="/">Home</a>
              <span className="breadcrumb-separator">&gt;</span>
              <a href="/shop">Shop</a>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-current">{p.name}</span>
            </nav>
          </div>
        </section>

        <section className="product-detail-section">
          <div className="product-detail-container" id="productDetailContainer">
            <div className="product-detail-gallery">
              <div className="product-thumbs" id="productThumbs">
                <img src="/image/Rectangle 24.png" alt="thumb" className="product-thumb active" />
                <img src="/image/Rectangle 25.png" alt="thumb" className="product-thumb" />
                <img src="/image/Rectangle 43.png" alt="thumb" className="product-thumb" />
                <img src="/image/Rectangle 24.png" alt="thumb" className="product-thumb" />
              </div>
              <div className="product-main-image">
                <img id="productImage" className="product-detail-image" src={p.image} alt={p.name} />
              </div>
            </div>
            <div className="product-detail-info">
              <h1 id="productName" className="product-detail-name">{p.name}</h1>
              <div className="product-detail-price-line">
                <span id="productPrice" className="product-detail-price-number">{p.price}</span>
                {p.oldPrice ? <span id="productOldPrice" className="product-detail-old-price">{p.oldPrice}</span> : null}
              </div>
              <div className="product-rating-line">
                <div className="stars" aria-label="rating"><span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span></div>
                <span className="review-count"><span id="reviewsCount">5</span> Customer Review</span>
              </div>
              <p id="productDescription" className="product-detail-description">{p.description}</p>
              <div className="product-options">
                <div className="option-group">
                  <div className="option-label">Size</div>
                  <div className="size-options" id="sizeOptions">
                    <button className="size-pill" data-size="L">L</button>
                    <button className="size-pill" data-size="XL">XL</button>
                    <button className="size-pill" data-size="XS">XS</button>
                  </div>
                </div>
                <div className="option-group">
                  <div className="option-label">Color</div>
                  <div className="color-options" id="colorOptions">
                    <button className="color-dot purple" data-color="#6c5ce7" aria-label="Purple"></button>
                    <button className="color-dot black" data-color="#000000" aria-label="Black"></button>
                    <button className="color-dot gold" data-color="#c49b2d" aria-label="Gold"></button>
                  </div>
                </div>
              </div>
              <div className="product-actions-line">
                <div className="quantity-selector">
                  <button className="qty-btn" id="qtyMinus">-</button>
                  <input type="text" className="qty-input" id="qtyInput" defaultValue="1" readOnly />
                  <button className="qty-btn" id="qtyPlus">+</button>
                </div>
                <button className="add-to-cart-btn" id="detailAddToCart">Add To Cart</button>
                <button className="secondary-btn" id="compareBtn">+ Compare</button>
              </div>
              <div className="product-meta">
                <div><strong>SKU:</strong> <span id="productSku">{p.sku}</span></div>
                <div><strong>Category:</strong> <span id="productCategory">{p.category}</span></div>
                <div><strong>Tags:</strong> <span id="productTags">{p.tags.join(', ')}</span></div>
                <div className="share-line"><strong>Share:</strong>
                  <a href="#" aria-label="Share on Facebook">f</a>
                  <a href="#" aria-label="Share on Pinterest">p</a>
                  <a href="#" aria-label="Share on Twitter">t</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-tabs-section">
          <div className="product-tabs-container">
            <div className="tabs-header" id="tabsHeader">
              <button className="tab-btn active" data-tab="description">Description</button>
              <button className="tab-btn" data-tab="additional">Additional Information</button>
              <button className="tab-btn" data-tab="reviews">Reviews [5]</button>
            </div>
            <div className="tabs-content">
              <div className="tab-panel active" id="tab-description">
                <p>Embodying the raw, wayward spirit of rock 'n' roll...</p>
                <div className="tab-images"><img src="/image/Rectangle 24.png" alt="room 1" /><img src="/image/Rectangle 25.png" alt="room 2" /></div>
              </div>
              <div className="tab-panel" id="tab-additional"><p>Materials: Solid wood frame, premium fabric cushions...</p></div>
              <div className="tab-panel" id="tab-reviews"><p>No reviews yet. Be the first to write one!</p></div>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="products-container">
            <h2 className="products-title">Related Products</h2>
            <div className="products-grid" id="relatedProducts">
              <div className="product-card">
                <div className="product-image">
                  <a href="/product/syltherine"><img src="/image/image 1.png" alt="Syltherine Chair" className="product-img" /></a>
                  <div className="product-badge discount">-30%</div>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="syltherine">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/syltherine">Syltherine</a></h3>
                  <p className="product-description">Stylish cafe chair</p>
                  <div className="product-price">
                    <span className="current-price">$ 2.500.000</span>
                    <span className="old-price">$ 3.500.000</span>
                  </div>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/leviosa"><img src="/image/image 2.png" alt="Leviosa Chair" className="product-img" /></a>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="leviosa">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/leviosa">Leviosa</a></h3>
                  <p className="product-description">Stylish cafe chair</p>
                  <div className="product-price">
                    <span className="current-price">$ 2.500.000</span>
                  </div>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/lolito"><img src="/image/image 3.png" alt="Lolito Sofa" className="product-img" /></a>
                  <div className="product-badge discount">-50%</div>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="lolito">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/lolito">Lolito</a></h3>
                  <p className="product-description">Luxury big sofa</p>
                  <div className="product-price">
                    <span className="current-price">$ 7.000.000</span>
                    <span className="old-price">$ 14.000.000</span>
                  </div>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/respira"><img src="/image/image 7.png" alt="Respira Table" className="product-img" /></a>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="respira">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/respira">Respira</a></h3>
                  <p className="product-description">Outdoor bar table and stool</p>
                  <div className="product-price">
                    <span className="current-price">$ 500.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Script src="/legacy/script.js" strategy="afterInteractive" />
    </>
  );
}