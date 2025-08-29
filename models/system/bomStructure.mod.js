import {DataTypes} from "sequelize";
import db from "../../config/database.js";
import BomTemplateModel from "./bomTemplate.mod.js";
import {ModelOrderPOHeader} from "../orderManagement/orderManagement.mod.js";
import Users from "../setup/users.mod.js";
import MasterItemIdModel from "./masterItemId.mod.js";
import {ModelVendorDetail} from "./VendorDetail.mod.js";
import MasterCompanyModel from "../setup/company.mod.js";
import SizeChartMod from "./sizeChart.mod.js";
import ColorChartMod from "./colorChart.mod.js";
import {OrderPoListing} from "../production/order.mod.js";
import BomTemplateListModel from "./bomTemplateList.mod.js";
import MasterItemDimensionModel from "./masterItemDimention.mod.js";

export const BomStructureRevModel = db.define("bom_structure_rev", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    TITLE: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    DESCRIPTION: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    BOM_STRUCTURE_ID: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    SEQUENCE: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    CREATED_AT: {
        type: DataTypes.DATE,
    },
    UPDATED_AT: {
        type: DataTypes.DATE,
        allowNull: true
    },
    DELETED_AT: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'bom_structure_rev',
    timestamps: false,
})

const BomStructureModel = db.define(
    "bom_structure",
    {
        ID: {
            type: DataTypes.STRING(15),
            primaryKey: true,
            allowNull: false,
        },
        LAST_REV_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        IS_NOT_ALLOW_REVISION: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        STATUS_STRUCTURE: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        BOM_TEMPLATE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ORDER_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        COMPANY_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "bom_structure",
        timestamps: false,
    }
)


export const BomStructureListModel = db.define(
    'bom_structure_list',
    {
        ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        COMPANY_ID: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        REV_ID: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        BOM_LINE_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        STATUS: {
            type: DataTypes.ENUM('Confirmed', 'Canceled', 'Deleted', 'Open'),
            allowNull: true,
        },
        BOM_STRUCTURE_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        MASTER_ITEM_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        STANDARD_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        INTERNAL_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        BOOKING_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        PRODUCTION_CONSUMPTION_PER_ITEM: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        EXTRA_BOOKS: {
            type: DataTypes.DOUBLE,
            defaultValue: 0,
            allowNull: true,
        },
        IS_SPLIT_COLOR: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        IS_SPLIT_SIZE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        IS_SPLIT_NO_PO: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        VENDOR_ID: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ITEM_POSITION: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        NOTE: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        IS_SPLIT_STATUS: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        IS_ACTIVE: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        CREATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CREATED_AT: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        UPDATED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        UPDATED_ID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        IS_DELETED: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },
        DELETED_AT: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        CONSUMPTION_UOM: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    },
    {
        tableName: 'bom_structure_list',
        timestamps: false,
    }
);

export const BomStructureNoteModel = db.define("bom_structure_notes", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    REV_ID: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    NOTE: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    BOM_STRUCTURE_ID: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    IS_BOM_CONFIRMATION: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: "bom_structure_notes",
    timestamps: false
})


export const BomStructureSizeModel = db.define("bom_structure_size", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    BOM_STRUCTURE_ID: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    SIZE_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    REV_ID: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
    }
}, {
    tableName: 'bom_structure_size',
    timestamps: false,
});
BomStructureSizeModel.belongsTo(SizeChartMod, {
    foreignKey: "SIZE_ID",
    as: "SIZE"
})


export const BomStructureColorModel = db.define("bom_structure_color", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    BOM_STRUCTURE_ID: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    COLOR_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    REV_ID: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
    }
}, {
    tableName: 'bom_structure_color',
    timestamps: false,
});

export const BomStructureListDetailModel = db.define("bom_structure_list_detail", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    BOM_STRUCTURE_LIST_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ITEM_SPLIT_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ORDER_PO_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    COLOR_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    SIZE_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    ITEM_DIMENSION_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ORDER_QUANTITY: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    STANDARD_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    INTERNAL_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    BOOKING_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    PRODUCTION_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    EXTRA_BOOKS: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    MATERIAL_ITEM_REQUIREMENT_QUANTITY: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    EXTRA_REQUIRE_QUANTITY: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    TOTAL_EXTRA_PURCHASE_PLAN: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    IS_BOOKING: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
    },
    EXTRA_APPROVAL_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    CREATED_AT: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    CREATED_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    UPDATED_AT: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    UPDATED_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'bom_structure_list_detail',
    timestamps: false,
});

