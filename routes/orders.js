/**
 * Created by Farid on 8/2/2017.
 */

'use strict';
const User = require('../models/user.js');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets');
const express = require('express');
const router = express.Router();
const transporter = require('../config/emailsender');
const {orderConfirm} = require('../emails/emails.js');
const Order = require('../models/order');

router.use('/', function(req,res,next){

        jwt.verify(req.get('Authorization'), secrets.jwt, function(err, decoded){
            if(err){ //token invaild/expired
                return res.status(401).json({
                    title : 'Not authenticated',
                    error :err
                });
            }
            next(); //let the request continue
        })
});

router.post('/', function(req,res){

    let uid = req.body.userId;
    let products = req.body.products;
    let total = req.body.total;
    User.findOne({'_id':uid}, function(err, user){
        console.log('user', user);
        let user_info = getValidUserInfo(user);
        if(err){
           return res.status(500).send('Something gat real fackd ap');
        }
        else{
        
        let order = new Order();
        order.status = 0;
        order.user = uid;
        order.products = products;
        order.total = total;
        order.save(function(err,order){
        if(err){
           return res.status(500).send('Something gat real fackd ap');
        }

        let condensedPedido = '';

        for(let p of products){
            condensedPedido = condensedPedido + `
            <tr style="padding:0;text-align:left;vertical-align:top"><td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">${p.name}</td><td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">${p.qty}</td><td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">$ ${p.price}.00</td><td style="-moz-hyphens:auto;-webkit-hyphens:auto;Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:400;hyphens:auto;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">$ ${p.sum}.00</td></tr>
            `
        }

        let orderid = order._id;

        let emailHtml = orderConfirm(user_info.name, condensedPedido, total);
        let mailOptions = {
                from: '"FarmApp Ventas👻" <roma.team.alpha@gmail.com>', // sender address
                to: user_info.email,
                subject: `Su pedido # ${orderid}`,
                html : emailHtml
            };
            transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                    res.status(201).send({message: 'Confirmación de órden enviada por correo'});
            });

        })
        }
    })

    

    
});

function getValidUserInfo(user){
    if(user.local.email !== undefined && user.local.email !== null){
        return {
            name : user.local.name,
            email : user.local.email
        }
    }

    else if(user.facebook.email !== undefined && user.facebook.email !== null){
        return {
            name : user.facebook.name,
            email : user.facebook.email
        }
    }

    else if(user.google.email !== undefined && user.google.email !== null){
        return {
            name : user.google.name,
            email : user.google.email
        }
    }
}

module.exports = router;