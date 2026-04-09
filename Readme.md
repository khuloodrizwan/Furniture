> **Rent Smart. Live Comfortably.**
> A full-stack MERN web application that enables users to rent furniture and home appliances with flexible rental durations.

🔗 **GitHub Repository:**
[https://github.com/khuloodrizwan/Furniture](https://github.com/khuloodrizwan/Furniture)

---

## 📑 Table of Contents

* [📖 About the Project](#-about-the-project)
* [✨ Features](#-features)
* [🎯 Deals & Discounts](#-deals--discounts)
* [🔐 Admin Panel](#-admin-panel)
* [⚙️ How It Works](#️-how-it-works)
* [🛠️ Tech Stack](#️-tech-stack)
* [📁 Project Structure](#-project-structure)
* [🚀 Installation and Setup](#-installation-and-setup)
* [💻 Usage Guide](#-usage-guide)
* [🔮 Future Enhancements](#-future-enhancements)
* [🤝 Contributing](#-contributing)
* [📜 License](#-license)
* [👩‍💻 Author](#-author)

---

## 📖 About the Project

**RentEase** is a web-based platform that allows users to rent furniture and home appliances for flexible durations ranging from **1 month to 24 months**. It is designed for students, bachelors, and working professionals who frequently relocate for work, education, or personal reasons.

The platform simplifies renting through secure payments, automated installment scheduling, and an intuitive admin dashboard.

---

## ✨ Features

### 🛍️ User Features

* Browse and rent furniture and home appliances.
* View detailed product information.
* Select flexible rental durations from **1 to 24 months**.
* Add items to the cart and proceed to checkout.
* Pay the first month's rent upfront using Razorpay.
* Automated scheduling of future rental installments.
* Apply for returns anytime during the rental period.
* View promotional deals and discounts.
* Fully responsive and user-friendly interface.

---

## 🎯 Deals & Discounts

* Display promotional offers such as **50% and 60% discounts**.
* Deals are highlighted on:

  * Product listings
  * Product detail pages
  * Shopping cart
* Managed through the admin dashboard.
* Applied dynamically to selected items.

---

## 🔐 Admin Panel

* Secure authentication using JWT.
* Add, update, and delete furniture and appliance listings.
* Upload product images and descriptions.
* Manage and monitor customer orders.
* Track rental installments and payments.
* Review and manage return requests.
* Add and manage deals and discounts.
* Maintain overall platform operations efficiently.

---

## ⚙️ How It Works

1. Users browse available furniture and appliances.
2. They select a product and choose the rental duration.
3. The item is added to the cart.
4. Users pay the first month's rent via Razorpay.
5. Remaining payments are scheduled automatically.
6. Users can submit a return request anytime.
7. Admin manages products, orders, deals, and payments via the dashboard.

---

## 🛠️ Tech Stack

| Category         | Technology                                                        |
| ---------------- | ----------------------------------------------------------------- |
| Frontend         | React.js, Vite                                                    |
| Backend          | Node.js, Express.js                                               |
| Database         | MongoDB                                                           |
| Authentication   | JSON Web Tokens (JWT)                                             |
| Payment Gateway  | Razorpay                                                          |
| State Management | React Hooks                                                       |
| Styling          | CSS                                                               |
| Assets           | Local Image Assets Folder                                         |
| API Architecture | RESTful APIs                                                      |
| Version Control  | Git & GitHub                                                      |
| Deployment       | Netlify / Vercel (Frontend & Admin), Render/Node Server (Backend) |

---

## 📁 Project Structure

```plaintext
RentEase/
│
├── admin/        # Admin dashboard for managing products, orders, deals, and returns
├── frontend/     # User interface of the application
├── backend/      # Server-side logic, APIs, and database management
└── README.md
```

---

## 🚀 Installation and Setup

### 📌 Prerequisites

Ensure you have the following installed:

* Node.js (v16 or later)
* npm or yarn
* MongoDB (Local or Atlas)
* Git

---

### 📥 Clone the Repository

```bash
git clone https://github.com/khuloodrizwan/Furniture.git
cd Furniture
```

---

### 🔧 Backend Setup

```bash
cd backend
npm install
node server.js
```

Create a `.env` file in the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 🛠️ Admin Panel Setup

```bash
cd admin
npm install
npm run dev
```

---

## 💻 Usage Guide

| Service     | URL                                            |
| ----------- | ---------------------------------------------- |
| Frontend    | [http://localhost:5173](http://localhost:5173) |
| Admin Panel | [http://localhost:5174](http://localhost:5174) |
| Backend API | [http://localhost:5000](http://localhost:5000) |

*(Ports may vary based on configuration.)*

## 🔮 Future Enhancements

* 📱 Mobile application (Android & iOS)
* 📦 Subscription-based rental plans
* 📊 Advanced analytics dashboard
* ⭐ User reviews and ratings
* 🔔 Email and SMS notifications
* 🌍 Multi-city support
* 🚚 Delivery tracking system
* 🌐 Cloud-based image storage (Cloudinary/AWS S3)
* 🔐 OAuth and Google Sign-In
* 📈 AI-powered product recommendations

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add YourFeatureName"
   ```
4. Push to GitHub:

   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request.

---

## 📜 License

This project is licensed under the **MIT License**.
Feel free to use and modify it for educational and commercial purposes.

---

## 👩‍💻 Author

**Khulood Chivilkar**

* 🔗 GitHub: [https://github.com/khuloodrizwan](https://github.com/khuloodrizwan)
* 💼 LinkedIn:[https://www.linkedin.com/in/khulood-chivilkar-300617309] (https://www.linkedin.com/in/khulood-chivilkar-300617309)
* 📧 Email: [chivilkarkhulood@gmail.com] (chivilkarkhulood@gmail.com)

---

## ⭐ Support

If you found this project helpful, please consider giving it a star!

```bash
⭐ Star the repository on GitHub!
```

---

### 🚀 Deployment Recommendations

| Component   | Platform          |
| ----------- | ----------------- |
| Frontend    | Vercel or Netlify |
| Admin Panel | Vercel or Netlify |
| Backend     | Render or Railway |
| Database    | MongoDB Atlas     |

---

