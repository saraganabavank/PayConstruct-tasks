
const collection={
    USERS:"users",
    BLOGS:"Blogs"
};
const error_code={
    success:"SUCCESS",                     // succes
    fail:"FAILED",                         // request_fail error occur at servel level
    expired:"EXP",        // no data found || empty result set
};

const variables={ 
    NAME:"name",
    PASSWORD:"password",
    EMAIL:"email",
    OB_ID:"_id",
    ACCESS_TOKEN:"access_token",
    MESSAGE:"message",
    BLOGER_ID:"bloger_id",
    BLOGER_INFO:"bloger_info",
    TITLE:"title",
    DESCRIPTION:"description",
    CREATED_AT:"created_at",
    BLOGS:"blogs",
    BLOGER:"bloger"
}

module.exports =  {collection,variables,error_code};