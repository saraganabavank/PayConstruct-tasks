const express = require("express");
const router = express.Router(); 
const helper = require('../helper');
const constant = require('../constant');



router.post('/Transfer', async (req, res) => {
  var data = {};  
  var response = { };
  data = helper.getData(req);   

  try { 
       // validating the requre fields are exit or not   helper.validate(<data obect>,["field_name1",field_name2])
     let validate = helper.validate(data,[constant.variables.TO,constant.variables.FROM,constant.variables.AMOUNT,constant.variables.REASON])
      if(validate.length==0)
      { 
        
        let to = data[constant.variables.TO];
        let from = data[constant.variables.FROM];
        let amount = data[constant.variables.AMOUNT];
        let reason = data[constant.variables.REASON]; 
        let tr_id = helper.uniqueid()
        // check sender and receiver account is exist or not 
        let sender = await helper.getCollection(constant.collection.ACCOUNTS).aggregate([{$match:{[constant.variables.ACCOUNT_NUMBER]:from}}]).toArray();
        let receiver = await helper.getCollection(constant.collection.ACCOUNTS).aggregate([{$match:{[constant.variables.ACCOUNT_NUMBER]:to}}]).toArray(); 
        // sender and receiver exist then it's length == 1  to!=from  sender and receiver not be same
        if(sender.length&&receiver.length && to!=from)
        {
            // check  sender has the amount to transfer 
            if(sender[0][constant.variables.BALANCE]>=amount)
            { 

              // detecting amount from  sender account
              var { result:result_detection_amount, err:err_detection_amount } = await helper.getCollection(constant.collection.ACCOUNTS).updateOne({[constant.variables.ACCOUNT_NUMBER]:from}, { $inc: { [constant.variables.BALANCE]: -amount} });
               if(result_detection_amount.n&&result_detection_amount.nModified){
                 // adding transaction recoard to transaction collection
              let INSERT_TRANS = {
                [constant.variables.TYPE]:'transfer',
                [constant.variables.TO]:to,
                [constant.variables.FROM]:from,
                [constant.variables.AMOUNT]:amount,
                [constant.variables.REASON]:reason,
                [constant.variables.TRANSACTION_ID]:tr_id,
                [constant.variables.IS_SUCCESS]:true,
                [constant.variables.CREATED_AT]:new Date()
              }
                let { err, result } = await helper.getCollection(constant.collection.TRANS_ACTION).insertOne(INSERT_TRANS);
                if (err) {
                  throw err;
                }
                else {  
              // Here incrementing the amount in reciver account in account collection
                  var { result:result_credit_amount, err:err_credit_amount } = await helper.getCollection(constant.collection.ACCOUNTS).updateOne({[constant.variables.ACCOUNT_NUMBER]:to}, { $inc: { [constant.variables.BALANCE]: amount} });
                  if(result_credit_amount.n&&result_credit_amount.nModified){
                    response = helper.addToData(response, constant.variables.MSG,"Amount transfered.");
                    response = helper.addToData(response,constant.variables.TRANSACTION_ID,tr_id);
                    response = helper.setErrorCode(response, constant.error_code.success); 
                  }
                  else{ 
                    response = helper.addToData(response, constant.variables.MSG,"Transaction is failed. Any amount detected will be refund with in 8 working days.");
                    response = helper.setErrorCode(response, constant.error_code.fail);
                  }
                }
              }
              else{ 
                // transaction not incompleted 
                var { result:in_comp_result_credit_amount, err:in_comp_err_credit_amount } = await helper.getCollection(constant.collection.TRANS_ACTION).updateOne({[constant.variables.TRANSACTION_ID]:tr_id}, { $set: { [constant.variables.IS_SUCCESS]:false,[constant.variables.IS_REFUNDED]:false} });
                response = helper.addToData(response, constant.variables.MSG,"Your transaction not compleated, please try again later.");
                response = helper.setErrorCode(response, constant.error_code.fail);
              } 
            }
            else{
              // amount in the sendr account is insufficient 
              response = helper.addToData(response, constant.variables.MSG,"Amount in your account is insufficient to complete the transaction");
              response = helper.setErrorCode(response, constant.error_code.fail); 
            }
        }
        else{
          // here sender or receiver account is invalid
          if(to!=from){
            response = helper.addToData(response, constant.variables.MSG,sender.length?"Please check beneficiary account number.":"Account number is invalid.");
            response = helper.setErrorCode(response, constant.error_code.fail); 
          }
          //  sender and receiver accounts are same 
          else{
            response = helper.addToData(response, constant.variables.MSG,"Sender and beneficiary should be different.");
            response = helper.setErrorCode(response, constant.error_code.fail);  
          }
        } 
      }
      else{
        // fields from request is invalid 
        response = helper.addToData(response,constant.variables.MSG,validate); 
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


router.get('/History/:account_no', async (req, res) => {
  var data = {};
  var response = {};
  data = req.params;

  try {
    // validating the requre fields are exit or not   helper.validate(<data obect>,["field_name1",field_name2])
    let validate = helper.validate(data, [constant.variables.ACCOUNT_NUMBER])
    if (validate.length == 0) {
    
      //Getting transaction history
      let history = await helper.getCollection(constant.collection.TRANS_ACTION).aggregate([{ $match: { $or:[{[constant.variables.TO]: parseInt(data[constant.variables.ACCOUNT_NUMBER]) },{[constant.variables.FROM]: parseInt(data[constant.variables.ACCOUNT_NUMBER]) }]} }]).toArray();
      if (history.length) {
        history=history.map((val)=>{
          if(val[constant.variables.TYPE] == constant.variables.TRANSFER)
          {
            if(val[constant.variables.TO] == data[constant.variables.ACCOUNT_NUMBER])
            {
              return ({[constant.variables.TYPE]:"credit",[constant.variables.AMOUNT]:val[constant.variables.AMOUNT],[constant.variables.FROM]:val[constant.variables.FROM],[constant.variables.DATE]:val[constant.variables.CREATED_AT],[constant.variables.TRANSACTION_ID]:val[constant.variables.TRANSACTION_ID],[constant.variables.IS_SUCCESS]:val[constant.variables.IS_SUCCESS]})
            }
            else{
              return ({[constant.variables.TYPE]:"debit",[constant.variables.AMOUNT]:val[constant.variables.AMOUNT],[constant.variables.TO]:val[constant.variables.TO],[constant.variables.DATE]:val[constant.variables.CREATED_AT],[constant.variables.TRANSACTION_ID]:val[constant.variables.TRANSACTION_ID],[constant.variables.IS_SUCCESS]:val[constant.variables.IS_SUCCESS]})
            }
          }
          else if(val[constant.variables.TYPE] == constant.variables.INITIAL_DEPOSITE){
            return ({[constant.variables.TYPE]:"credit",[constant.variables.AMOUNT]:val[constant.variables.AMOUNT],[constant.variables.TO]:"self",[constant.variables.DATE]:val[constant.variables.CREATED_AT],[constant.variables.TRANSACTION_ID]:val[constant.variables.TRANSACTION_ID],[constant.variables.IS_SUCCESS]:val[constant.variables.IS_SUCCESS]})
          }
        })
        response = helper.addToData(response, constant.variables.HISTORY, history);
        response = helper.setErrorCode(response, constant.error_code.success);
      }
      else {
        // account number is invalid
        response = helper.addToData(response, constant.variables.MSG, "Please check your account number.");
        response = helper.setErrorCode(response, constant.error_code.fail);
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


module.exports = router;