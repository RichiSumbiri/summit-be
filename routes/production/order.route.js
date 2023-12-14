import express from "express";
const router = express.Router();

import {
  getOrder,
  getOrderByBarcodeSerial,
  getOrderByBLK,
  newOrder,
  deleteOrder,
} from "../../controllers/production/order/OrderDetail.js";
import {
  getBlkNoList,
  getOrderPOListing,
  getOrderPOListingSize,
  newOrderPOListing,
  newOrderPOListingSizes,
} from "../../controllers/production/order/OrderPOListing.js";
import {
  getMatrixPoDelivSize,
  postPOMatrixDeliv,
} from "../../controllers/production/order/PoDelivMatrix.js";
import {
  getDetailOneCap,
  getDetailOneCapSize,
  getOrderByCapacity,
  getOrderStatusMo,
  getOrderStatusSize,
} from "../../controllers/production/order/OrderRepStatus.js";

router.get("/detail", getOrder);
router.get("/detail/barcodeserial/:barcodeserial", getOrderByBarcodeSerial);
router.get("/detail/ordernumber/:orderno", getOrderByBLK);

router.post("/detail", newOrder);
router.delete("/detail/delete/:barcodeserial", deleteOrder);

router.get("/polisting", getOrderPOListing);
router.post("/polisting", newOrderPOListing);

router.post("/polisting-sizes", newOrderPOListingSizes);

router.get("/polisting-sizes/:orderId", getOrderPOListingSize);
router.get("/polisting-blk-list/:orderId", getBlkNoList);

router.post("/pomatrixdeliv", postPOMatrixDeliv);
router.get("/pomatrixdeliv/:capId", getMatrixPoDelivSize);

//report order status
router.get("/order-status-po/:listMonth", getOrderStatusMo);
router.get(
  "/order-status-size/:prodMonth/:capSite/:orderRefPoNo/:color",
  getOrderStatusSize
);
router.get("/order-status-capacity/:listMonth", getOrderByCapacity);
router.get("/order-status-capacity-detail/:idCapacity", getDetailOneCap);
router.get("/order-status-capacity-size/:schId", getDetailOneCapSize);

export default router;