export const BomStructurePendingDimension = db.define("bom_structure_pending_dimension", {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    BOM_STRUCTURE_LIST_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    SIZE_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    COLOR_ID: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    ORDER_PO_ID: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    ORDER_QUANTITY: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    MATERIAL_ITEM_REQUIREMENT_QTY: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        allowNull: true,
    },
    TOTAL_EXTRA_PURCHASE_PLAN_PERCENT: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        allowNull: true,
    },
    EXTRA_APPROVAL_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ITEM_DIMENSION_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    STANDARD_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    INTERNAL_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    BOOKING_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    PRODUCTION_CONSUMPTION_PER_ITEM: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    EXTRA_REQUIRE_QTY: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    EXTRA_BOOKS: {
        type: DataTypes.DOUBLE,
        allowNull: true,
    },
    CREATED_AT: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
    },
    IS_BOOKING: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
    }
}, {
    tableName: 'bom_structure_pending_dimension',
    timestamps: false,
});

BomStructurePendingDimension.belongsTo(BomStructureListModel, {
    foreignKey: 'BOM_STRUCTURE_LIST_ID',
    as: 'BOM_STRUCTURE_LIST',
});

BomStructurePendingDimension.belongsTo(ColorChartMod, {
    foreignKey: 'COLOR_ID',
    targetKey: 'COLOR_ID',
    as: 'COLOR',
});

BomStructurePendingDimension.belongsTo(SizeChartMod, {
    foreignKey: 'SIZE_ID',
    targetKey: 'SIZE_ID',
    as: 'SIZE',
});

BomStructurePendingDimension.belongsTo(MasterItemDimensionModel, {
    foreignKey: 'ITEM_DIMENSION_ID',
    as: 'ITEM_DIMENSION',
});

BomStructurePendingDimension.belongsTo(OrderPoListing, {
    foreignKey: "ORDER_PO_ID",
    as: "ORDER_PO"
})

BomStructureListDetailModel.belongsTo(BomStructureListModel, {
    foreignKey: 'BOM_STRUCTURE_LIST_ID',
    as: 'BOM_STRUCTURE_LIST',
});

BomStructureListDetailModel.belongsTo(ColorChartMod, {
    foreignKey: 'COLOR_ID',
    targetKey: 'COLOR_ID',
    as: 'COLOR',
});

BomStructureListDetailModel.belongsTo(SizeChartMod, {
    foreignKey: 'SIZE_ID',
    targetKey: 'SIZE_ID',
    as: 'SIZE',
});

BomStructureListDetailModel.belongsTo(MasterItemDimensionModel, {
    foreignKey: 'ITEM_DIMENSION_ID',
    as: 'ITEM_DIMENSION',
});

BomStructureColorModel.belongsTo(ColorChartMod, {
    foreignKey: "COLOR_ID",
    as: "COLOR"
})


BomStructureModel.belongsTo(BomStructureRevModel, {
    foreignKey: "LAST_REV_ID",
    as: "REV"
})

BomStructureModel.belongsTo(BomTemplateModel, {
    foreignKey: "BOM_TEMPLATE_ID",
    as: "BOM_TEMPLATE"
})

BomStructureModel.belongsTo(ModelOrderPOHeader, {
    foreignKey: "ORDER_ID",
    as: "ORDER"
})

BomStructureModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

BomStructureModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})

BomStructureListModel.belongsTo(BomStructureModel, {
    foreignKey: "BOM_STRUCTURE_ID",
    as: "BOM_STRUCTURE"
})

BomStructureListModel.belongsTo(MasterItemIdModel, {
    foreignKey: "MASTER_ITEM_ID",
    as: "MASTER_ITEM"
})

BomStructureListModel.belongsTo(ModelVendorDetail, {
    foreignKey: "VENDOR_ID",
    as: "VENDOR"
})

BomStructureListModel.belongsTo(MasterCompanyModel, {
    foreignKey: "COMPANY_ID",
    as: "COMPANY"
})

BomStructureListModel.belongsTo(Users, {
    foreignKey: "CREATED_ID",
    as: "CREATED"
})

BomStructureListModel.belongsTo(Users, {
    foreignKey: "UPDATED_ID",
    as: "UPDATED"
})

BomStructureNoteModel.belongsTo(BomStructureModel, {
    foreignKey: "BOM_STRUCTURE_ID",
    as: "BOM_STRUCTURE"
})


export default BomStructureModel;