/**
 * Validador y helper para configuración de Firebase
 */
import dotenv from 'dotenv';
dotenv.config();
export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export class FirebaseConfigValidator {
  
  /**
   * Validar que todas las variables de Firebase estén presentes
   */
  static validateEnvironmentVariables(): FirebaseConfig {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    const errors: string[] = [];

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

    // Validaciones adicionales
    this.validateProjectId(projectId!);
    this.validateClientEmail(clientEmail!);
    this.validatePrivateKey(privateKey!);

    return {
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: privateKey!
    };
  }

  /**
   * Validar formato del Project ID
   */
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

  /**
   * Validar formato del email del service account
   */
  private static validateClientEmail(clientEmail: string): void {
    const emailRegex = /^firebase-adminsdk-[a-z0-9]+@[a-z0-9-]+\.iam\.gserviceaccount\.com$/;
    
    if (!emailRegex.test(clientEmail)) {
      throw new Error('FIREBASE_CLIENT_EMAIL debe tener el formato: firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com');
    }
  }

  /**
   * Validar formato de la clave privada
   */
  private static validatePrivateKey(privateKey: string): void {
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('FIREBASE_PRIVATE_KEY debe empezar con "-----BEGIN PRIVATE KEY-----"');
    }

    if (!privateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('FIREBASE_PRIVATE_KEY debe terminar con "-----END PRIVATE KEY-----"');
    }

    // Verificar que tenga el formato básico correcto
    const cleanKey = privateKey.replace(/\\n/g, '\n');
    const lines = cleanKey.split('\n');
    
    if (lines.length < 3) {
      throw new Error('FIREBASE_PRIVATE_KEY parece estar mal formateada');
    }
  }

  /**
   * Procesar la clave privada para uso con Firebase
   */
  static processPrivateKey(privateKey: string): string {
    return privateKey.replace(/\\n/g, '\n');
  }

  /**
   * Mostrar información de configuración (sin datos sensibles)
   */
  static displayConfigInfo(config: FirebaseConfig): void {
    console.log('📋 Configuración de Firebase:');
    console.log(`  🎯 Project ID: ${config.projectId}`);
    console.log(`  📧 Client Email: ${config.clientEmail}`);
    console.log(`  🔑 Private Key: ${config.privateKey.substring(0, 50)}... (${config.privateKey.length} caracteres)`);
  }

  /**
   * Verificar si estamos en entorno de producción
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Obtener configuración completa y validada
   */
  static getValidatedConfig(): FirebaseConfig {
    console.log('🔧 Validando configuración de Firebase...');
    
    const config = this.validateEnvironmentVariables();
    
    if (this.isProduction()) {
      console.log('🌐 Entorno de producción detectado');
    } else {
      console.log('🛠️ Entorno de desarrollo detectado');
    }
    
    this.displayConfigInfo(config);
    
    return config;
  }
}

/**
 * Helper para debugging de configuración
 */
export class FirebaseDebugHelper {
  
  /**
   * Verificar si las variables están definidas (sin mostrar valores)
   */
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
      } else {
        console.log(`  ❌ ${varName}: NO DEFINIDA`);
      }
    });
  }

  /**
   * Mostrar ejemplo de configuración
   */
  static showConfigurationExample(): void {
    console.log('\n📝 Ejemplo de configuración en .env:');
    console.log('FIREBASE_PROJECT_ID=mi-app-restaurante-12345');
    console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@mi-app-restaurante-12345.iam.gserviceaccount.com');
    console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBA...\\n-----END PRIVATE KEY-----\\n"');
    console.log('\n💡 Recuerda: Los \\n deben ser literales, no saltos de línea reales');
  }
}