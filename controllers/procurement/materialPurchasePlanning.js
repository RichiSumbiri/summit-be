import moment from "moment";
import { PurchaseOrderModel } from "../../models/procurement/purchaseOrder.mod.js";




export const postMaterialPurchaseOrder = async(req,res) => {
    try {
        const { DataMPO } = req.body;
        if(DataMPO.MPO_ID===''){
            // check latest number of mpo
            const LatestMPO = await PurchaseOrderModel.findAll({ order: [['MPO_ID', 'DESC']], limit:1, raw: true });
            console.log(DataMPO);
            const newIncrement = LatestMPO.length===0 ? '0000001': parseInt(LatestMPO[0].MPO_ID.slice(-7)) + 1;
            const MPOID = `MPO${newIncrement.toString().padStart(7, '0')}`;
            await PurchaseOrderModel.create({
                MPO_ID: MPOID,
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
                SURCHARGE_AMOUNT: DataMPO.SURCHARGE_AMOUNT,
                TAX_PERCENTAGE: DataMPO.TAX_PERCENTAGE,
                CREATE_BY: DataMPO.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            })
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
                SURCHARGE_AMOUNT: DataMPO.SURCHARGE_AMOUNT,
                TAX_PERCENTAGE: DataMPO.TAX_PERCENTAGE,
                CREATE_BY: DataMPO.CREATE_BY,
                CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss')
            }, { 
                where: {
                    MPO_ID: DataMPO.MPO_ID
                }
            })
        }
        console.log(DataMPO);
        return res.status(200).json({
            success: true,
            message: "success post material purchase order"
        });
    } catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            error: err,
            message: "error post material purchase order"
        });
    }
}