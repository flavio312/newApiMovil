import { Request, Response } from 'express';
import { firebaseService, TopicNotificationPayload, TokenNotificationPayload } from '../services/firebase.service';

export interface TokenRegistrationRequest {
  token: string;
  userId?: string;
}

export interface NotificationRequest {
  topic?: string;
  token?: string;
  title: string;
  message: string;
  data?: Record<string, string>;
}

export class NotificationController {

  /**
   * Enviar notificación a un topic
   */
  async sendTopicNotification(req: Request, res: Response): Promise<void> {
    try {
      const { topic, title, message, data }: NotificationRequest = req.body;

      if (!topic || !title || !message) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: topic, title, message'
        });
        return;
      }

      const payload: TopicNotificationPayload = {
        topic,
        title,
        message,
        data: data as any
      };

      const messageId = await firebaseService.sendTopicNotification(payload);

      res.json({
        success: true,
        message: 'Notificación enviada exitosamente',
        data: {
          messageId,
          topic,
          title
        }
      });

    } catch (error) {
      console.error('❌ Error enviando notificación al topic:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Enviar notificación a un token específico
   */
  async sendTokenNotification(req: Request, res: Response): Promise<void> {
    try {
      const { token, title, message, data }: NotificationRequest = req.body;

      if (!token || !title || !message) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: token, title, message'
        });
        return;
      }

      const payload: TokenNotificationPayload = {
        token,
        title,
        message,
        data: data as any
      };

      const messageId = await firebaseService.sendTokenNotification(payload);

      res.json({
        success: true,
        message: 'Notificación enviada exitosamente',
        data: {
          messageId,
          title
        }
      });

    } catch (error) {
      console.error('❌ Error enviando notificación al token:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Registrar token FCM de un usuario
   */
  async registerToken(req: Request, res: Response): Promise<void> {
    try {
      const { token, userId }: TokenRegistrationRequest = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token FCM requerido'
        });
        return;
      }

      // Validar que el token sea válido
      const isValidToken = await firebaseService.validateToken(token);
      
      if (!isValidToken) {
        res.status(400).json({
          success: false,
          message: 'Token FCM inválido'
        });
        return;
      }

      // Aquí podrías guardar el token en tu base de datos
      // asociado al usuario si manejas autenticación
      // Ejemplo:
      // if (userId) {
      //   await User.update({ fcmToken: token }, { where: { id: userId } });
      // }

      console.log(`✓ Token FCM registrado: ${token.substring(0, 20)}...`);

      // Enviar notificación de bienvenida
      try {
        await firebaseService.sendWelcomeNotification(token);
      } catch (welcomeError) {
        console.warn('⚠️ Error enviando notificación de bienvenida:', welcomeError);
      }

      res.json({
        success: true,
        message: 'Token registrado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error registrando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error registrando token'
      });
    }
  }

  /**
   * Desregistrar token FCM
   */
  async unregisterToken(req: Request, res: Response): Promise<void> {
    try {
      const { token }: TokenRegistrationRequest = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token FCM requerido'
        });
        return;
      }

      // Aquí podrías eliminar el token de tu base de datos
      // Ejemplo:
      // await User.update({ fcmToken: null }, { where: { fcmToken: token } });

      console.log(`✓ Token FCM desregistrado: ${token.substring(0, 20)}...`);

      res.json({
        success: true,
        message: 'Token desregistrado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error desregistrando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error desregistrando token'
      });
    }
  }

  /**
   * Enviar notificación de prueba
   */
  async sendTestNotification(req: Request, res: Response): Promise<void> {
    try {
      const { token, topic } = req.body;

      if (!token && !topic) {
        res.status(400).json({
          success: false,
          message: 'Se requiere token o topic'
        });
        return;
      }

      const title = '🧪 Notificación de prueba';
      const message = 'Esta es una notificación de prueba del sistema de menú';
      const data = {
        type: 'test',
        product_id: '',
        product_title: 'test'
      };

      let messageId: string;

      if (token) {
        messageId = await firebaseService.sendTokenNotification({
          token,
          title,
          message,
          data
        });
      } else {
        messageId = await firebaseService.sendTopicNotification({
          topic,
          title,
          message,
          data
        });
      }

      res.json({
        success: true,
        message: 'Notificación de prueba enviada exitosamente',
        data: {
          messageId,
          title,
          target: token ? 'token' : `topic: ${topic}`
        }
      });

    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando notificación de prueba'
      });
    }
  }

  /**
   * Obtener estadísticas de notificaciones (placeholder)
   */
  async getNotificationStats(req: Request, res: Response): Promise<void> {
    try {
      // Aquí podrías implementar estadísticas desde tu base de datos
      const stats = {
        totalNotificationsSent: 0, // Obtener de BD
        activeTokens: 0, // Obtener de BD
        topicsAvailable: ['new_products', 'product_updates', 'menu_notifications'],
        lastNotificationSent: null // Obtener de BD
      };

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }
  }
}

// Exportar instancia del controlador
export const notificationController = new NotificationController();