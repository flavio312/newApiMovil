# 🍽️ API de Restaurante

Una API RESTful completa para la gestión de un restaurante, desarrollada con TypeScript, Express, Sequelize y Cloudinary para el almacenamiento de imágenes.

## 🚀 Características

- ✅ **Autenticación de usuarios** - Sistema completo de login y registro
- ✅ **Gestión de platillos** - CRUD completo con imágenes
- ✅ **Almacenamiento en la nube** - Integración con Cloudinary
- ✅ **Base de datos** - MySQL con Sequelize ORM
- ✅ **TypeScript** - Tipado estático para mayor robustez
- ✅ **Validaciones** - Validación de datos y archivos
- ✅ **Manejo de errores** - Respuestas consistentes y detalladas
- ✅ **Documentación** - API bien documentada

## 🛠️ Tecnologías

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **TypeScript** | ^5.1.6 | Superset tipado de JavaScript |
| **Express** | ^4.18.2 | Framework web para Node.js |
| **Sequelize** | ^6.35.1 | ORM para bases de datos SQL |
| **MySQL** | 8.0+ | Sistema de gestión de base de datos |
| **Cloudinary** | ^1.41.0 | Servicio de almacenamiento de imágenes |
| **Multer** | ^1.4.5 | Middleware para manejar archivos |

## 📋 Requisitos Previos

- **Node.js** 18.0 o superior
- **MySQL** 8.0 o superior
- **Cuenta de Cloudinary** (gratuita)
- **Git** para clonar el repositorio

## ⚡ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/flavio312/newApiMovil.git
cd newApiMovil
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=restaurante_db

# Servidor
PORT=3000
NODE_ENV=development or production

# Cloudinary (obtener en https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Firebase (obtener en https://console.firebase.google.com)
FIREBASE_PROJECT_ID = your-firebase-project-id
FIREBASE_CLIENT_EMAIL =  your-firebase-client-email
FIREBASE_PRIVATE_KEY =  your-firebase-private-key
FIREBASE_SENDER_ID =  your-firebase-sender-id
FIREBASE_SECRET_KEY = your-firebase-secret-key
```

### 4. Configurar base de datos
```sql
CREATE DATABASE restaurante_db;
CREATE USER 'username'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON *.* TO 'username'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### 5. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📚 Estructura del Proyecto

```
newApiMovil/
├── src/
│   ├── config/
│   │   └── db.ts                 # Configuración de Sequelize
│   ├── controllers/
│   │   └── menuController.ts     # Controladores de platillos
│   ├── models/
│   │   └── Platillo.ts           # Modelo de platillos
│   ├── routes/
│   │   ├── user.routes.ts        # Rutas de usuarios
│   │   ├── login.routes.ts       # Rutas de autenticación
│   │   ├── food.routes.ts        # Rutas de comida
│   │   └── menuRoutes.ts         # Rutas de platillos (Cloudinary)
│   ├── services/
│   │   └── cloudinary.service.ts # Servicio de Cloudinary
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   └── middleware/               # Middlewares personalizados
├── dist/                         # Archivos compilados (auto-generado)
├── .env                          # Variables de entorno
├── tsconfig.json                 # Configuración TypeScript
├── package.json                  # Dependencias y scripts
└── README.md                     # Documentación
```

## 🔗 Endpoints de la API

### 🏠 General
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Información de la API |

### 👥 Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/users` | Obtener usuarios |
| `POST` | `/api/users` | Crear usuario |
| `PUT` | `/api/users/:id` | Actualizar usuario |
| `DELETE` | `/api/users/:id` | Eliminar usuario |

### 🔐 Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/login` | Iniciar sesión |
| `POST` | `/api/register` | Registrar usuario |

### 🍽️ Platillos (con Cloudinary)
| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| `GET` | `/api/platillos` | Obtener todos los platillos | - |
| `GET` | `/api/platillos/:id` | Obtener platillo por ID | `id` |
| `POST` | `/api/platillos` | Crear platillo con imagen | FormData |
| `PUT` | `/api/platillos/:id` | Actualizar platillo | `id` + FormData |
| `DELETE` | `/api/platillos/:id` | Eliminar platillo | `id` |
| `GET` | `/api/platillos/buscar` | Buscar platillos | `?q=texto` |

## 📝 Ejemplos de Uso

