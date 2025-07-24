import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';

const router = Router();

// Ruta para enviar notificación a un topic
router.post('/notifications/topic', notificationController.sendTopicNotification.bind(notificationController));

// Ruta para enviar notificación a un token específico
router.post('/notifications/token', notificationController.sendTokenNotification.bind(notificationController));

// Ruta para registrar token FCM
router.post('/notifications/register-token', notificationController.registerToken.bind(notificationController));

// Ruta para desregistrar token FCM
router.delete('/notifications/unregister-token', notificationController.unregisterToken.bind(notificationController));

// Ruta para enviar notificación de prueba
router.post('/notifications/test', notificationController.sendTestNotification.bind(notificationController));

// Ruta para obtener estadísticas de notificaciones
router.get('/notifications/stats', notificationController.getNotificationStats.bind(notificationController));

export default router;