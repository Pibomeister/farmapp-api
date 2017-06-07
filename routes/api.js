'use strict';

const express = require('express');
const fs = require('fs');
const router = express.Router();
const Pharmacy = require('../models/pharmacy');
const Drug = require('../models/drugs.js');
const User = require('../models/user');
const secrets = require('../config/secrets');
const jwt = require('jsonwebtoken');
// const neo4j = require('node-neo4j');

const neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", secrets.neo4j));
var session = driver.session();

module.exports = function(passport) {


    router.get('/drugs', function (req, res, next) {
        //console.log(req.header('Authorization'));
        console.log('VALID');
        Drug.find(function (err, data) {
            if (err) console.log(err);
            else {
                res.json(data);
            }
        });

    });

    function transformToBoolean(n){
        return n=='X' ? true : false;
    }

    function insertDrugsToDB(drugs) {
        var count = 0;
        for(var drug of drugs) {
            var dr = new Drug({
            _id: drug.codigo,
            name : drug.descripcion,
            existent : parseInt(drug.existencia),
            substance : drug.sustancia,
            laboratory : drug.laboratorio,
            price : parseFloat(drug.preciofarmacia),
            rating: [],
            discount : parseFloat(drug.descuento.slice(0,-1)),
            perf : transformToBoolean(drug.PERF),
            medic : transformToBoolean(drug.MEDIC),
            Antib : transformToBoolean(drug.ANTIB),
            Gen: transformToBoolean(drug.GEN),
            Ctrl : transformToBoolean(drug.CTRL),
            Refrig : transformToBoolean(drug.REFRIG),
            Normal : transformToBoolean(drug.NORMAL),
            Bonif : transformToBoolean(drug.BONIF),
            Limit : transformToBoolean(drug.LIMIT),
            Expires : transformToBoolean(drug.CADUCA),
            RetForExp : transformToBoolean(drug.DEVXCAD),
            FFS: transformToBoolean(drug.FFS),
            //imgUrl : ''
            imgUrl: "/images/" + drug.codigo + ".jpg",
                pharmacies : []
            }).save(function(err, data){
            if(err){
                console.log("COUNT VALUE", count);
                console.log(err);
            } 
            else {
                //console.log('insercion succesful', count);
                count++;

            }
            });
        }
    }


    router.post('/drugs', function (req, res, next) {
        //var drugs = req.body;
        //var total = drugs.length;
        fs.readFile('./catalogo.json', (err, data) => {
        if (err) throw err;
            var obj = JSON.parse(data);
            insertDrugsToDB(obj);
        });
        //insertDrugsToDB(drugs);
        /*res.json({
            "msg" : "inserted a total of " + total + " records"
        });*/

        



    });
    
    router.get('/drug/:did', (req, res)=> {
            Drug.findById(req.params.did).populate('pharmacies')
            .exec(function (err, result) {
                if (err) return res.status(500).send('Internal server error');
                res.json(result);
            })
        });


            /*session
                .run(`MATCH(n:Drug{_id:{did} })<-[:PURCHASED]-(o:User)
                    MATCH (o)-[:PURCHASED]->(rec:Drug)
                    WHERE NOT(rec._id = {did})
                    RETURN rec, count(*) AS score ORDER BY score DESC`, {did: req.params.did})
                .then(result => {
                    let recommendations = result.records.map( record => record._fields[0].properties);
                    res.send({drug: doc, recommendations});
                    session.close();     
                }).catch(err =>{
                    console.log('dat error', err);
                    session.close();
                });
        });
    })*/

    router.get('/pharmacy', function(req,res){
        Pharmacy.find(function (err, data) {
            if (err) console.log(err);
            else {
                res.json(data);
            }
        });
    });

    router.get('/pharmacyTest', function(req,res){

        Drug.findById('7501023108849')
            .populate('pharmacies')
            .exec(function(err,result){
                if(err) res.json({error:err});
                res.json({result:result});
        });

    });

    router.post('/pharmacy', function (req, res, next) {

        fs.readFile('./farmacias.json', (err, data) => {
            if (err) throw err;
            var obj = JSON.parse(data);
            var records = insertPharmaciesToDB(obj);
            res.send('insertados ' + records + ' registros');
        });

    });

    function insertPharmaciesToDB(pharmacies){
        var count = 0;
        for(var pharmacy of pharmacies){
            var pharmacyModel = new Pharmacy({
                name : pharmacy.name,
                address : pharmacy.address,
                lat : pharmacy.lat,
                lng : pharmacy.lng
            }).save(function(err, data){
                if(err){
                    console.log(err);
                }
                else {
                    count++;
                }
            });
        }

        return count;
    }

    // router.post('/drugneo4j', function(req,res) {
    //     var productname = req.body.name;
    //     db.cypherQuery("CREATE(p:Product {name:'" + productname + "'}) RETURN p", function (err, result) {
    //         if (err) console.log(err);
    //         console.log(result);
    //         res.send('Très bien');
    //     });
    // });

    // function createRelationship(userid, productid, type){
    //     db.insertRelationship(userid, productid, type, {
    //         times: '1',
    //         }, function(err, relationship){
    //         if(err) throw err;
    //         return "Added new relationship"

    //     });
    // };

    // router.post('/create/relationship', function(req,res){
    //     let userid=req.body.userid;
    //     let productid=req.body.productid;
    //     let type=req.body.type;
    //     createRelationship(userid,productid,type);
    //     res.send('chidixo');
    // });



    // router.get('/readlabels/:destinyNode', function(req,res){
    //     let id = req.params.destinyNode;
    //     let count = 0;
    //     let reslen = 0;
    //     let present = false;
    //     db.readRelationshipsOfNode(4, {types : ['BOUGHT']}, function(error, result){
    //                 console.log(result);
    //                 reslen = result.length;
    //                 result.forEach(function(rel){
    //                     count++;
    //                     if(rel._end == id){
    //                         present = true;
    //                         var next = parseInt(rel.times) + 1;
    //                         db.updateRelationship(rel._id, {
    //                             times: next.toString()
    //                         }, function(err, relationship){
    //                             if(err) throw err;

    //                             if(relationship === true){
    //                                 return res.send('Vergas');
    //                                 // relationship updated
    //                             } else {
    //                                 console.log('valiste pititio');
    //                                 //relationship not found, hence not updated.
    //                             }
    //                         });
    //                     }
    //                     else if(count == reslen && !present){
    //                         createRelationship(4,id, 'BOUGHT');
    //                         return res.send("new relationship created");
    //                     }
    //                 });

    //     });
    // });

    return router;
};
