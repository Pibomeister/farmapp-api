'use strict';

const express = require('express');
const router = express.Router();
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

    router.post('/drugs', function (req, res, next) {
        var body = req.body;
        var userid = req.query.userid;
        User.findById(userid, function(err, user){
            /*if(!user){
               return res.json({error: "Usuario invalido"});
            }*/
            var dr = new Drug({
                name : body.name,
                fancyName : body.fancyName,
                price : body.price,
                discount: body.discount,
                rating : body.rating,
                imgUrl : body.imgUrl,
                user : userid
            }).save(function(err, data){
                if(err) res.json({"Error": err});
                else
                    res.json({"Respuesta": "Satisfactorio"});
            });


        });


    });
    
    router.get('/drug/:did', (req, res)=> {
        Drug.findById(req.params.did, (err, doc)=>{
            if(err) return res.status(500).send('Internal server error');
            session
                .run(`MATCH(n:Drug{_id:{did} })<-[:PURCHASED]-(o:User)
                    MATCH (o)-[:PURCHASED]->(rec:Drug)
                    WHERE NOT(rec._id = {did})
                    RETURN rec, count(*) AS score ORDER BY score DESC`, {did: req.params.did})
                .then(result => {
                    let recommendations = result.records.map( record => record._fields[0].properties);
                    res.send({drug: doc, recommendations});
                    session.close();     
                }).catch(err =>{
                    console.log('dat error', error);
                    session.close();
                });       
        });
    })

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
