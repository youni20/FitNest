## 📦 FitNest – Full Stack Fitness App

FitNest is a full-stack fitness application built with **React**, **TypeScript**, **Node.js (Express)**, and **PostgreSQL**. This project is containerized using **Docker**, so you can run it easily with a single command.

---

### 🛠️ Tech Stack

* **Frontend**: React + TypeScript (Vite)
* **Backend**: Express.js + Node.js
* **Database**: PostgreSQL
* **Auth**: JWT
* **AI**: OpenAI API integrated

---

## 🚀 Getting Started

These instructions will get the app running on your local machine using **Docker**.

---

### 📁 Project Structure

```
.
├── backend/              # Express API
│   ├── .env              # Backend environment variables
│   ├── .env.example      # Sample env file
│   ├── Dockerfile
│   ├── init.sql          # DB init script
│   └── ...
├── frontend/             # React frontend (Vite)
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml    # Orchestrates all containers
└── README.md
```

---

### 🔐 Setup

1. **Install Docker** if you haven't already:
   [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

2. **Create a `.env` file for the backend:**

```bash
cp backend/.env.example backend/.env
```

Then open `backend/.env` and fill in the required values:
NOTE: look at the example.env!
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=FitNest
DB_HOST=db
PORT=3001
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
```



### 3. **Run the app**

```bash
# Step 1: Build and start all containers
docker-compose up --build
```

Wait for the containers to start up, then run the database initialization:

* **On Windows PowerShell:**

```powershell
Get-Content ./backend/init.sql | docker exec -i fitnest-db psql -U postgres -d FitNest
```

* **On macOS / Linux / other Unix shells:**

```bash
cat ./backend/init.sql | docker exec -i fitnest-db psql -U postgres -d FitNest
```


---

### ✅ Services

* **Frontend** → [http://localhost:5173](http://localhost:5173)
* **Backend API** → [http://localhost:3001](http://localhost:3001)
* **PostgreSQL DB** → localhost:5432

---

### 🧠 Notes

* The database is initialized using `backend/init.sql` the first time you run it.
* The frontend connects to the backend via `http://localhost:3001` (set by Docker).

---

### 🧼 Stopping & Cleaning Up

To stop the app:

```bash
docker-compose down
```

To stop and remove all volumes (including database data):

```bash
docker-compose down -v
```

---

### 📌 Troubleshooting

* Make sure ports **5173**, **3001**, and **5432** are not already in use.
* Ensure your `.env` values match the ones used in `docker-compose.yml`.

Enjoy!