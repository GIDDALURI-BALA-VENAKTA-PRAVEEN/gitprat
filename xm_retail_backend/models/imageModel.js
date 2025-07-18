import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Image = sequelize.define("Image", {
  data: {
    type: DataTypes.BLOB("long"),
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
