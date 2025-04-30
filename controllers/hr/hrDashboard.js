import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { Op, QueryTypes } from "sequelize";
import {
  additonalLineNoCountPast,
  additonalLineNoCountTod,
  additonalPast,
  additonalToday,
  allDeptTtl,
  Attandance,
  baseMpSewing,
  getLemburForAbsen,
  karyawanOut,
  karyawanOutSewing,
  qryBaseMpMonthly,
  qryBaseSewMpMonthly,
  qryCurrentOrPasMp,
  qryDailyAbsensi,
  // qryDtlMpByLinePast,
  qryDtlMpByLineToday,
  qryGetEmpInExpand,
  qryGetEmpInExpandHR,
  qryGetEmpInExpandMonth,
  qryGetEmpInHrExpandMonth,
  qryGetEmpOutExpand,
  qryGetEmpOutExpandHr,
  qryGetEmpOutExpandonth,
  qryGetEmpOutHrExpandonth,
  qryGetEmpSewAllExpand,
  qryGetEmpSewAllExpandHr,
  qryLaborSewing,
  querySumByKetDaily,
  SewingLineHR,
} from "../../models/hr/attandance.mod.js";
import moment from "moment";
import { CheckNilai, ChkNilaFlt, getRangeDate, getUniqueAttribute, totalCol } from "../util/Utility.js";
import db from "../../config/database.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";
import { QueryGetHoliday } from "../../models/setup/holidays.mod.js";

