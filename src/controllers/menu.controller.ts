import { Response } from 'express';
import { cloudinaryService } from '../services/cloudinary.service';
import { firebaseService } from '../services/firebase.service'; // ← NUEVO IMPORT
import Platillo from '../models/menu.models';
import { 
  MulterRequest, 
  ApiResponse, 
  PlatilloResponse, 
  Platillo as PlatilloType,
  PlatilloCreateRequest,
  PlatilloUpdateRequest 
} from '../types';
import { ValidationError, DatabaseError } from 'sequelize';

export class MenuController {
  
  /**
   * Crear un nuevo platillo
   */
  async crearPlatillo(req: MulterRequest, res: Response<ApiResponse<PlatilloResponse>>): Promise<void> {
    try {
      console.log('=== CREAR MENÚ ===');
      console.log('Datos recibidos:', req.body);
      
      // Validar que se recibió un archivo
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se recibió ninguna imagen'
        });
        return;
      }

      console.log(`Archivo recibido: ${req.file.originalname} (${req.file.size} bytes)`);

      // Extraer y validar datos del formulario
      const { titulo, ingredientes, preparacion }: PlatilloCreateRequest = req.body;

      // Validar campos requeridos
      if (!titulo || !ingredientes || !preparacion) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: titulo, ingredientes, preparacion'
        });
        return;
      }

      // Subir imagen a Cloudinary
      console.log('📤 Subiendo imagen a Cloudinary...');
      
      const imageResult = await cloudinaryService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        {
          folder: 'menu-restaurante',
          tags: ['menu', 'platillo', titulo.toLowerCase().replace(/\s+/g, '-')],
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        }
      );

      console.log('✓ Imagen subida exitosamente:', imageResult.url);

      // Crear platillo en base de datos usando Sequelize
      const nuevoPlatillo = await Platillo.create({
        titulo,
        ingredientes,
        preparacion,
        imagen_url: imageResult.url,
        imagen_public_id: imageResult.publicId
      });

      console.log('✓ Platillo creado exitosamente en la base de datos');

      // ← NUEVO: Enviar push notification de nuevo platillo
      try {
        console.log('📱 Enviando push notifications...');
        await firebaseService.sendProductAddedNotification(nuevoPlatillo);
        console.log('✓ Push notifications enviadas exitosamente');
      } catch (notificationError) {
        console.warn('⚠️ Error enviando push notifications (no crítico):', notificationError);
        // No fallar la creación del platillo si falla la notificación
      }

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        message: 'Platillo creado exitosamente',
        data: {
          id: nuevoPlatillo.id,
          titulo: nuevoPlatillo.titulo,
          ingredientes: nuevoPlatillo.ingredientes,
          preparacion: nuevoPlatillo.preparacion,
          imagen: {
            url: imageResult.url,
            publicId: imageResult.publicId,
            width: imageResult.width,
            height: imageResult.height,
            format: imageResult.format,
            size: imageResult.bytes
          }
        }
      });

    } catch (error) {
      console.error('❌ Error al crear platillo:', error);
      
      // Manejar errores de validación de Sequelize
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          error: error.errors.map(err => err.message).join(', ')
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Crear platillo sin imagen (para app móvil offline)
   */
  async crearPlatilloSinImagen(req: MulterRequest, res: Response<ApiResponse<PlatilloType>>): Promise<void> {
    try {
      console.log('=== CREAR MENÚ SIN IMAGEN ===');
      console.log('Datos recibidos:', req.body);

      // Extraer y validar datos del formulario
      const { titulo, ingredientes, preparacion }: PlatilloCreateRequest = req.body;

      // Validar campos requeridos
      if (!titulo || !ingredientes || !preparacion) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: titulo, ingredientes, preparacion'
        });
        return;
      }

      // Crear platillo en base de datos sin imagen
      const nuevoPlatillo = await Platillo.create({
        titulo,
        ingredientes,
        preparacion,
        imagen_url: null,
        imagen_public_id: null
      });

      console.log('✓ Platillo sin imagen creado exitosamente en la base de datos');

      // ← NUEVO: Enviar push notification
      try {
        console.log('📱 Enviando push notifications...');
        await firebaseService.sendProductAddedNotification(nuevoPlatillo);
        console.log('✓ Push notifications enviadas exitosamente');
      } catch (notificationError) {
        console.warn('⚠️ Error enviando push notifications (no crítico):', notificationError);
      }

      // Respuesta exitosa
      res.status(201).json({
        success: true,
        message: 'Platillo creado exitosamente',
        data: nuevoPlatillo
      });

    } catch (error) {
      console.error('❌ Error al crear platillo sin imagen:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          error: error.errors.map(err => err.message).join(', ')
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  }

  /**
   * Actualizar un platillo
   */
  async actualizarPlatillo(req: MulterRequest, res: Response<ApiResponse<PlatilloType>>): Promise<void> {
    try {
      const { id } = req.params;
      const { titulo, ingredientes, preparacion }: PlatilloUpdateRequest = req.body;

      // Buscar el platillo existente
      const platilloExistente = await Platillo.findByPk(id);

      if (!platilloExistente) {
        res.status(404).json({
          success: false,
          message: 'Platillo no encontrado'
        });
        return;
      }

      // Objeto para actualizar
      const updateData: any = {
        titulo: titulo || platilloExistente.titulo,
        ingredientes: ingredientes || platilloExistente.ingredientes,
        preparacion: preparacion || platilloExistente.preparacion
      };

      // Si se envió una nueva imagen, subirla y actualizar
      if (req.file) {
        console.log(`📤 Subiendo nueva imagen: ${req.file.originalname}`);
        
        const imageResult = await cloudinaryService.uploadImage(
          req.file.buffer,
          req.file.originalname,
          {
            folder: 'menu-restaurante',
            tags: ['menu', 'platillo', (titulo || platilloExistente.titulo).toLowerCase().replace(/\s+/g, '-')]
          }
        );

        // Eliminar imagen anterior de Cloudinary
        if (platilloExistente.imagen_public_id) {
          await cloudinaryService.deleteImage(platilloExistente.imagen_public_id);
        }

        updateData.imagen_url = imageResult.url;
        updateData.imagen_public_id = imageResult.publicId;
      }

      // Actualizar usando Sequelize
      const platilloActualizado = await platilloExistente.update(updateData);

      console.log('✓ Platillo actualizado exitosamente');

      // ← NUEVO: Enviar push notification de actualización
      try {
        console.log('📱 Enviando push notifications de actualización...');
        await firebaseService.sendProductUpdatedNotification(platilloActualizado);
        console.log('✓ Push notifications de actualización enviadas exitosamente');
      } catch (notificationError) {
        console.warn('⚠️ Error enviando push notifications (no crítico):', notificationError);
      }

      // Respuesta exitosa con el platillo actualizado
      res.json({
        success: true,
        message: 'Platillo actualizado exitosamente',
        data: platilloActualizado
      });

    } catch (error) {
      console.error('❌ Error actualizando platillo:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          error: error.errors.map(err => err.message).join(', ')
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error actualizando platillo'
      });
    }
  }

  /**
   * Actualizar platillo sin imagen (para app móvil)
   */
  async actualizarPlatilloSinImagen(req: MulterRequest, res: Response<ApiResponse<PlatilloType>>): Promise<void> {
    try {
      const { id } = req.params;
      const { titulo, ingredientes, preparacion }: PlatilloUpdateRequest = req.body;

      // Buscar el platillo existente
      const platilloExistente = await Platillo.findByPk(id);

      if (!platilloExistente) {
        res.status(404).json({
          success: false,
          message: 'Platillo no encontrado'
        });
        return;
      }

      // Actualizar campos
      const updateData = {
        titulo: titulo || platilloExistente.titulo,
        ingredientes: ingredientes || platilloExistente.ingredientes,
        preparacion: preparacion || platilloExistente.preparacion
      };

      const platilloActualizado = await platilloExistente.update(updateData);

      console.log('✓ Platillo actualizado sin imagen exitosamente');

      // ← NUEVO: Enviar push notification
      try {
        await firebaseService.sendProductUpdatedNotification(platilloActualizado);
      } catch (notificationError) {
        console.warn('⚠️ Error enviando push notifications:', notificationError);
      }

      res.json({
        success: true,
        message: 'Platillo actualizado exitosamente',
        data: platilloActualizado
      });

    } catch (error) {
      console.error('❌ Error actualizando platillo sin imagen:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Error de validación',
          error: error.errors.map(err => err.message).join(', ')
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error actualizando platillo'
      });
    }
  }

  // ← RESTO DE MÉTODOS MANTIENEN SU IMPLEMENTACIÓN ORIGINAL

  /**
   * Obtener todos los platillos
   */
  async obtenerPlatillos(req: MulterRequest, res: Response<ApiResponse<PlatilloType[]>>): Promise<void> {
    try {
      const platillos = await Platillo.findAll({
        order: [['created_at', 'DESC']],
        attributes: [
          'id', 
          'titulo', 
          'ingredientes', 
          'preparacion', 
          'imagen_url', 
          'imagen_public_id', 
          'created_at',
          'updated_at'
        ]
      });

      res.json({
        success: true,
        message: 'Platillos obtenidos exitosamente',
        data: platillos
      });

    } catch (error) {
      console.error('❌ Error obteniendo platillos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo platillos'
      });
    }
  }

  /**
   * Obtener un platillo por ID
   */
  async obtenerPlatilloPorId(req: MulterRequest, res: Response<ApiResponse<PlatilloType>>): Promise<void> {
    try {
      const { id } = req.params;

      const platillo = await Platillo.findByPk(id, {
        attributes: [
          'id', 
          'titulo', 
          'ingredientes', 
          'preparacion', 
          'imagen_url', 
          'imagen_public_id', 
          'created_at',
          'updated_at'
        ]
      });

      if (!platillo) {
        res.status(404).json({
          success: false,
          message: 'Platillo no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Platillo obtenido exitosamente',
        data: platillo
      });

    } catch (error) {
      console.error('❌ Error obteniendo platillo:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo platillo'
      });
    }
  }

  /**
   * Eliminar un platillo
   */
  async eliminarPlatillo(req: MulterRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;

      // Buscar el platillo
      const platillo = await Platillo.findByPk(id);

      if (!platillo) {
        res.status(404).json({
          success: false,
          message: 'Platillo no encontrado'
        });
        return;
      }

      // Eliminar imagen de Cloudinary si existe
      if (platillo.imagen_public_id) {
        await cloudinaryService.deleteImage(platillo.imagen_public_id);
      }

      // Eliminar de la base de datos
      await platillo.destroy();

      console.log('✓ Platillo eliminado exitosamente');

      res.json({
        success: true,
        message: 'Platillo eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando platillo:', error);
      res.status(500).json({
        success: false,
        message: 'Error eliminando platillo'
      });
    }
  }

  /**
   * Buscar platillos por título
   */
  async buscarPlatillos(req: MulterRequest, res: Response<ApiResponse<PlatilloType[]>>): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Parámetro de búsqueda requerido'
        });
        return;
      }

      const platillos = await Platillo.findAll({
        where: {
          titulo: {
            [require('sequelize').Op.like]: `%${q}%`
          }
        },
        order: [['created_at', 'DESC']],
        attributes: [
          'id', 
          'titulo', 
          'ingredientes', 
          'preparacion', 
          'imagen_url', 
          'imagen_public_id', 
          'created_at',
          'updated_at'
        ]
      });

      res.json({
        success: true,
        message: `Se encontraron ${platillos.length} platillos`,
        data: platillos
      });

    } catch (error) {
      console.error('❌ Error buscando platillos:', error);
      res.status(500).json({
        success: false,
        message: 'Error buscando platillos'
      });
    }
  }
}

// Exportar instancia del controlador
export const menuController = new MenuController();