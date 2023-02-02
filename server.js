/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kaung Khant Zaw Student ID: 157467218 Date: 1st February, 2023
*
*  Cyclic Web App URL: https://mushy-school-uniform-toad.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/kzaw28/web322-app
*
********************************************************************************/ 



var path = require("path");
var express = require("express");
var app = express();

var data = require("./blog-service")

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
};

// Serving static files
app.use(express.static(path.join(__dirname, "public"))); 

// ROUTES ----------------------------------

// The route "/" is redirected to "/about"
app.get("/", function(req, res){
    res.redirect("/about");
});

app.get("/about", function(req, res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function(req, res){
    data.getPublishedPosts()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            var returnObj = {
                message: `${err}`
            };
            res.send(returnObj)
        }) 
});

app.get("/posts", function(req, res){
    data.getAllPosts()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            var returnObj = {
                message: `${err}`
            };
            res.send(returnObj)
        })
});

app.get("/categories", function(req, res){
    data.getCategories()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            var returnObj = {
                message: `${err}`
            };
            res.send(returnObj)
        })
});

app.get('*', function(req, res){
    res.status(404).send("Page Not Found");
});

data
    .initialize()
    .then((res)=>{app.listen(HTTP_PORT, onHttpStart);})
    .catch((err)=>{console.log(err);})