import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define("Users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "New",
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "User",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: {
        msg: "Please enter a valid email address",
        args: true
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: {
        args: [10, 15],
        msg: "Phone number must be between 10 and 15 digits"
      }
    }
  },
  pincode: {
    type: DataTypes.STRING(6),
    allowNull: true,
    validate: {
      len: {
        args: [6, 6],
        msg: "Pincode must be exactly 6 characters"
      }
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['email'],
      where: {
        email: {
          [Sequelize.Op.ne]: null
        }
      }
    },
    {
      unique: true,
      fields: ['phone'],
      where: {
        phone: {
          [Sequelize.Op.ne]: null
        }
      }
    }
  ],
  validate: {
    eitherEmailOrPhone() {
      if (!this.email && !this.phone) {
        throw new Error('Either email or phone must be provided');
      }
    }
  }
});