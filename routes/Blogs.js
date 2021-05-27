const express = require("express");
const router = express.Router();
const db = require('../db');
// data extractor from request and supporting functions
const helper = require('../helper');
const constant = require('../constant');

router.get('/GetBlog/1.0.0', async (req, res) => {
  var response = { data: {}, status: {} };
  try {
     var blogs = await db.getDB().collection(constant.collection.BLOGS).aggregate([
      {
        $lookup: {
          from: constant.collection.USERS,
          let: { id: '$' + constant.variables.BLOGER_ID },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
            { $project: { _id: 0, name: 1 } },
            { $limit: 1 }
          ],
          as: constant.variables.BLOGER_INFO
        }
      }
    ]).toArray();
    blogs = blogs.map(val => {
      return {
        [constant.variables.TITLE]: val[constant.variables.TITLE],
        [constant.variables.DESCRIPTION]: val[constant.variables.DESCRIPTION],
        [constant.variables.CREATED_AT]: val[constant.variables.CREATED_AT],
        [constant.variables.BLOGER]: val[constant.variables.BLOGER_INFO][0][constant.variables.NAME]
      }
    })
    response = await helper.addToData(response, constant.variables.BLOGS, blogs);
    response = await helper.addToStatus(response, constant.error_code.success);
  } catch (err) {
    response = await helper.addToStatus(response, constant.error_code.fail);
  }
  finally {
    res.send(response);
  }
});


router.post('/AddBlog/1.0.0', async (req, res) => {
  var response = { data: {}, status: {} };
  var data = helper.getData(req);
  try {
    console.log(req.user.user_id)
    const { insertedCount } = await db.getDB().collection(constant.collection.BLOGS).insertOne(
      {
        [constant.variables.TITLE]: data[constant.variables.TITLE],
        [constant.variables.BLOGER_ID]: db.getPrimaryKey(req.user.user_id),
        [constant.variables.DESCRIPTION]: data[constant.variables.DESCRIPTION],
        [constant.variables.CREATED_AT]: new Date()
      });
    response = await helper.addToStatus(response, insertedCount === 1 ? constant.error_code.success : constant.error_code.fail);

  } catch (err) {
    response = await helper.addToStatus(response, constant.error_code.success);
  }
  finally {
    res.send(response);
  }
});


module.exports = router;