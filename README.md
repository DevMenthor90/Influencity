# Influencer Platform 🚀

Plataforma de gestión de deals para creadores de contenido.

## Stack
- **Frontend:** Angular 17 (standalone) + TailwindCSS → Vercel
- **Backend:** .NET 8 Minimal API → Render / Railway
- **Base de datos:** MongoDB Atlas (free tier)

---

## ⚙️ Configuración de URLs

Todos los cambios de entorno se hacen en **un solo archivo por capa**:

| Entorno | Archivo |
|---|---|
| Frontend local | `frontend/src/environments/environment.ts` |
| Frontend producción | `frontend/src/environments/environment.prod.ts` |
| Backend local | `backend/InfluencerAPI/appsettings.json` |
| Backend producción | `backend/InfluencerAPI/appsettings.Production.json` |

---

## 🖥️ Correr localmente

### Prerequisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- [MongoDB Community](https://www.mongodb.com/try/download/community) ó usa MongoDB Atlas desde ya

### 1. Backend (.NET API)

```bash
cd backend/InfluencerAPI

# Instalar dependencias
dotnet restore

# (Opcional) Editar appsettings.json si usas Atlas en lugar de Mongo local
# "ConnectionString": "mongodb://localhost:27017"

# Correr en modo desarrollo
dotnet run
# API corre en: http://localhost:5000
# Health check: http://localhost:5000/health
```

### 2. Frontend (Angular)

```bash
cd frontend

# Instalar dependencias
npm install

# Correr en modo desarrollo
npm start
# App corre en: http://localhost:4200
```

### 3. MongoDB local (si no usas Atlas)

```bash
# macOS (homebrew)
brew services start mongodb/brew/mongodb-community

# Windows: iniciar MongoDB como servicio desde Services
# Ubuntu
sudo systemctl start mongod
```

---

## 🔐 Seguridad implementada

- **JWT** (access token 60 min + refresh token 7 días)
- **bcrypt** para contraseñas (salt rounds = 10)
- **CORS** restringido a orígenes configurados
- **Rutas protegidas** con Guard en Angular
- **Auto-refresh** de token transparente con interceptor HTTP
- Preparado para multi-roles (campo `role` en User)

---

## 📁 Estructura del proyecto

```
influencer-platform/
├── backend/
│   └── InfluencerAPI/
│       ├── Controllers/       → AuthController, DealsController
│       ├── Services/          → AuthService, DealService, TokenService
│       ├── Models/            → User, Deal
│       ├── DTOs/              → Requests / Responses
│       ├── Config/            → AppSettings clases
│       ├── appsettings.json               ← Config LOCAL
│       └── appsettings.Production.json    ← Config PRODUCCIÓN
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── core/
│       │   │   ├── guards/    → authGuard, publicGuard
│       │   │   ├── interceptors/ → AuthInterceptor (auto JWT)
│       │   │   └── services/  → AuthService, DealService
│       │   ├── features/
│       │   │   ├── auth/      → Login, Register
│       │   │   ├── dashboard/ → Dashboard con KPIs y alertas
│       │   │   └── deals/     → Lista de deals + Formulario
│       │   └── shared/
│       │       ├── components/ → Layout con sidebar
│       │       └── models/    → Interfaces TypeScript
│       └── environments/
│           ├── environment.ts          ← URLs LOCAL
│           └── environment.prod.ts     ← URLs PRODUCCIÓN
│
├── render.yaml        → Config despliegue Render
└── README.md
```

---

## 🌐 Despliegue a producción

### Backend → Render (gratis)
1. Sube el repo a GitHub
2. En [render.com](https://render.com) → "New Web Service" → conecta el repo
3. Build: `cd backend/InfluencerAPI && dotnet publish -c Release -o out`
4. Start: `cd backend/InfluencerAPI/out && dotnet InfluencerAPI.dll`
5. En Environment Variables de Render:
   - `MongoDB__ConnectionString` = tu string de Atlas
   - `Jwt__SecretKey` = clave secreta larga y segura
   - `Cors__AllowedOrigins__0` = URL de tu app en Vercel

### Frontend → Vercel (gratis)
1. En [vercel.com](https://vercel.com) → "Import Project" → conecta el repo
2. Root Directory: `frontend`
3. Build Command: `npm run build:prod`
4. Output Directory: `dist/influencer-platform/browser`
5. Edita `src/environments/environment.prod.ts` con la URL de tu API en Render

### MongoDB → Atlas (gratis)
1. Crea cluster en [mongodb.com/atlas](https://mongodb.com/atlas) (M0 Free)
2. Crea usuario de BD
3. Whitelist IP: `0.0.0.0/0` (para Render)
4. Copia el Connection String → pégalo en Render env vars

---

## 📋 API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/register | Registro por email |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Renovar token |
| POST | /api/auth/logout | Cerrar sesión |
| GET | /api/auth/me | Usuario actual |

### Deals (requieren JWT)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/deals | Listar con filtros y paginación |
| POST | /api/deals | Crear deal |
| GET | /api/deals/:id | Obtener deal |
| PUT | /api/deals/:id | Actualizar deal |
| DELETE | /api/deals/:id | Eliminar deal |
| GET | /api/deals/dashboard | KPIs y alertas |
| GET | /api/deals/export | Exportar Excel |

---

## 🔜 Módulo de archivos adjuntos (próxima fase)
Cuando quieras agregar archivos (contratos, facturas, etc.), la recomendación es:
- **Cloudinary** (free: 25GB) para imágenes y PDFs
- Agregar campos `attachments: Attachment[]` al modelo `Deal`
- Endpoint `POST /api/deals/:id/attachments`
