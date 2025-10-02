import Header from './components/Header';
import Footer from './components/Footer';
import Script from 'next/script';

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-carousel-container">
            <div className="hero-carousel-slides">
              <div className="hero-slide active">
                <img src="/image/Mask Group.jpg" alt="Modern Living Room" className="hero-img" />
              </div>
              <div className="hero-slide">
                <img src="/image/noi-that-phong-khach-bep-hien-dai-don-gian-2.jpg" alt="Fantasy Night Scene" className="hero-img" />
              </div>
              <div className="hero-slide">
                <img src="/image/noi-that-phong-khach-bep-hien-dai-don-gian-3.jpg" alt="Japanese Temple Night" className="hero-img" />
              </div>
            </div>
            <div className="hero-carousel-navigation">
              <div className="hero-carousel-dots">
                <span className="hero-dot active" data-slide="0"></span>
                <span className="hero-dot" data-slide="1"></span>
                <span className="hero-dot" data-slide="2"></span>
              </div>
            </div>
            <button className="hero-carousel-prev" id="heroPrev">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button className="hero-carousel-next" id="heroNext">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </button>
            </div>
          </div>
        </section>

        <section className="browse-section">
          <div className="browse-container">
            <h2 className="browse-title">Browse The Range</h2>
            <p className="browse-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <div className="categories-grid">
              <div className="category-card">
                <div className="category-image">
                  <img src="/image/Rectangle 40.png" alt="Dining Room" className="category-img" />
                </div>
                <h3 className="category-name">Dining</h3>
              </div>
              <div className="category-card">
                <div className="category-image">
                  <img src="/image/image 7.png" alt="Living Room" className="category-img" />
                </div>
                <h3 className="category-name">Living</h3>
              </div>
              <div className="category-card">
                <div className="category-image">
                  <img src="/image/beb.png" alt="Bedroom" className="category-img" />
                </div>
                <h3 className="category-name">Bedroom</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="products-container">
            <h2 className="products-title">Our Products</h2>
            <div className="products-grid">
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
            <div className="show-more-container">
              <button className="show-more-btn">Show More</button>
            </div>
          </div>
        </section>

        <section className="rooms-inspiration-section">
          <div className="rooms-container">
            <div className="rooms-content">
              <h2 className="rooms-title">50+ Beautiful rooms inspiration</h2>
              <p className="rooms-description">Our designer already made a lot of beautiful prototipe of rooms that inspire you</p>
              <button className="explore-more-btn">Explore More</button>
            </div>
            <div className="rooms-carousel">
              <div className="carousel-container" id="carouselContainer">
                <div className="carousel-slide"><img src="/image/Rectangle 24.png" alt="Beautiful Room 1" className="carousel-img" /></div>
                <div className="carousel-slide"><img src="/image/Rectangle 25.png" alt="Beautiful Room 2" className="carousel-img" /></div>
                <div className="carousel-slide"><img src="/image/Rectangle 43.png" alt="Beautiful Room 3" className="carousel-img" /></div>
              </div>
              <div className="carousel-navigation">
                <div className="carousel-dots">
                  <span className="carousel-dot active" data-slide="0"></span>
                  <span className="carousel-dot" data-slide="1"></span>
                  <span className="carousel-dot" data-slide="2"></span>
                </div>
              </div>
              <button className="carousel-next" id="carouselNext"><svg fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg></button>
            </div>
          </div>
        </section>

        <section className="hashtag-gallery-section">
          <div className="hashtag-gallery-container">
            <h2 className="hashtag-gallery-title">Share your setup with</h2>
            <h3 className="hashtag-gallery-hashtag">#FuniroFurniture</h3>
            <img src="/image/Images.png" alt="Hashtag Social Gallery" className="gallery-main-image" />
          </div>
        </section>
      </main>

      <Footer />

      <Script src="/legacy/script.js" strategy="afterInteractive" />
    </>
  );
}


