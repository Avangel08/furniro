# 🎯 Banner Integration Plan - Customer Homepage

## 📋 Phân Tích Trang Chủ Khách Hàng

### 🏗️ Cấu Trúc Trang Chủ Hiện Tại:
```
Homepage Layout:
├── Header (Fixed)
├── Hero Section (Carousel)
├── Browse Section (Categories)
├── Our Products Section
├── Rooms Inspiration Section
└── Hashtag Gallery Section
```

### 🎯 Các Vị Trí Banner Được Xác Định:

#### 1. **Homepage Top** (Hero Section)
- **Vị trí**: Ngay dưới header, toàn bộ hero carousel
- **Kích thước**: Full width, aspect-ratio 16:9
- **Mục đích**: Banner chính, quảng cáo lớn
- **Ưu tiên**: Cao nhất (Priority 1-3)

#### 2. **Homepage Middle** (Giữa các sections)
- **Vị trí**: Giữa Browse Section và Our Products Section
- **Kích thước**: Full width, height linh hoạt
- **Mục đích**: Banner quảng cáo sản phẩm, khuyến mãi
- **Ưu tiên**: Trung bình (Priority 4-6)

#### 3. **Homepage Bottom** (Cuối trang)
- **Vị trí**: Trước Footer, sau Hashtag Gallery Section
- **Kích thước**: Full width, height linh hoạt
- **Mục đích**: Banner cuối trang, newsletter, social media
- **Ưu tiên**: Thấp (Priority 7-10)

#### 4. **Category Page** (Trang danh mục)
- **Vị trí**: Trang danh mục sản phẩm
- **Kích thước**: Full width hoặc sidebar
- **Mục đích**: Banner theo danh mục cụ thể
- **Ưu tiên**: Theo danh mục

## 🚀 Kế Hoạch Implementation

### **Phase 1: Cập Nhật Banner Model & API**

#### 1.1 Cập Nhật Banner Model
```typescript
// Thêm các vị trí mới vào enum
position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page' | 'Product Page' | 'Checkout Page' | 'Other'

// Thêm fields mới
displayOrder: number;        // Thứ tự hiển thị trong cùng vị trí
isResponsive: boolean;       // Responsive design
maxWidth?: number;          // Max width cho banner
height?: number;            // Fixed height nếu cần
```

#### 1.2 Cập Nhật API Endpoints
- **GET /api/banners**: Thêm filter theo position
- **GET /api/banners/active**: Lấy banners active theo position
- **POST /api/banners/track**: Track performance theo position

### **Phase 2: Tạo Banner Components cho Customer**

#### 2.1 BannerDisplay Component
```typescript
// furniro-cust/components/BannerDisplay.tsx
interface BannerDisplayProps {
  position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page';
  className?: string;
  maxBanners?: number;
}
```

#### 2.2 BannerCarousel Component
```typescript
// furniro-cust/components/BannerCarousel.tsx
// Cho Homepage Top - thay thế hero carousel hiện tại
interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  interval?: number;
}
```

#### 2.3 BannerGrid Component
```typescript
// furniro-cust/components/BannerGrid.tsx
// Cho Homepage Middle/Bottom - hiển thị nhiều banners
interface BannerGridProps {
  banners: Banner[];
  columns?: number;
  gap?: number;
}
```

### **Phase 3: Tích Hợp Vào Trang Chủ**

#### 3.1 Homepage Top Integration
```typescript
// Thay thế hero carousel hiện tại
<BannerCarousel 
  position="Homepage Top"
  className="hero-banner-carousel"
  autoPlay={true}
  interval={5000}
/>
```

#### 3.2 Homepage Middle Integration
```typescript
// Thêm sau Browse Section
<BannerGrid 
  position="Homepage Middle"
  className="middle-banner-section"
  columns={1}
/>
```

#### 3.3 Homepage Bottom Integration
```typescript
// Thêm trước Footer
<BannerGrid 
  position="Homepage Bottom"
  className="bottom-banner-section"
  columns={2}
/>
```

### **Phase 4: Cập Nhật Admin Dashboard**

#### 4.1 Cập Nhật Position Options
```typescript
// Cập nhật dropdown position trong Add/Edit Banner
const positionOptions = [
  'Homepage Top',
  'Homepage Middle', 
  'Homepage Bottom',
  'Category Page',
  'Product Page',
  'Checkout Page',
  'Other'
];
```

#### 4.2 Thêm Preview Functionality
- **Banner Preview**: Hiển thị banner sẽ như thế nào trên trang chủ
- **Position Preview**: Preview theo từng vị trí
- **Responsive Preview**: Preview trên mobile/desktop

#### 4.3 Cập Nhật Filters
- **Position Filter**: Filter banners theo vị trí
- **Display Order**: Sort theo displayOrder
- **Active Status**: Chỉ hiển thị banners active

