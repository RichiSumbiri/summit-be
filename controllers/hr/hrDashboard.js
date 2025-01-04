import { dbSPL, dbWdms } from "../../config/dbAudit.js";
import { Op, QueryTypes } from "sequelize";
import {
  Attandance,
  getLemburForAbsen,
  karyawanOut,
  qryDailyAbsensi,
} from "../../models/hr/attandance.mod.js";
import moment from "moment";

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
    const totalTetap = getAbsen.filter(
      (item) => item.StatusKaryawan === "TETAP"
    );
    
    const totalKontrak = getAbsen.filter(
      (item) => item.StatusKaryawan === "KONTRAK"
    );
    // const findNodept = getAbsen.filter(items => !items.NameDept)
    // console.log(findNodept);
    getAbsen.sort((a, b) => { if (a.NameDept < b.NameDept) { return -1; } if (a.NameDept > b.NameDept) { return 1; } return 0; });

    const deptCount = getAbsen.reduce((acc, employee) => {
      const department = employee.NameDept;
      if (acc[department]) {
        acc[department]++;
      } else {
        acc[department] = 1;
      }
      return acc;
    }, {});

    const depAttd = getAbsen.reduce((acc, employee) => {
      if (employee.scan_in) {
        const department = employee.NameDept;
        if (acc[department]) {
          acc[department]++;
        } else {
          acc[department] = 1;
        }
      }
      return acc;
    }, {});

    const dataDash = {
      totalEmp: getAbsen.length,
      totalAttd: totalAttd.length,
      totalEmpOut: getEmpOut[0].karyawanOut,
      totalEmpIn: totalEmpIn.length,
      totalMale: totalMale.length,
      totalFemale: totalFemale.length,
      totalTetap: totalTetap.length,
      totalKontrak: totalKontrak.length,
      deptCount,
      depAttd,
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
