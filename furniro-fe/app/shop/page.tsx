import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';

export default function ShopPage() {
  return (
    <>
      <Header />
      <main>
        <section className="shop-banner-section">
          <div className="shop-banner-container">
            <div className="shop-banner-box">
              <div className="shop-banner-overlay"></div>
              <div className="shop-banner-content">
              <h1 className="shop-banner-title">Shop</h1>
              <nav className="breadcrumb">
                <a href="/">Home</a>
                <span className="breadcrumb-separator">&gt;</span>
                <span className="breadcrumb-current">Shop</span>
              </nav>
              </div>
            </div>
          </div>
        </section>

        <section className="filter-sort-section">
          <div className="filter-sort-container">
            <div className="filter-sort-box">
              <div className="filter-sort-left">
              <button className="filter-btn">
                <svg className="filter-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17h18v-2H3v2zm0-5h18V7H3v5zm0-7v2h18V5H3z"/></svg>
                Filter
              </button>
              <div className="view-toggle">
                <button className="view-btn active" data-view="grid">
                  <svg className="view-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 6h8v-8h-8v8zm2-6h4v4h-4v-4z"/></svg>
                </button>
                <button className="view-btn" data-view="list">
                  <svg className="view-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
                </button>
              </div>
              <span className="results-info">Showing 1-16 of 32 results</span>
              </div>
              <div className="filter-sort-right">
                <div className="show-dropdown">
                  <label>Show</label>
                  <select className="dropdown"><option value="16">16</option><option value="32">32</option><option value="48">48</option></select>
                </div>
                <div className="sort-dropdown">
                  <label>Sort by</label>
                  <select className="dropdown"><option value="default">Default</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="name">Name</option><option value="newest">Newest</option></select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="shop-products-section">
          <div className="shop-products-container">
            <div className="products-grid" id="productsGrid">
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
                  <div className="product-badge new">New</div>
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

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/grifo"><img src="/image/Image 5.png" alt="Grifo Lamp" className="product-img" /></a>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="grifo">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/grifo">Grifo</a></h3>
                  <p className="product-description">Night lamp</p>
                  <div className="product-price">
                    <span className="current-price">$ 1.500.000</span>
                  </div>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/muggo"><img src="/image/image 6.png" alt="Muggo Mug" className="product-img" /></a>
                  <div className="product-badge new">New</div>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="muggo">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/muggo">Muggo</a></h3>
                  <p className="product-description">Small mug</p>
                  <div className="product-price">
                    <span className="current-price">$ 150.000</span>
                  </div>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/pingky"><img src="/image/image 7.png" alt="Pingky Bed" className="product-img" /></a>
                  <div className="product-badge discount">-50%</div>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="pingky">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/pingky">Pingky</a></h3>
                  <p className="product-description">Cute bed set</p>
                  <div className="product-price">
                    <span className="current-price">$ 7.000.000</span>
                    <span className="old-price">$ 14.000.000</span>
                  </div>
                </div>
              </div>

              <div className="product-card">
                <div className="product-image">
                  <a href="/product/potty"><img src="/image/Images (2).png" alt="Potty Pot" className="product-img" /></a>
                  <div className="product-badge new">New</div>
                  <div className="product-overlay">
                    <button className="add-to-cart-btn" data-id="potty">Add to cart</button>
                    <div className="product-actions">
                      <span className="action-item"><i className="icon">↗</i> Share</span>
                      <span className="action-item"><i className="icon">⚖</i> Compare</span>
                      <span className="action-item"><i className="icon">♡</i> Like</span>
                    </div>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name"><a href="/product/potty">Potty</a></h3>
                  <p className="product-description">Minimalist flower pot</p>
                  <div className="product-price">
                    <span className="current-price">$ 500.000</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pagination-container">
              <button className="pagination-btn prev" disabled>
                <svg className="pagination-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <div className="pagination-numbers">
                <button className="pagination-number active">1</button>
                <button className="pagination-number">2</button>
                <button className="pagination-number">3</button>
              </div>
              <button className="pagination-btn next">
                <svg className="pagination-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Script src="/legacy/script.js" strategy="afterInteractive" />
    </>
  );
}


