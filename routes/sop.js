const express = require('express');
const router = express.Router();
const sql = require('mssql');
const db = require('../config/config');

router.get('/', function(req, res){
    sql.connect(db, function(err){
        if (err) {
            console.log(err)
        }
        const request = new sql.Request();
        // request.input('id', sql.NVarChar, '111111')
        request.query('select * from deviceSop', function(err, result){
            if (err) {
                console.log(err)
                res.send(err)
            }
            sql.close();
            console.log('data send')
            res.json(result.recordset);
        });
    })
})

router.post('/', function(req, res){
    sql.connect(db, function(err){
        if (err) {
            console.log(err)
        }
        const request = new sql.Request();
        request.input('deviceId', sql.NVarChar, req.body.id)
               .input('description', sql.NVarChar, req.body.description)
               .query('insert into deviceSop (deviceId, description) values (@deviceId, @description)', function(err, result){
                   if (err) {
                       console.log(err)
                       res.send(err)
                   }
                   sql.close();
                   res.json(result.recordset);
               })
    })
})

router.delete('/:id', function(req, res){
    sql.connect(db, function(err){
        if (err) {
            console.log(err);
        }
        const request = new sql.Request();
        request.input('id', sql.NVarChar, req.params.id)
               .query('delete from deviceSop where deviceId=@id', function(err, result){
                   if (err) {
                       console.log(err);
                       res.send(err);
                   }
                   sql.close();
                   res.json(result.recordset);
               })
    })
})

module.exports = router;