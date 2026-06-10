# Inventra — Sistema de Gestión de Inventarios

Backend REST API construido con **Node.js + Express + MongoDB**.

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 24 (ESM) |
| Framework | Express 5 |
| Base de datos | MongoDB / Mongoose 9 |
| Autenticación | JWT + bcryptjs |
| Validación | express-validator |
| Testing | Jest 29 + supertest |
| Linter | ESLint 9 |
| Contenedores | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## 📁 Estructura del Proyecto

```
inventra/
├── src/
│   ├── app.js                   # Express app + CORS + rutas
│   ├── server.js                # Entry point
│   ├── config/db.js             # Conexión MongoDB
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── movementController.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # protect (401) + authorizeAdmin (403)
│   │   ├── asyncHandler.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js              # name, email, password, role
│   │   ├── Product.js
│   │   └── Movement.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── movementRoutes.js
│   ├── utils/generateToken.js
│   └── validators/authValidator.js
├── __tests__/
│   ├── auth.test.js
│   ├── products.test.js
│   └── movements.test.js
├── .github/workflows/
│   ├── ci.yml                   # Lint + Tests en push/PR a main
│   └── cd.yml                   # Deploy a Render si CI pasa
├── Dockerfile                   # node:24-alpine, USER node, multi-stage
├── docker-compose.yml           # Backend + MongoDB local
├── eslint.config.js
└── .env.example
```

---

## ⚙️ Variables de Entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

---

## 🐳 Levantar con Docker Compose

```bash
docker-compose up --build -d
```

Servicios que se levantan:
- `inventra_backend` → http://localhost:5000
- `inventra_mongo` → localhost:27017

---

## 🔧 Desarrollo Local

```bash
npm install
npm run dev
```

---

## 🧪 Tests y Cobertura

```bash
# Ejecutar todas las suites
npm test

# Con reporte de cobertura (>90% requerido)
npm run test:coverage
```

Módulos críticos cubiertos: **Autenticación**, **Productos**, **Movimientos**

---

## 🔍 ESLint

```bash
npm run lint        # Verificar
npm run lint:fix    # Corregir automáticamente
```

---

## 🌐 Endpoints principales

### Auth — `/api/v1/auth`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/register` | Público | Registrar usuario |
| POST | `/login` | Público | Iniciar sesión |
| GET | `/profile` | Privado | Ver perfil |

### Productos — `/api/v1/products`
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/` | Privado |
| GET | `/` | Privado |
| GET | `/:id` | Privado (dueño) |
| PUT | `/:id` | Privado (dueño) |
| DELETE | `/:id` | Privado (dueño) |

### Movimientos — `/api/v1/movements`
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/` | Privado (dueño del producto) |
| GET | `/` | Privado |
| GET | `/:id` | Privado (dueño) |

### Health Check
```
GET /health → { status: "ok", uptime: ... }
```

---

## 🔒 Semántica de Errores HTTP

| Código | Cuándo se emite |
|---|---|
| 400 | Datos inválidos / usuario ya existe / stock insuficiente |
| 401 | Sin token / token inválido o expirado |
| 403 | Usuario autenticado pero sin permiso sobre el recurso |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## 📡 CI/CD

- **`ci.yml`**: Lint → Tests → Cobertura en cada `push`/`PR` a `main`
- **`cd.yml`**: Deploy automático a Render vía Webhook si CI pasa

Configurar en GitHub Secrets: `RENDER_DEPLOY_HOOK_URL`

---

## 📊 Monitoreo Keep-Alive

Configurar **UptimeRobot** con ping a `GET /health` cada 5 minutos para evitar que Render duerma el servicio gratuito.
