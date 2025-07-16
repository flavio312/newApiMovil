import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

// Atributos del modelo
interface PlatilloAttributes {
  id: number;
  titulo: string;
  ingredientes: string;
  preparacion: string;
  imagen_url?: string;
  imagen_public_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Atributos opcionales para la creación
interface PlatilloCreationAttributes extends Optional<PlatilloAttributes, 'id' | 'created_at' | 'updated_at'> {}

// Modelo Sequelize
class Platillo extends Model<PlatilloAttributes, PlatilloCreationAttributes> implements PlatilloAttributes {
  public id!: number;
  public titulo!: string;
  public ingredientes!: string;
  public preparacion!: string;
  public imagen_url?: string;
  public imagen_public_id?: string;
  
  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// Definir el modelo
Platillo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El título no puede estar vacío'
        },
        len: {
          args: [1, 255],
          msg: 'El título debe tener entre 1 y 255 caracteres'
        }
      }
    },
    ingredientes: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Los ingredientes no pueden estar vacíos'
        }
      }
    },
    preparacion: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La preparación no puede estar vacía'
        }
      }
    },
    imagen_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida'
        }
      }
    },
    imagen_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize,
    tableName: 'platillos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'titulo_index',
        fields: ['titulo']
      },
      {
        name: 'created_at_index',
        fields: ['created_at']
      }
    ]
  }
);

export default Platillo;