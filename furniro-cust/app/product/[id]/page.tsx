import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { fetchProduct, formatPrice, getProductImage, calculateDiscountPercentage, Product } from '../../../lib/api';
import { Suspense } from 'react';

interface ProductPageProps {
  params: { id: string };
}

// Loading component for product detail
function ProductDetailLoading() {
  return (
    <div className="animate-pulse">
      <section className="product-breadcrumb-section">
        <div className="product-breadcrumb-container">
          <nav className="breadcrumb breadcrumb-light">
            <div className="bg-gray-200 h-4 w-12 rounded"></div>
            <span className="breadcrumb-separator">&gt;</span>
            <div className="bg-gray-200 h-4 w-16 rounded"></div>
            <span className="breadcrumb-separator">&gt;</span>
            <div className="bg-gray-200 h-4 w-24 rounded"></div>
          </nav>
        </div>
      </section>

      <section className="product-detail-section">
        <div className="product-detail-container">
          <div className="product-detail-gallery">
            <div className="product-thumbs">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-16 w-16 rounded"></div>
              ))}
            </div>
            <div className="product-main-image">
              <div className="bg-gray-200 h-96 w-96 rounded"></div>
            </div>
          </div>
          <div className="product-detail-info">
            <div className="bg-gray-200 h-8 w-48 mb-4 rounded"></div>
            <div className="bg-gray-200 h-6 w-32 mb-4 rounded"></div>
            <div className="bg-gray-200 h-4 w-full mb-2 rounded"></div>
            <div className="bg-gray-200 h-4 w-3/4 mb-4 rounded"></div>
            <div className="bg-gray-200 h-10 w-full mb-4 rounded"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Related products component
