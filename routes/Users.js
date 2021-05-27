require('dotenv').config();
const express = require("express");
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken')
// data extractor from request and supporting functions
const helper = require('../helper');
const constant = require('../constant');

router.post('/Register', async (req, res) => {
    var data = {}; 
    var response = { data: {}, status: {} }; 
    data = helper.getData(req); 
    // constructing response 
    try {  
      const email = data[constant.variables.EMAIL];
      const password = data[constant.variables.PASSWORD];
      const name = data[constant.variables.NAME];

      var result = await db.getDB().collection(constant.collection.USERS).aggregate([ 
         {$match:{[constant.variables.EMAIL]:email}}
        ]).toArray();
      if(result.length){ 
          response=helper.addToData(response,constant.variables.MESSAGE,"User already exist.");
          response=helper.addToStatus(response,constant.error_code.success);
      }
      else{
        const {insertedCount}=await db.getDB().collection(constant.collection.USERS).insertOne(
            {
                [constant.variables.EMAIL]:email,
                [constant.variables.NAME]:name,
                [constant.variables.PASSWORD]:password
            });
        if(insertedCount===1){
            response=helper.addToData(response,constant.variables.MESSAGE,"User registered. Please login");
            response=helper.addToStatus(response,constant.error_code.success);
        }
        else{
            response=helper.addToData(response,constant.variables.MESSAGE,"Try again later.");
            response=helper.addToStatus(response,constant.error_code.fail);
        }
      } 
    } catch (err) {
      response = await helper.addToStatus(response, constant.error_code.fail);
    }
    finally {
      res.send(response);
    }
})

router.post('/Login', async (req, res) => {
    
  var data = {}; 
  var response = { data: {}, status: {} };
  // extracting request as data, meta
  data = helper.getData(req); 
  // constructing response 
  try {  
    const email = data[constant.variables.EMAIL];
    const password = data[constant.variables.PASSWORD];
    var result = await db.getDB().collection(constant.collection.USERS).aggregate([ 
       {$match:{[constant.variables.EMAIL]:email,[constant.variables.PASSWORD]:password}}
      ]).toArray();
    if(result.length){
        const user = {user_id:result[0][constant.variables.OB_ID] };
        const accessToken = generateAccessToken(user) 
        response=helper.addToData(response,constant.variables.ACCESS_TOKEN,accessToken);
        response=helper.addToStatus(response,constant.error_code.success);
    }
    else{
        response=helper.addToStatus(response,constant.error_code.fail);
    } 
  } catch (err) {
    response = await helper.addToStatus(response, constant.error_code.fail);
  }
  finally {
    res.send(response);
  }
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,)
}
module.exports = router;







