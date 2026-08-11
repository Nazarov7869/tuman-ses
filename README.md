<<<<<<< HEAD
# tuman-ses
=======
# Dostlik SanEpi

Ikki qismdan iborat loyiha:

- **`frontend/`** — Vite + React + TypeScript + shadcn-ui admin panel.
- **`backend/`** — Django + Django REST Framework API (JWT auth, mijozlar/`clients` boshqaruvi). To'liq API hujjati: [`backend/README.md`](backend/README.md).

`supabase/` papkasi — loyiha ilgari ishlatgan Supabase migratsiyalarining tarixiy nusxasi. Frontend endi Supabase'ga emas, `backend/`dagi Django API'ga ulanadi.

## Ishga tushirish

**Backend** (birinchi, chunki frontend shu API'ga so'rov yuboradi):

```sh
cd backend
python -m venv .venv
./.venv/Scripts/activate        # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # /admin/ orqali rol tayinlash uchun
python manage.py runserver 8000
```

**Frontend** (yangi terminalda):

```sh
cd frontend
npm install
npm run dev
```

Vite dev server `http://localhost:8080` da, Django `http://127.0.0.1:8000` da ishlaydi (`frontend/.env`dagi `VITE_API_BASE_URL` shu manzilga ishora qiladi, `backend/.env`dagi `CORS_ALLOWED_ORIGINS` esa 8080-portga ruxsat beradi).

Ro'yxatdan o'tgan foydalanuvchi hech qanday rolga ega bo'lmaydi — Django admin (`/admin/`) orqali `main`/`qabul`/`payment`/`registrants` rollaridan birini qo'lda tayinlash kerak, shundan keyingina login ishlaydi.

## Texnologiyalar

- Frontend: Vite, TypeScript, React, shadcn-ui, Tailwind CSS, TanStack Query
- Backend: Django 5, Django REST Framework, SimpleJWT, django-cors-headers
>>>>>>> 0da9e24 (v1)