### Crear un platillo
```bash
curl -X POST http://localhost:3000/api/platillos \
  -F "titulo=Ensalada César" \
  -F "ingredientes=Lechuga, crutones, parmesano, aderezo césar" \
  -F "preparacion=Mezclar todos los ingredientes en un bowl grande" \
  -F "imagen=@/ruta/a/imagen.jpg"
```

### Respuesta exitosa
```json
{
  "success": true,
  "message": "Platillo creado exitosamente",
  "data": {
    "id": 1,
    "titulo": "Ensalada César",
    "ingredientes": "Lechuga, crutones, parmesano, aderezo césar",
    "preparacion": "Mezclar todos los ingredientes en un bowl grande",
    "imagen": {
      "url": "https://res.cloudinary.com/tu-cloud/image/upload/v123/menu-restaurante/imagen.jpg",
      "publicId": "menu-restaurante/menu_123_imagen",
      "width": 800,
      "height": 600,
      "format": "jpg",
      "size": 245678
    }
  }
}
```

### Obtener todos los platillos
```bash
curl -X GET http://localhost:3000/api/platillos
```

### Buscar platillos
```bash
curl -X GET "http://localhost:3000/api/platillos/buscar?q=ensalada"
```

## 🗄️ Esquema de Base de Datos

### Tabla: `platillos`
```sql
CREATE TABLE platillos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  ingredientes TEXT NOT NULL,
  preparacion TEXT NOT NULL,
  imagen_url VARCHAR(500),
  imagen_public_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX titulo_index (titulo),
  INDEX created_at_index (created_at)
);
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Verificar tipos sin compilar
npm run type-check

# Linter (si está configurado)
npm run lint
```

## 🚀 Despliegue

### Variables de entorno para producción
```env
NODE_ENV=production
DB_HOST=tu-host-produccion
DB_USER=tu-usuario-produccion
DB_PASSWORD=tu-password-seguro
DB_NAME=tu-base-produccion
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
PORT=3000
FIREBASE_PROJECT_ID = your-firebase-project-id
FIREBASE_CLIENT_EMAIL =  your-firebase-client-email
FIREBASE_PRIVATE_KEY =  your-firebase-private-key
FIREBASE_SENDER_ID =  your-firebase-sender-id
FIREBASE_SECRET_KEY = your-firebase-secret-key
```

### Compilar para producción
```bash
npm run build
npm start
```

## 🔍 Manejo de Errores

La API devuelve respuestas consistentes para todos los errores:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en desarrollo)"
}
```

### Códigos de estado HTTP
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Solicitud incorrecta
- `401` - No autorizado
- `404` - No encontrado
- `500` - Error interno del servidor

## 📸 Gestión de Imágenes

### Formatos soportados
- **JPG/JPEG** - Recomendado para fotografías
- **PNG** - Para imágenes con transparencia
- **WebP** - Formato moderno y optimizado

### Restricciones
- **Tamaño máximo:** 10 MB por archivo
- **Resolución automática:** 800x600px (manteniendo proporción)
- **Optimización:** Calidad automática y formato moderno
- **Almacenamiento:** Cloudinary CDN global

### Transformaciones automáticas
- Redimensionamiento a 800x600px
- Optimización de calidad automática
- Conversión a formatos modernos (WebP cuando es posible)
- Compresión inteligente

## 🔒 Validaciones

### Platillos
- **Título:** Requerido, 1-255 caracteres
- **Ingredientes:** Requerido, texto
- **Preparación:** Requerido, texto
- **Imagen:** Archivo de imagen válido, máximo 10MB

## 🐛 Solución de Problemas

### Error: "No se recibió ninguna imagen"
- Asegúrate de enviar el archivo con el campo `imagen`
- Verifica que el Content-Type sea `multipart/form-data`

### Error: "Solo se permiten archivos de imagen"
- Verifica que el archivo sea JPG, PNG o WebP
- Comprueba que el MIME type sea correcto

### Error de conexión a Cloudinary
- Verifica las credenciales en el archivo `.env`
- Confirma que la cuenta de Cloudinary esté activa

### Error de base de datos
- Verifica que MySQL esté ejecutándose
- Confirma las credenciales de la base de datos
- Asegúrate de que la base de datos existe

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Flavio** - [flavio312](https://github.com/flavio312)

## 📞 Soporte

Si tienes preguntas o problemas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

⭐ **¡No olvides dar una estrella al proyecto si te fue útil!**