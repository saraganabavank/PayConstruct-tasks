// extract data from request load
const getData = (req)=>
{
    return  req.body.data;
} 
// adding error code to status object of respone
const addToStatus = (res,value)=>
{
    res.status["errorCode"]=value
 return res;    
}
// adding object to data object of respone
const addToData = (res,key,value)=>
{
    res.data[key]=value
 return res;    
}
  
module.exports = {getData,addToData,addToStatus};