### **Phase 5: Performance & Analytics**

#### 5.1 Performance Tracking
```typescript
// Track theo position
const trackBannerPerformance = (bannerId: string, position: string, action: 'click' | 'impression') => {
  // Track với position context
};
```

#### 5.2 Analytics Dashboard
- **Performance by Position**: CTR theo từng vị trí
- **Position Comparison**: So sánh hiệu quả các vị trí
- **Time-based Analytics**: Performance theo thời gian

## 📝 Chi Tiết Implementation

### **Step 1: Cập Nhật Banner Model**
```typescript
// furniro-ad/src/models/Banner.ts
export interface IBanner extends Document {
  // ... existing fields
  position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page' | 'Product Page' | 'Checkout Page' | 'Other';
  displayOrder: number;
  isResponsive: boolean;
  maxWidth?: number;
  height?: number;
  // ... rest of fields
}
```

### **Step 2: Tạo Customer API**
```typescript
// furniro-cust/app/api/banners/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position');
  
  // Filter banners by position and active status
  const filter = {
    status: 'Active',
    position: position,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  };
  
  const banners = await Banner.find(filter)
    .sort({ displayOrder: 1, priority: 1 })
    .lean();
    
  return NextResponse.json({ success: true, data: banners });
}
```

### **Step 3: Tạo Banner Components**
```typescript
// furniro-cust/components/BannerDisplay.tsx
export function BannerDisplay({ position, className, maxBanners = 5 }: BannerDisplayProps) {
  const { banners, loading, error } = useActiveBanners(position);
  
  if (loading) return <BannerSkeleton />;
  if (error) return <BannerError />;
  if (!banners.length) return null;
  
  return (
    <div className={`banner-display ${className}`}>
      {banners.slice(0, maxBanners).map(banner => (
        <BannerItem key={banner._id} banner={banner} />
      ))}
    </div>
  );
}
```

### **Step 4: Tích Hợp Vào Homepage**
```typescript
// furniro-cust/app/page.tsx
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Homepage Top Banner */}
        <BannerDisplay 
          position="Homepage Top"
          className="hero-banner-section"
          maxBanners={1}
        />
        
        <section className="browse-section">
          {/* ... existing content */}
        </section>
        
        {/* Homepage Middle Banner */}
        <BannerDisplay 
          position="Homepage Middle"
          className="middle-banner-section"
          maxBanners={2}
        />
        
        <Suspense fallback={<ProductsSkeleton />}>
          <OurProductsSection />
        </Suspense>
        
        <section className="rooms-inspiration-section">
          {/* ... existing content */}
        </section>
        
        <section className="hashtag-gallery-section">
          {/* ... existing content */}
        </section>
        
        {/* Homepage Bottom Banner */}
        <BannerDisplay 
          position="Homepage Bottom"
          className="bottom-banner-section"
          maxBanners={3}
        />
      </main>
      <Footer />
    </>
  );
}
```

## 🎨 CSS Styling

### **Banner Section Styles**
```css
/* Homepage Top Banner */
.hero-banner-section {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  position: relative;
}

/* Homepage Middle Banner */
.middle-banner-section {
  padding: 40px 0;
  background-color: #f8f9fa;
}

/* Homepage Bottom Banner */
.bottom-banner-section {
  padding: 60px 0;
  background-color: white;
}

/* Banner Item */
.banner-item {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.banner-item:hover {
  transform: translateY(-4px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-banner-section {
    aspect-ratio: 4 / 3;
  }
  
  .middle-banner-section,
  .bottom-banner-section {
    padding: 30px 0;
  }
}
```

## 📊 Testing Plan

### **1. Unit Tests**
- Banner model validation
- API endpoint responses
- Component rendering

### **2. Integration Tests**
- Banner display on homepage
- Performance tracking
- Responsive design

### **3. User Acceptance Tests**
- Admin can create banners for each position
- Banners display correctly on homepage
- Performance tracking works
- Mobile responsiveness

## 🚀 Deployment Checklist

### **Pre-deployment**
- [ ] Update Banner model
- [ ] Create customer API endpoints
- [ ] Build banner components
- [ ] Integrate into homepage
- [ ] Update admin dashboard
- [ ] Test all functionality

### **Post-deployment**
- [ ] Monitor banner performance
- [ ] Check error logs
- [ ] Verify mobile responsiveness
- [ ] Test performance tracking

## 📈 Success Metrics

### **Technical Metrics**
- Banner load time < 2 seconds
- 99.9% uptime for banner API
- Mobile responsiveness score > 90

### **Business Metrics**
- Banner CTR improvement
- User engagement increase
- Conversion rate improvement

---

**🎯 Kế hoạch này sẽ tạo ra một hệ thống banner management hoàn chỉnh, tích hợp seamlessly với trang chủ khách hàng!**
