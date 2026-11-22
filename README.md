# Campus Sell & Buy Portal 🎓

A modern, full-stack college marketplace built for students to buy and sell second-hand textbooks, electronics, lecture notes, hostel furniture, and sports equipment directly within their college community.

---

## 🌟 Key Features

- **College Authentication & RBAC**:
  - Student registration with Student ID, College Email, Phone, and Campus location.
  - bcrypt password hashing & JWT authentication with protected routes.
  - Real password reset token workflow with email notification support.
  - Role-based authorization separating standard students from Administrators.

- **Product Listing & Image Management**:
  - Multi-image uploads with automatic primary cover selection.
  - Image validation for format and file size limits (max 5MB).
  - Cloudinary cloud storage integration with local disk storage fallback (`/uploads`).
  - Condition tagging: *Brand New*, *Like New*, *Good*, *Fair*.
  - Original price and automatic discount calculation percentage badge.

- **Campus Search & Filtering**:
  - Live full-text search across titles and descriptions.
  - Filter by category, condition, campus zone, and min/max price range.
  - Sort by newest, price low-to-high, price high-to-low, and popularity.
  - Clean pagination and empty states.
  - Sold items automatically excluded from public browsing.

- **Buyer-Seller Inquiries**:
  - Authenticated students can send direct inquiries with preferred meeting spots.
  - Contact details (phone/email) are securely locked for unauthenticated guests.
  - Real-time inquiry tracking across "Received (As Seller)" and "Sent (As Buyer)" tabs.

- **Favourites / Wishlist**:
  - Instant heart toggle with optimistic UI updates.
  - Dedicated relational database table with duplicate prevention.

- **Student Dashboard**:
  - Metrics: Total Listings, Active Items, Sold Items, Saved Favourites.
  - Listing management: Edit details, mark as sold, reactivate, or permanently delete with confirmation dialogs.
  - Profile settings: Update personal info, avatar, or change password.

- **Admin Moderation Console**:
  - Overview statistics: Total students, active products, sold products, pending flags.
  - Student management: Search, inspect enrollment details, suspend or reactivate accounts.
  - Listing moderation: Review flagged listings, takedown inappropriate items.
  - Reports center: Process student reports with one-click resolution.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React, React Hot Toast.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, Cloudinary, Nodemailer, Helmet, express-rate-limit, CORS.
- **Database**: MySQL 8.0, `mysql2/promise` connection pool, foreign keys with cascade constraints, indexes.

---

## 🚀 Getting Started

### 1. Database Setup (MySQL)

Ensure MySQL is running on your system (default port: `3306`).

To create the database and seed it with demo categories, admin, students, and products:

```bash
cd server
npm run init-db
```

This runs `database/schema.sql` and `database/seed.sql` automatically.

---

### 2. Environment Variables

Configure `server/.env` (a ready template is provided):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=campus_sell_buy

JWT_SECRET=campus_sell_buy_dev_secret_key_8837194726
JWT_EXPIRES_IN=7d

# Optional Cloudinary (leave empty to use local /uploads storage):
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional SMTP for password reset emails:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Campus Market" <no-reply@campusmarket.edu>
```

---

### 3. Installation & Running

#### Install dependencies:

```bash
# In server directory:
cd server
npm install

# In client directory:
cd ../client
npm install
```

#### Run Development Servers:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client starts at http://localhost:5173
```

---

## 🔑 Demo Accounts

Use the fast demo-fill buttons on the login page or enter these credentials:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@campusmarket.edu` | `Admin123!` | Full Admin Console (`/admin`) & Marketplace |
| **Student 1** | `aarav.sharma@campusmarket.edu` | `Student123!` | North Campus Hostel |
| **Student 2** | `priya.patel@campusmarket.edu` | `Student123!` | South Campus Hostel |
| **Student 3** | `rohan.verma@campusmarket.edu` | `Student123!` | East Campus Wing |

---

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/register` - Create student account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/forgot-password` - Request expiring reset token
- `POST /api/auth/reset-password` - Update password using token
- `GET /api/auth/me` - Current session details

### Products
- `GET /api/products` - Browse & filter listings (search, category, condition, price, sorting)
- `GET /api/products/:id` - Detailed listing info & similar products
- `POST /api/products` - Create new listing (multipart image upload)
- `PUT /api/products/:id` - Edit listing
- `DELETE /api/products/:id` - Remove listing
- `PATCH /api/products/:id/status` - Mark as sold / active
- `GET /api/products/my/listings` - Current user's listings

### Favourites
- `GET /api/favourites` - User's saved items
- `POST /api/favourites/:productId` - Add to wishlist
- `DELETE /api/favourites/:productId` - Remove from wishlist

### Inquiries & Moderation
- `POST /api/inquiries` - Send buyer inquiry to seller
- `GET /api/inquiries/my` - Inquiries received and sent
- `PATCH /api/inquiries/:id/status` - Update inquiry state
- `POST /api/reports` - Report inappropriate listing

### Admin Console (Admin Only)
- `GET /api/admin/dashboard` - Platform statistics
- `GET /api/admin/users` - Student accounts management
- `PATCH /api/admin/users/:id/status` - Suspend / activate student
- `GET /api/admin/products` - Manage all listings
- `PATCH /api/admin/products/:id` - Takedown product
- `GET /api/admin/reports` - View flagged content
- `PATCH /api/admin/reports/:id` - Update report resolution
