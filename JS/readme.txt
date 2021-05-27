Project Structor
----------------------
   app.js             // entry point
   chesse.log         // request and response log data
   db.js              // Database connection management here MongoDB with mongoClient
   helper.js          // common logics
   routes             // router and business logics 
   -> account.js      // accout related logics  account creation (POST) & balance enquery(GET) 
   -> transaction.js  // transaction related logics moneytransaction(POST) & transaction history(GET)

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
    Response         {"message":"Account created Successfully","account_no":2,"errCode":"SUCCESS"}
    response will contain Account number "account_no"

2)Amount Transaction 
   METHOD  POST 
   URL     http://localhost:3000/Transaction/Transfer
   
    Request Load     {"to":1,"from":2,"amount":100,"reason":"saving"}
    Response         {"message":"Amount transfered.","transaction_id":"1621690354918x8IN9OzVNQlEhQC1OYSfdVGYxOW1mw","errCode":"SUCCESS"}

3)Balance Enquery 
   METHOD  GET 
   URL     http://localhost:3000/Account/Balance/{account_no}   

    Request URL      http://localhost:3000/Account/Balance/1
    Response         {"balance":400,"errCode":"SUCCESS"}

3)Transaction History 
   METHOD  GET 
   URL     http://localhost:3000/Transaction/History/{account_no}   

    Request URL      http://localhost:3000/Transaction/History/1
    Response         {"history":[{"type":"credit","amount":500,"to":"self","date":"2021-05-22T14:02:22.493Z","transaction_id":"1621692142493AqQBupZRW3TEunZa6g1hEf9Hb1DIWR","is_success":true},{"type":"credit","amount":100,"from":2,"date":"2021-05-22T14:03:33.006Z","transaction_id":"1621692212182NMKVImr0kW9wXzNBjwmAcPHiLRPDtS","is_success":true},{"type":"credit","amount":100,"from":2,"date":"2021-05-22T14:03:35.213Z","transaction_id":"1621692214393jqb33ba3nvuYOEO4ljxuxbKtpwKgFJ","is_success":true},{"type":"debit","amount":100,"to":2,"date":"2021-05-22T14:03:42.193Z","transaction_id":"16216922213813MlEfk0tBLXj8TWrakmceESGNoEjRj","is_success":true}],"errCode":"SUCCESS"}
    