import Moment from "moment";
import momentRange from "moment-range";
import multer from "multer";
const moment = momentRange.extendMoment(Moment);

export const CheckNilai = (nilai) => {
  if (!nilai || isNaN(nilai)) return 0;

  return nilai;
};

export const CheckNilaiToint = (nilai) => {
  if (!nilai || isNaN(nilai)) return 0;

  return parseInt(nilai);
};

export const totalCol = (dataTable, namecol) => {
  return dataTable.reduce(
    (sum, item) =>
      parseInt(CheckNilai(sum)) + parseInt(CheckNilai(item[namecol])),
    0
  );
};

function calculateTimeDifference(startTime, endTime) {
  // Parse time strings using Moment.js
  // const startTime = moment(time1, "HH:mm:ss");
  // const endTime = moment(time2, "HH:mm:ss");

  // Calculate the difference in minutes
  const duration = moment.duration(endTime.diff(startTime));
  const minutesDiff = duration.asMinutes();

  return minutesDiff;
}

function calcWhByShift(timeRest, start, end, minusRes) {
  if (start.isBefore(timeRest) && end.isAfter(timeRest)) {
    return calculateTimeDifference(start, end) - minusRes;
  } else {
    return calculateTimeDifference(start, end);
  }
}

export const findWh = (shift, schdDate, startH, endH) => {
  const end_rest_normal = moment("12:00:00", "HH:mm:ss");
  const end_rest_a = moment("10:30:00", "HH:mm:ss");
  const end_rest_b = moment("18:30:00", "HH:mm:ss");
  const stratHour = moment(startH, "HH:mm:ss");
  const endHour = moment(endH, "HH:mm:ss");
  //const shiftEndHour = moment(endShift, "HH:mm:ss");
  // const curTime = moment();

  const prodDate = moment(schdDate);
  const dayName = prodDate.format("dddd");

  // if (shiftEndHour.isAfter(curTime) || prodDate.isAfter(curTime)) return planWh;

  const weekeEnd = ["Saturday", "Sunday"];

  //jika Normal shift
  if (shift === "Normal_A") {
    //jika tidak termasuk week
    if (!weekeEnd.includes(dayName)) {
      if (
        stratHour.isBefore(end_rest_normal) &&
        endHour.isAfter(end_rest_normal)
      ) {
        return calculateTimeDifference(stratHour, endHour) - 60;
      }
    } else {
      return calculateTimeDifference(stratHour, endHour);
    }
    return calcWhByShift(end_rest_normal, stratHour, endHour, 60);
  } else if (shift === "Shift_A") {
    if (weekeEnd.includes(dayName)) {
      return calcWhByShift(end_rest_a, stratHour, endHour, 60);
    } else {
      return calcWhByShift(end_rest_a, stratHour, endHour, 30);
    }
  } else {
    if (weekeEnd.includes(dayName)) {
      return calcWhByShift(end_rest_b, stratHour, endHour, 60);
    } else {
      return calcWhByShift(end_rest_b, stratHour, endHour, 30);
    }
  }
};

export const findRTT = (shift, startH, endH, schDate, target, tppm) => {
  const curdate = moment(); //curent date or curent time
  const prodDate = moment("2023-07-12");
  const stratHour = moment(startH, "HH:mm:ss");
  const endHour = moment(endH, "HH:mm:ss");
  const curTarget =
    findWh(shift, schDate, startH, curdate.format('"HH:mm:ss"')) * tppm;

  // if (prodDate.isBefore(curdate)) return target;
  if (prodDate.isAfter(curdate)) return 0;

  if (schDate === curdate.format("YYYY-MM-DD")) {
    if (curdate.isAfter(endHour)) {
      return target;
    } else if (curdate.isBefore(stratHour)) {
      return 0;
    } else if (curTarget > target) {
      return target;
    } else {
      return curTarget;
    }
  } else {
    return target;
  }
};

// const test = findRTT(
//   "Normal_A",
//   "07:00:00",
//   "15:00:00",
//   "2023-07-13",
//   500,
//   1.19
// );
// console.log(test);

export const ChkNilaFlt = (nilai) => {
  const newNilai = parseFloat(nilai);
  if (!newNilai || isNaN(newNilai)) {
    return 0;
  } else {
    return newNilai;
  }
};

//untuk sort
export function CompareBy(a, b, key) {
  if (a[key] < b[key]) {
    return -1;
  }
  if (a[key] > b[key]) {
    return 1;
  }
  return 0;
}

// hitung eff
export function JmlEff(eh, ah) {
  const Eff = (CheckNilai(eh) / CheckNilai(ah)) * 100;
  if (!Number.isFinite(Eff)) return 0;
  return Eff;
}

