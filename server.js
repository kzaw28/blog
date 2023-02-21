/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kaung Khant Zaw Student ID: 157467218 Date: 20th February, 2023
*
*  Cyclic Web App URL: https://mushy-school-uniform-toad.cyclic.app/about
*
*  GitHub Repository URL: https://github.com/kzaw28/web322-app
*
********************************************************************************/ 



const path = require("path");
const express = require("express");
const app = express();
const multer = require("multer");
const cloudinary= require("cloudinary").v2;
const streamifier = require("streamifier");

const data = require("./blog-service")


// Cloudinary config ---------------------------------
cloudinary.config(
    {
        cloud_name: "dojcvsabu",
        api_key: "432299183778232",
        api_secret: "P6BxLJXX9Cu-Tw96UqFIVYFq7w8",
        secure: true
    }
);

// Multer variable without disk storage  --------------
const upload = multer();

// Port -----------------------------------------------
var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
};

// Serving static files ------------------------------
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
        let returnObj = {
            message: `${err}`
        };
        res.send(returnObj);
    }) 
});


app.get("/posts/add", function(req, res){
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
})


app.get("/posts", function(req, res){
    const category = req.query.category;
    const minDateStr = req.query.minDate;

    if (category)
    {
        data.getPostsByCategory(category)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            let returnObj = {
                message: `${err}`
            };
            res.send(returnObj);
        });
    } else if (minDateStr) {
        data.getPostsByMinDate(minDateStr)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            let returnObj = {
                message: `${err}`
            };
            res.send(returnObj);
        })
    } else 
    {
        data.getAllPosts()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            let returnObj = {
                message: `${err}`
            };
            res.send(returnObj);
        })
    }
});


app.get("/posts/:id", function(req, res){
    const postID = req.params.id;
    data.getPostsById(postID)
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        let returnObj = {
            message: `${err}`
        };
        res.send(returnObj);
    })
})

app.get("/categories", function(req, res){
    data.getCategories()
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        let returnObj = {
            message: `${err}`
        };
        res.send(returnObj)
    })
});

// Single fileupload with the name "image" in the req, adds a 'file' object to the req
app.post("/posts/add", upload.single('featureImage'), function(req, res){

    // If the file was uploaded to the 'req'
    if (req.file)
    {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                // Upload file to cloudinary
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded) => {
            processPost(uploaded.url);
        });
    } else {
        processPost("");
    }

    // Process Post Function Definition ----------------------------
    function processPost(imageUrl) {
        req.body.featureImage = imageUrl;
        data.addPost(req.body)
        .then((newPost)=> {
            res.redirect("/posts");
        })
        .catch((err) => {
            let returnObj = {
                message: `${err}`
            };
            res.send(returnObj)
        })
    }    
});

app.get('*', function(req, res){
    res.status(404).send("Page Not Found");
});
// ----------------------------------------------



data
    .initialize()
    .then((res)=>{app.listen(HTTP_PORT, onHttpStart);})
    .catch((err)=>{console.log(err);})