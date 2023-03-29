/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kaung Khant Zaw Student ID: 157467218 Date: 29th March, 2023
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

const exphbs = require("express-handlebars");

const stripJs = require("strip-js");


const data = require("./blog-service")


// Set up engine to render content -----------
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li class="nav-item">'+ 
                '<a class="nav-link' + ((url == app.locals.activeRoute) ? ' add-post-nav-item" ' : '"') + '" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
        
    }


}));
app.set("view engine", ".hbs"); // Set the default view engine

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


// Fixing the routes (change category/5 to category) --
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.urlencoded({extended: true}));

// ROUTES ----------------------------------

// The route "/" is redirected to "/about"
app.get("/", function(req, res){
    res.redirect("/blog");
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await data.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await data.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await data.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await data.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await data.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await data.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await data.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});


app.get("/posts/add", function(req, res){
    data.getCategories()
    .then((data) => {
        res.render("addPost", {
            categories: data
        });
    }).catch((err) => {
        res.render("addPost", {
            categories: []
        });
    });
})


app.get("/posts", function(req, res){
    const category = req.query.category;
    const minDateStr = req.query.minDate;

    if (category)
    {
        data.getPostsByCategory(category)
        .then((data) => {
            if (data.length > 0)
            {
                res.render("posts", {
                    posts: data
                });
            }
            else
            {
                res.render("posts", {
                    message: "no results"
                });
            }
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
            if (data.length > 0)
            {
                res.render("posts", {
                    posts: data
                });
            }
            else
            {
                res.render("posts", {
                    message: "no results"
                });
            }
        })
        .catch((err) => {
            res.render("posts", {
                message: "no results"
            });
        })
    } else 
    {
        data.getAllPosts()
        .then((data) => {
            if (data.length > 0)
            {
                res.render("posts", {
                    posts: data
                });
            }
            else
            {
                res.render("posts", {
                    message: "no results"
                });
            }
        })
        .catch((err) => {
            res.render("posts", {
                message: "no results"
            });
        })
    }
});


app.get("/posts/:id", function(req, res){
    const postID = req.params.id;
    data.getPostById(postID)
    .then((data) => {
        if (data.length > 0)
        {
            res.render("posts", {
                posts: data
            });
        }
        else
        {
            res.render("posts", {
                message: "no results"
            });
        }
    })
    .catch((err) => {
        res.render("posts", {
            message: "no results"
        });
    })
})

app.get("/categories", function(req, res){
    data.getCategories()
    .then((data) => {
        if (data.length > 0)
        {
            res.render("categories", {
                categories: data
            });
        }
        else
        {
            res.render("categories", {
                message: "no results"
            });
        }
    })
    .catch((err) => {
        res.render("categories", {
            message: "no results"
        });
    })
});

app.get("/categories/add", function(req, res){
    res.render("addCategory");
}); 

app.post("/categories/add", function(req, res){
    const category = req.body;
    data.addCategory(category)
    .then((data) => {
        res.redirect("/categories");
    })
    .catch((err) => {
        res.render("categories", {
            message: "no results"
        });
    })
});

app.get("/categories/delete/:id", function(req, res){
    const categoryID = req.params.id;
    data.deleteCategoryById(categoryID)
    .then((data) => {
        res.redirect("/categories");
    })
    .catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found");
    })
}); 

app.get("/posts/delete/:id", function(req, res){
    const postID = req.params.id;
    data.deletePostById(postID)
    .then((data) => {
        res.redirect("/posts");
    })
    .catch((err) => {
        res.status(500).send("Unable to Remove Post / Post not found");
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
    res.render("404");
});
// ----------------------------------------------



data
    .initialize()
    .then((res)=>{app.listen(HTTP_PORT, onHttpStart);})
    .catch((err)=>{console.log(err);})