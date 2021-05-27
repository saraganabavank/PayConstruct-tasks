'use strict';
const db = require('./db');

const getCollection = (collection_name)=>{
    return db.getDB().collection(collection_name)

}
const getData = (req) => {
    return req.body;
}

const setErrorCode = (res, value) => {
    res["errCode"] = value
    return res;
}

const addToData = (res, key, value) => {
    res[key] = value
    return res;
}

const randomNumber = (dig) => {
    return Math.floor(Math.random() * Math.pow(10, dig));
}

const uniqueid=(ID_LENGTH = 30)=> {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return (new Date().getTime()) + rtn;
}

const validate=(data,require_fields)=>{
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

module.exports = { getCollection,getData, addToData, setErrorCode, randomNumber, uniqueid,validate };

