import { Request, Response } from 'express';
import Accounts from '../models/AccountModal';
import Transaction from '../models/TransactionModal';
import { Helper } from "../helper"
import { error_code, variables } from "../constants"

export class AccountController {
    private helper: Helper = new Helper();

    public async createUser(req: Request, res: Response) { 
        var data = {};
        var response = {};
        data = this.helper.getData(req);

        try {
            // validating the requre fields are exit or not   helper.validate(<data obect>,["field_name1",field_name2])
            let validate = this.helper.validate(data, [variables.ACCOUNT_TYPE, variables.HOLDER_NAME, variables.CONTACT, variables.NATIONAL_ID_NO, variables.INITIAL_DEPOSITE])
            if (validate.length == 0) {
                // account numnber generation  by getting no of existing accounts
                var account_no = (await Accounts.count()) + 1;
                //creating account
                let INSERT_DATA = {
                    [variables.ACCOUNT_TYPE]: data[variables.ACCOUNT_TYPE],
                    [variables.HOLDER_NAME]: data[variables.HOLDER_NAME],
                    [variables.CONTACT]: data[variables.CONTACT],
                    [variables.NATIONAL_ID_NO]: data[variables.NATIONAL_ID_NO],
                    [variables.BALANCE]: data[variables.INITIAL_DEPOSITE],
                    [variables.ACCOUNT_NUMBER]: account_no,
                    [variables.CREATED_AT]: new Date()
                }

                const new_user = new Accounts(INSERT_DATA)
                let result = await new_user.save(INSERT_DATA);
                console.log(result)
                 
                if(result._id) {
                    // Adding desposit record to transaction collection 
                    let INSERT_TRANS = {
                        [variables.TYPE]: 'initial_deposit',
                        [variables.TO]: account_no,
                        [variables.AMOUNT]: data[variables.INITIAL_DEPOSITE],
                        [variables.REASON]: "Account creation",
                        [variables.TRANSACTION_ID]: this.helper.uniqueid(),
                        [variables.IS_SUCCESS]: true,
                        [variables.CREATED_AT]: new Date()
                    }
                    const new_transaction = new Transaction(INSERT_TRANS)
                    let result_trans= await new_transaction.save(INSERT_TRANS);
                    if(result_trans._id){
                        //account is created successfully
                        response = this.helper.addToData(response, variables.MSG, "Account created Successfully");
                        response = this.helper.addToData(response, variables.ACCOUNT_NUMBER, account_no);
                        response = this.helper.setErrorCode(response, error_code.success);
                    }
                }
                 
            }
            else {
                //fields from request is invalid
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


    
    public async balanceEnquery(req: Request, res: Response) { 
        var data = {};
        var response = {};
        data = req.params;

        try {
             // validating  fields exist or not here checking account_no
            let validate = this.helper.validate(data, [variables.ACCOUNT_NUMBER])
            // account no is valid the validator.lenght==0
            if (validate.length == 0) {
            // getting balance
            let account = await Accounts.aggregate([{ $match: { [variables.ACCOUNT_NUMBER]: parseInt(data[variables.ACCOUNT_NUMBER]) } }]);
              console.log(account)
            if (account.length) {
                response = this.helper.addToData(response, variables.BALANCE, account[0][variables.BALANCE]);
                response = this.helper.setErrorCode(response, error_code.success);
            }
                //Invalid account number
            else {
                response = this.helper.addToData(response, variables.MSG, "Please check your account number.");
                response = this.helper.setErrorCode(response, error_code.fail);
            }
            }
            else {
            // fields from request is invalid 
            response = this.helper.addToData(response, variables.MSG, validate);
            response = this.helper.setErrorCode(response, error_code.fail);
            }
        }
        finally {
            res.send(response);
        }
    }
}