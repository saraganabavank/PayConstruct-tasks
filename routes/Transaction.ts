import { Application, Request, Response } from 'express';
import { TransactionController } from '../controller/TransactionsController';

export class Transaction {

    private account: TransactionController = new TransactionController();

    public route(app: Application) {
        
      app.post('/Transaction/Transfer', (req: Request, res: Response) => {
          // account controller
            this.account.transfer(req, res);
        });
        
      app.get('/Transaction/History/:account_no', (req: Request, res: Response) => {
          //transaction controller
            this.account.history(req, res);
        }); 

    }
}