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


exports.initialize = function() {
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
exports.getAllPosts = function() {
    return new Promise(function(resolve, reject){
        if (posts.length == 0)
        {
            reject("No results returned");
        }
        resolve(posts);
    });
};


exports.getPublishedPosts = function() {
    return new Promise(function(resolve, reject){
        if (posts.length == 0)
        {
            reject("No results returned");
        }

        // Calculate the array to be put in resolve()
        let tempArr = [];
        for (let post of posts) {
            if (post.published == true)
            {
                tempArr.push(post);
            }
        };

        resolve(tempArr);
    });
};

exports.getCategories = function() {
    return new Promise(function(resolve, reject){
        if (categories.length == 0)
        {
            reject("No results returned");
        }
        resolve(categories);
    });
};

exports.addPost = function(postData) {
    return new Promise(function(resolve, reject){
        const isPublished = postData.published === "on";

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // Month is zero indexed
        const day = today.getDate();


        // Create a new blogPost object and give it values
        let blogPost = {
            id: posts.length + 1,
            body: postData.body,
            title: postData.title,
            postDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
            category: postData.category,
            featureImage: postData.featureImage,
            published: isPublished
        }

        if (posts.push(blogPost))
        {
            resolve(blogPost);
        } else {
            reject("Post was not added");
        }
    });
}

exports.getPostsByCategory = function(category) {
    return new Promise(function(resolve, reject){
        let newArr = []
        for (let key in posts) {
            const post = posts[key]; // Need to deference the key
            if (post.category == category)
            {
                newArr.push(post);
            }
        }
    
        if (newArr.length == 0)
        {
            reject("No result returned");
        } else {
            resolve(newArr);
        }
    });
}

exports.getPostsByMinDate = function(minDateStr) {
    return new Promise(function(resolve, reject){
        let newArr = [];
        for (let key in posts) {
            const post = posts[key];
            if (new Date(post.postDate) >= new Date(minDateStr))
            {
                newArr.push(post);
            }
        }
    
        if (newArr.length == 0)
        {
            reject("No result returned");
        } else {
            resolve(newArr);
        }
    });
}


exports.getPostsById = function(id) {
    return new Promise(function(resolve, reject){
        let tempPost = {};
        for (let key in posts) {
            const post = posts[key];
            if (post.id == id)
            {
                tempPost = post;
            }
        }
    
        if (Object.keys(tempPost).length === 0)
        {
            reject("No result returned");
        } else {
            resolve(tempPost);
        }
    });
}