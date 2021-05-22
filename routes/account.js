const express = require("express");
const router = express.Router();
const helper = require('../helper');
const constant = require('../constant');



router.post('/Create', async (req, res) => {
  var data = {};
  var response = {};
  data = helper.getData(req);

  try {
    // validating the requre fields are exit or not   helper.validate(<data obect>,["field_name1",field_name2])
    let validate = helper.validate(data, [constant.variables.ACCOUNT_TYPE, constant.variables.HOLDER_NAME, constant.variables.CONTACT, constant.variables.NATIONAL_ID_NO, constant.variables.INITIAL_DEPOSITE])
    if (validate.length == 0) {
      // account numnber generation  by getting no of existing accounts
      var account_no = (await helper.getCollection(constant.collection.ACCOUNTS).count()) + 1;
      //creating account
      let INSERT_DATA = {
        [constant.variables.ACCOUNT_TYPE]: data[constant.variables.ACCOUNT_TYPE],
        [constant.variables.HOLDER_NAME]: data[constant.variables.HOLDER_NAME],
        [constant.variables.CONTACT]: data[constant.variables.CONTACT],
        [constant.variables.NATIONAL_ID_NO]: data[constant.variables.NATIONAL_ID_NO],
        [constant.variables.BALANCE]: data[constant.variables.INITIAL_DEPOSITE],
        [constant.variables.ACCOUNT_NUMBER]: account_no,
        [constant.variables.CREATED_AT]: new Date()
      }

      let { err: err1, result: result1 } = await helper.getCollection(constant.collection.ACCOUNTS).insertOne(INSERT_DATA);
      if (err1) {
        throw err1;
      }
      else { 
        // Adding desposit record to transaction collection 
        let INSERT_TRANS = {
          [constant.variables.TYPE]: 'initial_deposit',
          [constant.variables.TO]: account_no,
          [constant.variables.AMOUNT]: data[constant.variables.INITIAL_DEPOSITE],
          [constant.variables.REASON]: "Account creation",
          [constant.variables.TRANSACTION_ID]:helper.uniqueid() ,
          [constant.variables.IS_SUCCESS]:true,
          [constant.variables.CREATED_AT]: new Date()
        }
        let { err, result } = await helper.getCollection(constant.collection.TRANS_ACTION).insertOne(INSERT_TRANS);
        if (err) {
          throw err;
        }
        else {
          //account is created successfully
          response = helper.addToData(response, constant.variables.MSG, "Account created Successfully");
          response = helper.addToData(response, constant.variables.ACCOUNT_NUMBER, account_no);
          response = helper.setErrorCode(response, constant.error_code.success);
        }
      }
    }
    else {
      //fields from request is invalid
      response = helper.addToData(response, constant.variables.MSG, validate);
      response = helper.setErrorCode(response, constant.error_code.fail);
    }
  } catch (err) {
    response = helper.setErrorCode(response, constant.error_code.fail);
    req.logger.error(err);
  }
  finally {
    res.send(response);
  }
});


router.get('/Balance/:account_no', async (req, res) => {
  var data = {};
  var response = {};
  data = req.params;

  try {
    // validating  fields exist or not here checking account_no
    let validate = helper.validate(data, [constant.variables.ACCOUNT_NUMBER])
    // account no is valid the validator.lenght==0
    if (validate.length == 0) {
      // getting balance
      let account = await helper.getCollection(constant.collection.ACCOUNTS).aggregate([{ $match: { [constant.variables.ACCOUNT_NUMBER]: parseInt(data[constant.variables.ACCOUNT_NUMBER]) } }]).toArray();
      if (account.length) {
        response = helper.addToData(response, constant.variables.BALANCE, account[0][constant.variables.BALANCE]);
        response = helper.setErrorCode(response, constant.error_code.success);
      }
        //Invalid account number
      else {
        response = helper.addToData(response, constant.variables.MSG, "Please check your account number.");
        response = helper.setErrorCode(response, constant.error_code.fail);
      }
    }
    else {
      // fields from request is invalid 
      response = helper.addToData(response, constant.variables.MSG, validate);
      response = helper.setErrorCode(response, constant.error_code.fail);
    }
  } catch (err) {
    response = helper.setErrorCode(response, constant.error_code.fail);
    req.logger.error(err);
  }
  finally {
    res.send(response);
  }
});



module.exports = router;