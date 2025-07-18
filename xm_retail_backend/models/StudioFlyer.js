import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import StudioUser from './StudioUser.js';

const StudioFlyer = sequelize.define('StudioFlyer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: StudioUser, key: 'id' }, onDelete: 'CASCADE' },
  title: { type: DataTypes.STRING },
  flyerData: { type: DataTypes.JSON, allowNull: false },
  imageData: { type: DataTypes.TEXT('long') }, // base64 flyer image (legacy)
  previewImageUrl: { type: DataTypes.TEXT, allowNull: false }, // Cloudinary URL
}, {});

StudioFlyer.belongsTo(StudioUser, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudioUser.hasMany(StudioFlyer, { foreignKey: 'userId', onDelete: 'CASCADE' });

export default StudioFlyer; 