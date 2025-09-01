import {MasterItemTypes} from "../setup/ItemTypes.mod.js";
import {DataTypes} from "sequelize";
import db from "../../config/database.js";


const MasterExtraPurchaseLimit = db.define("master_extra_purchase_limit", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ITEM_TYPE_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MasterItemTypes,
            key: "ITEM_TYPE_ID"
        }
    },
    EXTRA_PURCHASING_LIMIT: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    }
}, {
    tableName: "master_extra_purchase_limit",
    timestamps: false,
    freezeTableName: true
});

MasterExtraPurchaseLimit.belongsTo(MasterItemTypes, {
    foreignKey: "ITEM_TYPE_ID",
    as: "ITEM_TYPE",
});

export default MasterExtraPurchaseLimit
