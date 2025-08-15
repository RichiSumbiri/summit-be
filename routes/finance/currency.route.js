import express from "express";
import { creatExchageRateHeader, deleteCurrencies, editExchageRateHeader, getAllDetail, getAllDetailKurs, getCurrencyDefault, getDataExchgExternal, getHeaderExchange, getListValuta, postCurrencyDefault, setPrimaryCurrency, updateActiveCurrency, updateExchageRateHeader } from "../../controllers/finance/currency.js";
const router = express.Router();

router.get("/get-list-valuta", getListValuta);
router.get("/get-list-currency", getCurrencyDefault);
router.get("/primary-currency/:idCur", setPrimaryCurrency);

router.post("/set-default-currency", postCurrencyDefault);
router.put("/uncheck-active-currency/:idCurrency", updateActiveCurrency);
router.patch("/delete-default-currency", deleteCurrencies); //delete dengan array

router.get("/get-header-exc-currency", getHeaderExchange);
router.get("/get-detail-exc-currency", getAllDetail);
router.post("/create-exchg-rate", creatExchageRateHeader);
router.patch("/update-exchg-rate", editExchageRateHeader);
router.patch("/edit-header-exc-currency", updateExchageRateHeader);

//kurs from Bi and 
router.get('/get-data-kurs-referensi/:stateDate', getAllDetailKurs)
router.get('/get-data-kurs-from-bi/:type/:stateDate', getDataExchgExternal) //fecth from bi
router.get('/get-data-kurs-from-bi', getAllDetailKurs)



export default router;
