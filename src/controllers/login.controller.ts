import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import User from '../models/user.models';
import dotenv from 'dotenv';

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  dotenv.config();
    const { email, password } = req.body;
  
    try {
      console.log('Email recibido:', email);
  
      const user = await User.findOne({ where: { email } });
      if (!user) {
        console.log('Usuario no encontrado');
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      console.log('Contraseña cifrada almacenada:', user.getDataValue('password'));
  
      const isMatch = await bcrypt.compare(password, user.getDataValue('password'));
      if (!isMatch) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ message: 'Contraseña incorrecta' });
      }
  
      const secretKey = process.env.JWT_SECRET || '';
      const token = jwt.sign(
        {
          id: user.getDataValue('id_Usuario'),
          name: user.getDataValue('name'),
        },
        secretKey,
        { expiresIn: '1h' }
      );
  
      console.log('Token generado:', token);
  
      res.json({
        message: 'Inicio de sesión exitoso',
        token,

      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  };