# NTI E-Commerce API

Backend API for the NTI e-commerce project using Node.js, Express, MongoDB, JWT, Joi, Nodemailer, Multer, Socket.io, and Stripe.

## Features

- Authentication with email verification, forgot password, and reset password
- User profile management and avatar upload
- Categories and subcategories management
- Product management with filtering, pagination, stock updates, and soft delete
- Cart and order flows
- Staff, attendance, deductions, and monthly salary modules
- Support tickets
- Socket.io admin offer notifications
- Stripe payment intent and webhook support

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcryptjs
- Joi
- Nodemailer
- Multer
- Socket.io
- Stripe

## Installation

```bash
npm install
cp config/.env.example config/.env
npm start
```

For development:

```bash
npm run dev
```

## Environment Variables

Use [config/.env.example](/Users/ahmedwageh/Desktop/E-commerce-node-final/config/.env.example) as the template.

Core variables:

- `PORT`
- `NODE_ENV`
- `APP_BASE_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `JWT_REFRESH_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`

Optional Stripe variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Base URL

Local:

```text
http://localhost:3000/api/v1
```

## Authentication Tokens

The API uses Bearer tokens:

- `accessToken` for normal user requests
- admin user token for admin routes
- staff user token for staff attendance routes

Header format:

```text
Authorization: Bearer YOUR_TOKEN
```

## API Modules

### 1. Auth

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/verify-email/:token`
- `POST /auth/resend-verification`
- `POST /auth/forgot-password`
- `POST /auth/reset-password/:token`

### 2. Users

- `GET /users/profile`
- `PUT /users/profile`
- `DELETE /users/profile`
- `POST /users/upload-avatar`

### 3. Categories

- `GET /categories`
- `GET /categories/:id/subcategories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

### 4. Subcategories

- `GET /subcategories/:id`
- `POST /subcategories`
- `PUT /subcategories/:id`
- `DELETE /subcategories/:id`

### 5. Products

Public:

- `GET /products`
- `GET /products/:id`
- `GET /products/category/:categoryId`
- `GET /products/subcategory/:subcategoryId`

Admin:

- `POST /admin/products`
- `PUT /admin/products/:id`
- `DELETE /admin/products/:id`
- `PATCH /admin/products/:id/stock`

Supported query params:

- `page`
- `limit`
- `minPrice`
- `maxPrice`
- `sort=price_asc`
- `sort=price_desc`
- `sort=createdAt`
- `sort=name`

### 6. Cart

- `POST /cart`
- `GET /cart`
- `PUT /cart/:productId`
- `DELETE /cart/:productId`
- `DELETE /cart`

### 7. Orders

- `POST /orders/checkout`
- `GET /orders`
- `GET /orders/:id`
- `GET /admin/orders`
- `PATCH /admin/orders/:id/status`
- `POST /orders/stripe/payment-intent`
- `POST /orders/stripe/webhook`

### 8. Staff

- `POST /admin/staff`
- `GET /admin/staff`
- `GET /admin/staff/:id`
- `PUT /admin/staff/:id`
- `DELETE /admin/staff/:id`

### 9. Attendance

- `POST /staff/checkin`
- `POST /staff/checkout`

### 10. Deductions

- `POST /admin/staff/:id/deductions`
- `GET /admin/staff/:id/deductions`
- `PUT /admin/staff/:id/deductions/:deductionId`
- `DELETE /admin/staff/:id/deductions/:deductionId`

### 11. Salary

- `GET /admin/staff/:id/salary/:month`
- `POST /admin/staff/:id/salary/:month/pay`
- `PUT /admin/staff/:id/salary/:month/adjust`

### 12. Tickets

- `POST /tickets`
- `GET /tickets`
- `GET /tickets/:id`
- `POST /tickets/:id/reply`
- `PATCH /admin/tickets/:id/status`

### 13. Health Check

- `GET /health`

## Example Request Bodies

### Auth Signup

```json
{
  "name": "Ahmed Wageh",
  "email": "ahmed@example.com",
  "password": "Ahmed123",
  "phone": "01012345678"
}
```

### Create Category

```json
{
  "name": "Electronics",
  "description": "الكترونيات"
}
```

### Create Subcategory

```json
{
  "name": "Mobiles",
  "description": "Smart phones",
  "category": "PUT_CATEGORY_ID_HERE"
}
```

### Create Product

```json
{
  "name": "iPhone 14",
  "description": "128GB mobile phone",
  "price": 30000,
  "stock": 5,
  "category": "PUT_CATEGORY_ID_HERE",
  "subcategory": "PUT_SUBCATEGORY_ID_HERE",
  "images": ["image1.jpg"]
}
```

### Add To Cart

```json
{
  "productId": "PUT_PRODUCT_ID_HERE",
  "quantity": 2
}
```

### Checkout COD

```json
{
  "paymentMethod": "cod",
  "shippingAddress": {
    "street": "Nasr City",
    "city": "Cairo",
    "country": "Egypt",
    "postalCode": "11765"
  }
}
```

### Create Staff

```json
{
  "user": "PUT_USER_ID_HERE",
  "dailySalary": 300,
  "joinDate": "2026-04-06",
  "department": "Sales",
  "isActive": true
}
```

### Create Deduction

```json
{
  "month": "2026-04",
  "amount": 100,
  "reason": "Late attendance",
  "date": "2026-04-06"
}
```

### Create Ticket

```json
{
  "subject": "Problem with order",
  "message": "I did not receive my product"
}
```

## Socket.io

Client flow:

1. Connect to the socket server.
2. Emit `authenticate` with a valid JWT access token.
3. Admin emits `admin:send-offer`.
4. Authenticated clients receive `user:receive-offer`.

Example admin offer payload:

```json
{
  "type": "offer",
  "title": "Weekend Sale",
  "message": "Take 20% off all accessories",
  "discountCode": "SAVE20",
  "expiresAt": "2026-04-30T23:59:59.000Z"
}
```

## Notes

- Soft delete is used in multiple modules such as users, categories, subcategories, products, and staff.
- Product stock reaching `0` automatically sets `isDeleted: true` and stores `autoDeletedAt`.
- Passwords are hashed with bcrypt using 12 salt rounds.
- Auth validation requires at least 8 characters, 1 uppercase letter, and 1 number.
- Email sending is skipped safely if SMTP credentials are not configured.

## Upload To GitHub Checklist

- Keep `config/.env` out of Git
- Keep `node_modules` out of Git
- Keep uploaded local files out of Git
- Push `config/.env.example`
- Push source code, README, and package files

## License

This project was prepared for the NTI backend development exam practice/project work.
