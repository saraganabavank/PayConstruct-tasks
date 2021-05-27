require('dotenv').config();
const jwt = require('jsonwebtoken') 
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const log4js = require('log4js');
const Blogs=require('./routes/Blogs'); 
const Users=require('./routes/Users'); 
const db = require('./db');
 

log4js.configure({
  appenders: { cheese: { type: "file", filename: "cheese.log" } },
  categories: { default: { appenders: ["cheese"], level: "error" } }
});
const logger = log4js.getLogger("cheese"); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
 
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next(); 

});

app.use("/Users", Users);
app.use("/Blogs",authenticateToken,Blogs);


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(authHeader)
  const token = authHeader
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { 
    if (err) return res.send({data:{},status:{errorCode:"access_denied"}})
    req.user = user
    next()
  })
}

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


db.connect((err) => {
  // If err unable to connect to database
  // End application
  if (err) { 
    logger.error('unable to connect to database');
    process.exit(1);
  }
  // Successfully connected to database
  // Start up our Express Application
  // And listen for Request
  else {
    app.listen(3010, () => {
      logger.fatal('connected to database, app listening on port 3003'); 
    });
   }
});