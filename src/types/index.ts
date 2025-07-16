import { Request } from 'express';

// Tipos para Cloudinary
export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  fileName: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  tags?: string[];
  transformation?: any[];
}

export interface CloudinaryDeleteResult {
  success: boolean;
  result: string;
}

// Tipos para el menú/platillo
export interface Platillo {
  id?: number;
  titulo: string;
  ingredientes: string;
  preparacion: string;
  imagen_url?: string;
  imagen_public_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlatilloCreateRequest {
  titulo: string;
  ingredientes: string;
  preparacion: string;
}

export interface PlatilloUpdateRequest extends Partial<PlatilloCreateRequest> {}

// Extender Request de Express para incluir file
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PlatilloResponse {
  id: number;
  titulo: string;
  ingredientes: string;
  preparacion: string;
  imagen: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

// Configuración de Cloudinary
export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
} 