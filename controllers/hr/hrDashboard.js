import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { Op, QueryTypes } from "sequelize";
import {
  allDeptTtl,
  Attandance,
  baseMpSewing,
  getLemburForAbsen,
  karyawanOut,
  karyawanOutSewing,
  qryDailyAbsensi,
  qryGetEmpInExpand,
  qryGetEmpOutExpand,
  SewingLineHR,
} from "../../models/hr/attandance.mod.js";
import moment from "moment";
import { CheckNilai, ChkNilaFlt, totalCol } from "../util/Utility.js";
import db from "../../config/database.js";
import { modelSumbiriEmployee } from "../../models/hr/employe.mod.js";

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

    let getAbsen = await dbSPL.query(baseMpSewing, {
      replacements: { date },
      type: QueryTypes.SELECT,
      // logging: console.log
    });

    getAbsen.sort((a, b) => {
      if (a.SITE_NAME < b.SITE_NAME) {
        return -1;
      }
      if (a.SITE_NAME > b.SITE_NAME) {
        return 1;
      }
      return 0;
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

    const ttlEmpOut = totalCol(getEmpOut, "karyawanOut");

    const totalAttd = getAbsen.filter((item) => item.scan_in);
    const totalEmpIn = getAbsen.filter((item) => item.TanggalMasuk === date);
    const totalMale = getAbsen.filter((item) => item.JenisKelamin === 0);
    const totalFemale = getAbsen.filter((item) => item.JenisKelamin === 1);
    const totalTlo =
      ChkNilaFlt(ttlEmpOut / (getAbsen.length + ttlEmpOut)) * 100;

    const dataEmpPerSec = getDataPerSection(getAbsen);
    const dataChartDept = dataChartSection(dataEmpPerSec);
    const dataTtlHcVsAbs = getTotalCountAndVariance(dataEmpPerSec);
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
      totalEmpIn: totalEmpIn.length,
      totalMale: totalMale.length,
      totalFemale: totalFemale.length,
      // totalTetap: totalTetap.length,
      // totalKontrak: totalKontrak.length,
      dataPerSec: joinResult,
      totalTlo: totalTlo,
      dataChartDept,
      dataTtlHcVsAbs,
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
    if (acc[section]) {
      acc[section].count++;
    } else {
      acc[section] = { count: 1, scan_in: 0 };
    }
    if (employee.scan_in) {
      acc[section].scan_in++;
    }
    return acc;
  }, {});

  Object.keys(dataSection).forEach((section) => {
    if (!dataSection[section].hasOwnProperty("scan_in")) {
      dataSection[section].scan_in = 0;
    }
    dataSection[section].variance =
      dataSection[section].count - dataSection[section].scan_in;
  });

  return dataSection;
};

function dataChartSection(dataBysec) {
  const deptName = Object.keys(dataBysec) || [];
  if (dataBysec) {
    const arrHc = deptName.map((item) => dataBysec[item].count);
    const absente = deptName.map((item) => dataBysec[item].variance);
    // const arrAttd = deptName.map(item => dataBysec[item].scan_in)

    const based = [
      {
        name: "Head Count",
        // type: "column",
        data: arrHc,
      },
      {
        name: "Absenteeism",
        // type: "column",
        data: absente,
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
      return totals;
    },
    { total_count: 0, total_variance: 0 }
  );
};

export const getExpandEmpIn = async (req, res) => {
  try {
    const { date, type } = req.params;
    let query = qryGetEmpInExpand;
    if (type === "empOut") {
      query = qryGetEmpOutExpand;
    }
    const dataEmpIn = await dbSPL.query(query, {
      replacements: { date },
      type: QueryTypes.SELECT,
    });

    res.json({ data: dataEmpIn, message: "success get data emp in" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error, message: "Terdapat error saat get data emp in" });
  }
};
