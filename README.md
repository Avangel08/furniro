# Furniro (Static HTML/CSS/JS)

## Giới thiệu
- Website tĩnh mô phỏng cửa hàng nội thất, triển khai bằng HTML/CSS/JavaScript thuần.

## Cấu trúc thư mục
- `index.html`, `shop.html`, `productdetails.html`
- `header.html`, `footer.html`
- `styles.css`, `script.js`
- `image/` chứa toàn bộ ảnh sử dụng

## Công việc đã làm 22/9 xây dựng các trang 
1) trang chủ 
2) sản phẩm 
3) Trang chi tiết sản phẩm
4) Giỏ hàng (js)

#25/9 hoàn thành html->nextjs

--npm install
--npm run dev




interface Product {
  _id: string;                    // ID sản phẩm (8 ký tự: 2 chữ + 6 số)
  name: string;                   // Tên sản phẩm
  category: string;               // Danh mục
  price: number;                  // Giá hiện tại
  oldPrice?: number;              // Giá cũ (tùy chọn)
  stock: number;                  // Số lượng tồn kho
  status: string;                 // Trạng thái (active/inactive)
  sku: string;                    // Mã SKU (tự động IN HOA)
  brand?: string;                 // Thương hiệu (tùy chọn)
  description: string;            // Mô tả ngắn
  detailedDescription?: string;   // Mô tả chi tiết (tùy chọn)
  weight?: number;                // Trọng lượng (tùy chọn)
  dimensions?: string;            // Kích thước (tùy chọn)
  material?: string;              // Chất liệu (tùy chọn)
  color?: string;                 // Màu sắc (tùy chọn)
  tags?: string[];               // Tags/nhãn (tùy chọn)
  images?: string[];             // Ảnh chính (tối đa 6 ảnh)
  detailedImages?: string[];     // Ảnh chi tiết (tối đa 2 ảnh)
  createdAt: string;             // Ngày tạo
  updatedAt: string;             // Ngày cập nhật
}






 SEED DATA SUMMARY:
==========================================

 ADMIN USERS:
  • Admin User (admin@furniro.com) - Role: admin
  • Manager User (manager@furniro.com) - Role: manager
  • Staff User (staff@furniro.com) - Role: staff

 CUSTOMERS:
  • Sarah Johnson (sarah.johnson@email.com) - Orders: 12, Spent: $3240
  • Michael Brown (michael.brown@email.com) - Orders: 8, Spent: $2150
  • Emily Davis (emily.davis@email.com) - Orders: 3, Spent: $890
  • James Wilson (james.wilson@email.com) - Orders: 15, Spent: $4320
  • Lisa Anderson (lisa.anderson@email.com) - Orders: 6, Spent: $1680