//sumby colom
export const SumByColoum = (dataTable, namecol) => {
  return dataTable.reduce(
    (sum, item) => CheckNilai(sum) + CheckNilai(item[namecol]),
    0
  );
};

export const roundNumber = (number, digitAfterComa) => {
  if (!number || isNaN(number)) return 0;
  if (!digitAfterComa) return Math.round(number);

  const decimal = digitAfterComa * 10;
  return Math.round(number * decimal) / decimal;
};

export function getRangeDate(newDate) {
  const { start, end } = newDate; // object berdasarkan moment

  //get range date
  return Array.from(moment.range(start, end).by("days")).map((day) =>
    day.format("YYYY-MM-DD")
  );
}

export function customSortByLetterFirst(arrOfObj, key) {
  return arrOfObj.sort((a, b) => {
    const matchA = a[key].match(/(\d+)(\D+)/);
    const matchB = b[key].match(/(\d+)(\D+)/);

    // Handle cases where there is no match (only letters)
    if (!matchA && !matchB) {
      // Return default order (unchanged)
      return 0;
    } else if (!matchA) {
      // A has only letters, should come after B
      return 1;
    } else if (!matchB) {
      // B has only letters, should come after A
      return -1;
    }

    // Both have the pattern with numbers and letters
    const [numA, letterA] = matchA.slice(1);
    const [numB, letterB] = matchB.slice(1);

    if (letterA < letterB) return -1;
    if (letterA > letterB) return 1;

    return numA - numB;
  });
}

// export function customSortByLetterFirst(arrOfObj, key) {
//   return arrOfObj.sort((a, b) => {
//     const [numA, letterA] = a[key].match(/(\d+)(\D+)/).slice(1);
//     const [numB, letterB] = b[key].match(/(\d+)(\D+)/).slice(1);

//     if (letterA < letterB) return -1;
//     if (letterA > letterB) return 1;

//     return numA - numB;
//   });
// }

export function customSortByNumberFirst(arrOfObj, key) {
  return arrOfObj.sort((a, b) => {
    const [numA, letterA] = a[key].match(/(\d+)(\D+)/).slice(1);
    const [numB, letterB] = b[key].match(/(\d+)(\D+)/).slice(1);

    if (numA !== numB) {
      return numA - numB;
    }

    if (letterA < letterB) return -1;
    if (letterA > letterB) return 1;

    return 0; // Angka dan huruf sama
  });
}

export function cstmArrSortSizeByLetter(arr) {
  return arr.sort((a, b) => {
    // Pisahkan angka dan huruf
    const [numA, letterA] = a.match(/(\d+)(\D+)/).slice(1);
    const [numB, letterB] = b.match(/(\d+)(\D+)/).slice(1);

    // Bandingkan huruf dulu
    if (letterA < letterB) return -1;
    if (letterA > letterB) return 1;

    // Jika huruf sama, bandingkan angka
    return numA - numB;
  });
}

export function cstArrSortByNumberFirst(arr) {
  return arr.sort((a, b) => {
    // Pisahkan angka dan huruf
    const [numA, letterA] = a.match(/(\d+)(\D+)/).slice(1);
    const [numB, letterB] = b.match(/(\d+)(\D+)/).slice(1);

    // Bandingkan angka dulu
    if (numA !== numB) {
      return numA - numB;
    }

    // Jika angka sama, bandingkan huruf
    if (letterA < letterB) return -1;
    if (letterA > letterB) return 1;

    return 0; // Angka dan huruf sama
  });
}

export function replaceMonthToIndonesian(dateStr) {
  // English to Indonesian month mapping
  const monthMapping = {
    January: "Januari",
    February: "Februari",
    March: "Maret",
    April: "April",
    May: "Mei",
    June: "Juni",
    July: "Juli",
    August: "Agustus",
    September: "September",
    October: "Oktober",
    November: "November",
    December: "Desember",
  };

  // Replace each English month with the corresponding Indonesian month
  for (const [engMonth, indMonth] of Object.entries(monthMapping)) {
    const regex = new RegExp(engMonth, "g"); // create regex to match all instances
    dateStr = dateStr.replace(regex, indMonth);
  }

  return dateStr;
}

export function convertMonthToRoman(monthNumber) {
  // Array of Roman numerals for each month (1-12)
  const romanMonths = [
    "I", // January
    "II", // February
    "III", // March
    "IV", // April
    "V", // May
    "VI", // June
    "VII", // July
    "VIII", // August
    "IX", // September
    "X", // October
    "XI", // November
    "XII", // December
  ];

  // Check if month number is valid (1-12)
  if (monthNumber < 1 || monthNumber > 12) {
    return "Invalid month number";
  }

  // Return the corresponding Roman numeral
  return romanMonths[monthNumber - 1];
}


export const EmpPhotos = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../../assets/images/photos/'); // Specify the destination folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename conflicts
  },
});
