# 🚀 Despliegue en AWS EC2

Guía completa para desplegar tu API de restaurante en una instancia EC2 de AWS.

## 📋 Requisitos Previos

- ✅ Cuenta de AWS activa
- ✅ Conocimientos básicos de SSH
- ✅ Tu proyecto funcionando localmente
- ✅ Credenciales de Cloudinary configuradas

## 🔧 Paso 1: Crear y Configurar la Instancia EC2

### 1.1 Crear la Instancia
1. **Accede a AWS Console** → EC2 → Launch Instance
2. **Configuración recomendada:**
   - **Nombre:** `restaurante-api-server`
   - **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Tipo de instancia:** t2.micro (para pruebas) o t3.small (recomendado)
   - **Par de claves:** Crear nuevo par o usar existente
   - **Almacenamiento:** 8-20 GB (según necesidades)

### 1.2 Configurar Security Groups
```
Inbound Rules:
- SSH (22): Tu IP o 0.0.0.0/0 (temporal)
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (3000): 0.0.0.0/0 (puerto de tu API)
- MySQL (3306): Solo desde localhost o VPC
```

### 1.3 Conectar a la Instancia
```bash
# Cambiar permisos de la clave
chmod 400 tu-clave.pem

# Conectar por SSH
ssh -i "tu-clave.pem" ubuntu@tu-ip-publica-ec2
```

## 🛠️ Paso 2: Configurar el Servidor

### 2.1 Actualizar el Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Instalar Node.js y npm
```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2.3 Instalar MySQL
```bash
# Instalar MySQL Server
sudo apt install mysql-server -y

# Configurar MySQL
sudo mysql_secure_installation

# Acceder a MySQL
sudo mysql -u root -p
```

### 2.4 Configurar Base de Datos
```sql
-- En MySQL
CREATE DATABASE restaurante_db;
CREATE USER 'restaurante_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON restaurante_db.* TO 'restaurante_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.5 Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 2.6 Instalar Git
```bash
sudo apt install git -y
```

## 📦 Paso 3: Desplegar la Aplicación

### 3.1 Clonar el Repositorio
```bash
# Crear directorio para aplicaciones
sudo mkdir -p /var/www
sudo chown -R ubuntu:ubuntu /var/www

# Clonar tu repositorio
cd /var/www
git clone https://github.com/flavio312/newApiMovil.git
cd newApiMovil
```

### 3.2 Instalar Dependencias
```bash
npm install
```

### 3.3 Configurar Variables de Entorno
```bash
# Crear archivo .env
nano .env
```

```env
# Archivo .env para producción
NODE_ENV=production
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=restaurante_user
DB_PASSWORD=tu_password_seguro
DB_NAME=restaurante_db

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### 3.4 Compilar el Proyecto
```bash
npm run build
```

### 3.5 Probar la Aplicación
```bash
# Probar que funciona
npm start

# Si funciona, detener con Ctrl+C
```

## 🔄 Paso 4: Configurar PM2 para Producción

### 4.1 Crear Archivo de Configuración PM2
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'restaurante-api',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
```

### 4.2 Crear Directorio de Logs
```bash
mkdir logs
```

### 4.3 Iniciar con PM2
```bash
# Iniciar la aplicación
pm2 start ecosystem.config.js --env production

# Verificar estado
pm2 status

# Ver logs en tiempo real
pm2 logs

# Configurar PM2 para iniciar automáticamente
pm2 startup
pm2 save
```

## 🌐 Paso 5: Configurar Nginx (Proxy Reverso)

### 5.1 Instalar Nginx
```bash
sudo apt install nginx -y
```

### 5.2 Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/restaurante-api
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com tu-ip-publica;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Configuración para archivos grandes (imágenes)
        client_max_body_size 10M;
    }
}
```

### 5.3 Habilitar la Configuración
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/restaurante-api /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Paso 6: Configurar HTTPS (Opcional pero Recomendado)

### 6.1 Instalar Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 6.2 Obtener Certificado SSL
```bash
# Solo si tienes un dominio configurado
sudo certbot --nginx -d tu-dominio.com
```

## 🛡️ Paso 7: Configurar Firewall

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verificar estado
sudo ufw status
```

## 🔧 Paso 8: Scripts de Automatización

### 8.1 Script de Despliegue
```bash
nano deploy.sh
```

```bash
#!/bin/bash
echo "🚀 Iniciando despliegue..."

# Navegar al directorio
cd /var/www/newApiMovil

# Actualizar código
echo "📥 Descargando últimos cambios..."
git pull origin main

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Compilar
echo "🔨 Compilando proyecto..."
npm run build

# Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
pm2 restart restaurante-api

echo "✅ Despliegue completado!"
```

```bash
chmod +x deploy.sh
```

### 8.2 Script de Backup de Base de Datos
```bash
nano backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="restaurante_db"
DB_USER="restaurante_user"
DB_PASS="tu_password_seguro"

mkdir -p $BACKUP_DIR

mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

echo "Backup creado: $BACKUP_DIR/backup_$DATE.sql"

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
chmod +x backup-db.sh
```

## 📊 Paso 9: Monitoreo y Logs

### 9.1 Comandos Útiles de PM2
```bash
# Ver estado de todas las aplicaciones
pm2 status

# Ver logs en tiempo real
pm2 logs restaurante-api

# Reiniciar aplicación
pm2 restart restaurante-api

# Detener aplicación
pm2 stop restaurante-api

# Ver información detallada
pm2 show restaurante-api

# Monitorear en tiempo real
pm2 monit
```

### 9.2 Ver Logs del Sistema
```bash
# Logs de Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs del sistema
sudo journalctl -f -u nginx
```

## 🧪 Paso 10: Probar el Despliegue

### 10.1 Verificar Endpoints
```bash
# Desde la instancia EC2
curl http://localhost:3000/

# Desde internet
curl http://tu-ip-publica/
curl http://tu-ip-publica/api/platillos
```

### 10.2 Probar Subida de Imágenes
```bash
curl -X POST http://tu-ip-publica/api/platillos \
  -F "titulo=Platillo de Prueba" \
  -F "ingredientes=Ingredientes de prueba" \
  -F "preparacion=Preparación de prueba" \
  -F "imagen=@imagen-prueba.jpg"
```

## 🔧 Mantenimiento

### Actualizar la Aplicación
```bash
cd /var/www/newApiMovil
./deploy.sh
```

### Backup de Base de Datos
```bash
./backup-db.sh
```

### Reiniciar Servicios
```bash
# Reiniciar PM2
pm2 restart all

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar MySQL
sudo systemctl restart mysql
```

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: "Port 3000 already in use"
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 PID
```

### Error: "Permission denied"
```bash
# Ajustar permisos
sudo chown -R ubuntu:ubuntu /var/www/newApiMovil
chmod +x deploy.sh
```

### Aplicación no accesible desde internet
```bash
# Verificar Security Groups en AWS
# Verificar firewall
sudo ufw status

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
```

## 💰 Optimización de Costos

### Para desarrollo/pruebas:
- **Instancia:** t2.micro (Free tier)
- **Almacenamiento:** 8 GB
- **Parar instancia** cuando no la uses

### Para producción:
- **Instancia:** t3.small o superior
- **Almacenamiento:** 20+ GB
- **Configurar alarmas** de CloudWatch
- **Auto Scaling** si es necesario

## 🔄 CI/CD Básico con GitHub Actions

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /var/www/newApiMovil
          ./deploy.sh
```

¡Con esta guía tendrás tu API funcionando en EC2! 🎉