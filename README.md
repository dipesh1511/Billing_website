# Billing Management System

## Overview

This project is a full-stack Billing Management System designed to simplify daily business operations for shops. It allows users to manage products, generate invoices, track payments (paid, due, partial), and view reports. The system also supports multi-shop management through an admin panel and includes offline functionality with automatic data synchronization.

---

## Features

- Product Management (Add, Update, Delete)
- Billing & Invoice Generation
- Payment Tracking (Paid / Due / Partial)
- Customer Details Management
- Reports and Analytics
- Offline Mode with Auto Sync
- Light & Dark Mode UI

---

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)

---

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-link>
cd billing-system
```

### 2. Install Dependencies

```bash
# frontend
cd client
npm install

# backend
cd ../server
npm install
```

### 3. Run the Project

```bash
# backend
npm run dev

# frontend
npm run dev
```

---

## Usage

- Login as Shop User to handle billing and products
- Use offline mode when internet is unavailable
- Data will automatically sync when connection is restored

---

## Future Enhancements

- Advanced analytics and charts
- Cloud deployment
- Email/SMS notifications via (Whatsaap)
- Inventory alerts

---

## Author

Developed as a full-stack project for real-world billing and shop management.
