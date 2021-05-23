import { Application, Request, Response } from 'express';
import { AccountController } from '../controller/AccountController';

export class Account {

    private account: AccountController = new AccountController();

    public route(app: Application) {
        
        app.post('/Account/Create', (req: Request, res: Response) => {
            this.account.createUser(req, res);
        });
        
        app.get('/Account/Balance/:account_no', (req: Request, res: Response) => {
            this.account.balanceEnquery(req, res);
        }); 

    }
}