import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const PostedFlyer = sequelize.define('PostedFlyer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  flyerData: { type: DataTypes.JSON, allowNull: false },
  previewImageUrl: { type: DataTypes.TEXT, allowNull: false }, // NEW FIELD
  imageData: { type: DataTypes.TEXT('long'), allowNull: false }, // legacy, not used
  imageCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSize: { type: DataTypes.BIGINT, defaultValue: 0 },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
});

export default PostedFlyer; 