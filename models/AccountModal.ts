import *as mongoose from 'mongoose' ;
import { collection,error_code,variables } from "../constants";


const AccountSchema = new mongoose.Schema({ 
  [variables.HOLDER_NAME] : String,
  [variables.ACCOUNT_NUMBER] : Number,
  [variables.CONTACT] : String,
  [variables.NATIONAL_ID_NO] : String,
  [variables.ACCOUNT_TYPE] : String,
  [variables.BALANCE] : Number,
  [variables.CREATED_AT] : Date,  
})
export default mongoose.model(collection.ACCOUNTS, AccountSchema,collection.ACCOUNTS);