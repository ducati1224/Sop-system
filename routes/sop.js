const express = require("express");
const router = express.Router();
const { loginRequired } = require("../middleware/auth");

// MSSQL
const sql = require("mssql");
const db = require("../config/config");

// Handle upload file
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./dist/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage
});

// sop Routes

// Get sop list
router.get("/list", function(req, res, next) {
  sql.connect(
    db,
    function(err) {
      if (err) {
        sql.close();
        return next({
          status: 500,
          message: "資料庫無回應，請稍後再試。"
        });
      }
      const request = new sql.Request();
      request.query("select alarmId,description from alarmSop ", function(
        err,
        result
      ) {
        if (err) {
          sql.close();
          return next({
            status: 500,
            message: "資料庫無回應，請稍後再試。"
          });
        } else {
          sql.close();
          res.json(result.recordset);
        }
      });
    }
  );
});

// Get sop by id
router.get("/:alarmId", function(req, res, next) {
  sql.connect(
    db,
    function(err) {
      if (err) {
        sql.close();
        return next({
          status: 500,
          message: "資料庫無回應，請稍後再試。"
        });
      }
      const request = new sql.Request();
      request
        .input("alarmId", sql.NVarChar, req.params.alarmId)
        .query("select * from alarmSop where alarmId=@alarmId", function(
          err,
          result
        ) {
          if (err) {
            sql.close();
            return next({
              status: 500,
              message: "資料庫無回應，請稍後再試。"
            });
          } else {
            sql.close();
            res.json(result.recordset);
          }
        });
    }
  );
});

// Create new sop
router.post("/", loginRequired, upload.array("file"), function(req, res, next) {
  var files = { dest: [] };
  if (req.files.length) {
    for (var i = 0; i < req.files.length; i++) {
      // console.log(req.files[i].path)
      let path = req.files[i].path.slice(5);
      // console.log(path)
      files.dest.push(path);
    }
    var paths = JSON.stringify(files);
  }

  sql.connect(
    db,
    function(err) {
      if (err) {
        sql.close();
        return next({
          status: 500,
          message: "資料庫無回應，請稍後再試。"
        });
      }
      const request = new sql.Request();
      request
        .input("alarmId", sql.NVarChar, req.body.alarmId)
        .input("description", sql.NVarChar, req.body.description)
        .input("detail", sql.NVarChar, req.body.detail)
        .input("files", sql.NVarChar, paths)
        .input("date", sql.BigInt, Date.now())
        .query(
          "insert into alarmSop (alarmId, description, detail, files, date) values (@alarmId, @description, @detail, @files, @date)",
          function(err, result) {
            if (err) {
              sql.close();
              console.log("Update fail...");
              return next({
                status: 500,
                message: "資料庫無回應，請稍後再試。"
              });
            } else {
              sql.close();
              res.status(201).json("Upload success");
            }
          }
        );
    }
  );
});

// Edit sop by id
router.put("/:alarmId", loginRequired, upload.array("file"), function(
  req,
  res,
  next
) {
  var files = { dest: [] };
  if (req.files.length) {
    for (var i = 0; i < req.files.length; i++) {
      // console.log(req.files[i].path)
      let path = req.files[i].path.slice(5);
      // console.log(path)
      files.dest.push(path);
    }
    var paths = JSON.stringify(files);
  }

  sql.connect(
    db,
    function(err) {
      if (err) {
        sql.close();
        return next({
          status: 500,
          message: "資料庫無回應，請稍後再試。"
        });
      }
      const request = new sql.Request();
      request
        .input("originAlarmId", sql.NVarChar, req.params.alarmId)
        .input("alarmId", sql.NVarChar, req.body.alarmId)
        .input("description", sql.NVarChar, req.body.description)
        .input("detail", sql.NVarChar, req.body.detail)
        .input("date", sql.BigInt, Date.now());
      if (req.files.length) {
        request
          .input("files", sql.NVarChar, paths)
          .query(
            "update alarmSop set alarmId=@alarmId, description=@description, detail=@detail, files=@files, date=@date where alarmId=@originAlarmId",
            function(err, result) {
              if (err) {
                sql.close();
                console.log("Update fail...");
                return next({
                  status: 500,
                  message: "資料庫無回應，請稍後再試。"
                });
              } else {
                sql.close();
                res.status(200).json("Update success");
              }
            }
          );
      } else {
        request.query(
          "update alarmSop set alarmId=@alarmId, description=@description, detail=@detail, date=@date where alarmId=@originAlarmId",
          function(err, result) {
            if (err) {
              sql.close();
              console.log("Update fail...");
              return next({
                status: 500,
                message: "資料庫無回應，請稍後再試。"
              });
            } else {
              sql.close();
              res.status(200).json("Update success");
            }
          }
        );
      }
    }
  );
});

// Delete sop by id
router.delete("/:alarmId", loginRequired, function(req, res, next) {
  sql.connect(
    db,
    function(err) {
      if (err) {
        sql.close();
        return next({
          status: 500,
          message: "資料庫無回應，請稍後再試。"
        });
      }
      const request = new sql.Request();
      request
        .input("alarmId", sql.NVarChar, req.params.alarmId)
        .query("delete from alarmSop where alarmId=@alarmId", function(
          err,
          result
        ) {
          if (err) {
            sql.close();
            console.log(err);
            res.json(err);
          } else {
            sql.close();
            res.json(result.recordset);
          }
        });
    }
  );
});

module.exports = router;
