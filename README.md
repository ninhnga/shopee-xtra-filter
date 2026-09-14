# Shopee XTRA Filter iPhone v2

Mục tiêu: quét trang Shopee Affiliate trong Safari, tự cuộn để tải sản phẩm, đọc XTRA và số video từ DOM, rồi chỉ giữ XTRA >= 2% và video 0–2.

## Quan trọng
- Bản v2 không dùng form nhập từng link.
- Nó chạy trên **website Shopee Affiliate mở bằng Safari**, không đọc được giao diện của app Shopee native.
- Nếu trang web không đưa XTRA/video vào DOM, tool sẽ báo "không đọc đủ dữ liệu" thay vì đoán.

## Cài trên iPhone bằng Shortcuts
1. Lưu nội dung `shopee_filter.js` vào nơi bạn có thể sao chép (GitHub Pages/ghi chú).
2. Mở app **Phím tắt (Shortcuts)** trên iPhone.
3. Tạo phím tắt mới.
4. Thêm action **Run JavaScript on Web Page / Chạy JavaScript trên trang web**.
5. Dán toàn bộ `shopee_filter.js` vào ô JavaScript.
6. Trong phần chi tiết của Shortcut, bật **Show in Share Sheet / Hiển thị trong bảng chia sẻ** và nhận **Safari Web Pages**.
7. Mở website Shopee Affiliate trong Safari, đăng nhập, vào trang sản phẩm/gợi ý.
8. Bấm Chia sẻ → chọn Shortcut **Shopee XTRA Filter v2**.
9. Tool sẽ tự cuộn trang, quét các card đã tải, lọc XTRA >=2% và video 0–2.

## Giới hạn
Safari/Shortcuts chỉ chạy JavaScript trong trang web hiện tại. Không có quyền đọc DOM của ứng dụng Shopee native. Safari web extensions có thể inject script vào trang web khi được cấp quyền, theo tài liệu Apple.
