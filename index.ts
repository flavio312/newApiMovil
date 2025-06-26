import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './src/routes/user.routes';
import loginRouter from './src/routes/login.routes';
import foodRouter from './src/routes/food.routes'
import sequelize from './src/config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || '';

app.use(cors());
app.use(express.json());
app.use('/api', router, loginRouter, foodRouter);

(async () => {
    try {
        await sequelize.sync({alter:true});
        console.log('Conexión a la base de datos exitosa');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
})();