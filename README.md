# FoodieHub — Online Food Ordering System

A full-stack college web application built with HTML, CSS, browser JavaScript, Node.js, Express, MongoDB and Mongoose.

## Features
- Customer registration/login with bcrypt password hashing and JWT in an HttpOnly cookie
- Food menu, category filters, search and cart saved in browser local storage
- Checkout with server-calculated prices and cash on delivery
- Customer order history and order status
- Admin dashboard to add/edit/delete food and update order status
- Express routes/controllers/models/middleware structure

## Requirements
- Node.js 18 or newer (20 LTS recommended)
- MongoDB Community Server running locally OR a MongoDB Atlas connection string
- Internet access for the sample Unsplash food images

## Setup (Windows)
1. Install Node.js from https://nodejs.org/ and MongoDB Community Server from https://www.mongodb.com/try/download/community, or create a MongoDB Atlas database.
2. Extract this project ZIP.
3. Open the `foodiehub` folder in VS Code.
4. Open Terminal in that folder and run:
   ```bash
   npm install
   ```
5. Copy `.env.example` to a new file named `.env`.
6. Edit `.env`. For a local database use:
   `MONGODB_URI=mongodb://127.0.0.1:27017/foodiehub`
   Change `JWT_SECRET` to a long random secret. Change `ADMIN_PASSWORD` to a password you choose.
7. Make sure MongoDB is running. Then add the starter foods and admin account:
   ```bash
   npm run seed
   ```
8. Start the website:
   ```bash
   npm start
   ```
9. Open http://localhost:3000 in your browser.

For auto-restart during development, run `npm run dev`.

## Admin login
Use the email and password from your `.env` values:
- Email: value of `ADMIN_EMAIL` (default `admin@foodiehub.local`)
- Password: value of `ADMIN_PASSWORD` (default is shown in `.env.example`; change it before using)

Log in through the website. The Admin link will appear after an admin account logs in.

## Folder structure
```text
foodiehub/
├── config/
│   └── db.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── foodController.js
│   └── orderController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── Food.js
│   ├── Order.js
│   └── User.js
├── public/
│   ├── css/styles.css
│   ├── js/app.js
│   └── index.html
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── foodRoutes.js
│   └── orderRoutes.js
├── scripts/
│   └── seed.js
├── utils/
│   └── createToken.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## API endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Log in |
| POST | `/api/auth/logout` | Public | Log out |
| GET | `/api/auth/me` | Logged in | Current user |
| GET | `/api/foods` | Public | List available food; supports `?search=` and `?category=` |
| GET | `/api/foods/categories` | Public | List categories |
| POST | `/api/orders` | Logged in | Place order |
| GET | `/api/orders/mine` | Logged in | Customer order history |
| GET | `/api/orders/:id` | Logged in, owner only | Read one own order |
| GET | `/api/admin/dashboard` | Admin | Counts and recent orders |
| GET/POST | `/api/admin/foods` | Admin | List or add food |
| PATCH/DELETE | `/api/admin/foods/:id` | Admin | Edit or delete food |
| GET | `/api/admin/orders` | Admin | List orders |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |

## Test checklist
1. Open the site and confirm the seeded food menu appears.
2. Register a new customer and log in.
3. Search and filter the menu.
4. Add food to the cart, change quantity, and refresh the page to check the cart persists.
5. Attempt checkout while logged out; it should ask you to log in.
6. Log in, place a cash-on-delivery order, and verify it appears in My Orders.
7. Log out and log in with the admin credentials in `.env`.
8. Add/edit/delete a food item and change an order's status.
9. Try opening `/api/admin/dashboard` while logged in as a customer; it should return 403.

## Important notes
- This is a learning/demo project, not a production-ready food delivery service.
- Never commit `.env` to GitHub or share your admin password.
- The demo uses cash on delivery only; it does not charge cards or UPI.
- For a public production deployment, add CSRF protection, rate limiting, stricter input validation, secure deployment settings, logging, and a real payment provider if needed.
- The UI uses external Unsplash image URLs; replace them with your own assets if required.
