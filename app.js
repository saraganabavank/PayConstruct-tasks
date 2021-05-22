'use strict';
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotenv = require('dotenv');
const account = require('./routes/account');
const transaction = require('./routes/transaction');  
const db = require('./db');
const log4js = require("log4js");

//logger for managing request and response logs
log4js.configure({
  appenders: { cheese: { type: "file", filename: "cheese.log" } },
  categories: { default: { appenders: ["cheese"], level: "error" } }
});

const logger = log4js.getLogger("cheese"); 

// accesss for  .env
dotenv.config();
// parer for json request loads
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// managing inbound and outbound logs 
app.use((req, res, next) => {
  req.logger=logger;
  logger.fatal(req.url);
  logger.fatal(JSON.stringify(req.body)); 
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];
  res.write = (...restArgs) => {
    chunks.push(Buffer.from(restArgs[0]));
    oldWrite.apply(res, restArgs);
  };
  res.end = (...restArgs) => {
    if (restArgs[0]) {
      chunks.push(Buffer.from(restArgs[0]));
    }
    const body = Buffer.concat(chunks).toString('utf8');
    logger.fatal(body);
    oldEnd.apply(res, restArgs);
  }

  // managing cross orgin - CORS
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.header("Access-Control-Allow-Credentials",true);
  res.header('Cache-Control','no-cache, no-store, must-revalidate');
  res.header('Accept-Encoding','gzip');
  res.header('Pragma','no-cache');
  res.header('Expires','0');
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// routers and business logics
app.use("/Transaction", transaction); 
app.use("/Account",account);

// handling 404 not found request
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
 
// handling internal server issues
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// DataBase connection establishment   
db.connect((err) => {
  // If err unable to connect to database
  // End application
  if (err) { 
    logger.error("unable to connect to database");
    process.exit(1);
  }
  // Successfully connected to database app will listen on port 3000
  else {
    app.listen(3000, () => {
      console.log('connected to database, app listening on port 3000');
      logger.fatal('connected to database, app listening on port 3000');

    });
  }
});