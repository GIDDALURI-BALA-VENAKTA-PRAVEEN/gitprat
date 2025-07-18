import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const StudioUser = sequelize.define('StudioUser', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: true },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
}, {});

export default StudioUser; 