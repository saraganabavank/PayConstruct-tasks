import { Request } from 'express'; 

export class Helper {
    public getData(req:Request){
        return req.body;
    }
    
    public setErrorCode(res:Object, value:any){
        res["errCode"] = value
        return res;
    }

    public addToData(res:any, key:string, value:any){
        res[key] = value
        return res;
    }
    
    public randomNumber(dig:number){
        return Math.floor(Math.random() * Math.pow(10, dig));
    }
    
    public uniqueid(ID_LENGTH = 30){
        var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var rtn = '';
        for (var i = 0; i < ID_LENGTH; i++) {
            rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
        }
        return (new Date().getTime()) + rtn;
    }
    
    public validate(data:any, require_fields:any){
        let error = [] 
        for(let key of require_fields)
        { 
            if(!(data.hasOwnProperty(key)))
            {
                error.push({field:key,err_msg:'require field'})
            }
            if(["initial_deposit","amount"].includes(key))
            {
                if(data[key]<=0 || typeof data[key]!="number" )
                {
                    error.push({field:key,err_msg:'Invalid amount.'})
                }
            }   
        } 
        return error;
    }
    
 
}
 

