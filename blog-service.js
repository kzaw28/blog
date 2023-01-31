const fs = require("fs");
const { resolve } = require("path");

var posts = [];
var categories = [];

// GETTING DATA FROM JSON FILES  -------------------------------------

function loadPosts() {
    return new Promise(function(resolve, reject){
        fs.readFile("./data/posts.json", "utf-8", (err,data)=> {
            if (err) reject("Unable to read file");
            // Parse data from JSON into an array and store it in posts
            posts = JSON.parse(data);
            resolve("Posts successfully loaded");
        });
    });
}

function loadCategories() {
    return new Promise(function(resolve, reject){
        fs.readFile("./data/categories.json", "utf-8", (err,data)=> {
            if (err) reject("Unable to read file");
            // Parse data from JSON into an array and store it in posts
            categories = JSON.parse(data);
            resolve("Categories successfully loaded");
        });
    });
}


function initialize() {
    return new Promise(function(resolve, reject){
        loadPosts()
        .then(loadCategories)
        .catch(function(errorMsg){
            reject(errorMsg);
        });

        resolve("Success");
    });
};

// ---------------------------------------------------------------------
function getAllPosts() {
    return new Promise(function(resolve, reject){
        if (posts.length == 0)
        {
            reject("No results returned");
        }
        resolve(function(){
            return posts;
        });
    });
};


function getPublishedPosts() {
    return new Promise(function(resolve, reject){
        if (posts.length == 0)
        {
            reject("No results returned");
        }
        resolve(function(){
            let tempArr = [];
            for (let post of posts) {
                if (post.published == true)
                {
                    tempArr.push(post);
                }
            };
            return tempArr;
        });
    });
};

function getCategories() {
    return new Promise(function(resolve, reject){
        if (categories.length == 0)
        {
            reject("No results returned");
        }
        resolve(function(){
            return categories;
        });
    });
};