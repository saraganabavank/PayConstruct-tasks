Project Structor
----------------------
   server.ts             // entry point
   app.ts 
   helper.ts          // common logics
   environment.ts     // development & production environment config
   .env               // config for credentials
   constants.ts       // all variables and collection names magage here as string 
   routes             // router and business logics 
   -> Account.ts      // accout related logics  account creation (POST) & balance enquery(GET) 
   -> Transaction.ts  // transaction related logics moneytransaction(POST) & transaction history(GET)
   
   models             //collection structure
   -> AccountModal.ts            // mongoose mongoDB  structor for Account collection
   -> TransactionModal.ts        // mongoose mongoDB  structor for Transaction collection
   controller                    // Db hit and business logics managed here
   -> AccountController.ts       // Business logic for Account creation and balance enquery 
   -> TransactionController.ts   // Business logic for Transaction history and mony transfer
----------------------
Starting server  
  npm install
  npm start  
  access entry : http://localhost:3000/


-------------------------
API Document

1) Account Creation
   METHOD  POST 
   URL     http://localhost:3000/Account/Create
   
    Request Load     {"holder_name":"saraganabavan","contact":"9009045332","national_id_no":"0000000001","account_type":"saving","initial_deposit":500}
        REQUEST_LOAD_FIELDS
            holder_name - account holder's names
            contact - account holder's contact no
            national_id_no - account holder's national_id_no like AADHAR
            account_type -  type of account saving|current
            initial_deposit - initial deposit amount should be greater than zero

    Response         {"message":"Account created Successfully","account_no":2,"errCode":"SUCCESS"}
    response will contain Account number "account_no"
        RESPONSE_LOAD_FIELDS  
            errCode - SUCCESS (success ) | FAIL (failed )
            message - what happen on account creation  success or fail if fails reason for fails
            account_no - account no
 

2)Amount Transaction 
   METHOD  POST 
   URL     http://localhost:3000/Transaction/Transfer
   
    Request Load     {"to":1,"from":2,"amount":100,"reason":"saving"} 
       REQUEST_LOAD_FIELDS  
            to - sender account no 
            from - beneficiary account no
            amount - transaction amount no 
            reason - reason for transaction 
 
    Response         {"message":"Amount transfered.","transaction_id":"1621690354918x8IN9OzVNQlEhQC1OYSfdVGYxOW1mw","errCode":"SUCCESS"}
       RESPONSE_LOAD_FIELDS  
            errCode - SUCCESS (success transaction) | FAIL (failed transaction)
            message - what happen on transaction success or fail if fails reason for fails
            transaction_id - for Successfully transactions

3)Balance Enquery 
   METHOD  GET 
   URL     http://localhost:3000/Account/Balance/{account_no}   

    Request URL      http://localhost:3000/Account/Balance/1
      URL_PARAMS 
           account_no - account number it's type is number

    Response         {"balance":400,"errCode":"SUCCESS"}
      RESPONSE_LOAD_FIELDS  
           balance - balace on the account 
           errCode - SUCCESS (success) | FAIL (failed)


4)Transaction History 
   METHOD  GET 
   URL     http://localhost:3000/Transaction/History/{account_no}   

    Request URL      http://localhost:3000/Transaction/History/1
      URL_PARAMS 
         account_no - account number it's type is number
    Response         {"history":[{"type":"credit","amount":500,"to":"self","date":"2021-05-22T14:02:22.493Z","transaction_id":"1621692142493AqQBupZRW3TEunZa6g1hEf9Hb1DIWR","is_success":true},{"type":"credit","amount":100,"from":2,"date":"2021-05-22T14:03:33.006Z","transaction_id":"1621692212182NMKVImr0kW9wXzNBjwmAcPHiLRPDtS","is_success":true},{"type":"credit","amount":100,"from":2,"date":"2021-05-22T14:03:35.213Z","transaction_id":"1621692214393jqb33ba3nvuYOEO4ljxuxbKtpwKgFJ","is_success":true},{"type":"debit","amount":100,"to":2,"date":"2021-05-22T14:03:42.193Z","transaction_id":"16216922213813MlEfk0tBLXj8TWrakmceESGNoEjRj","is_success":true}],"errCode":"SUCCESS"}
      RESPONSE_LOAD_FIELDS   
         type - action type it's credit or debit, amount - value of the transction, 
         to -  if to == self (deposit by account holder) else receiving amount from someone who has account of account_number in the from filed 
         from - amount sender
         date -  date of transaction
         transaction_id - transaction id