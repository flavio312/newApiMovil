import * as admin from 'firebase-admin';

// Tipos para las notificaciones
export interface PushNotificationData {
  type: string;
  product_id: string;
  product_title: string;
  [key: string]: string;
}

export interface TopicNotificationPayload {
  topic: string;
  title: string;
  message: string;
  data?: PushNotificationData;
}

export interface TokenNotificationPayload {
  token: string;
  title: string;
  message: string;
  data?: PushNotificationData;
}

class FirebaseService {
  private initialized = false;

  /**
   * Inicializar Firebase Admin SDK usando variables individuales
   */
  public initializeFirebase(): void {
    if (this.initialized) {
      console.log('Firebase ya está inicializado');
      return;
    }

    try {
      // Verificar que las variables de entorno estén presentes
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Variables de Firebase faltantes. Verifica FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY');
      }

      // Procesar la private key para manejar los \n correctamente
      const processedPrivateKey = privateKey.replace(/\\n/g, '\n');
      // Inicializar Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: processedPrivateKey
        }),
        projectId: projectId
      });

      this.initialized = true;
      console.log('✅ Firebase Admin SDK inicializado correctamente');
      console.log(`🎯 Proyecto: ${projectId}`);
    } catch (error) {
      console.error('❌ Error inicializando Firebase Admin SDK:', error);
      throw new Error(`No se pudo inicializar Firebase Admin SDK: ${(error as Error).message}`);
    }
  }

  /**
   * Verificar el estado de inicialización
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Obtener información del proyecto
   */
  public getProjectInfo(): { projectId: string; clientEmail: string } | null {
    if (!this.initialized) return null;
    
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || 'unknown',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'unknown'
    };
  }

  /**
   * Enviar notificación a un topic
   */
  public async sendTopicNotification(payload: TopicNotificationPayload): Promise<string> {
    if (!this.initialized) {
      throw new Error('Firebase no está inicializado. Llama a initializeFirebase() primero.');
    }

    try {
      console.log(`📤 Enviando notificación al topic: ${payload.topic}`);
      console.log(`📝 Título: ${payload.title}`);
      console.log(`💬 Mensaje: ${payload.message}`);

      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.message
        },
        data: payload.data ? this.convertDataToStrings(payload.data) : {},
        topic: payload.topic,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#CD5C5C',
            sound: 'default',
            priority: 'high' as const,
            channelId: 'push_channel'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const messageId = await admin.messaging().send(message);
      console.log(`✅ Notificación enviada exitosamente al topic ${payload.topic}`);
      console.log(`🆔 Message ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error(`❌ Error enviando notificación al topic ${payload.topic}:`, error);
      
      // Información adicional para debugging
      if (error instanceof Error) {
        console.error(`🔍 Error details: ${error.message}`);
        if (error.message.includes('not found')) {
          console.error(`💡 El topic '${payload.topic}' podría no existir o no tener suscriptores`);
        }
      }
      
      throw error;
    }
  }

  /**
   * Enviar notificación a un token específico
   */
  public async sendTokenNotification(payload: TokenNotificationPayload): Promise<string> {
    if (!this.initialized) {
      throw new Error('Firebase no está inicializado. Llama a initializeFirebase() primero.');
    }

    try {
      console.log(`📤 Enviando notificación al token: ${payload.token.substring(0, 20)}...`);
      console.log(`📝 Título: ${payload.title}`);

      const message: admin.messaging.Message = {
        notification: {
          title: payload.title,
          body: payload.message
        },
        data: payload.data ? this.convertDataToStrings(payload.data) : {},
        token: payload.token,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#CD5C5C',
            sound: 'default',
            priority: 'high' as const,
            channelId: 'push_channel'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const messageId = await admin.messaging().send(message);
      console.log(`✅ Notificación enviada exitosamente al token`);
      console.log(`🆔 Message ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error(`❌ Error enviando notificación al token:`, error);
      
      if (error instanceof Error && error.message.includes('invalid-registration-token')) {
        console.error(`💡 El token FCM parece ser inválido o expirado`);
      }
      
      throw error;
    }
  }

  /**
   * Enviar notificación cuando se agrega un nuevo platillo
   */
  public async sendProductAddedNotification(platillo: any): Promise<void> {
    if (!this.initialized) {
      console.warn('⚠️ Firebase no está inicializado, no se pueden enviar notificaciones');
      return;
    }

    try {
      console.log(`🍽️ Enviando notificaciones de nuevo platillo: ${platillo.titulo}`);

      // Enviar al topic de productos nuevos
      const newProductsPromise = this.sendTopicNotification({
        topic: 'new_products',
        title: '🍽️ ¡Nuevo platillo disponible!',
        message: `Se agregó '${platillo.titulo}' al menú del día`,
        data: {
          type: 'product_added',
          product_id: platillo.id.toString(),
          product_title: platillo.titulo
        }
      });

      // Enviar al topic general de notificaciones del menú
      const menuNotificationsPromise = this.sendTopicNotification({
        topic: 'menu_notifications',
        title: '🍽️ ¡Nuevo platillo disponible!',
        message: `Se agregó '${platillo.titulo}' al menú del día`,
        data: {
          type: 'product_added',
          product_id: platillo.id.toString(),
          product_title: platillo.titulo
        }
      });

      // Esperar ambas notificaciones
      await Promise.all([newProductsPromise, menuNotificationsPromise]);

      console.log(`✅ Todas las notificaciones de nuevo platillo enviadas para: ${platillo.titulo}`);
    } catch (error) {
      console.error('❌ Error enviando notificaciones de nuevo platillo:', error);
      // No lanzar error para no afectar la creación del platillo
    }
  }

  /**
   * Enviar notificación cuando se actualiza un platillo
   */
  public async sendProductUpdatedNotification(platillo: any): Promise<void> {
    if (!this.initialized) {
      console.warn('⚠️ Firebase no está inicializado, no se pueden enviar notificaciones');
      return;
    }

    try {
      console.log(`📝 Enviando notificaciones de platillo actualizado: ${platillo.titulo}`);

      // Enviar al topic de actualizaciones de productos
      const productUpdatesPromise = this.sendTopicNotification({
        topic: 'product_updates',
        title: '📝 Platillo actualizado',
        message: `Se actualizó '${platillo.titulo}' en el menú`,
        data: {
          type: 'product_updated',
          product_id: platillo.id.toString(),
          product_title: platillo.titulo
        }
      });

      // Enviar al topic general
      const menuNotificationsPromise = this.sendTopicNotification({
        topic: 'menu_notifications',
        title: '📝 Platillo actualizado',
        message: `Se actualizó '${platillo.titulo}' en el menú`,
        data: {
          type: 'product_updated',
          product_id: platillo.id.toString(),
          product_title: platillo.titulo
        }
      });

      // Esperar ambas notificaciones
      await Promise.all([productUpdatesPromise, menuNotificationsPromise]);

      console.log(`✅ Todas las notificaciones de platillo actualizado enviadas para: ${platillo.titulo}`);
    } catch (error) {
      console.error('❌ Error enviando notificaciones de platillo actualizado:', error);
      // No lanzar error para no afectar la actualización del platillo
    }
  }

  /**
   * Convertir datos a strings (requerido por FCM)
   */
  private convertDataToStrings(data: PushNotificationData): Record<string, string> {
    const stringData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      stringData[key] = String(value);
    }
    return stringData;
  }

  /**
   * Verificar si un token es válido
   */
  public async validateToken(token: string): Promise<boolean> {
    if (!this.initialized) {
      console.warn('⚠️ Firebase no está inicializado, no se puede validar token');
      return false;
    }

    try {
      console.log(`🔍 Validando token: ${token.substring(0, 20)}...`);
      
      await admin.messaging().send({
        token,
        data: { test: 'true' }
      }, true); // dry_run = true
      
      console.log('✅ Token válido');
      return true;
    } catch (error) {
      console.error('❌ Token inválido:', error);
      return false;
    }
  }

  /**
   * Enviar notificación de bienvenida
   */
  public async sendWelcomeNotification(token: string): Promise<void> {
    try {
      console.log('👋 Enviando notificación de bienvenida...');
      
      await this.sendTokenNotification({
        token,
        title: '¡Bienvenido a nuestro menú!',
        message: 'Ahora recibirás notificaciones sobre nuevos platillos y actualizaciones del menú',
        data: {
          type: 'welcome',
          product_id: '',
          product_title: ''
        }
      });
      
      console.log('✅ Notificación de bienvenida enviada');
    } catch (error) {
      console.error('❌ Error enviando notificación de bienvenida:', error);
    }
  }

  /**
   * Método para testing y debugging
   */
  public async testConnection(): Promise<boolean> {
    if (!this.initialized) {
      console.error('❌ Firebase no está inicializado');
      return false;
    }

    try {
      console.log('🧪 Probando conexión con Firebase...');
      
      // Intentar enviar una notificación de prueba a un topic
      await this.sendTopicNotification({
        topic: 'test_topic',
        title: '🧪 Test de conexión',
        message: 'Conexión con Firebase exitosa',
        data: {
          type: 'test',
          product_id: 'test',
          product_title: 'test'
        }
      });
      
      console.log('✅ Conexión con Firebase exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error probando conexión con Firebase:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const firebaseService = new FirebaseService();