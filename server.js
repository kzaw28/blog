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

// ROUTES ------------------------------

// The route "/" is redirected to "/about"
app.get("/", function(req, res){
    res.redirect("/about");
});

app.get("/about", function(req, res){
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/blog", function(req, res){
    res.send("TODO: get all posts who have published==true")
});

app.get("/posts", function(req, res){
    res.send("TODO: get all posts")
});

app.get("/categories", function(req, res){
    res.send("TODO: get all categories")
});

app.get('*', function(req, res){
    res.status(404).send("Page Not Found");
});

data
    .initialize()
    .then((res)=>{app.listen(HTTP_PORT, onHttpStart);})
    .catch((err)=>{console.log(err);})