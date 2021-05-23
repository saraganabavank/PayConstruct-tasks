import *as mongoose from 'mongoose' ;
import { collection,error_code,variables } from "../constants";


const AccountSchema = new mongoose.Schema({ 
  [variables.TYPE] : String,
  [variables.TO] : Number,
  [variables.FROM] : Number,
  [variables.REASON] : String,
  [variables.TRANSACTION_ID] : String, 
  [variables.AMOUNT] : Number,
  [variables.IS_SUCCESS] : Boolean,
  [variables.CREATED_AT] : Date,  
})
export default mongoose.model(collection.TRANS_ACTION, AccountSchema,collection.TRANS_ACTION);