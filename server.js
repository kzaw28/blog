var path = require("path");
var express = require("express");
var app = express();

var data = require("./blog-service")

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
};

// Serving static files
app.use(express.static('public')); 

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