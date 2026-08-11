# Dostlik SanEpi — Django backend

Django + Django REST Framework backend that replaces the Supabase project
this app was built on (`../supabase/migrations`). It reproduces the same
data model, role system, and business rules that the four admin panels
(`MainAdmin`, `QabulAdmin`, `PaymentAdmin`, `RegistrantsAdmin`) rely on.

## Stack

- Django 5 + Django REST Framework
- JWT auth (`djangorestframework-simplejwt`), login by **email** instead of Django's default username
- SQLite by default (dev); switch to Postgres by setting `POSTGRES_*` env vars
- `django-cors-headers` so the Vite dev server (port 8080) can call the API

## Setup

```sh
cd backend
python -m venv .venv
./.venv/Scripts/activate        # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # for the Django admin at /admin/
python manage.py runserver 8000
```

`.env` is already populated with a generated `DJANGO_SECRET_KEY` for local dev
(`.env.example` is the template). CORS defaults to `http://localhost:8080`,
matching `vite.config.ts`.

## Data model

**`clients.Client`** — one row per registered person, mirrors the Supabase
`clients` table field-for-field: `first_name`, `last_name`, `birth_year`
(4-digit string), `address`, `workplace`, `service_type`, `status`
(`yangi` → `ko'rildi` → `tugatildi`), `payment_status` (`kutilmoqda` /
`tolangan` / `rad_etilgan`), `payment_date`, `payment_amount`, `notes`,
`registered_at`. The same length/format constraints that existed as Postgres
`CHECK`s are enforced via Django validators.

**`accounts.UserRole`** — one row per admin user, `role` ∈
`main | qabul | payment | registrants` (same as the Postgres `app_role`
enum). Unlike Supabase there's no self-service role assignment: a new
sign-up gets no role and can't log in until a `main` admin grants one via
`/admin/` (Django admin), which mirrors how Supabase admins previously had
to assign roles by hand in the dashboard.

**Service catalogue** — `clients/services.py` hard-codes the same
categories/prices as `src/lib/validations.ts` (`SERVICE_CATEGORIES`). This is
the one piece of business data duplicated between frontend and backend by
necessity; the backend is authoritative because `mark_paid` computes the
charge server-side rather than trusting a client-supplied amount. If you
change prices, update both files, or better, delete `SERVICE_TYPES` /
`SERVICE_CATEGORIES` from `validations.ts` and have the frontend fetch
`GET /api/services/` instead.

## Auth flow

1. `POST /api/auth/register/ {email, password}` — public sign-up, no role
   granted (equivalent to `supabase.auth.signUp`).
2. A `main` admin opens `/admin/`, adds a `UserRole` row for that user.
3. `POST /api/auth/login/ {email, password}` — returns `{access, refresh,
   role, email}`. Fails with a Uzbek error message if the user has no role
   yet, exactly like the current `Login.tsx` flow.
4. Send `Authorization: Bearer <access>` on every subsequent request.
   `POST /api/auth/refresh/ {refresh}` rotates the access token
   (access token lives 8h, refresh 14d — see `SIMPLE_JWT` in `settings.py`).
5. `GET /api/auth/me/` — `{id, email, role}` for session restoration
   (replaces `supabase.auth.getSession()` + the `user_roles` lookup in
   `ProtectedRoute.tsx`).

## Client endpoints

All require `Authorization: Bearer <access>`.

| Endpoint | Method | Who | Behavior |
|---|---|---|---|
| `/api/clients/` | GET | any admin role | List/search/order. Query params: `payment_status`, `status`, `search`, `ordering` (e.g. `-registered_at`, `payment_date`) |
| `/api/clients/` | POST | `qabul`, `main` | Register a new client (`status=yangi`, `payment_status=kutilmoqda`) |
| `/api/clients/{id}/` | GET | any admin role | Detail |
| `/api/clients/{id}/` | PATCH | `qabul`, `main` | Edit basic info — **rejected with 403 once `payment_status != kutilmoqda`**, matching the edit button only showing for pending clients in `QabulAdmin.tsx` |
| `/api/clients/{id}/` | DELETE | `main` | Delete |
| `/api/clients/{id}/mark_paid/` | POST | `payment`, `main` | Sets `payment_status=tolangan`, computes `payment_amount` from the service catalogue (not client input), stamps `payment_date`, moves `status` to `ko'rildi` |
| `/api/clients/{id}/reject_payment/` | POST | `payment`, `main` | Sets `payment_status=rad_etilgan`, `status=yangi` |
| `/api/clients/{id}/complete/` | POST | `qabul`, `registrants`, `main` | Sets `status=tugatildi` (the "Tugatish" button appears on both the Qabul and Registrants panels) |
| `/api/services/` | GET | any admin role | Service categories + prices |

This maps directly onto what each panel needs:

- **QabulAdmin** → list all clients, create, edit (while pending), complete
- **PaymentAdmin** → list filtered by `payment_status`, mark_paid, reject_payment
- **RegistrantsAdmin** → list filtered by `payment_status=tolangan`, complete
- **MainAdmin** → list filtered by `payment_status=tolangan` for stats (main bypasses every role check, same as `ProtectedRoute`'s "main can access everything" rule)

## What's intentionally different from the Supabase version

- **No realtime/websocket push.** The frontend used `supabase.channel(...).on('postgres_changes', ...)` for live updates across open tabs. This backend is plain REST — `PaymentAdmin`/`MainAdmin` poll via React Query `refetchInterval` (5s) and `QabulAdmin` polls via `setInterval` instead. Django Channels is the equivalent if true push is needed later.
- **Role assignment has no API** — it's done through `/admin/` instead of a dashboard, since the original app didn't expose a self-serve role UI either.
- **Frontend is now rewired.** `../frontend/src/lib/api.ts`, `authApi.ts` and `clientsApi.ts` replace the old Supabase client — every admin page and the login flow call this REST API directly (JWT stored in `localStorage`, auto-refreshed on 401). See `../frontend/README` section below and the root `README.md` for how to run both halves together.

## Verified locally

`makemigrations` → `migrate` → `runserver`, then exercised by hand:
register → assign role via shell → login (JWT with `role` claim) → `/me/` →
create client → `mark_paid` (confirmed the price came from the server-side
catalogue, not the request) → PATCH after payment correctly 403s →
unauthenticated request correctly 401s → wrong password correctly 400s.
