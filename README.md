# Farmket

![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)
![Django Version](https://img.shields.io/badge/django-5.2-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/celery-%2337814A.svg?&logo=celery&logoColor=white)

Farmket is a robust, full-stack online marketplace connecting farmers directly with consumers. It provides a secure, reliable, and scalable platform for users to list farm-fresh produce, manage orders, and communicate in real-time. Designed with industrial standards, Farmket leverages a modern tech stack to ensure high performance and maintainability.

---

## 🚀 Key Features

- **Multi-Role Authentication:** Secure user registration, authentication, and distinct profile management for Buyers and Sellers.
- **Product Catalog Management:** Comprehensive CRUD capabilities for sellers to list products, upload images, and manage inventory.
- **E-Commerce Capabilities:** Full-featured shopping cart, smooth checkout flow, and robust order tracking system.
- **Real-Time Messaging:** WebSocket-integrated chat allowing buyers and sellers to communicate instantly.
- **Seller Analytics:** Interactive dashboards providing insights into sales, orders, and business metrics.
- **Asynchronous Task Processing:** Background task execution for email notifications, data processing, and scheduled jobs.
- **Responsive & Modern UI:** Fully responsive frontend tailored with Tailwind CSS for seamless experience across all devices.

## 🛠 Tech Stack & Architecture

- **Backend:** [Django](https://www.djangoproject.com/) 5.2 (Python)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Configured via `psycopg3`)
- **Frontend:** [Tailwind CSS](https://tailwindcss.com/) (Integrated via `django-tailwind`)
- **WebSockets:** [Django Channels](https://channels.readthedocs.io/) & [Daphne](https://github.com/django/daphne)
- **Message Broker & Cache:** [Redis](https://redis.io/) (Used by Channels and Celery)
- **Background Workers:** [Celery](https://docs.celeryq.dev/) & [Celery Beat](https://django-celery-beat.readthedocs.io/)

## 📁 Project Structure

```text
farmket/
├── accounts/           # User authentication, profiles, and permissions
├── analytics/          # Sales, user data, and seller dashboards
├── chat/               # WebSocket-based real-time messaging logic
├── farmket/            # Core Django settings, WSGI/ASGI configurations
├── orders/             # Cart management, checkout, and order tracking
├── products/           # Product models, forms, and catalog views
├── static/             # Global static assets (CSS, JS, images)
├── templates/          # Base HTML templates and partials
└── theme/              # Tailwind CSS configuration and theme app
```

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your host machine:

- **Python** 3.8+
- **PostgreSQL** 13+
- **Redis Server** 6+
- **Node.js & npm** (Required for Tailwind CSS compilation)
- **Git**

## 💻 Local Development Setup

Follow these steps to get a local development environment running.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/farmket.git
cd farmket
```

### 2. Set up the Python Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

*(Optional but recommended: install frontend dependencies via `theme` app)*
```bash
python manage.py tailwind install
```

### 4. Environment Variables

Create a `.env` file in the root directory (alongside `manage.py`). You can use the following variables as a template:

```env
DEBUG=True
SECRET_KEY='your-strong-development-secret-key'

# Database Configuration
DB_NAME=farmket_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379/0
```

### 5. Database Setup

Ensure your PostgreSQL server is running and the database specified in `.env` is created.

```bash
# Run Django database migrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run the Application Services

To fully test the application locally, you need to run multiple services. Open separate terminal windows/tabs for each:

**Terminal 1: Django Development Server (ASGI for WebSockets)**
```bash
python manage.py runserver
```

**Terminal 2: Tailwind CSS Watcher**
```bash
python manage.py tailwind start
```

**Terminal 3: Celery Worker**
```bash
celery -A farmket worker -l info
```

*(Optional) Terminal 4: Celery Beat (for scheduled tasks)*
```bash
celery -A farmket beat -l info
```

The application will be accessible at `http://127.0.0.1:8000/`.

## 🎥 Demo Videos

- [Login as Buyer Flow](https://drive.google.com/file/d/1ZhMAcBu2UXOkAbW_r-0gKWyNWtCKDgNh/preview)
- [Login as Farmer Flow](https://drive.google.com/file/d/1-KoSFK6bPw7gCFEi1vPwHly59D-k6X5I/preview)

## 🚢 Deployment

For production deployment, standard Django guidelines apply. It is recommended to use:
- **Gunicorn** or **Daphne** as the application server.
- **Nginx** as a reverse proxy and static file server.
- **Supervisor** or **Systemd** to manage Celery workers and Daphne processes.
- **Docker** (Optional) to containerize all services.

Remember to run `python manage.py collectstatic` to gather static assets and configure secure settings (e.g., `DEBUG=False`, secure `ALLOWED_HOSTS`) in production.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests. 
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.