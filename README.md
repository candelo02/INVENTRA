# 🛒 Sistema de Gestión de Inventario para Pequeños Negocios

API robusta para la gestión de inventario, trazabilidad de movimientos y reportes financieros, diseñada para pequeños comercios.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/YOUR_VIEW_ID)

## 🚀 Características

-   **Estructura MVC:** Código organizado y escalable.
-   **Autenticación Segura:** JWT con Cookies HTTP-only para máxima seguridad (XSS/CSRF).
-   **Trazabilidad Total:** Registro automático de cada entrada y salida de productos.
-   **Métricas del Negocio:** Valor total del inventario y alertas de stock bajo.
-   **Reportes Inteligentes:** Reporte de ventas y compras por rango de fechas.

## 🛠️ Stack Tecnológico

-   **Entorno:** Node.js
-   **Framework:** Express.js
-   **Base de Datos:** MongoDB con Mongoose
-   **Seguridad:** JWT, Bcryptjs, Cookie-parser
-   **Documentación:** Swagger UI
-   **Testing:** Jest & Supertest

## 📦 Instalación y Uso

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/candelo02/INVENTARIO-BACK.git
    cd INVENTARIO-BACK
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno (.env):**
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/inventario_db
    JWT_SECRET=tu_secreto_aqui
    NODE_ENV=development
    ```

4.  **Iniciar el servidor:**
    ```bash
    # Desarrollo (con nodemon)
    npm run dev
    
    # Producción
    npm start
    ```

## 📖 Documentación de la API

Una vez iniciado el servidor, puedes acceder a la documentación interactiva en:
👉 [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## 🧪 Pruebas Automáticas

Para ejecutar la suite de pruebas unitarias y de integración:
```bash
npm test
```

## 🔗 Diccionario de Endpoints (Contrato)

| Método | Endpoint | Descripción | Requiere Token |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/register` | Registro de nuevo usuario | No |
| POST | `/api/v1/auth/login` | Inicio de sesión (Crea Cookie) | No |
| POST | `/api/v1/auth/logout` | Cierre de sesión (Limpia Cookie) | No |
| GET | `/api/v1/products` | Lista productos del usuario | Sí |
| POST | `/api/v1/products` | Crea un nuevo producto | Sí |
| GET | `/api/v1/products/report` | Reporte de ventas/compras por fechas | Sí |
| POST | `/api/v1/products/:id/movements` | Registro rápido de entrada/salida | Sí |

---
Desarrollado para el módulo de **Electiva de Backend**.
