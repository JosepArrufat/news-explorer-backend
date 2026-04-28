# News Explorer — Backend

REST API for the News Explorer app. Handles user authentication, registration, and saving/deleting news articles per user account.

🔗 **Frontend repo:** [news-explorer-frontend](https://github.com/JosepArrufat/news-explorer-frontend)

## Live API

- Backend API: [https://news-explorer-backend-ev2z.onrender.com](https://news-explorer-backend-ev2z.onrender.com)
- Frontend demo: [https://news-explorer-frontend-josep.vercel.app/](https://news-explorer-frontend-josep.vercel.app/)

---

## Features

- User registration and login with JWT
- Password hashing with bcrypt
- Save and delete news articles per user
- Request validation with Celebrate/Joi
- Rate limiting and security headers with Helmet
- Request and error logging with Winston
- NewsAPI proxy endpoint so the frontend can search without browser CORS issues

---

## Tech Stack

- Node.js
- Express 4
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Celebrate / Joi
- Winston + express-winston
- Helmet
- dotenv

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/signup` | Register a new user | No |
| POST | `/signin` | Login and receive JWT | No |

### Users

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/users/me` | Get current user info | Yes |

### News Articles

| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/news?q=keyword&from=YYYY-MM-DD&to=YYYY-MM-DD` | Search NewsAPI through the backend proxy | No |
| GET | `/articles` | Get all saved articles for the current user | Yes |
| POST | `/articles` | Save a new article | Yes |
| DELETE | `/articles/:articleId` | Delete a saved article | Yes |

All protected routes require an `Authorization: Bearer <token>` header.

---

## Models

### User
| Field | Type | Notes |
|---|---|---|
| `email` | String | Required, unique, validated |
| `password` | String | Required, hashed with bcrypt |
| `name` | String | Required |

### Article
| Field | Type | Notes |
|---|---|---|
| `keyword` | String | Required |
| `title` | String | Required |
| `text` | String | Required |
| `date` | String | Required |
| `source` | String | Required |
| `link` | String | Required, valid URL |
| `image` | String | Required, valid URL |
| `owner` | ObjectId | Ref to User, required |

---

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB running locally

### Install and run

```bash
git clone https://github.com/JosepArrufat/news-explorer-backend.git
cd news-explorer-backend
npm install
```

Create a `.env` file in the root:

```env
NODE_ENV=development
JWT_SECRET=your_jwt_secret
PORT=3001
NEWS_API_KEY=your_newsapi_key
```

Then start the server:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API runs on `http://localhost:3001` by default.

---

## Deployment Notes

- The backend must be deployed with `NEWS_API_KEY`, `MONGO_URL`, `JWT_SECRET`, and `ALLOWED_ORIGIN` configured.
- `ALLOWED_ORIGIN` should match the frontend domain exactly, without a trailing slash.
- The `/news` endpoint proxies NewsAPI server-side so the frontend never calls NewsAPI directly from the browser.

## Architecture

- Vercel hosts the React frontend.
- Render hosts the Express API.
- MongoDB stores saved articles and user data.
- NewsAPI is called only from the backend.
