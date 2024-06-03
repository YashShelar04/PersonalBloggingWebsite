const express = require('express');
const path = require('path');
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const {query} = require("express");
const port = 3000
app.use(express.json())
app.use(express.static('./public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'public/views'));
const db =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Dragon@04',
    database:'blog'
})

db.connect((err)=>{
    if (err) throw err;
    console.log("Connected Successfully.")
})

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/templates/index.html');
})

app.get('/search',(req,res)=>{
    res.sendFile(__dirname+'/public/templates/search.html')
})

app.post('/find', (req, res) => {
    const inputType = req.body.inputType;
    const action = req.body.action;
    let sqlQuery;
    let queryParam;
    if(action === "Search"){
        switch (inputType) {
            case 'text':
                sqlQuery = 'SELECT * FROM blogdetails WHERE title = ?';
                queryParam = req.body.dynamicInput;
                break;

            case 'number':
                sqlQuery = 'SELECT * FROM blogdetails WHERE _id = ?';
                queryParam = req.body.dynamicInput;
                break;

            case 'date':
                sqlQuery = 'SELECT * FROM blogdetails WHERE DATE(date_of_save) = ?';
                queryParam = req.body.dynamicInput;
                break;

            default:
                return res.status(400).send('Invalid input type');
        }

        db.query(sqlQuery, [queryParam], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Internal Server Error');
            } else {
                res.render('result', { blogs: results });

            }
        });
    }else if(action === "Delete"){
        switch (inputType) {
            case 'text':
                sqlQuery = 'DELETE FROM blogdetails WHERE title = ?';
                queryParam = req.body.dynamicInput;
                break;

            case 'number':
                sqlQuery = 'DELETE FROM blogdetails WHERE _id = ?';
                queryParam = req.body.dynamicInput;
                break;

            case 'date':
                sqlQuery = 'DELETE FROM blogdetails WHERE DATE(date_of_save) = ?';
                queryParam = req.body.dynamicInput;
                break;

            default:
                return res.status(400).send('Invalid input type');
                break
        }
        db.query(sqlQuery, [queryParam], (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send('Internal Server Error');
            } else {
                res.send("Blog deleted successfully.");

            }
        });

    }

});



app.get('/write',(req,res)=>{
    res.sendFile(__dirname+'/public/templates/write.html')
})
app.post('/entry',(req,res)=>{
    const title = req.body.title
    const content = req.body.content
    const action = req.body.action

    if(action==='save'){
        const query = 'INSERT INTO blogdetails (title,content) values (?,?)'
        db.query(query,[title,content],(err,result)=>{
            if(err) {
                console.log(err)
                res.status(500).send("Server error")
            }else{
                res.send(`Blog Saved Successfully with id ${result.insertId}`)
            }
        })
    }
})

app.listen(port,()=>{
    console.log("Server is listening on port "+port)
})