import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Menu extends Model {
    public id_Menu!: number;
    public titulo!: string;
    public ingredientes!: string;
    public preparacion!: string;
    public imagen!: string | null;
}

Menu.init({
    id_Menu: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ingredientes: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    preparacion: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    imagen: {
        type: DataTypes.TEXT, // Para almacenar la URL de Google Drive
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Menu',
    tableName: 'Menu',
    timestamps: false,
});

export default Menu;