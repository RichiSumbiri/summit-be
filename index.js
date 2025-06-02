import express from "express";
import dotenv from "dotenv";
import db from "./config/database.js";
import db2 from "./config/database.js";
import { redisConn } from "./config/dbAudit.js";

dotenv.config();
import cookieParser from "cookie-parser";
import FileUpload from "express-fileupload";
import cors from "cors";
import cron from "node-cron";

import sumbiriOneRoute from "./routes/index.js";
import { funcReschedule } from "./cronjob/cronSchdVsActual.js";
import { cronLogDialyOut } from "./cronjob/logDailyOutput.js";
import { mainCutReSchedule, recapCutDepManual, recapLogDepCut } from "./cronjob/cronCutingSchd.js";
import { recapWipMonitoring } from "./cronjob/sewWipRecap.js";
import { recapQcDefPart } from "./cronjob/logQcDefPart.js";
import moment from "moment";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// import fs from "fs"; //untuk ssl
// import https from "https"; //untuk ssl
// import bodyParser from 'body-parser';

const PORT = 5001;
const app = express();

const runDb = async () => {
  try {
    await db.authenticate();
    await db2.authenticate();
    console.log("DB Connected");
    await redisConn.connect();
    console.log("Redis Connected");
  } catch (err) {
    console.log("Unable to connect to the database SPM:", err);
  }
};

runDb();
// funcReschedule();
// cron.schedule(" 30 * * * *", () => {
//   console.log("running a task reschedule");
// funcReschedule();
// });

// cron.schedule(" 1 * * * * *", () => {
//   console.log("running a task log");
//   cronLogDialyOut();
// });
// mainCutReSchedule();

// cron.schedule(" 1 * * * * *", () => {
//   console.log("running a task log");
//   recapWipMonitoring();
// });

// cron.schedule(" 1 * * * * *", () => {
//   console.log("running a task log");
//   recapQcDefPart();
// });


// cron.schedule(" 1 * * * * *", () => {
//   const now = moment();
//   // Tentukan tanggal kerja berdasarkan waktu
//   let workDate = now.clone();
//   if (now.hour() < 6) {
//       workDate = workDate.subtract(1, 'day'); // Ambil hari sebelumnya jika sebelum pukul 06:00
//   }
//   const date = workDate.format("YYYY-MM-DD");

//   console.log(`Running a task log for workDate: ${date}`);
//   recapLogDepCut(date);
// });

// recapCutDepManual('December/2024')


// app.use(cors());

function logOriginalUrl(req, res, next) {
  console.log("Request URL:", req.originalUrl);
  next();
}

var whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.1.192:3001",
  "http://192.168.6.177:3000",
  "http://192.168.1.192:3000",
  "https://spmqc.sumbiri.com",
  "https://spmqc1.sumbiri.com",
  "https://spmqc2.sumbiri.com",
  "https://spm.sumbiri.com",
  "https://api.sumbiri.com",
  "https://rekrutmen.sumbiri.com",
];

// const options = {
//   key: fs.readFileSync("server.key"),
//   cert: fs.readFileSync("server.cert"),
// };
app.use(express.static("public"));
app.use("/images/sketch", express.static(path.join(__dirname, "assets/images/sketch")));
app.use("/images/style", express.static(path.join(__dirname, "assets/images/styles")));
// app.use('/assets/images/photos', express.static('uploadempphoto'));
// app.use(
//   cors({
//     credentials: true,
//     origin: function (origin, callback) {
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else if (whitelist.indexOf(origin) !== -1 && express.static("public")) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//   })
// );

app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Cek apakah origin diizinkan, jika tidak, lakukan redirect
  if (whitelist.indexOf(origin) === -1) {
    return res.redirect(302, "https://spm.sumbiri.com");
  }

  // Jika origin diizinkan, lanjut ke middleware berikutnya
  next();
});

app.use(cookieParser());
// app.use(express.json());
app.use(express.json({ limit: "45mb" }));
app.use(FileUpload());

app.use("/", sumbiriOneRoute);

app.listen(PORT, () => console.log(`Server Runing On port : ${PORT}`));
