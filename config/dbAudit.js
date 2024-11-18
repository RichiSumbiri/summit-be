import dotenv from "dotenv";
import tedious from "tedious";
dotenv.config();
import { Sequelize } from "sequelize";
const { DB_NAME, HOST, USER, PASS } = process.env;
tedious.Connection;

export const dbAudit = new Sequelize("audit_trial", "egi", "Sum54321`", {
  host: "192.168.6.253",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

export const dbSPL = new Sequelize("sumbiri_hrm", "sumbiri", "082234725445", {
  host: "192.168.0.180",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

export const dbWdms = new Sequelize("wdms", "sumbirispm", "Asd54321`", {
  host: "192.168.1.241",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});

export const dbSlave1 = new Sequelize("db_sumbiri_one", "sumbirispm", "Asd54321`", {
  host: "192.168.1.252",
  port: 3306,
  dialect: "mysql",
  logging: false,
  timezone: "+07:00",
  dialectOptions: {
    timezone: "local",
  },
});
