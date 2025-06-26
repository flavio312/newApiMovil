import { Request, Response } from 'express';
import Menu from '../models/menu.models';
import googleDriveService from '../config/googleDrive';
import fs from 'fs';

// Obtener todos los menús
export const getMenu = async (req: Request, res: Response): Promise<any> => {
    try {
        const menus = await Menu.findAll();
        res.status(200).json({
            message: 'Menús obtenidos correctamente',
            data: menus
        });
    } catch (error) {
        console.error("Error al obtener menús:", error);
        res.status(500).json({
            message: "Error al obtener menús"
        });
    }
};

// Crear nuevo menú
export const createMenu = async (req: Request, res: Response): Promise<any> => {
    const { titulo, ingredientes, preparacion } = req.body;
    const file = req.file;

    console.log("=== CREAR MENÚ ===");
    console.log("Datos recibidos:", req.body);
    console.log("Archivo recibido:", file ? `${file.originalname} (${file.size} bytes)` : 'Sin archivo');

    // Validaciones
    if (!titulo || typeof titulo !== "string") {
        return res.status(400).json({ 
            message: "El campo 'titulo' es obligatorio y debe ser texto válido." 
        });
    }

    if (!ingredientes || typeof ingredientes !== "string") {
        return res.status(400).json({ 
            message: "El campo 'ingredientes' es obligatorio y debe ser texto válido." 
        });
    }

    if (!preparacion || typeof preparacion !== "string") {
        return res.status(400).json({ 
            message: "El campo 'preparacion' es obligatorio y debe ser texto válido." 
        });
    }

    const cleanPreparacion = preparacion.trim();
    let imageUrl: string | null = null;

    try {
        // Si hay archivo, subirlo a Google Drive
        if (file) {
            console.log("📤 Subiendo imagen a Google Drive...");
            
            imageUrl = await googleDriveService.uploadFile(
                file.path,
                `menu_${Date.now()}_${file.originalname}`,
                file.mimetype
            );

            // Eliminar archivo temporal
            fs.unlinkSync(file.path);
            console.log("🗑️ Archivo temporal eliminado");
        }

        // Crear el menú en la base de datos
        const newMenu = await Menu.create({
            titulo,
            ingredientes,
            preparacion: cleanPreparacion,
            imagen: imageUrl
        });

        const responseData = {
            action: "create",
            id: newMenu.id_Menu,
            titulo,
            ingredientes,
            preparacion: cleanPreparacion,
            imagen: imageUrl
        };

        res.status(201).json({
            message: 'Plato agregado correctamente',
            data: responseData
        });

        console.log("✅ Plato creado con éxito!");
        console.log("==================");

    } catch (error) {
        console.error("❌ Error al crear un platillo:", error);
        
        // Limpiar archivo temporal si existe
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        res.status(500).json({
            message: "Error al crear un platillo",
            error: process.env.NODE_ENV === 'development' ? error?.message : undefined
        });
    }
};

// Actualizar menú
export const updateMenu = async (req: Request, res: Response): Promise<any> => {
    const { id_Menu } = req.params;
    const { titulo, ingredientes, preparacion } = req.body;
    const file = req.file;

    console.log("=== ACTUALIZAR MENÚ ===");
    console.log("ID:", id_Menu);
    console.log("Datos:", req.body);
    console.log("Archivo:", file ? file.originalname : 'Sin archivo');

    try {
        // Buscar el menú existente
        const menu = await Menu.findByPk(id_Menu);
        
        if (!menu) {
            return res.status(404).json({
                message: 'Menú no encontrado'
            });
        }

        let imageUrl: string | null = menu.imagen;

        // Si hay un nuevo archivo, subir a Google Drive
        if (file) {
            console.log("📤 Subiendo nueva imagen...");
            
            // Eliminar imagen anterior de Google Drive si existe
            if (menu.imagen) {
                const oldFileId = googleDriveService.extractFileId(menu.imagen);
                if (oldFileId) {
                    try {
                        await googleDriveService.deleteFile(oldFileId);
                        console.log('🗑️ Imagen anterior eliminada de Google Drive');
                    } catch (error) {
                        console.warn('⚠️ Error al eliminar imagen anterior:', error);
                    }
                }
            }

            // Subir nueva imagen
            imageUrl = await googleDriveService.uploadFile(
                file.path,
                `menu_${Date.now()}_${file.originalname}`,
                file.mimetype
            );

            // Eliminar archivo temporal
            fs.unlinkSync(file.path);
        }

        // Actualizar los campos
        const updatedData: any = {};
        if (titulo !== undefined) updatedData.titulo = titulo;
        if (ingredientes !== undefined) updatedData.ingredientes = ingredientes;
        if (preparacion !== undefined) updatedData.preparacion = preparacion.trim();
        if (imageUrl !== menu.imagen) updatedData.imagen = imageUrl;

        await menu.update(updatedData);

        const responseData = {
            action: "update",
            id: menu.id_Menu,
            titulo: menu.titulo,
            ingredientes: menu.ingredientes,
            preparacion: menu.preparacion,
            imagen: menu.imagen
        };

        res.status(200).json({
            message: 'Plato actualizado correctamente',
            data: responseData
        });

        console.log("✅ Plato actualizado!");
        console.log("======================");

    } catch (error) {
        console.error("❌ Error al actualizar:", error);
        
        // Limpiar archivo temporal si existe
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        res.status(500).json({
            message: "Error al actualizar el platillo",
            error: process.env.NODE_ENV === 'development' ? error?.message : undefined
        });
    }
};

// Eliminar menú
export const deleteMenu = async (req: Request, res: Response): Promise<any> => {
    const { id_Menu } = req.params;

    console.log("=== ELIMINAR MENÚ ===");
    console.log("ID:", id_Menu);

    try {
        // Buscar el menú
        const menu = await Menu.findByPk(id_Menu);
        
        if (!menu) {
            return res.status(404).json({
                message: 'Menú no encontrado'
            });
        }

        // Eliminar imagen de Google Drive si existe
        if (menu.imagen) {
            const fileId = googleDriveService.extractFileId(menu.imagen);
            if (fileId) {
                try {
                    await googleDriveService.deleteFile(fileId);
                    console.log('🗑️ Imagen eliminada de Google Drive');
                } catch (error) {
                    console.warn('⚠️ Error al eliminar imagen:', error);
                }
            }
        }

        // Eliminar el menú de la base de datos
        await menu.destroy();

        res.status(200).json({
            message: 'Menú eliminado correctamente'
        });

        console.log("✅ Menú eliminado!");
        console.log("====================");

    } catch (error) {
        console.error('❌ Error al eliminar:', error);
        res.status(500).json({
            message: 'Error al eliminar el menú',
            error: process.env.NODE_ENV === 'development' ? error?.message : undefined
        });
    }
};