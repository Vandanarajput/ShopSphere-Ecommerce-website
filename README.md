<div align="center">

# 🛍️ ShopSphere

### A full-stack MERN e-commerce platform with admin panel, reviews, order tracking & more.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)

**🔗 Live Demo:** _coming soon_ &nbsp;·&nbsp; **📂 Repo:** this repository

</div>

---

## ✨ What is ShopSphere?

ShopSphere is a production-style e-commerce web app built from scratch — covering the complete customer journey (browse → cart → checkout → tracking) AND a full admin panel (products, orders, image uploads). The codebase emphasises **real-world patterns**: atomic stock decrement to prevent overselling, cart price snapshots, JWT-based role auth, Cloudinary CDN for images, and a clean Redux state architecture.

It is built to be **demo-ready**: 20 seeded demo products with real photos, a polished cream-and-forest-green theme, toast notifications, skeleton loaders, and a visual order-tracking timeline.

---

## 🚀 Features

### 🛒 Customer experience
- 🔐 **Authentication** — Register, login, JWT-protected routes, change password
- 👤 **Profile page** — Edit name/phone, change password, manage saved addresses
- 🔍 **Product catalog** — Search by text, filter by category/brand/price/stock, sort by newest/price/rating, paginated
- 📦 **Product detail** — Multi-image gallery, ratings breakdown, in-stock indicator, discount badge
- ⭐ **Reviews & Ratings** — Post / edit / delete · 1-5 stars · **auto-verified purchase** badge · rating breakdown bars
- 🛒 **Cart** — Add/update/remove/clear, **price-snapshot** lock-in, stock-aware quantity stepper
- ❤️ **Wishlist** — Save items for later, move to cart with one click
- 📍 **Multi-address checkout** — Add, set default, delete addresses
- 💳 **Checkout** — Address selection, COD payment, order summary
- 📦 **Order tracking** — Visual **horizontal stepper** (Placed → Processing → Shipped → Delivered) with animated progress bar
- 🗂️ **My Orders** — Filterable list with status pills + item preview
- ❌ **Cancel orders** — Customer can cancel pending/processing orders, stock auto-restored
- 🔔 **Toast notifications** — Friendly feedback on every action
- 💀 **Skeleton loaders** — Smooth perceived performance instead of generic spinners

### 👨‍💼 Admin panel
- 📦 **Product CRUD** — Create, edit, soft-delete with **Cloudinary** image uploads (up to 5 images)
- 🧾 **Orders management** — View all orders, filter by status, expand for details, advance state machine
- 🔄 **Status transitions** — Enforced state machine: pending → processing → shipped → delivered (or cancelled → refunded)
- 📊 **Stats** — Total orders, pending, processing, shipped, revenue
- 🔒 **Protected routes** — Role-based access (`customer` / `admin` / `superAdmin`)

### 🔧 Engineering highlights
- ⚛️ **Atomic stock decrement** with `findOneAndUpdate` to prevent overselling under concurrent checkout
- 💰 **Cart price snapshots** so prices don't shift between add-to-cart and checkout
- 🎯 **Mongoose text indexes** for full-text product search
- 🛡️ **Zod schema validation** on auth requests
- 🌐 **Standardized API responses** via `success()` / `failure()` helpers
- 🏗️ **Vercel-ready** — both apps deploy as separate serverless projects

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, Vite 5, React Router 6, Redux Toolkit, TailwindCSS, Axios, react-hot-toast |
| **Backend** | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, Zod, Multer |
| **Database** | MongoDB (local or Atlas) |
| **Images** | Cloudinary CDN (with `f_auto, q_auto` optimization) |
| **Hosting** | Vercel (frontend + backend serverless) |
| **Dev tools** | Nodemon, Morgan, Vite HMR |

---

## 📂 Project Structure

