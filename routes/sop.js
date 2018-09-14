const express = require('express');
const router = express.Router();

// MSSQL
const sql = require('mssql');
const db = require('../config/config');

// Handle upload file
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, '../sop_gen_client/public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage
})

// sop Routes

// Get sop list
router.get('/list', function(req, res){
    sql.connect(db, function(err){
        if (err) {
            console.log(err)
        }
        const request = new sql.Request();
        request.query('select alarmId,description from alarmSop ', function(err, result){
            if (err) {
                console.log(err)
                res.send(err)
            }
            sql.close();
            let flag = result.recordset.length;
            console.log('data send')
            if (flag) {
                console.log('not null')
            }
            res.json(result.recordset);
        });
    })
})

// Get sop by id
router.get('/:alarmId', function (req, res) {
    sql.connect(db, function (err) {
        if (err) {
            console.log(err)
        }
        const request = new sql.Request();
        request.input('alarmId', sql.NVarChar, req.params.alarmId)
               .query('select * from alarmSop where alarmId=@alarmId', function (err, result) {
                    if (err) {
                        console.log(err)
                        res.send(err)
                    }
                    sql.close();
                    let flag = result.recordset.length;
                    if (flag) {
                        res.json(result.recordset);
                    } else {
                        res.json({
                            message: 'Data not found'
                        })
                    }
                    
                });
    })
})

// Create new sop
router.post('/', function(req, res){
    sql.connect(db, function(err){
        if (err) {
            console.log(err)
        }
        const request = new sql.Request();
        request.input('alarmId', sql.NVarChar, req.body.alarmId)
               .input('description', sql.NVarChar, req.body.description)
               .input('detail', sql.NVarChar, req.body.detail)
               .input('date', sql.BigInt, Date.now())
               .query('insert into alarmSop (alarmId, description, detail, date) values (@alarmId, @description, @detail, @date)', function(err, result){
                   if (err) {
                       console.log(err)
                       res.send(err)
                   }
                   sql.close();
                   res.json(result.recordset);
               })
    })
})

// Delete sop by id
router.delete('/:alarmId', function(req, res){
    sql.connect(db, function(err){
        if (err) {
            console.log(err);
        }
        const request = new sql.Request();
        request.input('alarmId', sql.NVarChar, req.params.alarmId)
               .query('delete from alarmSop where alarmId=@alarmId', function(err, result){
                   if (err) {
                       console.log(err);
                       res.send(err);
                   }
                   sql.close();
                   res.json(result.recordset);
               })
    })
})

// Upload file and store by id
router.post('/:alarmId/upload', upload.array('file'), function(req, res){
    // Handle uploaded file path
    var files = {
        dest: []
    }
    for (var i = 0; i < req.files.length; i++) {
        let path = req.files[i].path.slice(25);
        files.dest.push(path);
    }
    var paths = JSON.stringify(files);
    
    // Write path data into sql
    sql.connect(db, function (err) {
        if (err) {
            console.log(err)
        }
        const request = new sql.Request();
        request.input('alarmId', sql.NVarChar, req.params.alarmId)
               .input('date', sql.BigInt, Date.now())
               .input('files', sql.NVarChar, paths)
               .query('update alarmSop set files=@files, date=@date where alarmId=@alarmId', function (err, result) {
            if (err) {
                console.log(err)
                res.send(err)
            }
            sql.close();
            console.log('data send')
            res.send('result.recordset');
        });
    })
})

module.exports = router;