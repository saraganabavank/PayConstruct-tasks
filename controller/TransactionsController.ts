import { Request, Response } from 'express';
import Accounts from '../models/AccountModal';
import Transaction from '../models/TransactionModal';
import { Helper } from "../helper"
import { error_code, variables } from "../constants"

export class TransactionController {
  private helper: Helper = new Helper();

  public async transfer(req: Request, res: Response) {
    var data = {};
    var response = {};
    data = this.helper.getData(req);

    try {
      // validating the requre fields are exit or not   helper.validate(<data obect>,["field_name1",field_name2])
      let validate = this.helper.validate(data, [variables.TO, variables.FROM, variables.AMOUNT, variables.REASON])
      if (validate.length == 0) {

        let to = data[variables.TO];
        let from = data[variables.FROM];
        let amount = data[variables.AMOUNT];
        let reason = data[variables.REASON];
        let tr_id = this.helper.uniqueid()
        // check sender and receiver account is exist or not 
        let sender = await Accounts.aggregate([{ $match: { [variables.ACCOUNT_NUMBER]: from } }]);
        let receiver = await Accounts.aggregate([{ $match: { [variables.ACCOUNT_NUMBER]: to } }]);
        // sender and receiver exist then it's length == 1  to!=from  sender and receiver not be same
        if (sender.length && receiver.length && to != from) {
          // check  sender has the amount to transfer 
          if (sender[0][variables.BALANCE] >= amount) {

            // detecting amount from  sender account
            var result_detection_amount = await Accounts.updateOne({ [variables.ACCOUNT_NUMBER]: from }, { $inc: { [variables.BALANCE]: -amount } });
            if (result_detection_amount.n && result_detection_amount.nModified) {
              // adding transaction recoard to transaction collection
              let new_trans = new Transaction({
                [variables.TYPE]: 'transfer',
                [variables.TO]: to,
                [variables.FROM]: from,
                [variables.AMOUNT]: amount,
                [variables.REASON]: reason,
                [variables.TRANSACTION_ID]: tr_id,
                [variables.IS_SUCCESS]: true,
                [variables.CREATED_AT]: new Date()
              });
              let result = await new_trans.save();
              if (result._id) {
                // Here incrementing the amount in reciver account in account collection
                var result_credit_amount = await Accounts.updateOne({ [variables.ACCOUNT_NUMBER]: to }, { $inc: { [variables.BALANCE]: amount } });
                if (result_credit_amount.n && result_credit_amount.nModified) {
                  response = this.helper.addToData(response, variables.MSG, "Amount transfered.");
                  response = this.helper.addToData(response, variables.TRANSACTION_ID, tr_id);
                  response = this.helper.setErrorCode(response, error_code.success);
                }
                else {
                  response = this.helper.addToData(response, variables.MSG, "Transaction is failed. Any amount detected will be refund with in 8 working days.");
                  response = this.helper.setErrorCode(response, error_code.fail);
                }
              }

            }
            else {
              // transaction not incompleted 
              var trans_update_for_fail = await Transaction.updateOne({ [variables.TRANSACTION_ID]: tr_id }, { $set: { [variables.IS_SUCCESS]: false, [variables.IS_REFUNDED]: false } });
              response = this.helper.addToData(response, variables.MSG, "Your transaction not compleated, please try again later.");
              response = this.helper.setErrorCode(response, error_code.fail);
            }
          }
          else {
            // amount in the sendr account is insufficient 
            response = this.helper.addToData(response, variables.MSG, "Amount in your account is insufficient to complete the transaction");
            response = this.helper.setErrorCode(response, error_code.fail);
          }
        }
        else {
          // here sender or receiver account is invalid
          if (to != from) {
            response = this.helper.addToData(response, variables.MSG, sender.length ? "Please check beneficiary account number." : "Account number is invalid.");
            response = this.helper.setErrorCode(response, error_code.fail);
          }
          //  sender and receiver accounts are same 
          else {
            response = this.helper.addToData(response, variables.MSG, "Sender and beneficiary should be different.");
            response = this.helper.setErrorCode(response, error_code.fail);
          }
        }
      }
      else {
        // fields from request is invalid 
        response = this.helper.addToData(response, variables.MSG, validate);
        response = this.helper.setErrorCode(response, error_code.fail);
      }
    } catch (err) {
      response = this.helper.setErrorCode(response, error_code.fail);
      //   req.logger.error(err);
    }
    finally {
      res.send(response);
    }
  }



  public async history(req: Request, res: Response) {
    var data = {};
    var response = {};
    data = req.params;
    try {
      let validate = this.helper.validate(data, [variables.ACCOUNT_NUMBER])
      if (validate.length == 0) {

        //Getting transaction history
        let history = await Transaction.aggregate([{ $match: { $or: [{ [variables.TO]: parseInt(data[variables.ACCOUNT_NUMBER]) }, { [variables.FROM]: parseInt(data[variables.ACCOUNT_NUMBER]) }] } }]);
       console.log(history.length)
        if (history.length) {
          history = history.map((val) => {
            if (val[variables.TYPE] == variables.TRANSFER) {
              if (val[variables.TO] == data[variables.ACCOUNT_NUMBER]) {
                return ({ [variables.TYPE]: "credit", [variables.AMOUNT]: val[variables.AMOUNT], [variables.FROM]: val[variables.FROM], [variables.DATE]: val[variables.CREATED_AT], [variables.TRANSACTION_ID]: val[variables.TRANSACTION_ID], [variables.IS_SUCCESS]: val[variables.IS_SUCCESS] })
              }
              else {
                return ({ [variables.TYPE]: "debit", [variables.AMOUNT]: val[variables.AMOUNT], [variables.TO]: val[variables.TO], [variables.DATE]: val[variables.CREATED_AT], [variables.TRANSACTION_ID]: val[variables.TRANSACTION_ID], [variables.IS_SUCCESS]: val[variables.IS_SUCCESS] })
              }
            }
            else if (val[variables.TYPE] == variables.INITIAL_DEPOSITE) {
              return ({ [variables.TYPE]: "credit", [variables.AMOUNT]: val[variables.AMOUNT], [variables.TO]: "self", [variables.DATE]: val[variables.CREATED_AT], [variables.TRANSACTION_ID]: val[variables.TRANSACTION_ID], [variables.IS_SUCCESS]: val[variables.IS_SUCCESS] })
            }
          })
          response = this.helper.addToData(response, variables.HISTORY, history);
          response = this.helper.setErrorCode(response, error_code.success);
        }
        else {
          // account number is invalid
          response = this.helper.addToData(response, variables.MSG, "Please check your account number.");
          response = this.helper.setErrorCode(response, error_code.fail);
        }
      }
      else {
        //fields from request is invalid
        response = this.helper.addToData(response, variables.MSG, validate);
        response = this.helper.setErrorCode(response, error_code.fail);
      }
    } catch (err) {
      response = this.helper.setErrorCode(response, error_code.fail);
    }
    finally {
      res.send(response);
    }
  }
}