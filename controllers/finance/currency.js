
import { QueryTypes, Op } from "sequelize";
import { CurrencyDefault, CurrencyExcRateDetail, CurrencyExcRateHeader, kursRef, qryGetCurrencyExchange, qryGetDetaulCurExch, qryListCurrency, qryrefTabelKurs, queryGetListValuta } from "../../models/finance/currency.mod.js";
import db from "../../config/database.js";
import moment from "moment";
import * as cheerio from "cheerio";
import axios from "axios";

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


function parseIDNumber(str) {
  if (!str) return null;
  return parseFloat(
    str.replace(/\./g, "").replace(",", ".")
  );
}


//kurs Bi, get kurs BI Today 
// 🔹 Fungsi Scraper BI
export async function fetchAndSaveKursBI(date) {
    const url = "https://www.bi.go.id/id/statistik/informasi-kurs/transaksi-bi/Default.aspx";
    // console.log(`[${new Date().toISOString()}] Mulai fetch data BI...`);

    try {
      const url = "https://www.bi.go.id/id/statistik/informasi-kurs/transaksi-bi/Default.aspx";

      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          "Accept-Language": "id,en;q=0.9",
          "Accept": "text/html,application/xhtml+xml"
        },
        timeout: 20000 // tambahkan timeout lebih panjang
      });
      const getBi = response.data;
//         const getBi = await axios.get(url, { timeout: 10000 });
//         console.log(getBi);
        
        const $ = cheerio.load(getBi);
        const kurs = [];

        // Cari tabel utama
        $("table tbody tr").each((_, el) => {
          const tds = $(el).find("td");
          if (tds.length >= 4) {
            kurs.push({
              code: $(tds[0]).text().trim(),
              nilai: parseIDNumber($(tds[1]).text().trim()),
              jual: parseIDNumber($(tds[2]).text().trim()),
              beli: parseIDNumber($(tds[3]).text().trim()),
            });
          }
        });

        const KURS_DATE = moment().format('YYYY-MM-DD')
        // console.log(`✅ Dapat ${kurs.length} data kurs`);
        if(kurs.length > 0){

          const structurBiObj = kurs.map(item => ({
              KURS_DATE :KURS_DATE,
              KURS_TYPE :'BI',
              KURS_CODE : item.code,
              KURS_VALUE : item.nilai,
              KURS_SALE : item.jual,
              KURS_BUY : item.beli,
              KURS_MID : (item.beli+item.jual)/2,
          }))

          // await kursRef.bulkCreate(structurBiObj)
          return structurBiObj
        }else{
          return []
        }

        // console.log("✅ Data kurs BI berhasil disimpan/diupdate.");
    } catch (err) {      
      console.error("❌ Filed fetch data BI:", err.message);
      return []
      // res.status(500).json({ message: 'Internal server error' });
    }
}


