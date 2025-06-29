import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createMenu, deleteMenu, getMenu, getMenuById, updateMenu } from "../controllers/menu.controller";

const router = express.Router();

// Crear directorio temporal si no existe
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `menu-${uniqueSuffix}${extension}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    }
});

// Rutas
router.get("/menu/:id_Menu", getMenuById);
router.get("/menu", getMenu);
router.post("/plato", upload.single('imagen'), createMenu);
router.delete("/plato/:id_Menu", deleteMenu);
router.put("/plato/:id_Menu", upload.single('imagen'), updateMenu);


export default router;