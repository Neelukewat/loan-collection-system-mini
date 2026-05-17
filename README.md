# Loan Collection Management System Mini

A mini loan collection system I built as part of a machine round assignment. The idea was to simulate how a field collection agency works - agents go out, collect EMIs, and the system tracks everything.

---

## What I Used

- **Backend** - Laravel 11
- **Database** - MySQL
- **Auth** - Laravel Sanctum (token based)
- **Frontend** - React 18 + Vite
- **API** - REST

---

## Getting Started

### What you need
- PHP 8.2+
- Composer
- MySQL
- Node.js 18+

### Backend

```bash
cd loanCollectionSystemMini
composer install
cp .env.example .env
php artisan key:generate
```

Update `.env` with your DB details:
DB_DATABASE=loan_collection_db
DB_USERNAME=root
DB_PASSWORD=your_password



Create the database in MySQL:
```bash
mysql -u root -p -e "CREATE DATABASE loan_collection_db;"
```

Run migrations and seed demo data:
```bash
php artisan migrate --seed
```

Start the server:
```bash
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Login Credentials

| Role        | Email               | Password   |
|-------------|---------------------|------------|
| Admin       | admin@loanapp.com   | Admin@1234 |
| Field Agent | ravi@loanapp.com    | Agent@1234 |


## How the roles work

I kept it simple but realistic:

- **Admin** - creates and manages loans, can see everything
- **Field Agent** - goes out and records collections, can view loans but cannot create or delete them

Role check happens at the route level using a custom `RoleMiddleware` - so it's blocked before it even hits the controller.

---

## API Endpoints

Base URL: `http://127.0.0.1:8000/api`

Add this header to all protected requests:

Authorization: Bearer your_token_here
Accept: application/json

### Auth
POST   /auth/login      -- get token
POST   /auth/logout     -- revoke token

### Loans
GET    /loans           -- list all (search, status, date filters, pagination)
POST   /loans           -- create loan (admin only)
GET    /loans/{id}      -- get single loan
PUT    /loans/{id}      -- update (admin only)
DELETE /loans/{id}      -- delete (admin only, only if no collections)

### Collections
GET    /collections     -- list all (filter by mode, date)
POST   /collections     -- add collection
GET    /collections/{id} -- get single


### Dashboard
GET    /dashboard            -- summary stats
GET    /dashboard/prediction -- best collection time

---

## The Prediction Feature

This was the interesting part. The idea is to tell field agents what time of day they are most likely to successfully collect.

Here is how I approached it:

1. Pull all collections from last 90 days and group by hour
2. Since not every hour will have data, I fill the missing hours with 0
3. Normalise both count and amount to a 0-1 scale so they are comparable
4. Score each hour - I weighted count at 60% and amount at 40% because reaching more customers matters more than the amount per visit
5. Slide a 2-hour window across all 24 hours and pick the one with the highest combined score

If there is not enough data yet, it falls back to a default 10 AM - 12 PM slot.

---

## A few decisions I made

**Why UUID?**
I kept the regular auto-increment `id` for internal DB relations but added a `uuid` column on top. This way the internal queries stay fast and if we ever expose IDs externally we use the UUID.

**Why are collections immutable?**
No update or delete on collections. These are financial records - once a payment is recorded it should not disappear. If there is a mistake, a new correcting entry should be made.

**Why does the loan auto-close?**
When the total collected equals the loan amount, the loan status automatically changes to `closed`. Less manual work for admin.

**Dashboard is only 2 queries**
Instead of running separate queries for each stat, I used `selectRaw` with `CASE WHEN` to get everything in one shot per table.

---

## Postman Collection

Import the file from `/postman/loan_collection_management_system.postman_collection.postman_collection.json`

The login request automatically saves the token - all other requests will work right away.

---

## Seeded Data

Running `php artisan migrate --seed` creates:
- 2 users (1 admin, 1 field agents)
- 6 loans (mix of active, closed, defaulted)
- Collection entries spread across different hours (for prediction to work)

  ## Branches

| Branch | Contains |
|--------|----------|
| `backend` | Laravel API (default) |
| `frontend` | React Frontend |
