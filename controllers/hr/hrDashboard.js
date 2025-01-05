import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { Op, QueryTypes } from "sequelize";
import {
  Attandance,
  getLemburForAbsen,
  karyawanOut,
  qryDailyAbsensi,
} from "../../models/hr/attandance.mod.js";
import moment from "moment";
import { ChkNilaFlt } from "../util/Utility.js";

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
      // logging: console.log
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
