# Inventory & Order Management System

Full-stack technical assessment project with React, FastAPI, PostgreSQL, Docker, and Docker Compose.

## Features

- Product CRUD with unique SKU validation
- Customer create/list/detail/delete with unique email validation
- Order create/list/detail/delete
- Inventory is reduced automatically when an order is created
- Orders are rejected when stock is insufficient
- Backend-calculated order totals
- Dashboard totals for products, customers, orders, and low-stock products
- Responsive React frontend with validation and user messages

## Directory Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .dockerignore
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   └── package.json
├── .dockerignore
├── .env.example
├── docker-compose.yml
└── README.md
```

## Run Locally With Docker

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:3000

Backend API: http://localhost:8000

API docs: http://localhost:8000/docs

## Main API Endpoints

Products:

- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `PUT /products/{id}`
- `DELETE /products/{id}`

Customers:

- `POST /customers`
- `GET /customers`
- `GET /customers/{id}`
- `DELETE /customers/{id}`

Orders:

- `POST /orders`
- `GET /orders`
- `GET /orders/{id}`
- `DELETE /orders/{id}`

Dashboard:

- `GET /dashboard`

## Deployment

Backend can be deployed to Render, Railway, or Fly.io.

Frontend can be deployed to Vercel or Netlify.

Set these environment variables in production:

- `DATABASE_URL`
- `CORS_ORIGINS`
- `VITE_API_URL`

For Docker Hub:

```bash
docker build -t your-dockerhub-username/inventory-backend:latest ./backend
docker push your-dockerhub-username/inventory-backend:latest
```

## Submission Checklist

- GitHub repository link
- Docker Hub backend image link
- Live frontend deployment URL
- Live backend API URL
