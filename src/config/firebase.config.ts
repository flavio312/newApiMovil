import dotenv from 'dotenv';
dotenv.config();

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export class FirebaseConfigValidator {

  static validateEnvironmentVariables(): FirebaseConfig {
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

    const errors: string[] = [];

    // FIX: Agregar validaciones que faltaban
    if (!projectId) {
      errors.push('FIREBASE_PROJECT_ID is required');
    }
    if (!clientEmail) {
      errors.push('FIREBASE_CLIENT_EMAIL is required');
    }
    if (!privateKey) {
      errors.push('FIREBASE_PRIVATE_KEY is required');
    }

    if (errors.length > 0) {
      throw new Error(`Firebase configuration error:\n${errors.join('\n')}`);
    }

    // Validaciones adicionales solo si las variables existen
    this.validateProjectId(projectId!);
    this.validateClientEmail(clientEmail!);
    this.validatePrivateKey(privateKey!);

    return {
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: this.processPrivateKey(privateKey!) // Procesar aquí
    };
  }

  private static validateProjectId(projectId: string): void {
    if (projectId.length < 6 || projectId.length > 30) {
      throw new Error('FIREBASE_PROJECT_ID debe tener entre 6 y 30 caracteres');
    }

    if (!/^[a-z0-9-]+$/.test(projectId)) {
      throw new Error('FIREBASE_PROJECT_ID solo puede contener letras minúsculas, números y guiones');
    }

    if (projectId.startsWith('-') || projectId.endsWith('-')) {
      throw new Error('FIREBASE_PROJECT_ID no puede empezar o terminar con guión');
    }
  }

  private static validateClientEmail(clientEmail: string): void {
    const emailRegex = /^firebase-adminsdk-[a-z0-9]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/;
    
    if (!emailRegex.test(clientEmail)) {
      throw new Error('FIREBASE_CLIENT_EMAIL debe tener el formato: firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com');
    }
  }

  private static validatePrivateKey(privateKey: string): void {
    // Procesar la clave antes de validar
    const processedKey = this.processPrivateKey(privateKey);
    
    if (!processedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('FIREBASE_PRIVATE_KEY debe empezar con "-----BEGIN PRIVATE KEY-----"');
    }

    if (!processedKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('FIREBASE_PRIVATE_KEY debe terminar con "-----END PRIVATE KEY-----"');
    }

    // Verificar que tenga el formato básico correcto
    const lines = processedKey.split('\n');
    
    if (lines.length < 3) {
      throw new Error('FIREBASE_PRIVATE_KEY parece estar mal formateada');
    }

    // Validar que no tenga caracteres extraños
    const keyContent = lines.slice(1, -1).join('');
    if (!/^[A-Za-z0-9+/=]+$/.test(keyContent)) {
      throw new Error('FIREBASE_PRIVATE_KEY contiene caracteres inválidos en el contenido base64');
    }
  }

  /**
   * Procesar la clave privada para uso con Firebase
   * Maneja diferentes formatos de escape de \n
   */
  static processPrivateKey(privateKey: string): string {
    let processed = privateKey;
    
    // Remover comillas externas si existen
    if (processed.startsWith('"') && processed.endsWith('"')) {
      processed = processed.slice(1, -1);
    }
    if (processed.startsWith("'") && processed.endsWith("'")) {
      processed = processed.slice(1, -1);
    }
    
    // Reemplazar \n escapado con saltos de línea reales
    processed = processed.replace(/\\n/g, '\n');
    
    // Asegurar espacios en BEGIN/END
    processed = processed.replace('-----BEGINPRIVATEKEY-----', '-----BEGIN PRIVATE KEY-----');
    processed = processed.replace('-----ENDPRIVATEKEY-----', '-----END PRIVATE KEY-----');
    
    return processed;
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static getValidatedConfig(): FirebaseConfig {
    console.log('🔧 Validando configuración de Firebase...');
    
    try {
      const config = this.validateEnvironmentVariables();
      
      if (this.isProduction()) {
        console.log('🌐 Entorno de producción detectado');
      } else {
        console.log('🛠️ Entorno de desarrollo detectado');
      }
      
      return config;
    } catch (error) {
      console.error('❌ Error en configuración de Firebase:', error);
      throw error;
    }
  }
}

export class FirebaseDebugHelper {

  static checkEnvironmentVariables(): void {
    const variables = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL', 
      'FIREBASE_PRIVATE_KEY'
    ];

    console.log('🔍 Verificando variables de entorno de Firebase:');
    
    variables.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`  ✅ ${varName}: Definida (${value.length} caracteres)`);
        
        // Debug adicional para la clave privada
        if (varName === 'FIREBASE_PRIVATE_KEY') {
          console.log(`    🔍 Primeros 50 chars: ${value.substring(0, 50)}`);
          console.log(`    🔍 Contiene BEGIN: ${value.includes('-----BEGIN PRIVATE KEY-----')}`);
          console.log(`    🔍 Contiene END: ${value.includes('-----END PRIVATE KEY-----')}`);
        }
      } else {
        console.log(`  ❌ ${varName}: NO DEFINIDA`);
      }
    });
  }

  /**
   * Crear archivo temporal para debug de la clave privada
   */
  static debugPrivateKey(): void {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      console.log('❌ FIREBASE_PRIVATE_KEY no está definida');
      return;
    }

    const processed = FirebaseConfigValidator.processPrivateKey(privateKey);
  }
}