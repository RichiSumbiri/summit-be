import { DataTypes } from "sequelize";
import db from "../../config/database.js";


export const ModelFOBPoint = db.define('master_fob_point', {
    FOB_POINT_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    FOB_POINT_CODE: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    FOB_POINT_DESC: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'master_fob_point',
    timestamps: false
  });