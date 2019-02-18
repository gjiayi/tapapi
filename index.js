var express = require("express");
var app = express();

var bodyParser = require('body-parser');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "%",
    user: "user",
    password: "pw"
});

con.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected as id ' + con.threadId);
});


app.use(function (req, res, next) {
    // Website you wish to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

app.use(bodyParser.urlencoded({extended: true}));

app.post("/api/register", function(req, res){
    var teacher = req.body.teacher;
    var students = req.body.students;
    teacher = teacher.split("@")[0];

    for (idx in students) {
        var student = students[idx].split("@")[0]
        var querystring1 = 'INSERT INTO students VALUES(\'' + student + '\',false);';
        var querystring2 = 'INSERT INTO ' + teacher + ' VALUES(\'' + student + '\');';
        connection.query(querystring1, function (error, results, fields) {
            if (error) {
                res.json({ status: false, message: 'Failed to register student into portal' });
            }
            results.forEach(result => {
                console.log(result);
            });
        });
        connection.query(querystring2, function (error, results, fields) {
            if (error){
                res.json({ status: false, message: 'Failed to register student under teacher' });
            }
            results.forEach(result => {
                console.log(result);
            });
        });
    }
});

app.get("/api/commonstudents", function(req, res){
    console.log(req.query);
    var teacher = req.query.teacher;
    if (typeof teacher != "object") {
        teacher = teacher.split("%")[0];
        var querystring = 'SELECT * FROM ' + teacher + ';';
        connection.query(querystring, function (error, results, fields) {
            if (error) {
                res.json({ status: false, message: 'Failed to find common students' });
            }
            res.json({ status: true, results: {students : results} });
        });
    }
    else {
        var querystring = 'SELECT student FROM students'
        for (idx in teacher) {
            var thisteacher = teacher[idx].split("%")[0];
            querystring += ' INNER JOIN ' thisteacher + 'ON students.student = ' + thisteacher +'.student'
        }
        connection.query(querystring, function (error, results, fields) {
            if (error){
                res.json({ status: false, message: 'Failed to find common students' });}
            res.json({ status: true, results: {students: results} });
        });
    }

    res.end("Common Students");
});

app.post("/api/suspend", function(req, res){
    var student = req.body.student;
    student = student.split("@")[0];
    var querystring = 'UPDATE students SET suspended = true WHERE student = \'' + student + '\';';
    connection.query(querystring, function (error, results, fields) {
        if (error){
            res.json({ status: false, message: 'Failed to suspend student' });}
        results.forEach(result => {
            console.log(result);
        });
    });
});

app.post("/api/retrievefornotifications", function(req, res){
    var teacher = req.body.teacher;
    teacher = teacher.split("@")[0];
    var querystring = 'SELECT * FROM ' + teacher + ';';
    connection.query(querystring, function (error, results, fields) {
        if (error){
            res.json({ status: false, message: 'Failed to retrieve list of students' });}
        res.json({ status: true, results: {recipients: results} });    });
});


app.listen(3000, function(){
   console.log("Server running at port 3000");
});