export const getDailyHrDash = async (req, res) => {
  try {
    const { date } = req.params;

    let getAbsen = await dbSPL.query(qryDailyAbsensi, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    const getLembur = await dbSPL.query(getLemburForAbsen, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    if (getLembur.length > 0) {
      getAbsen = getAbsen.map((item) => {
        const lembur = getLembur.find((lembur) => lembur.Nik === item.Nik);

        if (lembur) {
          return { ...item, ...lembur };
        } else {
          return item;
        }
      });
    }

    const getEmpOut = await dbSPL.query(karyawanOut, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: conso
      // le.log
    });

    const detailEmpOut = await modelSumbiriEmployee.findAll({
      where: {
        TanggalKeluar: date,
        IDDepartemen: "100103",
      },
      raw: true,
    });

    const totalAttd = getAbsen.filter((item) => item.scan_in);
    const totalEmpIn = getAbsen.filter((item) => item.TanggalMasuk === date);
    const totalMale = getAbsen.filter((item) => item.JenisKelamin === 0);
    const totalFemale = getAbsen.filter((item) => item.JenisKelamin === 1);
    const totalTlo =
      ChkNilaFlt(
        getEmpOut[0].karyawanOut / (getAbsen.length + getEmpOut[0].karyawanOut)
      ) * 100;
    const totalTetap = getAbsen.filter(
      (item) => item.StatusKaryawan === "TETAP"
    );

    const totalKontrak = getAbsen.filter(
      (item) => item.StatusKaryawan === "KONTRAK"
    );
    // const findNodept = getAbsen.filter(items => !items.NameDept)
    // console.log(findNodept);
    getAbsen.sort((a, b) => {
      if (a.NameDept < b.NameDept) {
        return -1;
      }
      if (a.NameDept > b.NameDept) {
        return 1;
      }
      return 0;
    });

    const dataByDept = getDataPerDept(getAbsen);
    const dataChartDeptCount = dataChartDept(dataByDept);
    const dataChartDeptAttd = dataChartAttdDept(dataByDept);

    const dataDash = {
      totalEmp: getAbsen.length,
      totalAttd: totalAttd.length,
      totalEmpOut: getEmpOut[0].karyawanOut,
      totalEmpIn: totalEmpIn.length,
      totalMale: totalMale.length,
      totalFemale: totalFemale.length,
      totalTetap: totalTetap.length,
      totalKontrak: totalKontrak.length,
      totalTlo: totalTlo,
      dataChartDeptCount,
      dataChartDeptAttd,
    };
    // console.log(dataDash);
    // console.log(findNodept);

    return res.json({ data: dataDash, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data absen" });
  }
};

const getDataPerDept = (employees) => {
  const departmentCount = employees.reduce((acc, employee) => {
    const department = employee.NameDept;
    if (acc[department]) {
      acc[department].count++;
    } else {
      acc[department] = { count: 1, scan_in: 0 };
    }
    if (employee.scan_in) {
      acc[department].scan_in++;
    }
    return acc;
  }, {});
  Object.keys(departmentCount).forEach((department) => {
    if (!departmentCount[department].hasOwnProperty("scan_in")) {
      departmentCount[department].scan_in = 0;
    }
  });
  return departmentCount;
};

function dataChartAttdDept(dataByDept) {
  let structurCat = [
    {
      name: "Attendance",
      data: [],
    },
  ];
  let dataCategory = [];

  if (!dataByDept) {
    structurCat, dataCategory;
  }
  dataCategory = Object.keys(dataByDept);
  const dataCount = dataCategory.map(
    (department) => dataByDept[department].scan_in || 0
  ); // Pastikan scan_in memiliki nilai default 0

  const arrayColor = dataCategory.map((department) =>
    dataByDept[department].scan_in !== dataByDept[department].count
      ? "#FE9900"
      : "#01C7EA"
  );

  structurCat[0].data = dataCount;

  return {
    structurCat,
    dataCategory,
    arrayColor,
  };
}

function dataChartDept(dataByDept) {
  let structurCat = [
    {
      name: "Head Count",
      data: [],
    },
  ];

  let dataCategory = [];

  if (!dataByDept) {
    return {
      structurCat,
      dataCategory,
    };
  }

  dataCategory = Object.keys(dataByDept);
  const dataCount = dataCategory.map(
    (department) => dataByDept[department].count
  );

  structurCat[0].data = dataCount;

  return {
    structurCat,
    dataCategory,
  };
}

export const getDataDashSewMp = async (req, res) => {
  try {
    const { date } = req.params;

    const qureys = qryCurrentOrPasMp(date) 
    let baseAllSewMp = await dbSPL.query(qureys, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });
    let getAbsen = baseAllSewMp

    const curDate = moment()
    const curTime = moment()
    const paramsDate = moment(date, 'YYYY-MM-DD')

    //jika hari parameter sama dengan paramter maka cek jadwal jam nya 
    if(paramsDate.isSame(curDate, 'day')){
      getAbsen = baseAllSewMp.map((item, i) => {
        const jkIn = item.jk_in ? moment(item.jk_in, 'HH:mm:ss') : false

        if (jkIn && jkIn.isSameOrBefore(curTime, 'hours')){
          return {...item, schedule_jk : 1}
        }else{
          return {...item, schedule_jk : 0} 
        }
      })
    }
      

    getAbsen.sort((a, b) => {
      if (a.SITE_NAME < b.SITE_NAME) {
        return -1;
      }
      if (a.SITE_NAME > b.SITE_NAME) {
        return 1;
      }
      return 0;
    });


    const getEmpOut = await dbSPL.query(karyawanOutSewing, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    const getHdCount = await dbSPL.query(allDeptTtl, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    const dataEmpIn = await dbSPL.query(qryGetEmpInExpand, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });
    const dataSumKetIn  = await dbSPL.query(querySumByKetDaily, {
      replacements: { tanggal_in : date },
      type: QueryTypes.SELECT,
    });

    const ttlEmpOut   = totalCol(getEmpOut, "karyawanOut");

    const totalAttd   = getAbsen.filter((item) => item.scan_in);
    const totalEmpSch = getAbsen.filter((item) => item.jk_id);
    // const totalEmpIn = getAbsen.filter((item) => item.TanggalMasuk === date);
    const totalMale   = getAbsen.filter((item) => item.JenisKelamin === 0);
    const totalFemale = getAbsen.filter((item) => item.JenisKelamin === 1);
    const totalTlo    =  ChkNilaFlt(ttlEmpOut / (getAbsen.length + ttlEmpOut)) * 100;

    const dataEmpPerSec   = getDataPerSection(getAbsen);
    
    const dataChartDept   = dataChartSection(dataEmpPerSec, date);
    const dataTtlHcVsAbs  = getTotalCountAndVariance(dataEmpPerSec);
    // const dataChartDeptAttd = dataChartAttdDept(dataEmpPerSec);

    const joinResult = { ...dataEmpPerSec };

    // Inisialisasi lto = 0 untuk semua data
    Object.keys(joinResult).forEach((key) => {
      joinResult[key] = { ...joinResult[key], lto: 0, karyawanOut: 0 };
    });

    if (getEmpOut.length > 0 && dataEmpPerSec) {
      getEmpOut.forEach((item) => {
        if (joinResult[item.CusName]) {
          const count = joinResult[item.CusName].count || 0;
          const karyawanOut = item.karyawanOut || 0;
          const ltoValue =
            karyawanOut > 0
              ? ChkNilaFlt(karyawanOut / (count + karyawanOut)) * 100
              : 0;

          joinResult[item.CusName] = {
            ...joinResult[item.CusName],
            karyawanOut: karyawanOut,
            lto: ltoValue,
          };
        }
      });
    }

    //console.log(joinResult);

    const dataDash = {
      totalEmp: getHdCount[0].ttlemp,
      totalEmpSew: getAbsen.length,
      totalAttd: totalAttd.length,
      totalEmpOut: ttlEmpOut,
      totalEmpSch: totalEmpSch.length,
      totalEmpIn: dataEmpIn.length,
      totalMale: totalMale.length,
      totalFemale: totalFemale.length,
      // totalTetap: totalTetap.length,
      // totalKontrak: totalKontrak.length,
      dataPerSec: joinResult,
      totalTlo: totalTlo,
      dataChartDept,
      dataTtlHcVsAbs,
      dataSumKetIn
    };

    return res.json({ data: dataDash, message: "succcess get data" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data absen" });
  }
};

const getDataPerSection = (employees) => {
  const dataSection = employees.reduce((acc, employee) => {
    const section = employee.CUS_NAME;

    if (!acc[section]) {
      acc[section] = { count: 0, scan_in: 0, schedule_jk: 0 };
    }

    acc[section].count++;

    if (employee.scan_in) {
      acc[section].scan_in++;
    }

    if (employee.schedule_jk) {
      acc[section].schedule_jk++;
    }

    return acc;
  }, {});

  Object.keys(dataSection).forEach((section) => {
    dataSection[section].variance = dataSection[section].count - dataSection[section].scan_in;

    // Tambahan: menghitung selisih antara schedule dan scan_in
    dataSection[section].variance_schedule =
      dataSection[section].schedule_jk - dataSection[section].scan_in;
  });

  return dataSection;
};


function dataChartSection(dataBysec, date) {
  const deptName = Object.keys(dataBysec) || [];
  if (dataBysec) {
    const arrHc = deptName.map((item) => dataBysec[item].count);
    // const absente = deptName.map((item) => dataBysec[item].variance);
    const absente = deptName.map((item) => dataBysec[item].variance_schedule);
    // const arrAttd = deptName.map(item => dataBysec[item].scan_in)
    const schedule = deptName.map(item => dataBysec[item].schedule_jk)

    const based = [
      {
        name: "Head Count",
        // type: "column",
        data: arrHc,
        date
      },
      {
        name: "Schedule Attd",
        // type: "column",
        data: schedule,
        date
      },
      {
        name: "Absent",
        // type: "column",
        data: absente,
        date
      },
    ];
    return { deptName, based };
  } else {
    return { deptName, based };
  }
}

const getTotalCountAndVariance = (data) => {
  return Object.keys(data).reduce(
    (totals, section) => {
      totals.total_count += data[section].count;
      totals.total_variance += data[section].variance;
      totals.schedule_jk += data[section].schedule_jk;
      totals.variance_schedule += data[section].variance_schedule;
      return totals;
    },
    { total_count: 0, total_variance: 0, total_schedule : 0, variance_schedule : 0  }
  );
};

export const getExpandEmpIn = async (req, res) => {
  try {
    const { date, type } = req.params;
    let query = qryGetEmpInExpand;
    if (type === "empOut") {
      query = qryGetEmpOutExpand;
    }
    if (type === "empAll") {
      query = qryGetEmpSewAllExpand;
    }
    if (type === "empAllHr") {
      query = qryGetEmpSewAllExpandHr;
    }
    if (type === "empInHr") {
      query = qryGetEmpInExpandHR;
    }
    if (type === "empOutHr") {
      query = qryGetEmpOutExpandHr;
    }
    if (type === "empInMpMonth") {
      query = qryGetEmpInExpandMonth;
    }
    if (type === "empOutMpMonth") {
      query = qryGetEmpOutExpandonth;
    }
    if (type === "empInMpMonthHr") {
      query = qryGetEmpInHrExpandMonth;
    }
    if (type === "empOutMpMonthHr") {
      query = qryGetEmpOutHrExpandonth;
    }
    const dataEmpIn = await dbSPL.query(query, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    res.json({ data: dataEmpIn, message: `success get data ${type}` });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: `Terdapat error saat get data ${type}` });
  }
};

export const getChartMpDtlByLine = async (req, res) => {
  try {
    const { date, site } = req.params;
    const { line } = req.query;
    
    const cusName = decodeURIComponent(site)

    const query = findQuery(cusName, date, line)
    // console.log(query);

    const dataEmpIn = await dbSPL.query(query, {
      replacements: { date, cusName },
      type: QueryTypes.SELECT,
    });

    dataEmpIn.sort((a, b) => {
      if (a.subDeptName < b.subDeptName) {
        return -1;
      }
      if (a.subDeptName > b.subDeptName) {
        return 1;
      }
      return 0;
    });

    let getAbsen = dataEmpIn
    const curDate = moment()
    const curTime = moment()
    const paramsDate = moment(date, 'YYYY-MM-DD')

      //jika hari parameter sama dengan paramter maka cek jadwal jam nya 
      if(paramsDate.isSame(curDate, 'day')){
        getAbsen = dataEmpIn.map((item, i) => {
          const jkIn = item.jk_in ? moment(item.jk_in, 'HH:mm:ss') : false
    
          if (jkIn && jkIn.isSameOrBefore(curTime, 'hours')){
            return {...item, schedule_jk : 1}
          }else{
            return {...item, schedule_jk : 0} 
          }
        })
      }

    if(!line){
      const dataLine = jmlhByLine(getAbsen)
      return res.json({
        data: dataLine,
        message: "success get data emp detail by line",
      });
    }else{
      // const filterNoSchAndNoIn = getAbsen?.filter(items => items.schedule_jk )
    return  res.json({
        data: getAbsen,
        message: "success get data emp detail by line",
      });
    }
    
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({
        error,
        message: "Terdapat error saat get data emp detail by line",
      });
  }
};



//jumlahkan 
function jmlhByLine(getAbsen){

  const finalGroupedResult = getAbsen.reduce((acc, item) => {
    const groupKey = `${item.SITE_NAME}__${item.CUS_NAME}__${item.subDeptName}`;
  
    if (!acc[groupKey]) {
      acc[groupKey] = {
        SITE_NAME: item.SITE_NAME,
        CUS_NAME: item.CUS_NAME,
        IDSubDepartemen: item.IDSubDepartemen,
        subDeptName: item.subDeptName,
        total_emp: 0,
        total_hadir: 0,
        total_schedule_jk: 0,
      };
    }
  
    acc[groupKey].total_emp += 1;
  
    if (item.scan_in) {
      acc[groupKey].total_hadir += 1;
    }
  
    if (item.schedule_jk === 1) {
      acc[groupKey].total_schedule_jk += 1;
    }
  
    return acc;
  }, {}); // ← initial value = object kosong
  
  // ubah hasil akhir jadi array
  const groupedArray = Object.values(finalGroupedResult);
  
  // const filterNoSchAndNoIn = groupedArray?.filter(items => items.total_schedule_jk && items.total_hadir)
  return groupedArray
}


function findQuery(cusName, date, line){
  let strings = `AND msts.CusName = '${cusName}'`
  const today = moment().startOf("day");
  const parDate = moment(date, "YYYY-MM-DD").startOf("day");

  if(!line){
  
    let query = qryDtlMpByLineToday(strings, additonalPast);
    // if (parDate.isBefore(today)) {      
    //   query = qryDtlMpByLineToday(strings, additonalPast)
    // }
    return query
  }else{
    strings += `AND msd.Name = '${line}'`
    // let query = qryDtlMpByLineToday(strings, additonalLineNoCountTod);
    // if (parDate.isBefore(today)) {      
      // }
    let query = qryDtlMpByLineToday(strings, additonalLineNoCountPast)
    return query
  } 

}



//dashboard hr SEWING monthly
export const getBaseSewMpMonthly = async(req, res) => {
  try {
    const {monthYear} = req.params
    const {seciton} = req.query

    
    const startDate   = moment(monthYear, 'YYYY-MM')
      .startOf("month")
      .format('YYYY-MM-DD')
    const endDate     = moment(monthYear, 'YYYY-MM')
      .endOf("month")
      .format('YYYY-MM-DD')


    const years     = moment(monthYear, 'YYYY-MM')
      .endOf("month")
      .format('YYYY')

    const listHoliday = await db.query(QueryGetHoliday, {
      replacements: {
        startYear:years,
        endYear: years
      },
      type: QueryTypes.SELECT,
    });

    //untuk bypass sabtu dan minggu
    const dayWeekEnd = ["Sunday"];

       //masukan array holiday
    const arrHoliday = listHoliday.map((item) => item.calendar_date);


      const baseMpSew     = await dbSPL.query(qryBaseSewMpMonthly, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      });

      
      const baseLabor     = await dbSPL.query(qryLaborSewing, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      });

      let baseMpAll = baseMpSew
      let laborSewing = baseLabor
      
      if(seciton){
        baseMpAll = baseMpSew.filter(item => item.CUS_NAME === seciton)        
        laborSewing = baseLabor.filter(item => item.CUS_NAME === seciton)        
      }
  
      //ALL emp
      const endDateAll = findEndDate(baseMpSew, endDate)

      const filEmpAllStart  = baseMpSew.filter(rcp => rcp.tgl_recap === startDate)
      const filEmpAllEnd    = baseMpSew.filter(rcp => rcp.tgl_recap === endDateAll)
      const totalAllStart   = totalCol(filEmpAllStart, 'emp_total')
      const totalAllEnd     = totalCol(filEmpAllEnd, 'emp_total')
      const avgEmpAll       = (totalAllStart+totalAllEnd)/2

      //sewing
      const baseMpSewingMonth = baseMpAll.filter(rcp => rcp.IDDepartemen === 100103 && rcp.IDPosisi === 6)
      //?.filter(
      //   (dt) =>
      //     !arrHoliday.includes(dt.tgl_recap) &&
      //     !dayWeekEnd.includes(moment(dt.tgl_recap, "YYYY-MM-DD").format("dddd"))
      // ); ``

      const endDateLto      = findEndDate(baseMpSewingMonth, endDate)
      const filterEmpStart  = baseMpSewingMonth.filter(emp => emp.tgl_recap === startDate)
      const filterEmpEnd    = baseMpSewingMonth.filter(emp => emp.tgl_recap === endDateLto)
      const totalEmpStart   = totalCol(filterEmpStart, 'emp_total')
      const totalEmpEnd     = totalCol(filterEmpEnd, 'emp_total')
      const avgEmp          = (totalEmpStart+totalEmpEnd)/2


      // const getTglFromResul = getUniqueAttribute(baseMpSewingMonth, 'tgl_recap')
      const getSiteList = getUniqueAttribute(baseMpSewingMonth, 'CUS_NAME')

      // data card month 
      const totalEmp    = totalAllEnd
      const totalEmpIn  = totalCol(baseMpSewingMonth, 'emp_in')
      const totalEmpout = totalCol(baseMpSewingMonth, 'emp_out')
      const ltoMonth    = totalEmpout > 0 ? ChkNilaFlt(totalEmpout / (totalEmpEnd + totalEmpout)) * 100 : 0;
      // console.log({endDateLto, totalEmpout, totalEmpEnd });
      
      //betulkan ini karena retun object
      const dataGroupTglSection = groupAndSumByDateAndSection(baseMpSewingMonth)//ini menjumlahkan selama satu bulan
      
      //lalu cari lto per tanggal per section
      const addLtoPerDate = dataGroupTglSection.map(items => {
        let tlo =  items.emp_out > 0 ? ChkNilaFlt(items.emp_out / (items.emp_total + items.emp_out)) * 100 : 0; 
        return {...items, tlo}
      })

      //lanjut cari avg emp per section berdasarkan start date dan end date
      const dataPerSec = getSiteList.map(csName => {
        const filterBysection = dataGroupTglSection.filter(tems => tems.CUS_NAME === csName)
        
        let endDateSec      = findEndDate(filterBysection, endDate)
        
        const findStartSec  = filterBysection.filter(item => item.tgl_recap === startDate)
        const findEndSec    = filterBysection.filter(item => item.tgl_recap === endDateSec)
        const secEmpStart   = totalCol(findStartSec, 'emp_total')
        const secEmpEnd     = totalCol(findEndSec, 'emp_total')
        const secEmpIn      = totalCol(filterBysection, 'emp_in')
        const secEmpout     = totalCol(filterBysection, 'emp_out')
        const secEmpSch     = totalCol(filterBysection, 'schedule_jk')
        const avgEmpSec     = secEmpStart+secEmpEnd/2
        const secLto        =  secEmpout > 0 ? ChkNilaFlt(secEmpout / (secEmpEnd+secEmpout)) * 100 : 0;

      return {
        CUS_NAME    : csName, 
        IDSection   : filterBysection[0].IDSection,
        SITE_NAME   :  filterBysection[0].SITE_NAME,
        secEmpStart,
        secEmpEnd,
        secEmpout,
        secEmpIn,
        avgEmpSec,
        secEmpSch,
        secLto,}
      })

    const objDateMoment = {
      start: startDate,
      end: endDate,
    };

    const rangeDate = getRangeDate(objDateMoment);
// console.log('mampu sampai sini');

      //hapus weekend dan holiday
      // const dateOutHol = rangeDate.filter(
      //   (dt) =>
      //     !arrHoliday.includes(dt) &&
      //     !dayWeekEnd.includes(moment(dt, "YYYY-MM-DD").format("dddd"))
      // );

  const sumOfDate = sumEmpByDate(baseMpSewingMonth, rangeDate)
    
  const dataMonth = {
    dataCard       : { totalEmpStart, totalEmpEnd, avgEmp, totalEmp, totalEmpIn, totalEmpout, ltoMonth},
    dataPerSec     : dataPerSec,
    dataSecPerDate : dataGroupTglSection,
    sumOfDate      : sumOfDate,
    laborSewing: laborSewing
  }

  res.json({data : dataMonth, message : 'success get data month'})
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({
        error,
        message: "Terdapat error saat get data emp detail by line",
      });
  }
}

function groupAndSumByDateAndSection(arr) {  
  const result = arr.reduce((acc, item) => {
    // Key berdasarkan tgl_recap dan section
    const key = `${item.tgl_recap}-${item.IDSection}`;
    
    // Jika key belum ada di accumulator, buat objek baru
    if (!acc[key]) {
      acc[key] = {
        tgl_recap: item.tgl_recap,
        IDSection: item.IDSection,
        emp_total: 0,
        emp_absen: 0,
        emp_female: 0,
        emp_male: 0,
        emp_in: 0,
        emp_out: 0,
        emp_present: 0,
        schedule_jk: 0,
        SITE_NAME: item.SITE_NAME,
        CUS_NAME: item.CUS_NAME,
        LINE_NAME: item.LINE_NAME
      };
    }
    
    // Menambahkan nilai ke dalam akumulator
    acc[key].emp_total += item.emp_total;
    acc[key].emp_in += item.emp_in;
    acc[key].emp_out += item.emp_out;
    acc[key].emp_absen += item.emp_absen;
    acc[key].emp_present += item.emp_present;
    acc[key].emp_male += item.emp_male;
    acc[key].emp_female += item.emp_female;
    acc[key].schedule_jk += item.schedule_jk;

    return acc;
  }, {})

  const resultAndLto = Object.values(result).map(item => ({...item, absentBySch : item.schedule_jk - item.emp_present, lto: item.emp_out ? (item.emp_out/(item.emp_out+item.emp_total))*100 : 0}))
  return resultAndLto;
}

function findEndDate(data, maxdate) {
  // Tentukan tanggal batas yang diinginkan (21 Maret)
  const targetDate = moment(maxdate);

  // Filter data yang memiliki tgl_recap lebih kecil atau sama dengan 21 Maret
  const filteredData = data.filter(item => moment(item.tgl_recap).isSameOrBefore(targetDate, 'day'));

  // Jika ada tanggal yang lebih kecil atau sama dengan 21 Maret, cari tanggal terakhir
  if (filteredData.length > 0) {
    // Menggunakan moment untuk mendapatkan tanggal terbaru dari yang sudah difilter
    const latestDate = filteredData.reduce((latest, item) => {
      const currentDate = moment(item.tgl_recap);
      return currentDate.isAfter(latest) ? currentDate : latest;
    }, moment(0));  // Inisialisasi dengan tanggal paling awal (epoch)

    // Kembalikan tanggal dalam format YYYY-MM-DD
    return latestDate.format('YYYY-MM-DD');
  }

  return null; // Jika tidak ada tanggal yang lebih kecil atau sama dengan 21 Maret
}

function sumEmpByDate(data, rangeDates) {
  
  return rangeDates.map(date => {
      const summary = data.reduce((acc, item) => {
          if (item.tgl_recap === date) {
              acc.emp_in += item.emp_in || 0;
              acc.emp_out += item.emp_out || 0;
              acc.emp_total += item.emp_total || 0;
              acc.emp_present += item.emp_present || 0;
              acc.emp_absen += item.emp_absen || 0;
              acc.schedule_jk += item.schedule_jk || 0;
          }
          return acc;
      }, { emp_in: 0, emp_out: 0, emp_total: 0 , emp_present: 0, emp_absen : 0, schedule_jk: 0});
      const dateLto  =  summary.emp_out > 0 ? ChkNilaFlt(summary.emp_out / (summary.emp_total+summary.emp_out)) * 100 : 0;
      const absentBySch = summary.schedule_jk ? summary.schedule_jk - summary.emp_present : 0
      return { tanggal: date, dateLto, absentBySch, ...summary };
  });
}


//dashboard hr ALL monthly
export const getBaseMpMonthly = async(req, res) => {
  try {
    const {monthYear} = req.params

    const startDate   = moment(monthYear, 'YYYY-MM')
      .startOf("month")
      .format('YYYY-MM-DD')
    const endDate     = moment(monthYear, 'YYYY-MM')
      .endOf("month")
      .format('YYYY-MM-DD')


    const years     = moment(monthYear, 'YYYY-MM')
      .endOf("month")
      .format('YYYY')

    const listHoliday = await db.query(QueryGetHoliday, {
      replacements: {
        startYear:years,
        endYear: years
      },
      type: QueryTypes.SELECT,
    });

    //untuk bypass sabtu dan minggu
    const dayWeekEnd = ["Sunday"];

       //masukan array holiday
    const arrHoliday = listHoliday.map((item) => item.calendar_date);


      const baseMpAll     = await dbSPL.query(qryBaseMpMonthly, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT,
      });

  
      //ALL emp
      // const endDateAll = findEndDate(baseMpAll, endDate)

      // const filEmpAllStart  = baseMpAll.filter(rcp => rcp.tgl_recap === startDate)      
      // const filEmpAllEnd    = baseMpAll.filter(rcp => rcp.tgl_recap === endDateAll)
      // const totalAllStart   = totalCol(filEmpAllStart, 'emp_total')
      // const totalAllEnd     = totalCol(filEmpAllEnd, 'emp_total')
      // const avgEmpAll       = (totalAllStart+totalAllEnd)/2

      //filter libur
      // const baseMp = baseMpAll.filter(
      //   (dt) =>
      //     !arrHoliday.includes(dt.tgl_recap) &&
      //     !dayWeekEnd.includes(moment(dt.tgl_recap, "YYYY-MM-DD").format("dddd"))
      // ); 
      
      const endDateLto      = findEndDate(baseMpAll, endDate)
      const filterEmpStart  = baseMpAll.filter(emp => emp.tgl_recap === startDate)
      const filterEmpEnd    = baseMpAll.filter(emp => emp.tgl_recap === endDateLto)
      const totalEmpStart   = totalCol(filterEmpStart, 'emp_total')
      const totalEmpEnd     = totalCol(filterEmpEnd, 'emp_total')
      const avgEmp          = (totalEmpStart+totalEmpEnd)/2


      // const getTglFromResul = getUniqueAttribute(baseMpSewingMonth, 'tgl_recap')
      const getListDept = getUniqueAttribute(baseMpAll, 'NameDept')
      
      // data card month 
      const totalEmp    = totalEmpEnd
      const totalEmpIn  = totalCol(baseMpAll, 'emp_in')
      const totalEmpOut = totalCol(baseMpAll, 'emp_out')
      const ltoMonth    = totalEmpOut > 0 ? ChkNilaFlt(totalEmpOut / (totalEmpEnd + totalEmpOut)) * 100 : 0;

      //betulkan ini karena retun object
      const dataGroupTglDept = groupAndSumByDateAndDept(baseMpAll)//ini menjumlahkan selama satu bulan
      
      //lalu cari lto per tanggal per section
      // const addLtoPerDate = dataGroupTglDept.map(items => {
      //   let tlo =  items.emp_out > 0 ? ChkNilaFlt(items.emp_out / (items.emp_total + items.emp_out)) * 100 : 0; 
      //   return {...items, tlo}
      // })

      //lanjut cari avg emp per section berdasarkan start date dan end date
      const dataPerDept = getListDept.map(dept => {
        const filterByDept = dataGroupTglDept.filter(tems => tems.NameDept === dept)
        
        let endDateSec      = findEndDate(filterByDept, endDate)
        
        const findStartSec  = filterByDept.filter(item => item.tgl_recap === startDate)
        const findEndSec    = filterByDept.filter(item => item.tgl_recap === endDateSec)
        const deptEmpStart   = totalCol(findStartSec, 'emp_total')
        const deptEmpEnd     = totalCol(findEndSec, 'emp_total')
        const deptEmpIn      = totalCol(filterByDept, 'emp_in')
        const deptEmpout     = totalCol(filterByDept, 'emp_out')
        const avgEmpSec     = deptEmpStart+deptEmpEnd/2
        const deptLto        =  deptEmpout > 0 ? ChkNilaFlt(deptEmpout / (deptEmpEnd+deptEmpout)) * 100 : 0;

      return {
        IDDepartemen   : filterByDept[0].IDDepartemen,
        NameDept   :  filterByDept[0].NameDept,
        deptEmpStart,
        deptEmpEnd,
        deptEmpout,
        deptEmpIn,
        avgEmpSec,
        deptLto,
      }
      })

    const objDateMoment = {
      start: startDate,
      end: endDate,
    };

    const rangeDate = getRangeDate(objDateMoment);
// console.log('mampu sampai sini');

      //hapus weekend dan holiday
      // const dateOutHol = rangeDate.filter(
      //   (dt) =>
      //     !arrHoliday.includes(dt) &&
      //     !dayWeekEnd.includes(moment(dt, "YYYY-MM-DD").format("dddd"))
      // );

  const sumOfDate = sumEmpByDate(baseMpAll, rangeDate)
    
  const dataMonth = {
    dataCard       : { totalEmpStart, totalEmpEnd, avgEmp, totalEmp, totalEmpIn, totalEmpOut, totalTlo : ltoMonth},
    dataPerDept     : dataPerDept,
    dataDeptPerDate : dataGroupTglDept,
    sumOfDate      : sumOfDate
  }

  res.json({data : dataMonth, message : 'success get data month'})
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({
        error,
        message: "Terdapat error saat get data emp detail by line",
      });
  }
}


function groupAndSumByDateAndDept(arr) {  
  const result = arr.reduce((acc, item) => {
    // Key berdasarkan tgl_recap dan section
    const key = `${item.tgl_recap}-${item.IDDepartemen}`;
    
    // Jika key belum ada di accumulator, buat objek baru
    if (!acc[key]) {
      acc[key] = {
        tgl_recap: item.tgl_recap,
        IDDepartemen: item.IDDepartemen,
        emp_total: 0,
        emp_absen: 0,
        emp_female: 0,
        emp_male: 0,
        emp_in: 0,
        emp_out: 0,
        emp_present: 0,
        schedule_jk: 0,
        NameDept: item.NameDept
      };
    }
    
    // Menambahkan nilai ke dalam akumulator
    acc[key].emp_total += item.emp_total;
    acc[key].emp_in += item.emp_in;
    acc[key].emp_out += item.emp_out;
    acc[key].emp_absen += item.emp_absen;
    acc[key].emp_present += item.emp_present;
    acc[key].emp_male += item.emp_male;
    acc[key].emp_female += item.emp_female;
    acc[key].schedule_jk += item.schedule_jk;

    return acc;
  }, {})

  const resultAndLto = Object.values(result).map(item => ({...item, absentBySch : item.schedule_jk - item.emp_present, lto: item.emp_out ? (item.emp_out/(item.emp_out+item.emp_total))*100 : 0}))
  return resultAndLto;
}