export const getAllDetailKurs = async (req, res) => {
  try {
    const {stateDate} = req.params    
    const alldetail =   await db.query(qryrefTabelKurs,
          {
            replacements: {    stateDate    }, 
            type: QueryTypes.SELECT 
          }
        ); 

        res.json({data: alldetail})
  } catch (error) {
    console.error('Error when get data detail currency exchange reference:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getKursPajak(date) {
  const url = `https://fiskal.kemenkeu.go.id/informasi-publik/kurs-pajak?date=${date}`;

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $ = cheerio.load(html);
    const result = [];

    // Loop setiap baris tabel
    $("table tbody tr").each((_, el) => {
      const tds = $(el).find("td");
      if (tds.length >= 3) {
        const nama = $(tds[1]).text().trim();
        const kurs = $(tds[2]).text().trim().replace(/\./g, "").replace(",", ".");
        result.push({
          nama,
          kurs: parseFloat(kurs),
        });
      }
    });

    if(result.length > 0){
        const KURS_DATE = moment().format('YYYY-MM-DD')

      const changeNameToCOde = result.map(item => {
        const match = item.nama.match(/\((.*?)\)/); // ambil isi dalam tanda kurung
        return {
          // kode: match ? match[1] : null,
          // kurs: item.kurs,
              KURS_DATE :KURS_DATE,
              KURS_TYPE :'PAJAK',
              KURS_CODE : match[1],
              KURS_VALUE : match[1] === 'JPY' ?  100 : 1 ,
              KURS_SALE : item.kurs,
              KURS_BUY : 0,
              KURS_MID : item.kurs,
        };
      });


      return changeNameToCOde
    }else{
      return []
    }


  } catch (err) {
    console.log(err);
    
    console.error("Gagal ambil kurs pajak:", err.message);
    return [];
  }
}

// Contoh pakai
// getKursPajak().then(data => console.log(data));


export const getDataExchgExternal = async (req, res) => {
  try {
    const {stateDate, type} = req.params
    let typeKurs = type === 'bi' ? 'BI' : 'PAJAK'
    const KURS_DATE = type === 'bi' ?  moment().format('YYYY-MM-DD') : stateDate
    const getDataKurs =  type === 'bi' ? await fetchAndSaveKursBI() : await getKursPajak(KURS_DATE)
 
    if(getDataKurs.length > 0){
      const checkExist = await kursRef.findOne({
            where : { 
              KURS_DATE :KURS_DATE,
              KURS_TYPE :type,
            },
            raw: true
          })
  
          
      if(checkExist){
        const deleteKurs = await kursRef.destroy({
            where : { 
              KURS_DATE :KURS_DATE,
              KURS_TYPE :type,
            },
          })
      }

      const createKurs = await kursRef.bulkCreate(getDataKurs)

      return res.status(200).json({message : `Success get data From ${typeKurs}`}) 
    }else{
        return res.status(200).json({message : `No data From ${typeKurs}`}) 
    }



 
  } catch (error) {
    console.log(error);
    
    return res.status(500).json(err.message)
  }
}





// exchange rate 
export const creatExchageRateFromBi = async (req, res) => {
  try {
    const {date, primaryCurrency, userId }= req.body;
 
    //check apakah sudah ada data dari BI 
    const checkDataBi = await kursRef.findAll({
          where : { 
            KURS_DATE : date,
            KURS_TYPE : 'BI',
          },
          raw: true
        })
  
    if(checkDataBi.length === 0) {
      //jika tidak ada maka reject
      return res.status(202).json({message : 'No Data Form BI, Pls Get Data First'})
    }

    //ambil list data default currency nya dulu
    const getAllCurdef = await db.query(qryListCurrency,
      { type: QueryTypes.SELECT }
    );

    if(getAllCurdef.length === 0) {
      //jika tidak ada maka reject
      return res.status(202).json({message : 'No Data Form Currency Default'})
    }

    const getRowKursPrimary = checkDataBi.find(item => item.KURS_CODE === primaryCurrency)
    const getDataPrimary = getAllCurdef.find(item => item.CURRENCY_CODE === primaryCurrency)
   
    if(!getRowKursPrimary) {
      //jika tidak ada maka reject
      return res.status(202).json({message : 'No Data BI Kurs From BI'})
    }
    

    //Rate IDR ke Primary
    const calRatePrimary = parseInt(getRowKursPrimary.KURS_VALUE)/((parseFloat(getRowKursPrimary.KURS_SALE) + parseFloat(getRowKursPrimary.KURS_BUY))/2)

    const currencyCodeWoPrimary = getAllCurdef.filter(item => item.CURRENCY_CODE !== primaryCurrency && item.CURRENCY_CODE !== 'IDR')
   
   
    const dataCurrency = currencyCodeWoPrimary.map(item => {
      const findRate = checkDataBi.find(biRate => biRate.KURS_CODE === item.CURRENCY_CODE)
        if(!findRate) {
          return {...item, CER_RATE : 0}
        }else{
          const calRate =  parseInt(findRate.KURS_VALUE)/((parseFloat(findRate.KURS_SALE) + parseFloat(findRate.KURS_BUY))/2)
          const rateBoDefault = calRatePrimary/calRate
    
          return {...item, CER_RATE : rateBoDefault}
        }
    })

    const struIdr = {
       CER_FROM_CODE: "IDR",
        CER_TO_CODE: primaryCurrency,
        CER_FROM_DESC: 'Indonesia Rupiah',
        CER_TO_DESC: getDataPrimary.CURRENCY_DESC,
        CER_RATE: parseFloat(calRatePrimary).toFixed(13),
        IS_ACTIVE: 1,
        ADD_ID: userId,
    }

    let listDetailRate = dataCurrency.map(item => ({
      CER_FROM_CODE: item.CURRENCY_CODE,
      CER_TO_CODE: primaryCurrency,
      CER_FROM_DESC: item.CURRENCY_DESC,
      CER_TO_DESC:getDataPrimary.CURRENCY_DESC,
      CER_RATE: parseFloat(item.CER_RATE).toFixed(13), // hasilnya string,
      IS_ACTIVE: 1,
      ADD_ID: userId,
    }))
    
    const alldetail = [...listDetailRate, struIdr]
    

    

    // jika ada data maka cek sudah ada exchg header atau blm jika ada maka destroy 
    let existing = await CurrencyExcRateHeader.findOne({ where: { CERH_EFECTIVE_DATE : date } , raw: true});
    if (existing) {
          await CurrencyExcRateHeader.update({ MOD_ID : userId}, { where: { CERH_EFECTIVE_DATE: date }});
    }else{
         const createNewHeader = await CurrencyExcRateHeader.create({CERH_EFECTIVE_DATE : date,  ADD_ID : userId});
         existing = createNewHeader.get({plain: true})
    }

    const checkDetail = CurrencyExcRateDetail.findOne({where : {CERH_ID : existing.CERH_ID}})

    if(checkDetail){
          await CurrencyExcRateDetail.destroy({where : {CERH_ID : existing.CERH_ID}})
    }

    const dataWithHeadId = alldetail.map(item => ({...item, CERH_ID : existing.CERH_ID }))
    await CurrencyExcRateDetail.bulkCreate(dataWithHeadId)

    res.status(200).json({message: 'Succces save Currency Exchange'});
  } catch (error) {
    console.log(error);
    
    console.error('Error creating header:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
