import dotenv from "dotenv";
import tedious from "tedious";
dotenv.config();
import { Sequelize } from "sequelize";
import redis from "redis";
const { REDIS_PASS, DB_HR, HR_NAME, HR_HOST, HR_USER, HR_PASS } = process.env;
tedious.Connection;


export const dbSPL = new Sequelize(`${DB_HR}`, `${HR_USER}`, `${HR_PASS}`, {
  host: HR_HOST,
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


export const redisConn = redis.createClient({
  url: 'redis://192.168.1.238:6379',
  password: REDIS_PASS, 
});