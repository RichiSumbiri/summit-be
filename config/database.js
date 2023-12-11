import dotenv from "dotenv";
import tedious from "tedious";
dotenv.config();
import { Sequelize } from "sequelize";
const { DB_NAME, HOST, USER, PASS } = process.env;
tedious.Connection;

// const db = new Sequelize(DB_NAME, USER, PASS, {
//   host: HOST,
//   port: 44170,
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
// });

// const db = new Sequelize("db_sumbiri_one", "root", "", {
//   host: "localhost",
//   port: 3306,
//   dialect: "mysql",
//   logging: false,
//   timezone: "+07:00",
//   dialectOptions: {
//     timezone: "local",
//   },
// });

const db = new Sequelize("db_sumbiri_one", "sumbirispm", "Asd54321`", {
  host: "192.168.1.236",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

const db2 = new Sequelize("db_sumbiri_one", "sumbirispm", "Asd54321`", {
  host: "192.168.1.252",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

const dbAudit = new Sequelize("audit_trial", "egi", "Sum54321``", {
  host: "192.168.1.253",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

export default db;