```
ShopSphere/
├── backend/                       Express API (port 5000)
│   ├── src/
│   │   ├── app.js                 Express app + routes mounting
│   │   ├── server.js              Entry point + DB connect
│   │   ├── config/                db.js, cloudinary.js
│   │   ├── models/                User · Product · Category · Cart · Wishlist · Order · Review
│   │   ├── controllers/           Business logic per entity
│   │   ├── middleware/            auth · admin · upload · error handler
│   │   ├── routes/                Express routers
│   │   ├── validators/            Zod schemas
│   │   ├── utils/                 API response, JWT, slug, order #, totals
│   │   └── scripts/               (none — scripts at root)
│   ├── scripts/                   seedAdmin.js · seedData.js
│   ├── .env.example
│   └── vercel.json
│
├── frontend/                      React SPA (port 5173)
│   ├── public/
│   │   └── images/
│   │       ├── hero/              Hero carousel banners
│   │       └── categories/        Category card photos
│   └── src/
│       ├── App.jsx · main.jsx
│       ├── app/store.js           Redux store
│       ├── features/              Redux slices (auth, products, cart, wishlist, orders, reviews)
│       ├── pages/                 Home · ProductList · ProductDetail · Cart · Wishlist
│       │                          Checkout · OrderSuccess · Orders · OrderDetail · Profile · Auth
│       │                          admin/AdminProducts · admin/AdminOrders
│       ├── components/            layout · common · home · product
│       ├── routes/                AppRoutes · AdminRoute
│       ├── services/apiClient.js  Axios w/ JWT interceptor
│       └── utils/
│
└── README.md
```

---

## 🏃 Getting Started Locally

### Prerequisites
- **Node.js** 18 or higher
- **MongoDB** running locally (or a free [MongoDB Atlas](https://mongodb.com/atlas) cluster)
- **Cloudinary** account (free tier) for product image uploads

### 1. Clone & install

```bash
git clone <your-repo-url>
cd ShopSphere
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/shopsphere
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

# Free tier at https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Then seed an admin user and 20 demo products:

```bash
npm run seed:admin     # creates admin@shopsphere.com / admin1234
npm run seed:data      # creates 5 categories + 20 demo products with real photos
npm run dev
```

API is live at `http://localhost:5000` &nbsp;·&nbsp; health check: `GET /api/health`

### 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env       # set VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
```

App is live at `http://localhost:5173` 🎉

---

## 🌐 Key API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create new account |
| `POST` | `/api/auth/login` | Login → returns JWT |
| `GET`  | `/api/auth/me` | Current user profile (auth) |
| `PUT`  | `/api/auth/change-password` | Change password (auth) |
| `PUT`  | `/api/users/profile` | Update name/phone (auth) |
| `GET`  | `/api/products?search=&category=&minPrice=&sort=&page=` | List products |
| `GET`  | `/api/products/:id` | Product detail |
| `POST` | `/api/products/:productId/reviews` | Post a review (auth) |
| `GET`  | `/api/cart` | Get current user's cart (auto-cleans phantom items) |
| `POST` | `/api/cart/items` | Add to cart |
| `POST` | `/api/orders` | Place order (atomic stock decrement) |
| `GET`  | `/api/orders/my-orders` | List my orders |
| `PUT`  | `/api/orders/:id/cancel` | Cancel order (restores stock) |
| `GET`  | `/api/admin/orders?status=` | All orders (admin) |
| `PUT`  | `/api/admin/orders/:id/status` | Advance status (admin) |

---

## 🚢 Deployment (Vercel)

Both apps deploy as two **independent Vercel projects** pointing at this same repo:

| Project | Root Directory | Build Command | Output |
|---|---|---|---|
| Frontend | `frontend` | `npm run build` | `dist` |
| Backend | `backend` | (auto from `vercel.json`) | serverless functions |

Set the env vars from `.env.example` in each Vercel project's settings.

> ⚠️ Because Vercel serverless has no persistent disk, **Cloudinary is required** for product image uploads.

---

## 🗺️ Roadmap

- [ ] Online payment integration (Razorpay test mode or fake gateway)
- [ ] Order invoice PDF download
- [ ] Email notifications (order placed / shipped / delivered)
- [ ] Coupon code application at checkout (schema fields exist)
- [ ] Product variants (size / color)
- [ ] Recently viewed products
- [ ] Recommendations (related products on detail page)

---

## 🤝 Contributing

This is a personal portfolio project, but issues and suggestions are welcome.

## 📄 License

MIT — feel free to use this as a learning reference or starter for your own e-commerce projects.

---

<div align="center">

Built with 💚 using the MERN stack.

</div>
