const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// MSSQL
const sql = require("mssql");
const db = require("../config/config");

router.post("/signup", async function(req, res, next) {
  try {
    let pool = await sql.connect(db);
    let hash = await bcrypt.hash(req.body.password, 10);
    let result = await pool
      .request()
      .input("username", sql.NVarChar, req.body.username)
      .input("password", sql.NVarChar, hash)
      .query(
        "insert into userList (username, password) values (@username, @password)"
      );

    let userData = await pool
      .request()
      .input("username", sql.NVarChar, req.body.username)
      .query("select username from userList where username=@username");

    sql.close();
    let user = {
      ...userData.recordset[0],
      token: jwt.sign(userData.recordset[0], process.env.SECRET_KEY, {
        expiresIn: 60 * 60
      })
    };
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
});

router.post("/signin", async function(req, res, next) {
  try {
    let pool = await sql.connect(db);
    let result = await pool
      .request()
      .input("username", sql.NVarChar, req.body.username)
      .query("select * from userList where username=@username");

    sql.close();
    let isMatch = await bcrypt.compare(
      req.body.password,
      result.recordset[0].password
    );
    if (isMatch) {
      let token = jwt.sign(
        {
          username: result.recordset[0].username
        },
        process.env.SECRET_KEY
      );
      return res.status(200).json({
        username: result.recordset[0].username,
        token
      });
    } else {
      return next({ status: 400, message: "Invalid Username/Password." });
    }
  } catch (err) {
    return next({ status: 400, message: "Invalid Username/Password." });
  }
});

module.exports = router;
