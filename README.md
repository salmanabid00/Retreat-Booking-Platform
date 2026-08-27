# HavenHideaway — Luxury Retreat & Property Booking Platform

HavenHideaway is a full-stack MERN platform engineered for booking and managing serene retreat properties, luxury villas, mountain cabins, and wellness sanctuaries. Built with a responsive glassmorphism UI, real-time WebSocket communication, and an ACID-compliant booking engine that strictly enforces 10 core business rules, it delivers a seamless end-to-end experience for retreat guests, property hosts, and platform administrators.

---

## Live Deployments

- **Frontend (Vercel)**: `<URL>` *(Fill after deployment)*
- **Backend API (Railway)**: `<URL>` *(Fill after deployment)*

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19.1.0, Vite 6.3.5, React Router 7.18.2 | Component-based SPA architecture with client-side routing |
| **Styling** | Tailwind CSS 4.3.3 & Custom Glassmorphism CSS | Glassmorphism design tokens, micro-animations, responsive layout |
| **Icons & UI** | Lucide React 1.31.0, React Hot Toast 2.6.0 | Modern icon set and unified glassmorphic toast notification system |
| **Backend** | Node.js, Express 5.2.1 | RESTful API server with custom error handling and rate limiting (`trust proxy` enabled) |
| **Database** | MongoDB, Mongoose 9.9.2 | Document database with schema validation, indexing, and population |
| **Real-Time** | Socket.IO 4.8.3 (Client & Server) | Bidirectional messaging, typing indicators, read receipts, live notifications |
| **Authentication**| JWT 9.0.3, Bcrypt.js 3.0.3, Crypto | Stateless Bearer token auth, password hashing, secure random tokens |
| **Email Service**| Brevo (Sendinblue) HTTP API / Axios | HTTPS transactional email delivery for verification links without SMTP port/IPv6 limits |
| **Media Storage**| Cloudinary 2.10.0, Multer 2.2.0 | Multipart image uploads with buffer transformations and cloud hosting |

---

## Key Features

### 1. Multi-Role Authentication & Security
- **Roles**: Distinct role privileges for `customer` (Guest), `owner` (Host), and `admin` (System Administrator).
- **Email Verification**: Production-grade verified signup flow via expiring crypto tokens (24-hour expiry) dispatched through Brevo's HTTPS transactional email API.
- **DNS & Format Validation**: Domain verification via DNS MX record lookup (`dns.promises.resolveMx`) and RFC format validation, with `ipv4first` global DNS ordering.
- **Password Strength**: Real-time 5-rule strength indicator (minimum length, lowercase, uppercase, number, symbol).
- **Proxy & Rate Limit Hardening**: Express configured with `trust proxy: 1` to ensure accurate client IP detection and rate limiting behind cloud load balancers (e.g. Railway).
- **Access Control**: Role-based route middleware (`protect`, `authorize`) restricting sensitive resources.

### 2. Property Management (Host & Admin)
- Full CRUD capabilities for property listings with title, description, category, amenities, rules, check-in/out policies, and pricing.
- Cloudinary multi-image upload via Multer buffer processing.
- Dynamic search and filter system: location/city, property type, price range, guest count, amenities, and available dates.
- Host maintenance blockout dates preventing bookings during blocked windows.

### 3. High-Integrity Booking Engine
- Real-time instant price calculator reflecting night count and capacity on date changes.
- Booking status lifecycle: `pending` $\rightarrow$ `confirmed` / `rejected` / `cancelled`.
- Enforces the **10 Core Business Rules** with zero native browser alerts (100% styled glassmorphic toasts).

### 4. Real-Time Chat & Direct Messaging
- Instant bidirectional messaging powered by Socket.IO rooms.
- Real-time typing indicators (`userTyping` / `userStopTyping`), online/offline presence tracking, and message read receipts.
- Direct linking from property pages ("Contact Host") and booking dashboards ("Chat Guest" / "Chat Host").
- Strict participant-level authorization checks blocking unauthorized users from conversation rooms.

