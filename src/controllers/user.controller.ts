import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.models";
import dotenv from 'dotenv';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
        console.log('Usuarios encontrados');
    } catch (error) {
        res.status(500).json({ message: "Usuarios no encontrados" });
    }
};

export const createUser = async (req:Request, res:Response):Promise<any>=>{
    const {name, email, password} = req.body;
    
    dotenv.config();

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios: name, email o password" });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        const message = {
            action: 'create',
            id: newUser.getDataValue('id_User'),
            name,
            email,
            hashedPassword
        }

        const secretKey = process.env.JWT_SECRET || '';
        const token = jwt.sign({ id: newUser.getDataValue('id_User') }, secretKey, {
            expiresIn: '1h',
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            data: newUser,
            token
        });
        console.log("Usuario creado con éxito:", message);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el usuario" });
        console.log(error);
    }
};

export const deleteUser = async (req:Request, res:Response):Promise<void> =>{
    const {id} = req.params;  

    try {

    const deletedRows = await User.destroy({ where: { id_User: id } });

    if (deletedRows === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }


    const message = {
      action: 'delete',
      id
    };

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const updateUser = async (req:Request, res:Response):Promise<any> =>{
    const {id} = req.params;
    const {name, email, password} = req.body;

    try{
        const saltRounds = 10;
        let hashedPassword = password;
        if(password){
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        const [affectedRows] = await User.update(
            {name, email, password:hashedPassword},
            {where: {id_User:id}}
        )

        if(affectedRows ===0){
            return res.status(404).json({message:"Usuario no encontrado"})
        }

        const message = {
            action: 'update',
            id,
            name,
            email,
            hashedPassword
        }
        res.json({
            message: "Usuario actualizado correctamente",
            data:{id, name}
        });
    }catch(error){
        res.status(500).json({message:"Error al actualizar el usuario: ",error});
    }
};