const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID; 


const dbname = "Payment"; 
// const url = "mongodb+srv://saraganabavan:saraganabavan123@cluster0.xzcmx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const mongoOptions = { useNewUrlParser: true,useUnifiedTopology:true };

const state = {
    db: null
};

const connect = (cb) => {
    // if state is not NULL
    // Means we have connection already, call our CB
    if (state.db)
        cb();
    else {
        // attempt to get database connection
        MongoClient.connect(process.env.DB_URL, mongoOptions, (err, client) => {
            // unable to get database connection pass error to CB
            if (err)
                cb(err);
            // Successfully got our database connection
            // Set database connection and call CB
            else {
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

// returns OBJECTID object used to 
const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

// returns database connection 
const getDB = () => {
    return state.db;
}
const closeDB = () => {
    state.db = null;
}



module.exports = { getDB, connect, getPrimaryKey, closeDB };