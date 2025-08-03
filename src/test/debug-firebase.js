require('dotenv').config();
const { FirebaseDebugHelper } = require('./dist/config/firebase'); // Ajusta la ruta

console.log('🔍 Iniciando debug de Firebase...');
FirebaseDebugHelper.checkEnvironmentVariables();
FirebaseDebugHelper.debugPrivateKey();