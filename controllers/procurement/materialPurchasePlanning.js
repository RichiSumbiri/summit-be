import moment from "moment";
import {
    PurchaseOrderModel,
    PurchaseOrderNotesModel
} from "../../models/procurement/purchaseOrder.mod.js";
import PurchaseOrderDetailModel from "../../models/procurement/purchaseOrderDetail.mod.js";
import { BomStructureSourcingDetail } from "../../models/materialManagement/bomStructure/bomStructure.mod.js";




export const postMaterialPurchaseOrder = async(req,res) => {
    try {
        const { DataMPO } = req.body;
        let mpo_number = 0;

        if(DataMPO.MPO_ID===''){
            // check latest number of mpo
            const LatestMPO = await PurchaseOrderModel.findAll({ order: [['MPO_ID', 'DESC']], limit:1, raw: true });
            const newIncrement = LatestMPO.length===0 ? '0000001': parseInt(LatestMPO[0].MPO_ID.slice(-7)) + 1;
            const MPOID = `MPO${newIncrement.toString().padStart(7, '0')}`;

            // create header mpo
            await PurchaseOrderModel.create({
                MPO_ID: MPOID,
                REV_ID: 0,
                MPO_DATE: DataMPO.MPO_DATE,
                VENDOR_ID: DataMPO.VENDOR_DETAIL.VENDOR_ID,
                VENDOR_DETAIL: JSON.stringify(DataMPO.VENDOR_DETAIL),
                VENDOR_SHIPPER_LOCATION_ID: DataMPO.VENDOR_SHIPPER_LOCATION_ID,
                COMPANY_ID: DataMPO.INVOICE_COMPANY_ID ? DataMPO.INVOICE_COMPANY_ID : 'SBR',
                INVOICE_DETAIL: JSON.stringify(DataMPO.INVOICE_DETAIL),
                INVOICE_UNIT_ID: DataMPO.INVOICE_UNIT_ID,
                DELIVERY_UNIT_ID: DataMPO.DELIVERY_UNIT_ID,
                CURRENCY_CODE: DataMPO.CURRENCY_CODE,
                MOQ_VALIDATION_STATUS: DataMPO.MOQ_VALIDATION_STATUS,
                SURCHARGE_AMOUNT: DataMPO.SURCHARGE_AMOUNT,
                RECEIPT_STATUS: 'Not Completed',
                TAX_PERCENTAGE: DataMPO.TAX_PERCENTAGE,
                CREATE_BY: DataMPO.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            });

            await PurchaseOrderNotesModel.create({
                PURCHASE_ORDER_ID: MPOID,
                REV_ID: 0,
                MPO_STATUS: 'Open',
                IS_ACTIVE: true,
                MPO_ETD: DataMPO.DELIVERY_ETD_DATE,
                MPO_ETA: DataMPO.DELIVERY_ETA_DATE,
                DELIVERY_MODE_CODE: DataMPO.DELIVERY_MODE_CODE,
                DELIVERY_TERM: DataMPO.DELIVERY_TERM,
                COUNTRY_ID: DataMPO.COUNTRY_ID,
                PORT_DISCHARGE: DataMPO.DELIVERY_PORT_DISCHARGE,
                WAREHOUSE_ID: DataMPO.DELIVERY_WAREHOUSE_ID,
                PAYMENT_TERM_ID: DataMPO.PAYMENT_TERM_ID,
                PAYMENT_REFERENCE: DataMPO.PAYMENT_REFERENCE,
                NOTE: DataMPO.NOTE,
                CREATED_AT: new Date(),
                CREATED_ID: DataMPO.CREATE_BY
            })

            const moqValidation = DataMPO?.MOQ_VALIDATION
            if (moqValidation) {
                if (moqValidation?.MIN_ORDER_QTY) {
                    if (!Array.isArray(moqValidation?.MIN_ORDER_QTY)) {
                        return res.status(400).json({
                            success: false,
                            message: "Min order quantity must be array"
                        });
                    }
                }
                if (moqValidation?.MIN_COLOR_QTY) {
                    if (!Array.isArray(moqValidation?.MIN_COLOR_QTY)) {
                        return res.status(400).json({
                            success: false,
                            message: "Min Color quantity must be array"
                        });
                    }
                }
                if (moqValidation?.MIN_SIZE_QTY) {
                    if (!Array.isArray(moqValidation?.MIN_SIZE_QTY)) {
                        return res.status(400).json({
                            success: false,
                            message: "Min Size quantity must be array"
                        });
                    }

                }
            }



            // create detail mpo
            for(const mdm of DataMPO.MPO_DETAIL_MATERIAL){
                // update on purchase order detail
                 await PurchaseOrderDetailModel.create({
                    MPO_ID: MPOID,
                    REV_ID: 0,
                    BOM_STRUCTURE_LINE_ID: mdm.BOM_STRUCTURE_LINE_ID,
                    ORDER_NO: mdm.BOM_STRUCTURE_LINE.BOM_STRUCTURE.ORDER.ORDER_ID,
                    PURCHASE_ORDER_QTY: mdm.PURCHASE_QTY,
                    UNIT_COST: mdm.COST_PER_ITEM,
                    FINANCE_COST: mdm.FINANCE_COST,
                    FREIGHT_COST: mdm.FREIGHT_COST,
                    OTHER_COST: mdm.OTHER_COST,
                    TOTAL_UNIT_COST: mdm.TOTAL_ITEM_COST,
                    TOTAL_PURCHASE_COST: mdm.TOTAL_PURCHASE_COST,
                    ITEM_DIMENSION_ID: mdm.ITEM_DIMENSION_ID,
                    CREATE_BY: DataMPO.CREATE_BY,
                    CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
                });
                // update on bom structure sourcing
                await BomStructureSourcingDetail.update({
                    UNCONFIRM_PO_QTY: mdm.UNCONFIRM_PO_QTY + mdm.PURCHASE_QTY ,
                    PENDING_PURCHASE_ORDER_QTY: parseFloat(mdm.APPROVE_PURCHASE_QUANTITY) - parseFloat(mdm.CONFIRM_PO_QTY) - parseFloat(mdm.UNCONFIRM_PO_QTY) - parseFloat(mdm.PURCHASE_QTY)
                }, {
                    where: {
                        ID: mdm.ID
                    }
                })
            }

            mpo_number = MPOID;
        } else {
            await PurchaseOrderModel.update({
                REV_ID: 0,
                MPO_DATE: DataMPO.MPO_DATE,
                MPO_STATUS: 'Open',
                MPO_ETD: DataMPO.DELIVERY_ETD_DATE,
                MPO_ETA: DataMPO.DELIVERY_ETA_DATE,
                DELIVERY_MODE_CODE: DataMPO.DELIVERY_MODE_CODE,
                DELIVERY_TERM: DataMPO.DELIVERY_TERM,
                COUNTRY_ID: DataMPO.COUNTRY_ID,
                PORT_DISCHARGE: DataMPO.DELIVERY_PORT_DISCHARGE,
                WAREHOUSE_ID: DataMPO.DELIVERY_WAREHOUSE_ID,
                VENDOR_ID: DataMPO.VENDOR_DETAIL.VENDOR_ID,
                VENDOR_DETAIL: JSON.stringify(DataMPO.VENDOR_DETAIL),
                VENDOR_SHIPPER_LOCATION_ID: DataMPO.VENDOR_SHIPPER_LOCATION_ID,
                COMPANY_ID: DataMPO.INVOICE_COMPANY_ID ? DataMPO.INVOICE_COMPANY_ID : 'SBR',
                INVOICE_DETAIL: JSON.stringify(DataMPO.INVOICE_DETAIL),
                INVOICE_UNIT_ID: DataMPO.INVOICE_UNIT_ID,
                DELIVERY_UNIT_ID: DataMPO.DELIVERY_UNIT_ID,
                CURRENCY_CODE: DataMPO.CURRENCY_CODE,
                PAYMENT_TERM_ID: DataMPO.PAYMENT_TERM_ID,
                PAYMENT_REFERENCE: DataMPO.PAYMENT_REFERENCE,
                NOTE: DataMPO.NOTE,
                MOQ_VALIDATION_STATUS: DataMPO.MOQ_VALIDATION_STATUS,
                SURCHARGE_AMOUNT: DataMPO.SURCHARGE_AMOUNT,
                TAX_PERCENTAGE: DataMPO.TAX_PERCENTAGE,
                CREATE_BY: DataMPO.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, {
                where: {
                    MPO_ID: DataMPO.MPO_ID
                }
            })

            await PurchaseOrderNotesModel.update({
                MPO_ETD: DataMPO.DELIVERY_ETD_DATE,
                MPO_ETA: DataMPO.DELIVERY_ETA_DATE,
                DELIVERY_MODE_CODE: DataMPO.DELIVERY_MODE_CODE,
                DELIVERY_TERM: DataMPO.DELIVERY_TERM,
                COUNTRY_ID: DataMPO.COUNTRY_ID,
                PORT_DISCHARGE: DataMPO.DELIVERY_PORT_DISCHARGE,
                WAREHOUSE_ID: DataMPO.DELIVERY_WAREHOUSE_ID,
                PAYMENT_TERM_ID: DataMPO.PAYMENT_TERM_ID,
                PAYMENT_REFERENCE: DataMPO.PAYMENT_REFERENCE,
                NOTE: DataMPO.NOTE,
                UPDATED_AT: new Date(),
                UPDATED_ID: DataMPO.CREATE_BY
            }, {
                where: {
                    PURCHASE_ORDER_ID: DataMPO.MPO_ID,
                    REV_ID: 0
                }
            });

            mpo_number = DataMPO.MPO_ID;
        }
        return res.status(200).json({
            success: true,
            message: "success post material purchase order",
            mpo_number
        });
    } catch(err){
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post material purchase order"
        });
    }
}