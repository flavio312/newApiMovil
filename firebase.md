# 🚀 Guía de Despliegue en Producción - Firebase Push Notifications

## 📋 Paso a paso para configurar en producción:

### 1. **Obtener credenciales de Firebase**

#### 🔥 Firebase Console:
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Configuración del proyecto" → "Cuentas de servicio"
4. Clic en "Generar nueva clave privada"
5. Descarga el archivo JSON

#### 📄 Extraer datos del JSON:
Del archivo descargado, necesitas estos 3 valores:
```json
{
  "project_id": "mi-app-restaurante-12345",
  "client_email": "firebase-adminsdk-abc123@mi-app-restaurante-12345.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n"
}
```

### 2. **Configurar variables en diferentes plataformas**

#### 🌐 **Heroku:**
```bash
heroku config:set FIREBASE_PROJECT_ID="mi-app-restaurante-12345"
heroku config:set FIREBASE_CLIENT_EMAIL="firebase-adminsdk-abc123@mi-app-restaurante-12345.iam.gserviceaccount.com"
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n"
```

#### ☁️ **AWS Elastic Beanstalk:**
En la consola web:
- Configuration → Software → Environment properties
- Agregar las 3 variables

#### 🐙 **DigitalOcean App Platform:**
En app.yaml:
```yaml
envs:
- key: FIREBASE_PROJECT_ID
  value: mi-app-restaurante-12345
- key: FIREBASE_CLIENT_EMAIL
  value: firebase-adminsdk-abc123@mi-app-restaurante-12345.iam.gserviceaccount.com
- key: FIREBASE_PRIVATE_KEY
  value: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n"
```

#### 🔵 **Azure App Service:**
```bash
az webapp config appsettings set --resource-group myResourceGroup --name myApp --settings FIREBASE_PROJECT_ID="mi-app-restaurante-12345"
```

#### 🐳 **Docker/Kubernetes:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: firebase-secrets
type: Opaque
stringData:
  FIREBASE_PROJECT_ID: "mi-app-restaurante-12345"
  FIREBASE_CLIENT_EMAIL: "firebase-adminsdk-abc123@mi-app-restaurante-12345.iam.gserviceaccount.com"
  FIREBASE_PRIVATE_KEY: |
    -----BEGIN PRIVATE KEY-----
    MIIEvQIBADANBgkqhkiG...
    -----END PRIVATE KEY-----
```

### 3. **Formato correcto de la Private Key**

#### ✅ **CORRECTO (para variables de entorno):**
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

#### ❌ **INCORRECTO:**
```bash
# NO usar saltos de línea reales
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

### 4. **Script para validar configuración**

#### 📝 validate-firebase.js:
```javascript
// Crear archivo validate-firebase.js para probar localmente
require('dotenv').config();

const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY'
];

console.log('🔍 Validando configuración de Firebase...\n');

let hasErrors = false;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: OK (${value.length} caracteres)`);
    
    if (varName === 'FIREBASE_PRIVATE_KEY') {
      const hasBegin = value.includes('-----BEGIN PRIVATE KEY-----');
      const hasEnd = value.includes('-----END PRIVATE KEY-----');
      console.log(`   🔑 BEGIN: ${hasBegin ? '✅' : '❌'}`);
      console.log(`   🔑 END: ${hasEnd ? '✅' : '❌'}`);
    }
  } else {
    console.log(`❌ ${varName}: FALTA`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Configuración incompleta');
  process.exit(1);
} else {
  console.log('\n✅ Configuración válida');
}
```

#### Ejecutar validación:
```bash
node validate-firebase.js
```

### 5. **Verificar en producción**

#### 🌐 **Endpoints para verificar:**
```bash
# Health check general
GET https://tu-servidor.com/health

# Status específico de Firebase (solo desarrollo)
GET https://tu-servidor.com/firebase-status

# Probar notificación
POST https://tu-servidor.com/api/notifications/test
Content-Type: application/json
{
  "topic": "test_topic"
}
```

### 6. **Troubleshooting común**

#### ⚠️ **Error: "Firebase configuration error"**
- Verificar que las 3 variables estén definidas
- Revisar formato de la private key

#### ⚠️ **Error: "invalid private key"**
```bash
# La private key debe tener \n literales, no saltos de línea reales
# Usar un editor que muestre caracteres especiales
```

#### ⚠️ **Error: "project not found"**
- Verificar que el PROJECT_ID sea correcto
- Asegurar que Firebase está habilitado en el proyecto

#### ⚠️ **Error: "insufficient permissions"**
- Verificar que el service account tenga rol "Firebase Admin SDK Administrator Service Agent"

### 7. **Monitoreo en producción**

#### 📊 **Logs a revisar:**
```bash
# Inicialización exitosa
✅ Firebase Admin SDK inicializado correctamente
🎯 Proyecto: mi-app-restaurante-12345

# Notificación enviada
✅ Notificación enviada exitosamente al topic new_products
🆔 Message ID: projects/mi-app-restaurante-12345/messages/...

# Errores comunes
❌ Error enviando notificación al topic new_products: Error: Invalid topic name
```

### 8. **Configuración de seguridad**

#### 🔒 **Recomendaciones:**
1. **Nunca** subir el archivo JSON a Git
2. **Rotar** las claves periódicamente
3. **Limitar** permisos del service account
4. **Usar** secrets managers en producción
5. **Monitorear** uso de la API

#### 🔐 **Service Account Permissions:**
En Firebase Console → IAM:
- Firebase Admin SDK Administrator Service Agent
- Cloud Messaging Admin (mínimo requerido)

### 9. **Script de despliegue automatizado**

#### 🚀 deploy.sh:
```bash
#!/bin/bash
echo "🚀 Desplegando aplicación con Firebase..."

# Validar variables localmente
node validate-firebase.js || exit 1

# Desplegar (ejemplo Heroku)
git push heroku main

# Verificar despliegue
curl -f https://tu-app.herokuapp.com/health || exit 1

echo "✅ Despliegue completado"
```

### 10. **Checklist final**

#### ✅ Pre-despliegue:
- [ ] Variables de Firebase configuradas
- [ ] Script de validación pasa
- [ ] Tests locales funcionan
- [ ] Logs de inicialización OK

#### ✅ Post-despliegue:
- [ ] Endpoint /health responde OK
- [ ] Firebase status = "initialized"
- [ ] Notificación de prueba funciona
- [ ] Apps móviles reciben notificaciones

¡Tu servidor ahora está listo para enviar push notifications en producción! 🎉📱