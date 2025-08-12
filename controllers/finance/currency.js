
import { QueryTypes, Op } from "sequelize";
import { CurrencyDefault, CurrencyExcRateDetail, CurrencyExcRateHeader, qryGetCurrencyExchange, qryGetDetaulCurExch, qryListCurrency, queryGetListValuta } from "../../models/finance/currency.mod.js";
import db from "../../config/database.js";

export const getListValuta = async (req, res) => {
  try {
    const listValuta = await db.query(queryGetListValuta,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json({data: listValuta});
  } catch (error) {
    console.log(error);
        return res.status(404).json({
        message: "error processing get data ref valuta",
    });  }
}


export const postCurrencyDefault = async (req, res) => {
  try {
    const data = req.body;

    if(data.length === 0) {
      return res.status(400).json({ message: "No Data for Post" });
    }else{
        for (const [i, item] of data.entries()) {
          const { CURRENCY_CODE } = item;
    
          if (!CURRENCY_CODE) {
            return res.status(400).json({ message: "CURRENCY_CODE and ADD_ID are required" });
          }
    
          // Check if the currency already exists
            const existingCurrency = await CurrencyDefault.findOne({
            where: {
                CURRENCY_CODE: CURRENCY_CODE,
                deletedAt: {
                [Op.is]: null
                }
            },
            raw: true
            });
                
          if (!existingCurrency) {
            const createdCurrency = await CurrencyDefault.create(item);
          }
    
            if (i === data.length - 1) {
                return res.status(200).json({ message: "Data successfully created" });
            }
        }
    }


  } catch (error) {
    console.error("Error creating currency default:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


export const updateActiveCurrency = async (req, res) => {
  try {
    const {idCurrency} = req.params;

      const existingCurrency = await CurrencyDefault.findOne({
        where: {
            CURRENCY_ID: idCurrency,
            deletedAt: {
            [Op.is]: null
            }
        },
        raw: true
        });
            
      if (!existingCurrency) {
            return res.status(404).json({ message: "Data successfully created" });
      }

      let valueCheck = {IS_ACTIVE : existingCurrency.IS_ACTIVE ? 0 : 1}

      const updateCurDef = await CurrencyDefault.update(valueCheck, {
            where: {
            CURRENCY_ID: idCurrency,
        },
      })


        return res.status(200).json({ message: "Data successfully created", succes: true });

  } catch (error) {
    console.error("Error creating currency default:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const getCurrencyDefault = async (req, res) => {
    try {
        const getAllCurdef = await db.query(qryListCurrency,
            { type: QueryTypes.SELECT }
          );
        return res.status(200).json({data : getAllCurdef})
    } catch (error) {
          console.error("Error get currency default:", error);
    res.status(500).json({ message: "Internal server error" });
    }
}


export const deleteCurrencies = async (req, res) => {
  try {
    const { ids } = req.body; 
    // ids adalah array berisi CURRENCY_ID, contoh: [1, 2, 3]

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'NO Currencies ID ' });
    }

    // Lakukan soft delete (update deletedAt otomatis oleh Sequelize karena paranoid: true)
    const deletedCount = await CurrencyDefault.destroy({
      where: {
        CURRENCY_ID: {
          [Op.in]: ids
        },
        IS_PRIMARY: {
          [Op.is]: null
        }
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'NO Find data for delete' });
    }

    return res.status(200).json({
      message: `Success deleted ${deletedCount}`
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed delete default currency ', error: error.message });
  }
};


export const setPrimaryCurrency = async (req, res) => {
  try {
    const { idCur } = req.params;

    if (!idCur) {
      return res.status(400).json({ message: 'Currency ID is required.' });
    }

    const existingCurrency = await CurrencyDefault.findOne({
      where: { CURRENCY_ID: idCur },
      raw: true
    });

    if (!existingCurrency) {
      return res.status(404).json({ message: 'Currency not found.' });
    }

    await db.transaction(async (t) => {
      // Reset all IS_PRIMARY to null
      await CurrencyDefault.update(
        { IS_PRIMARY: null },
        { where: {}, transaction: t }
      );

      // Set selected currency as primary
      await CurrencyDefault.update(
        { IS_PRIMARY: 1 },
        { where: { CURRENCY_ID: idCur }, transaction: t }
      );
    });

    return res.status(200).json({ message: 'Primary currency set successfully.' });

  } catch (error) {
    console.error('Error setting primary currency:', error);
    return res.status(500).json({
      message: 'Failed to set primary currency.',
      error: error.message
    });
  }
};



// exchange rate 
export const creatExchageRateHeader = async (req, res) => {
  try {
    const {dataHeader, dataDetail}= req.body;
    const { CERH_EFECTIVE_DATE, ADD_ID, MOD_ID, IS_ACTIVE ,}  = dataHeader

    // Validasi apakah sudah ada data untuk tanggal efektif tersebut
    const existing = await CurrencyExcRateHeader.findOne({ where: { CERH_EFECTIVE_DATE } });
    if (existing) {
      return res.status(202).json({ message: 'Effective date already exists.' });
    }
    

      await db.transaction(async (t) => {
      // Reset all IS_PRIMARY to null
        const newHeader = await CurrencyExcRateHeader.create({
          CERH_EFECTIVE_DATE,
          ADD_ID,
          MOD_ID,
          IS_ACTIVE
        });

        const plainDataHead = newHeader.get({plain : true})
        
        const setIdHeader = dataDetail.map(item => ({...item, CERH_ID : plainDataHead.CERH_ID }))
        await CurrencyExcRateDetail.bulkCreate(setIdHeader)
    });

    res.status(201).json({message: 'Succces save Currency Exchange'});
  } catch (error) {
    console.error('Error creating header:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const editExchageRateHeader = async (req, res) => {
  try {
    const {dataHeader, dataDetail}= req.body;
    const { CERH_ID, CERH_EFECTIVE_DATE, MOD_ID, IS_ACTIVE ,}  = dataHeader

    // Validasi apakah sudah ada data untuk tanggal efektif tersebut
    const existing = await CurrencyExcRateHeader.findOne({ where: { CERH_ID } });
    if (!existing) {
      return res.status(202).json({ message: 'Effective date Not exists.' });
    }
    

      await db.transaction(async (t) => {
      // Reset all IS_PRIMARY to null
        const newHeader = await CurrencyExcRateHeader.update({
          CERH_EFECTIVE_DATE,
          MOD_ID,
          IS_ACTIVE
        }, {
          where : {
            CERH_ID: CERH_ID,
          }
        });

        const destroyDetail = await CurrencyExcRateDetail.destroy({where : { CERH_ID }})
        
        const setIdHeader = dataDetail.map(item => ({...item, CERH_ID : CERH_ID }))
        await CurrencyExcRateDetail.bulkCreate(setIdHeader)
    });

    res.status(201).json({message: 'Succces updated Currency Exchange'});
  } catch (error) {
    console.error('Error creating header:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getHeaderExchange = async (req, res) => {
  try {
        const getAllCurdef = await db.query(qryGetCurrencyExchange,
          { type: QueryTypes.SELECT }
        ); 


        res.json({data: getAllCurdef})
  } catch (error) {
    console.error('Error when get data header currency exchange rate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


export const getAllDetail = async (req, res) => {
  try {
    const alldetail =   await db.query(qryGetDetaulCurExch,
          { type: QueryTypes.SELECT }
        ); 

        res.json({data: alldetail})
  } catch (error) {
    console.error('Error when get data detail currency exchange rate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


//update header currency rate
export const updateExchageRateHeader = async (req, res) => {
  try {
    const {CERH_ID, MOD_ID,}= req.body;

    // Validasi apakah sudah ada data untuk tanggal efektif tersebut
    const existing = await CurrencyExcRateHeader.findOne({ where: { CERH_ID } });
    if (!existing) {
      return res.status(202).json({ message: 'No Found header exchange ID' });
    }
    

    const updateHeader = await CurrencyExcRateHeader.update({
      IS_ACTIVE : !existing.IS_ACTIVE,
      MOD_ID
    }, {
      where : {
        CERH_ID
      }
    });

    res.status(201).json({message: 'Succces update Currency Exchange'});
  } catch (error) {
    console.error('Error creating header:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};