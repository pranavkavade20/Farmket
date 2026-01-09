# Farmket

Hey there! Welcome to Farmket, your friendly online marketplace for fresh farm products. Whether you're a farmer looking to sell your crops or a customer hunting for the best veggies, fruits, and more, Farmket makes it easy and fun to connect. Built with Django, this platform lets you buy, sell, chat, and track everything in one place.

## What is Farmket?

Farmket is like a digital farmers' market. Farmers can list their products, and buyers can browse, order, and even chat with sellers. It's all about bringing farm-fresh goods right to your doorstep while supporting local farmers. We keep things simple, secure, and community-focused.

## Key Features

Here's what makes Farmket special:

- **User Accounts**: Sign up as a buyer or seller, complete your profile, and manage your info easily.
- **Product Listings**: Farmers can add, edit, and delete products with photos, descriptions, and prices.
- **Shopping Cart & Orders**: Add items to your cart, checkout smoothly, and track your orders from start to finish.
- **Real-Time Chat**: Talk directly with sellers about products, deals, or questions.
- **Analytics Dashboard**: Sellers get insights into sales, orders, and user trends to grow their business.
- **Search & Categories**: Find products quickly with search and organized categories.
- **Responsive Design**: Works great on phones, tablets, and computers.
- **Secure Payments**: Payment integration can be added based on your needs in future.

## Getting Started

Ready to dive in? Let's get Farmket running on your machine. We'll keep it simple step by step.

### Prerequisites

You'll need:
- Python 3.8 or higher (we recommend the latest version)
- A web browser (like Chrome or Firefox)
- Git (to clone the project if needed)

### Installation

1. **Clone or Download the Project**:
   - If you have Git, run: `git clone https://github.com/yourusername/farmket.git` (replace with the actual repo URL)
   - Or download the ZIP file and unzip it to your computer.

2. **Set Up a Virtual Environment** (optional but recommended):
   - Open your terminal and navigate to the project folder: `cd farmket`
   - Create a virtual environment: `python -m venv venv`
   - Activate it:
     - On Windows: `venv\Scripts\activate`
     - On Mac/Linux: `source venv/bin/activate`

3. **Install Dependencies**:
   - Run: `pip install -r requirements.txt`
   - This will install all the needed libraries like Django, Channels for chat, and more.

4. **Set Up the Database**:
   - Run: `python manage.py migrate`
   - This creates the database tables for users, products, orders, etc.

5. **Create a Superuser** (for admin access):
   - Run: `python manage.py createsuperuser`
   - Follow the prompts to set up an admin account.

6. **Run the Server**:
   - Start the app: `python manage.py runserver`
   - Open your browser and go to `http://127.0.0.1:8000/`
   - You should see Farmket running!

### Configuration

- **Settings**: Check `farmket/settings.py` for database, email, and other configs. You might need to set up email for notifications.
- **Static Files**: For production, run `python manage.py collectstatic` to gather CSS, JS, and images.
- **Channels for Chat**: The chat feature uses Django Channels. Make sure Redis or another channel layer is set up if deploying.

## How to Use Farmket

Once it's running:

- **As a Buyer**: Browse products, add to cart, checkout, and chat with sellers.
- **As a Seller**: Log in, add products, view analytics, and respond to chats.
- **Admin Panel**: Go to `/admin/` with your superuser account to manage everything.

Explore the templates in the `templates/` folder to see how pages look. The static files in `static/` handle styles and scripts.

## Project Structure

Here's a quick tour of the folders:

- `accounts/`: Handles user registration, login, and profiles.
- `products/`: Manages product listings, categories, and forms.
- `orders/`: Deals with carts, checkouts, and order tracking.
- `chat/`: Real-time messaging between users.
- `analytics/`: Dashboards for sales and user data.
- `farmket/`: Core Django settings and URLs.
- `media/`: Stores uploaded images for products and profiles.
- `static/`: CSS, JS, and other assets.
- `templates/`: HTML files for the website.
- `theme/`: Custom theme assets and build tools.

## Contributing

We love contributions! If you want to help make Farmket better:

1. Fork the repo on GitHub.
2. Create a new branch for your changes: `git checkout -b my-awesome-feature`
3. Make your edits and test them.
4. Submit a pull request with a clear description.

Please follow our coding style (PEP 8 for Python) and add tests if you can. Let's build something great together!

## License

Farmket is open-source under the MIT License. Feel free to use, modify, and share it. Just give credit where it's due.

## Support

Got questions or stuck? Check the Django docs or open an issue on GitHub. We're here to help!

Happy farming! 🌾🥕