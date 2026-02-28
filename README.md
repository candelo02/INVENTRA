# 🛒 Sistema de Gestión de Inventario - Backend

Este es el backend de un sistema de gestión de inventario para pequeños negocios, desarrollado con **Node.js**, **Express** y **MongoDB**.

## 🚀 Tecnologías utilizadas

- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework web para Node.js.
- **MongoDB & Mongoose**: Base de Datos NoSQL y Modelado de datos.
- **JWT (JSON Web Tokens)**: Autenticación segura.
- **Bcryptjs**: Encriptación de contraseñas.
- **Express-validator**: Validación de datos de entrada.

## 📋 Requisitos previos

Antes de comenzar, asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local o en la nube con Atlas)

## 🛠️ Instalación y configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd INVENTARIO-BACK
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y añade lo siguiente (puedes basarte en el ejemplo):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/inventario_snippets
   JWT_SECRET=supersecret123
   NODE_ENV=development
   ```

## 🏃‍♂️ Ejecución del proyecto

Para levantar el servidor en modo de desarrollo (con recarga automática):
```bash
npm run dev
```
El servidor debería estar corriendo en: `http://localhost:5000`

## 📡 Endpoints principales (Fase 1)

### Autenticación
- **POST** `/api/v1/auth/register`: Registro de nuevo usuario.
- **POST** `/api/v1/auth/login`: Inicio de sesión (Entrega Token JWT).

### Snippets (Prueba de Seguridad)
- **POST** `/api/v1/snippets`: Crear snippet (Privado).
- **GET** `/api/v1/snippets`: Listar snippets propios.
- **PUT** `/api/v1/snippets/:id`: Editar snippet propio.
- **DELETE** `/api/v1/snippets/:id`: Borrar snippet propio.

## 🔒 Arquitectura de Seguridad
El sistema utiliza el **"Muro de Privacidad"**, lo que significa que el ID del usuario se extrae directamente del Token JWT enviado en las cabeceras (`Authorization: Bearer <token>`). Un usuario nunca podrá manipular datos de otro aunque conozca el ID del recurso.

## 📄 Licencia
Este proyecto está bajo la Licencia ISC.
