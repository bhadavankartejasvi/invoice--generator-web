# SaaS Invoice Generator with Template Engine

A dynamic, template-driven invoice generation web application built with React, Node.js, Express, and MySQL. This platform allows users to create, view, manage, and delete custom-branded invoices. It features dynamic styling for invoice viewing, ensuring records use their persisted `template_snapshot` (theme, branding, typography).

## 🏗️ Project Structure

The repository is divided into two main parts:

- **`frontend/`**: The client-side application built with React, Vite, and Tailwind CSS.
- **`backend/`**: The server-side API built with Node.js, Express, Sequelize (MySQL), and PDFKit.

```text
InvoiceGeneratorWithTemplateEngine/
│
├── frontend/             # React (Vite) Frontend
│   ├── public/           # Static assets
│   ├── src/              # React components, pages, context, and styles
│   ├── package.json      # Frontend dependencies and scripts
│   ├── vite.config.js    # Vite configuration
│   └── tailwind.config.js# Tailwind CSS configuration
│
└── backend/              # Node.js + Express Backend
    ├── src/              # API Routes, Controllers, Models, Middleware
    ├── seed/             # Database seeding scripts
    ├── migrations/       # Sequelize migrations
    ├── uploads/          # Uploaded branding assets (logos, signatures)
    ├── .env.template     # Template for environment variables
    └── package.json      # Backend dependencies and scripts
```

## 🚀 Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MySQL](https://www.mysql.com/) database server

### 1. Database Configuration
Create a new MySQL database for the application. You can use any name, for example `invoice_app`.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see [Environment Variables](#-environment-variables) section below).
4. (Optional) Run the seed script to populate initial data:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will typically run on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173` (default Vite port).*

## 🔐 Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory based on the provided `.env.template`.

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=invoice_app
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (`frontend/.env`)
*(If your frontend relies on environment variables, create a `.env` file in the `frontend` directory.)*

```env
VITE_API_URL=http://localhost:5000/api
```

## ✨ Core Features

- **Full CRUD Operations**: Create, read, update, and delete invoices seamlessly.
- **Dynamic Templates**: Generate invoices using custom branding (logos, signatures, colors, typography).
- **Template Snapshots**: Invoices store their stylistic data securely to maintain their look even if global templates change.
- **PDF Generation**: Robust server-side PDF generation using PDFKit.
- **Authentication**: JWT-based secure user authentication.
