import { dbSPL } from "../../config/dbAudit.js";
import { empOutstandPosision, forRecapEmpOut, mpRecap, mpRecapDetail, qryForRecap } from "../../models/hr/attandance.mod.js";
import moment from "moment";
import { QueryTypes } from "sequelize";

export function getRangeDate(monthYear) {
  
    const parsing = moment(monthYear, "YYYY-MM", true);
    if (!parsing.isValid()) {
      return console.log('tidak valid');
      
    }

    const start = parsing.clone().startOf("month")
    const end = parsing.clone().endOf("month")

    //get range date
    return Array.from(moment.range(start, end).by("days")).map((day) =>
      day.format("YYYY-MM-DD")
    );
  }

  const getDateListByMonthYear = (year, month) => {
  const today = moment();
  const inputMonth = moment(`${year}-${month}`, 'YYYY-M');

  const dates = [];
  const startDate = inputMonth.clone().startOf('month');
  
  // If same year and month as current date, end at yesterday
  const endDate = (inputMonth.isSame(today, 'month'))
    ? today.clone().subtract(1, 'day').startOf('day')
    : inputMonth.clone().endOf('month');

  let currentDate = startDate.clone();
  while (currentDate.isSameOrBefore(endDate, 'day')) {
    dates.push(currentDate.format('YYYY-MM-DD'));
    currentDate.add(1, 'day');
  }

  return dates;
};

export const postLogRecapMpWithRange = async(req,res) => {
    try {
        const { monthYear }   = req.body;
        console.log(monthYear);
        const [year, month] = monthYear.split("-");
        const rangeDate = getDateListByMonthYear(year, month);
        
        for (const [i, dateNow] of rangeDate.entries()) {
                    //destroy dulu 
                const del = await mpRecap.destroy({
                    where : {
                        tgl_recap : dateNow
                    }
                });
                const delDetail = await mpRecapDetail.destroy({
                    where : {
                        tgl_recap : dateNow
                    }
                });

                const getDatarecap   = await dbSPL.query(qryForRecap, {
                    replacements: { tglRecap: dateNow },
                    type: QueryTypes.SELECT,
                    // logging: console.log
                });
                        

                const getDataOut   = await dbSPL.query(forRecapEmpOut, {
                    replacements: {
                        tglRecap: dateNow
                    }, 
                    type: QueryTypes.SELECT
                });


                let parsingOut = []
                if(getDatarecap.length > 0){
                    parsingOut = getDatarecap.map(item => {
                        return {...item, emp_absen : item.emp_total - item.emp_present, emp_male : item.emp_total - parseInt(item.emp_female), emp_out: 0  }
                    })
                }

                if(getDataOut.length > 0){
                    getDataOut.forEach(item => {
                        const fidx = parsingOut.findIndex(emp => emp.IDDepartemen === item.IDDepartemen &&
                            emp.IDSection === item.IDSection &&
                            emp.IDSubDepartemen === item.IDSubDepartemen && 
                            emp.IDPosisi === item.IDPosisi
                        )


                        // console.log(item);

                        if(fidx >= 0){
                            // console.log(parsingOut[fidx]);
                            
                            parsingOut[fidx].emp_out = item.emp_out
                        }else{
                            //jika tidak ada recap atau hanya ada karyawan out
                            const noEmpLine = {...item, 
                                emp_total: 0,
                                emp_present: 0,
                                emp_in: 0,
                                emp_female: 0,
                                emp_absen: 0,
                                emp_male: 0
                            }
                            parsingOut.push(noEmpLine)
                        }
                    });
                }
                

                //record nik dan posisi, dept, subdept, dan section
                const getgetDataDetail   = await dbSPL.query(empOutstandPosision, {
                    replacements: { tglRecap: dateNow },
                    type: QueryTypes.SELECT,
                });
                        

                if(parsingOut.length > 0){
                    const postLog = await mpRecap.bulkCreate(parsingOut);
                    const postLogDetail = await mpRecapDetail.bulkCreate(getgetDataDetail);


                    if(postLog){
                        console.log(`Insert Data Log ${dateNow} Recap Manpower Success at ` + moment().format('YYYY-MM-DD HH:mm:ss'));
                    } else {
                        console.log("Insert Data Log Recap Manpower Failed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
                    }
                } else {
                    console.log("Data Log Recap Manpower Empty at " + moment().format('YYYY-MM-DD HH:mm:ss'));
                }

                if(i+1 === rangeDate.length){
                    console.log('Done Recap Log Manpower for Month Year: ' + monthYear);
                }
        }
        res.status(200).json({
            message: "Log Recap Manpower Success",
            success: true,
        });
     
    } catch(err){
        console.error(err);
    }
}