-- ==========================================================
-- Campus Sell & Buy Portal Seed Data
-- ==========================================================

USE campus_sell_buy;

-- Categories
INSERT INTO categories (name, slug, icon, description) VALUES
('Electronics', 'electronics', 'Laptop', 'Laptops, chargers, headphones, calculators, gadgets'),
('Books', 'books', 'BookOpen', 'Textbooks, reference books, novels, exam prep books'),
('Notes', 'notes', 'FileText', 'Lecture notes, handwritten summaries, exam cheat sheets'),
('Furniture', 'furniture', 'Armchair', 'Study tables, ergonomic chairs, bed tables, organizers'),
('Sports Equipment', 'sports-equipment', 'Activity', 'Badminton rackets, cricket bats, footballs, fitness gear'),
('Fashion', 'fashion', 'Shirt', 'College hoodies, lab coats, formal attire, jackets'),
('Accessories', 'accessories', 'Watch', 'Bags, backpacks, scientific calculators, stationery'),
('Other Products', 'other-products', 'Package', 'Miscellaneous campus essentials and daily items')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample Users (Passwords are 'Student123!' or 'Admin123!')
-- bcrypt hash for 'Student123!' is $2a$10$fI86vV6nC2R4jRzYI5WjZ.774900iU6a4Ksmg4tJ0W96i0i2q84d6
-- bcrypt hash for 'Admin123!' is $2a$10$mBqJiqB0N2W1.62C8wMWeOzH7K4fT0Z2YjMvK5wW5I2y0U1uE2tXW
INSERT INTO users (id, full_name, email, student_id, phone, password, campus, role, status) VALUES
(1, 'Campus Administrator', 'admin@campusmarket.edu', 'ADM-001', '+91 98765 00000', '$2a$10$mBqJiqB0N2W1.62C8wMWeOzH7K4fT0Z2YjMvK5wW5I2y0U1uE2tXW', 'Admin Block', 'admin', 'active'),
(2, 'Aarav Sharma', 'aarav.sharma@campusmarket.edu', 'CS2022-045', '+91 98765 43210', '$2a$10$fI86vV6nC2R4jRzYI5WjZ.774900iU6a4Ksmg4tJ0W96i0i2q84d6', 'North Campus Hostel 4', 'student', 'active'),
(3, 'Priya Patel', 'priya.patel@campusmarket.edu', 'EE2023-112', '+91 98765 12345', '$2a$10$fI86vV6nC2R4jRzYI5WjZ.774900iU6a4Ksmg4tJ0W96i0i2q84d6', 'South Campus Hostel 2', 'student', 'active'),
(4, 'Rohan Verma', 'rohan.verma@campusmarket.edu', 'ME2021-089', '+91 98765 67890', '$2a$10$fI86vV6nC2R4jRzYI5WjZ.774900iU6a4Ksmg4tJ0W96i0i2q84d6', 'East Campus Wing A', 'student', 'active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Sample Products
INSERT INTO products (id, seller_id, category_id, title, description, price, original_price, product_condition, campus, status) VALUES
(1, 2, 1, 'Casio FX-991EX Classwiz Scientific Calculator', 'Used for 2 semesters in Engineering. Excellent working condition with solar panel and battery. All advanced matrices and equation functions intact.', 850.00, 1595.00, 'Like New', 'North Campus Hostel 4', 'active'),
(2, 2, 2, 'Introduction to Algorithms (CLRS 3rd Edition)', 'Standard textbook for Data Structures & Algorithms. Clean pages, no torn sheets, only light pencil annotations on chapter 4.', 650.00, 1250.00, 'Good', 'North Campus Hostel 4', 'active'),
(3, 3, 3, 'Complete Electrical Machines & Power Systems Notes (Sem 4 & 5)', 'Handwritten detailed classroom notes with solved university previous year questions, diagrams, and formulas summary.', 250.00, 500.00, 'Like New', 'South Campus Hostel 2', 'active'),
(4, 3, 4, 'Ergonomic Wooden Foldable Study Bed Desk', 'Compact foldable laptop desk with cup holder and tablet slot. Perfect for hostel dorm rooms. Sturdy metal legs with non-slip foam.', 450.00, 999.00, 'Good', 'South Campus Hostel 2', 'active'),
(5, 4, 5, 'Yonex Nanoray 7000 Badminton Racket with Cover', 'Strung at 24 lbs tension with BG65 gut. Grip replaced 2 weeks ago. Ideal for college sports tournaments or evening games.', 1100.00, 2400.00, 'Like New', 'East Campus Wing A', 'active'),
(6, 4, 1, 'Logitech K380 Multi-Device Bluetooth Wireless Keyboard', 'Connects up to 3 devices seamlessly (Mac/Windows/iPad). Smooth scissor keys, battery lasts over a year.', 1400.00, 2895.00, 'Like New', 'East Campus Wing A', 'active'),
(7, 2, 6, 'Official College Navy Blue Hoodie - Size L', 'Warm fleece college festival hoodie, rarely worn. Clean and washed, no lint or tears.', 550.00, 1200.00, 'Like New', 'North Campus Hostel 4', 'active'),
(8, 3, 7, 'Wildcraft 35L Water-Resistant Campus Backpack', '3 main compartments with padded 15.6 inch laptop sleeve. Rain cover included in bottom zipper.', 750.00, 1899.00, 'Good', 'South Campus Hostel 2', 'active')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample Product Images (Using reliable Unsplash CDN placeholders for initial seed)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80', 1),
(2, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', 1),
(3, 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80', 1),
(4, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80', 1),
(5, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80', 1),
(6, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 1),
(7, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', 1),
(8, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 1)
ON DUPLICATE KEY UPDATE image_url=VALUES(image_url);

-- Sample Favourites
INSERT INTO favourites (user_id, product_id) VALUES
(2, 4),
(3, 1),
(4, 2)
ON DUPLICATE KEY UPDATE created_at=CURRENT_TIMESTAMP;

-- Sample Inquiries
INSERT INTO inquiries (product_id, buyer_id, seller_id, message, phone, status) VALUES
(1, 3, 2, 'Hi Aarav, is the Casio FX-991EX still available? Can we meet at the Library cafeteria tomorrow afternoon?', '+91 98765 12345', 'pending'),
(4, 2, 3, 'Hello Priya, is the wooden bed desk sturdy enough for a 15-inch gaming laptop? Let me know if you can do 400.', '+91 98765 43210', 'read')
ON DUPLICATE KEY UPDATE message=VALUES(message);
