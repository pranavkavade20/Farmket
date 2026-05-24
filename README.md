# Farmket — Modern Farm-Fresh Marketplace

Farmket is a premium, full-featured online marketplace designed to connect farmers directly with consumers (buyers). 

Following a major architectural upgrade, Farmket is built as a **fully decoupled full-stack application** comprising:
1. **API Backend**: Built with Python, Django 5.2, and Django REST Framework (DRF). Includes JWT authentication, PostgreSQL database integrations, Celery asynchronous task processing, and Django Channels/Daphne for WebSocket-based real-time messaging.
2. **SPA Frontend**: Built with React 19, TypeScript, and Vite. Leverages TailwindCSS v4 for styling, Framer Motion & GSAP/Lenis for smooth premium animations, Three.js (React Three Fiber) for interactive 3D elements, and Recharts for rich data visualizations.

---

## 🛠 Technology Stack & Highlights

### 🖥 Backend (API)
- **Core**: Python 3.10+, [Django](https://www.djangoproject.com/) 5.2
- **REST Framework**: [DRF](https://www.django-rest-framework.org/) with [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/) (stateless token authentication & token blacklisting)
- **Documentation**: [drf-spectacular](https://github.com/tfranzel/drf-spectacular) (OpenAPI 3.0 / Swagger schema auto-generation)
- **Database**: PostgreSQL (via `psycopg3`)
- **Real-Time Communication**: [Django Channels](https://channels.readthedocs.io/) & [Daphne](https://github.com/django/daphne) (ASGI server)
- **Caching & Broker**: [Redis](https://redis.io/) (for Channel layers and Celery tasks)
- **Background Tasks**: [Celery](https://docs.celeryq.dev/) & [Celery Beat](https://django-celery-beat.readthedocs.io/) (for notifications and analytics processing)

### 🎨 Frontend (SPA)
- **Core**: React 19, TypeScript, [Vite 8](https://vite.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) (modern CSS utility-first framework)
- **Routing**: [React Router v7](https://reactrouter.com/) (layout-based nested routing and guards)
- **HTTP Client**: Axios with interceptors (transparent JWT auto-refresh and logout events)
- **Animations & 3D**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lenis](https://lenis.darkroom.engineering/) (smooth scroll), and [React Three Fiber](https://r3f.docs.pmnd.rs/) (Three.js 3D interaction)
- **Charts**: [Recharts](https://recharts.org/) (for interactive seller analytics dashboards)
- **Notifications**: [react-hot-toast](https://react-hot-toast.com/)

---

## 📂 Project Directory Structure

```text
Farmket/
├── backend/                # Django REST API Backend
│   ├── farmket/            # Core settings, WSGI, ASGI, and URL routing
│   ├── accounts/           # Auth views, JWT config, users, and profile serializers
│   ├── products/           # Product listings, categories, and reviews
│   ├── orders/             # Shopping cart, checkout system, and order tracking
│   ├── chat/               # WebSocket consumers, JWT middleware, routing, messaging
│   ├── analytics/          # Business intelligence and stats for farmers
│   ├── requirements.txt    # Python dependencies
│   └── manage.py           # Django administrative tasks
│
├── frontend/               # React TypeScript SPA Frontend
│   ├── src/
│   │   ├── assets/         # Images, icons, and static assets
│   │   ├── components/     # UI primitives (Button, Input) & domain components (ProductCard)
│   │   ├── hooks/          # Reusable custom hooks (useAsync, useSEO, useDarkMode)
│   │   ├── layouts/        # Layout shells (MainLayout, AuthLayout, DashboardLayout)
│   │   ├── pages/          # All SPA views (Home, Marketplace, Dashboard, Chat, etc.)
│   │   ├── services/       # Axios-based API service calls (auth, product, chat, etc.)
│   │   ├── store/          # Context Providers (Auth, Theme, Cart, App)
│   │   ├── types/          # Strict TypeScript interface declarations
│   │   └── utils/          # Tailored utility functions (cn helper)
│   ├── package.json        # Frontend scripts and dependencies
│   └── vite.config.ts      # Vite configuration & path aliases
```

---

## 🚀 Getting Started

To run the application locally, you will need to run the **Backend API server** and the **Frontend dev server** concurrently.

### ⚙️ Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+**
- **Node.js 18+ & npm**
- **PostgreSQL**
- **Redis Server**

---

### 🖥 1. Backend Setup & Run

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv .venv
   # On Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install Python packages**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**:
   Copy `backend/.env.example` to `backend/.env` and configure your credentials:
   ```env
   DEBUG=True
   SECRET_KEY='development-secret-key-goes-here'
   
   # Database Configuration
   DB_NAME=farmket_db
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   
   # Redis URL
   REDIS_URL=redis://127.0.0.1:6379/0
   ```

5. **Run Migrations & Create Superuser**:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start Application Services**:
   Open separate terminals for each:
   
   * **Terminal A: Django Dev ASGI Server (handles REST API + WebSockets)**:
     ```bash
     python manage.py runserver
     ```
   * **Terminal B: Celery Worker (for background jobs)**:
     ```bash
     celery -A farmket worker -l info
     ```

---

### 🎨 2. Frontend Setup & Run

1. **Navigate to frontend folder**:
   ```bash
   cd ../frontend
   ```

2. **Install Node packages**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `frontend/.env` file with the following variable:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

4. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser to view the application.

---

## 🔒 Authentication & Role-Based Workflows

The platform supports two distinct user types (`user_type`):
- **Buyers**: Can browse the marketplace, add items to the cart, place orders, chat with sellers, and view their order history.
- **Farmers**: Can manage products (CRUD), upload product images, view detailed shop/sales analytics (Recharts), process incoming orders, and chat with prospective buyers.

Authentication is powered by **JWT (JSON Web Tokens)** stored in memory and localStorage. The Axios HTTP client automatically intercepts expired sessions and performs silent token renewals using a refresh token rotation pattern.

---

## 💬 Real-Time Messaging Architecture

A robust communication flow between buyers and farmers is powered by **Django Channels** and **WebSockets**.
- Frontend clients establish a persistent WebSocket connection to the Daphne server on `/ws/chat/`.
- Requests are authenticated using customized middleware that extracts and validates the JWT query parameter.
- The interface provides visual typing indicators, message reactions, receipt updates, and immediate message updates.

---

## 🤝 Contributing

We welcome contributions to Farmket!
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
