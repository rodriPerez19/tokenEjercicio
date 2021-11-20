const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const methodOverride=require("method-override");

const app = express();
const SALT =10;
const PORT= process.env.PORT || 3000;
const roles=["admin","normal","basic","premium"];
let users=[];

app.get("/users",(req,res)=>{
    res.send(users);
});

app.get("/user/:email",(req,res)=>{
    const email= req.params.email;

    users.find((user)=>{
        if(user.email==email){
            res.send(user);
        }
    });
    res.send("no se encontro ningun usuario");
});

app.post("/user/:email/:name/:pass/:role",(req,res)=>{

    const {email,name,pass,role}= req.params;
    let flag=0;
    roles.forEach((rol)=>{
        if(rol==role){
            flag=1
        }
    })
    if(flag==1){
        let user={email,name,pass,role};

        bcrypt.hash(user.pass,SALT,(err,hash)=>{
            if(!err){
                user.pass=hash;
                users.push(user)
            }
        })
        const payload={
            user:user.nombre,
            role:user.role,
            country:"arg",
            lang:"es"
        };
        jsonwebtoken.sign(payload,user.pass,(err,token)=>{
            if(!err){
                res.send(token)
            }
            else{
                res.send("dio error")
            }
        })
    }
    else
        res.send("ingrese un rol valido")
})


app.post("/user/verify/:email/:pass",(req,res)=>{

    const token= req.headers.authorization.split(" ")[1]
    const email= req.params.email;
    const pass= req.params.pass;

    if(token){
        jsonwebtoken.verify(token,pass,(err,payload)=>{
            if(!err){
                users.find((user)=>{
                    if(user.email== email){
                        bcrypt.compare(pass,user.pass,(err,hash)=>{
                            if(!err){
                                res.send(`verify ${hash} `);
                            }
                        });
                    }
                });
            }
        });
    }
    else
     res.send("el token no llego");
   
});

app.listen(PORT,()=>{
    console.log("server start");
});