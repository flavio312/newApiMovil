import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';
import { upload } from '../services/cloudinary.service';

const router = Router();

// Ruta para buscar platillos (debe ir antes de /:id)
router.get('/platillos/buscar', menuController.buscarPlatillos.bind(menuController));

// Ruta para crear un nuevo platillo (con imagen)
router.post('/platillos', upload.single('imagen'), menuController.crearPlatillo.bind(menuController));

// Ruta para obtener todos los platillos
router.get('/platillos', menuController.obtenerPlatillos.bind(menuController));

// Ruta para obtener un platillo por ID
router.get('/platillos/:id', menuController.obtenerPlatilloPorId.bind(menuController));

// Ruta para actualizar un platillo (con o sin imagen)
router.put('/platillos/:id', upload.single('imagen'), menuController.actualizarPlatillo.bind(menuController));

// Ruta para eliminar un platillo
router.delete('/platillos/:id', menuController.eliminarPlatillo.bind(menuController));

export default router;