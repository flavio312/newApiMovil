import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { firebaseService } from './src/services/firebase.service';
import router from './src/routes/user.routes';
import loginRouter from './src/routes/login.routes';
import foodRouter from './src/routes/food.routes'
import notificationRouter from './src/routes/notification.routes';
import sequelize from './src/config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || '';

try {
  firebaseService.initializeFirebase();
  console.log('🚀 Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
    process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use('/api', router, foodRouter,notificationRouter);
app.use('/auth', loginRouter);

(async () => {
    try {
        await sequelize.sync({alter:true});
        console.log('Conexión a la base de datos exitosa');
        // Ruta de prueba para verificar que el servidor funciona
        app.get('/', (req, res) => {
        res.json({ 
            message: 'Api version 1.1.2',
            status: 'OK', 
            timestamp: new Date().toISOString(),
            firebase: firebaseService ? 'initialized' : 'not initialized'
        });
        });

        // Middleware de manejo de errores
        app.use((error: any, req: any, res: any, next: any) => {
        console.error('Error no manejado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
        });

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`📱 Push notifications habilitadas`);
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
})();