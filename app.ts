import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from 'mongoose';
import environment from "./environment";
import { Account } from "./routes/Account"; 
import { Transaction } from "./routes/Transaction";
import * as dotenv from 'dotenv';

class App {

   public app: express.Application;
   public mongoUrl: string = "";
   private account: Account = new Account(); 
   private transaction: Transaction = new Transaction(); 

   constructor() {
      this.app = express();
      this.config();
      this.mongoSetup();
      this.account.route(this.app);
      this.transaction.route(this.app);
   }

   private config(): void {
      // support application/json type post data
      this.app.use(bodyParser.json());
      dotenv.config();
      this.mongoUrl = ""+environment.getDBName()
      //support application/x-www-form-urlencoded post data
      this.app.use(bodyParser.urlencoded({ extended: false }));
   }

   private mongoSetup(): void { 
      mongoose.connect(this.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
   }

}
export default new App().app;