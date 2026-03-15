---
description: how to run the AutoExpense application
---

The AutoExpense app consists of two parts: a Django backend and a React frontend. Follow these steps to get everything running.

### 1. Prerequisites
Ensure you have the following installed:
- Python 3.10+
- Node.js & npm
- Redis (required for email parsing/Celery tasks)

---

### 2. Backend Setup (Django)

1. **Navigate to the backend directory:**
   ```powershell
   cd backend
   ```

2. **Create and activate a virtual environment (Optional but Recommended):**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Apply database migrations:**
   ```powershell
   python manage.py migrate
   ```

5. **Start the Django development server:**
   ```powershell
   python manage.py runserver
   ```
   *The API will be available at http://localhost:8000*

6. **Start Celery Worker (In a separate terminal):**
   ```powershell
   celery -A autoexpense worker --loglevel=info
   ```

---

### 3. Frontend Setup (React/Vite)

1. **Navigate to the frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```
   *The UI will be available at http://localhost:3000*

---

### 4. Summary
- **Backend API**: http://localhost:8000/api/
- **Frontend App**: http://localhost:3000
- **Admin Panel**: http://localhost:8000/admin/ (requires creating a superuser with `python manage.py createsuperuser`)
