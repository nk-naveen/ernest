const mysql = require('mysql2');
const express = require('express');
var app = express();
const { generateKeyPair } = require('crypto');
const crypto = require('crypto');

app.use(express.json());
var config = require('./config');
const res = require('express/lib/response');
const { db: { host, user, password, database, multipleStatements }, app: { port } } = config;



var connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    multipleStatements: multipleStatements
});

connection.connect((err)=>{
    if(!err)
        console.log('db connected');
    else
        console.log('db conn failed'+ JSON.stringify(err, undefined, 2));    
});

app.listen(port, () => console.log('server started: '+ port));

//get all users
app.get('/users',(req, res) => {
    connection.query('select * from user', (err, rows, fields) => {
        if(!err)
            res.send(rows);
        else
            console.log(err);    
    })
});

//get users by id

app.get('/user/:id', (req, res) => {
    connection.query('select * from user where userid=?', [req.params.id],(err, rows, fields)=> {
        if(!err)
            res.send(rows);
        else
            console.log(err);
    })
});

//delete a user
app.delete('/user/:id', (req, res) => {
    connection.query('delete from user where userid=?', [req.params.id], (err, rows, fields)=>{
        if(!err)
            res.send('user deleted successfully');
        else
            res.send(err);

    })
});

//add a user easy-way
app.post('/users/', (req, res) => {
    generateKeyPair('ed25519', {
        namedCurve: 'secp256k1', 
        publicKeyEncoding: {
            type: 'spki',
            format: 'der'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'der'
        }
        },
        (err, publicKey, privateKey) => { 
            if(!err){
                publicKey = publicKey.toString('hex')
                privateKey= privateKey.toString('hex')
            }
            else{console.log("Errr is: ", err);}
    // console.log(publicKey);
    var usr = req.body;
    var usrData = [usr.Name, usr.email, usr.num, publicKey]
    
    connection.query('INSERT INTO user(Name, email, num, publicKey) values(?)',[usrData], (err, rows) => {
        if(err) {
            console.log(err);
        }
        else
            res.send({"Your publicKey is": publicKey, "Your privateKey is": privateKey, rows:rows });
        })
    })
});

//update employee
app.put('/user/', (req, res) => {
    var usr = req.body;
    var sql = `set @userId=?;set @Name=?;set @email=?;set @num=?; CALL userio(@userId,@Name,@email,@num)`
    connection.query(sql, [usr.userId, usr.Name, usr.email, usr.num], (err, rows, fields) => {
        if (!err) {
            res.send('Updated successfully');
        }
        else
            res.send(err);
    })
});

//verify user 
app.get('/verify/:id',(req, res) => {

    // var usr = req.body;
    
    connection.query('SELECT publicKey FROM user WHERE userId=?', [req.params.id], (err, rows,fields) => {
        if(err) {
            console.log(err); 
        }
        else
            res.send(rows);
    })
});