### 5. Push Notifications & System Messages
- Automated system messages generated in conversation threads on booking creation, confirmation, rejection, and cancellation.
- Real-time notification badge and toasts fired to dedicated user rooms (`user:${id}`) for bookings and incoming chats.

### 6. Platform Administration Dashboard
- Real-time platform KPI metrics (total users, customer/owner breakdown, active listings, bookings, total revenue).
- User management with instant account blocking/unblocking (blocked accounts are rejected at login with 403).
- Property approval and moderation controls.

---

## The 10 Enforced Booking Business Rules

1. **No Past Check-in Dates**: Check-in date cannot be in the past (`checkInDate >= today`).
2. **Sequential Dates**: Check-out date must be strictly after check-in date (`checkOutDate > checkInDate`).
3. **Capacity Enforcement**: Guest count cannot exceed property maximum guest capacity (`guests <= property.maxGuests`).
4. **Self-Booking Prevention**: Property hosts cannot book their own property listings.
5. **Overlapping Confirmed Bookings Rejected**: Bookings that overlap with an already `confirmed` booking or owner maintenance window are rejected at both API and status update levels.
6. **Cancellation Date Freeing**: Cancelling a booking instantly frees up the date window for other guests.
7. **Host-Only Status Modification**: Only the listing's authorized property owner (or admin) can accept or reject a booking request.
8. **Guest Privacy & Isolation**: Customers can only view and manage their own bookings (cross-user access returns 403/404).
9. **Host Property Scoping**: Hosts can only view and manage booking requests for properties they own (cross-host access returns 403).
10. **Toast Notification Consistency**: All validation errors, authorization rejections, and business rule failures use the non-intrusive toast notification system with zero browser `alert()` or `confirm()` prompts.

---

## Folder Structure

```
Retreat Booking Platform/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── api/                # Axios instance & interceptors (VITE_API_URL)
│   │   ├── components/         # Reusable UI, Navbar, Footer, PropertyCard
│   │   ├── context/            # AuthContext & SocketContext
│   │   ├── pages/              # Route pages (Home, Listings, Details, Chat, Dashboards, Admin)
│   │   ├── App.jsx             # Route definitions & ProtectedRoute wrappers
│   │   ├── index.css           # Glassmorphism tokens & Tailwind utilities
│   │   └── main.jsx            # Application root mount
│   ├── .gitignore              # Ignored files (node_modules, .env, dist)
│   └── package.json
│
├── server/                     # Express & Socket.IO Backend
│   ├── config/                 # MongoDB connection & Cloudinary setup
│   ├── controllers/            # auth, property, booking, chat, notification, admin controllers
│   ├── middleware/             # authMiddleware, errorMiddleware
│   ├── models/                 # User, Property, Booking, Conversation, Message, Notification
│   ├── routes/                 # Express route modules
│   ├── socket/                 # Socket.IO initialization & real-time event handlers
│   ├── utils/                  # seedData.js, passwordValidator.js, sendEmail.js, systemMessageHelper.js
│   ├── .gitignore              # Ignored files (node_modules, .env, data, logs)
│   ├── package.json            # Start & dev scripts
│   └── server.js               # Entry point (HTTP + Socket.IO server)
│
├── .gitignore                  # Root git ignore
└── README.md
```

---

## Environment Variables

### Backend (`server/.env` / Railway Environment Variables)

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port for Express server (Railway sets this dynamically) | `5000` |
| `MONGO_URI` | **Yes** | MongoDB connection string | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/retreat_db` |
| `JWT_SECRET` | **Yes** | Cryptographic secret key for signing JWT tokens | `super_secure_jwt_secret_key_2026` |
| `JWT_EXPIRES_IN` | Optional | JWT token validity duration (defaults to `7d`) | `7d` |
| `CLIENT_URL` | **Yes** | Allowed frontend URL(s) for CORS & verification links | `https://your-app.vercel.app,http://localhost:5173` |
| `BREVO_API_KEY` | **Yes** | Brevo (Sendinblue) API v3 Key for transactional emails | `xkeysib-xxxxxxxx...` |
| `BREVO_SENDER_EMAIL` / `EMAIL_USER` | **Yes** | Verified sender email configured in Brevo | `your-verified-sender@example.com` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary account cloud name for image uploads | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API Secret | `abcdefghijklmnopqrstuvwxyz` |

