import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';
import { fetchProducts, formatPrice, getProductImage, calculateDiscountPercentage, Product } from '../../lib/api';
import { Suspense } from 'react';

interface ShopPageProps {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    limit?: string;
  };
}

// Loading component for products
function ProductsLoading() {
  return (
    <div className="products-grid">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="product-card animate-pulse">
          <div className="product-image bg-gray-200 h-48"></div>
          <div className="product-info">
            <div className="bg-gray-200 h-4 mb-2 rounded"></div>
            <div className="bg-gray-200 h-3 mb-2 rounded w-3/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Product card component
function ProductCard({ product }: { product: Product }) {
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

// Products grid component
async function ProductsGrid({ searchParams }: { searchParams: ShopPageProps['searchParams'] }) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '16');
  const category = searchParams.category;
  const search = searchParams.search;
  const sortBy = searchParams.sortBy || 'newest';

  try {
    const productsResponse = await fetchProducts({
      page,
      limit,
      category,
      search,
      sortBy
    });

    if (!productsResponse.success) {
      throw new Error('Failed to load products');
    }

    const { data: products, pagination, categories } = productsResponse;

    return (
      <>
        <div className="products-grid" id="productsGrid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          )}
        </div>
        
        {pagination.pages > 1 && (
          <div className="pagination-container">
            <button 
              className={`pagination-btn prev ${page <= 1 ? 'disabled' : ''}`}
              disabled={page <= 1}
            >
              <svg className="pagination-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum}
                    className={`pagination-number ${page === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              className={`pagination-btn next ${page >= pagination.pages ? 'disabled' : ''}`}
              disabled={page >= pagination.pages}
            >
              <svg className="pagination-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('Error loading products:', error);
    return (
      <div className="col-span-full text-center py-8">
        <p className="text-red-500 text-lg">Failed to load products. Please try again later.</p>
      </div>
    );
  }
}

export default function ShopPage({ searchParams }: ShopPageProps) {
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
              <span className="results-info">Showing 1-16 of 48 results</span>
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
            <Suspense fallback={<ProductsLoading />}>
              <ProductsGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
      <Script src="/legacy/script.js" strategy="afterInteractive" />
    </>
  );
}