function RelatedProductCard({ product }: { product: Product }) {
  const discountPercentage = calculateDiscountPercentage(product.price, product.oldPrice);
  const productImage = getProductImage(product);

  return (
    <div className="product-card">
      <div className="product-image">
        <a href={`/product/${product._id}`}>
          <img src={productImage} alt={product.name} className="product-img" />
        </a>
        {discountPercentage && (
          <div className="product-badge discount">-{discountPercentage}%</div>
        )}
        {!product.oldPrice && new Date(product.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
          <div className="product-badge new">New</div>
        )}
        <div className="product-overlay">
          <button className="add-to-cart-btn" data-id={product._id}>Add to cart</button>
          <div className="product-actions">
            <span className="action-item"><i className="icon">↗</i> Share</span>
            <span className="action-item"><i className="icon">⚖</i> Compare</span>
            <span className="action-item"><i className="icon">♡</i> Like</span>
          </div>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-name">
          <a href={`/product/${product._id}`}>{product.name}</a>
        </h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          <span className="current-price">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatPrice(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Main product detail component
async function ProductDetail({ id }: { id: string }) {
  try {
    const productResponse = await fetchProduct(id);
    
    if (!productResponse.success) {
      return notFound();
    }

    const { data: product, relatedProducts } = productResponse;
    const productImage = getProductImage(product);

    return (
      <>
        <section className="product-breadcrumb-section">
          <div className="product-breadcrumb-container">
            <nav className="breadcrumb breadcrumb-light">
              <a href="/">Home</a>
              <span className="breadcrumb-separator">&gt;</span>
              <a href="/shop">Shop</a>
              <span className="breadcrumb-separator">&gt;</span>
              <span className="breadcrumb-current">{product.name}</span>
            </nav>
          </div>
        </section>

        <section className="product-detail-section">
          <div className="product-detail-container" id="productDetailContainer">
            <div className="product-detail-gallery">
              <div className="product-thumbs" id="productThumbs">
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <img 
                      key={index}
                      src={getProductImage(product, index)} 
                      alt={`${product.name} thumb ${index + 1}`} 
                      className={`product-thumb ${index === 0 ? 'active' : ''}`} 
                    />
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, index) => (
                    <img key={index} src="/image/Rectangle 24.png" alt="thumb" className="product-thumb" />
                  ))
                )}
              </div>
              <div className="product-main-image" style={{
                height: '420px',
                padding: '16px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f9f7f3',
                borderRadius: '12px',
                border: '1px solid #eee'
              }}>
                <img 
                  id="productImage" 
                  className="product-detail-image" 
                  src={productImage} 
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: '10px'
                  }}
                />
              </div>
            </div>
            <div className="product-detail-info">
              <h1 id="productName" className="product-detail-name">{product.name}</h1>
              <div className="product-detail-price-line">
                <span id="productPrice" className="product-detail-price-number">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span id="productOldPrice" className="product-detail-old-price">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
              <div className="product-rating-line">
                <div className="stars" aria-label="rating">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>☆</span>
                </div>
                <span className="review-count">
                  <span id="reviewsCount">5</span> Customer Review
                </span>
              </div>
              <p id="productDescription" className="product-detail-description">{product.description}</p>
              
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
                <div><strong>SKU:</strong> <span id="productSku">{product.sku || product._id}</span></div>
                <div><strong>Category:</strong> <span id="productCategory">{product.category}</span></div>
                <div><strong>Tags:</strong> <span id="productTags">{product.tags?.join(', ') || 'N/A'}</span></div>
                <div className="share-line">
                  <strong>Share:</strong>
                  <a href="#" aria-label="Share on Facebook">f</a>
                  <a href="#" aria-label="Share on Pinterest">p</a>
                  <a href="#" aria-label="Share on Twitter">t</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider line above product tabs */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#E5E5E5',
          margin: '40px 0',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}></div>

        <section className="product-tabs-section">
          <div className="product-tabs-container">
            <div className="tabs-header" id="tabsHeader">
              <button className="tab-btn active" data-tab="description">Description</button>
              <button className="tab-btn" data-tab="additional">Additional Information</button>
              <button className="tab-btn" data-tab="reviews">Reviews [5]</button>
            </div>
            <div className="tabs-content">
              <div className="tab-panel active" id="tab-description">
                <p>{product.detailedDescription || product.description}</p>
                {product.detailedImages && product.detailedImages.length > 0 && (
                  <div className="tab-images" style={{
                    marginTop: '20px',
                    display: 'grid',
                    gridTemplateColumns: product.detailedImages.length === 1 ? '1fr' : '1fr 1fr',
                    gap: '20px'
                  }}>
                    {product.detailedImages.map((image, index) => (
                      <img 
                        key={index}
                        src={image.startsWith('/uploads') ? `http://localhost:3002${image}` : image} 
                        alt={`${product.name} detail ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '300px',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          borderRadius: '12px'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="tab-panel" id="tab-additional">
                <div>
                  {product.weight && <p><strong>Weight:</strong> {product.weight}kg</p>}
                  {product.dimensions && <p><strong>Dimensions:</strong> {product.dimensions}</p>}
                  {product.material && <p><strong>Material:</strong> {product.material}</p>}
                  {product.color && <p><strong>Color:</strong> {product.color}</p>}
                </div>
              </div>
              <div className="tab-panel" id="tab-reviews">
                <p>No reviews yet. Be the first to write one!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider line between tabs and related products */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: '#E5E5E5',
          margin: '40px 0',
          maxWidth: '1200px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}></div>

        {relatedProducts.length > 0 && (
          <section className="products-section">
            <div className="products-container">
              <h2 className="products-title">Related Products</h2>
              <div className="products-grid" id="relatedProducts">
                {relatedProducts.map((relatedProduct) => (
                  <RelatedProductCard key={relatedProduct._id} product={relatedProduct} />
                ))}
              </div>
              <div className="show-more-container">
                <button className="show-more-btn">Show More</button>
              </div>
            </div>
          </section>
        )}
      </>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    return notFound();
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<ProductDetailLoading />}>
          <ProductDetail id={params.id} />
        </Suspense>
      </main>
      <Footer />
      <Script src="/legacy/script.js" strategy="afterInteractive" />
    </>
  );
}