### Frontend (`client/.env` / Vercel Environment Variables)

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | **Yes** | Base API URL pointing to the deployed backend | `https://your-backend.railway.app/api` |
| `VITE_SOCKET_URL` | **Yes** | Socket.IO server root URL | `https://your-backend.railway.app` |

---

## Local Setup & Installation

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/retreat-booking-platform.git
cd retreat-booking-platform

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables
- Create `server/.env` using the backend variables table above.
- Create `client/.env` using the frontend variables table above.

### 4. Seed the Database
Populates initial sample properties and pre-verified test accounts:
```bash
cd server
npm run seed
```

### 5. Run the Application
In separate terminal windows:
```bash
# Terminal 1: Start Backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2: Start Frontend (http://localhost:5173)
cd client
npm run dev
```

---

## Demo Accounts

Demo credentials for reviewer testing are available on request — please contact the repository owner directly rather than finding them in this public document.

---

## API Reference Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new user (initiates verification email via Brevo)
- `GET /api/auth/verify-email/:token` — Verify user email address
- `POST /api/auth/resend-verification` — Rate-limited verification email resend
- `POST /api/auth/login` — Authenticate credentials & receive JWT
- `GET /api/auth/me` — Fetch currently authenticated user profile
- `PUT /api/auth/profile` — Update user profile details
- `POST /api/auth/logout` — Invalidate user session

### Properties (`/api/properties`)
- `GET /api/properties` — Query properties with search, filters & pagination
- `GET /api/properties/:id` — Get single property details by ID
- `POST /api/properties` — Create new property listing with image upload *(Host/Admin)*
- `PUT /api/properties/:id` — Update property details *(Host Owner/Admin)*
- `DELETE /api/properties/:id` — Remove property listing *(Host Owner/Admin)*
- `GET /api/properties/my-properties` — Get listings owned by logged-in host *(Host)*
- `POST /api/properties/:id/blocked-dates` — Add manual maintenance blockout dates *(Host)*

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a new retreat booking request *(Customer)*
- `GET /api/bookings/my-bookings` — Get logged-in customer's booking history *(Customer)*
- `GET /api/bookings/owner-bookings` — Get incoming bookings for host's properties *(Host)*
- `GET /api/bookings/:id` — View specific booking details *(Participant/Admin)*
- `PATCH /api/bookings/:id/status` — Accept/Reject *(Host)* or Cancel *(Customer/Host)*

### Chat & Messages (`/api`)
- `GET /api/conversations` — Retrieve all active conversations for the authenticated user
- `POST /api/conversations` — Get or initialize a conversation by property/booking/recipient
- `GET /api/messages/:conversationId` — Retrieve message history *(Participant only)*
- `PATCH /api/messages/:conversationId/read` — Mark conversation messages as read

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Get user notifications list and unread count
- `PATCH /api/notifications/:id/read` — Mark a notification as read
- `PATCH /api/notifications/read-all` — Mark all user notifications as read

### Admin (`/api/admin`)
- `GET /api/admin/stats` — Platform-wide performance and revenue statistics *(Admin)*
- `GET /api/admin/users` — List and audit all registered platform users *(Admin)*
- `PATCH /api/admin/users/:id/block` — Block or unblock a user account *(Admin)*
- `PATCH /api/admin/properties/:id/approval` — Approve or disable a property listing *(Admin)*

---

## License
MIT License. Created for HavenHideaway Retreat Platform.
