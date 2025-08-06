// MongoDB Sample Data for web_ai_db

// Categories Collection
db.categories.insertMany([
  {
    _id: ObjectId(),
    name: "Nhân sự",
    description: "Các quy trình liên quan đến nhân sự và tuyển dụng",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "Kế toán",
    description: "Các quy trình tài chính và kế toán",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "IT",
    description: "Các quy trình công nghệ thông tin",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "Hành chính",
    description: "Các quy trình hành chính văn phòng",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Procedures Collection
db.procedures.insertMany([
  {
    _id: ObjectId(),
    title: "Quy trình nghỉ việc",
    content: "1. Nộp đơn xin nghỉ việc trước 30 ngày\n2. Hoàn thành công việc bàn giao\n3. Thu hồi tài sản công ty\n4. Thanh toán lương và phụ cấp\n5. Nhận xác nhận nghỉ việc",
    category: "Nhân sự",
    description: "Hướng dẫn quy trình nghỉ việc cho nhân viên",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    title: "Quy trình tuyển dụng",
    content: "1. Xác định nhu cầu tuyển dụng\n2. Đăng tin tuyển dụng\n3. Sàng lọc hồ sơ\n4. Phỏng vấn vòng 1\n5. Phỏng vấn vòng 2\n6. Quyết định tuyển dụng\n7. Onboarding nhân viên mới",
    category: "Nhân sự",
    description: "Quy trình tuyển dụng nhân viên mới",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    title: "Quy trình báo cáo tài chính",
    content: "1. Thu thập dữ liệu tài chính\n2. Kiểm tra và đối soát\n3. Lập báo cáo\n4. Phê duyệt báo cáo\n5. Gửi báo cáo cho ban lãnh đạo",
    category: "Kế toán",
    description: "Quy trình lập và báo cáo tài chính định kỳ",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    title: "Quy trình backup dữ liệu",
    content: "1. Kiểm tra dung lượng storage\n2. Chạy backup tự động\n3. Kiểm tra backup thành công\n4. Lưu trữ backup offsite\n5. Test restore định kỳ",
    category: "IT",
    description: "Quy trình sao lưu dữ liệu hệ thống",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    title: "Quy trình xin phép nghỉ",
    content: "1. Điền đơn xin nghỉ phép\n2. Gửi đơn cho quản lý trực tiếp\n3. Chờ phê duyệt\n4. Thông báo kết quả\n5. Cập nhật lịch làm việc",
    category: "Hành chính",
    description: "Hướng dẫn xin phép nghỉ làm",
    created_at: new Date(),
    updated_at: new Date()
  }
]);

// Create indexes for better performance
db.procedures.createIndex({ "title": "text", "content": "text", "description": "text" });
db.procedures.createIndex({ "category": 1 });
db.categories.createIndex({ "name": 1 }, { unique: true });
