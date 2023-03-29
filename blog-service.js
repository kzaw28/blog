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

const Sequelize = require('sequelize');
var sequelize = new Sequelize('bthgztar', 'bthgztar', 'eeqIGKQ42NGeSss3to7cIj9oGt7Ssoz-', {
    host: 'raja.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Creating Data Models ------------------------------------------------ 
var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});

// ---------------------------------------------------------------------
exports.initialize = function() {
    return new Promise(function(resolve, reject){
        sequelize.sync().then(() => {
            resolve("Successfully synced the database");
        }).catch((err) => {
            reject("Unable to sync the database");
        });
    });
};

// ---------------------------------------------------------------------
exports.getAllPosts = function() {
    return new Promise(function(resolve, reject){
        Post.findAll().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};


exports.getPublishedPosts = function() {
    return new Promise(function(resolve, reject){
        Post.findAll({
            where: {
                published: true
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};

exports.getCategories = function() {
    return new Promise(function(resolve, reject){
        Category.findAll().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
};

exports.addPost = function(postData) {
    return new Promise(function(resolve, reject){
        // Make sure postData.published is set properly
        postData.published = (postData.published) ? true : false;

        // Make sure the properties are set to null if empty
        for (var property in postData) {
            if (postData[property] == "") {
                postData[property] = null;
            }
        }

        // postDate is set to the current date
        postData.postDate = new Date();

        // Add the new post
        Post.create({
            body: postData.body,
            title: postData.title,
            postDate: postData.postDate,
            featureImage: postData.featureImage,
            published: postData.published,
            category: postData.category
        }).then(() => {
            resolve("Post created");
        }).catch((err) => {
            reject("Unable to create post");
        });

    });
}

exports.getPostsByCategory = function(category) {
    return new Promise(function(resolve, reject){
        Post.findAll({
            where: {
                category: category
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
}

exports.getPostsByMinDate = function(minDateStr) {
    return new Promise(function(resolve, reject){
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
}


exports.getPostById = function(id) {
    return new Promise(function(resolve, reject){
        Post.findAll({
            where: {
                id: id
            }
        }).then((data) => {
            resolve(data[0]);
        }).catch((err) => {
            reject("No results returned");
        });
    });
}

exports.getPublishedPostsByCategory = function(category) {
    return new Promise(function(resolve, reject){
        Post.findAll({
            where: {
                category: category,
                published: true
            }
        }).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject("No results returned");
        });
    });
}

exports.addCategory = function(categoryData) {
    return new Promise(function(resolve, reject){
        // Make sure the properties are set to null if empty
        for (var property in categoryData) {
            if (categoryData[property] == "") {
                categoryData[property] = null;
            }
        }

        // Add the new category
        Category.create({
            category: categoryData.category
        }).then(() => {
            resolve("Category created");
        }).catch((err) => {
            reject("Unable to create category");
        });
    });
}

exports.deleteCategoryById = function(id) {
    return new Promise(function(resolve, reject){
        Category.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("Category deleted");
        }).catch((err) => {
            reject("Unable to delete category");
        });
    });
}

exports.deletePostById = function(id) {
    return new Promise(function(resolve, reject){
        Post.destroy({
            where: {
                id: id
            }
        }).then(() => {
            resolve("Post deleted");
        }).catch((err) => {
            reject("Unable to delete post");
        });
    });
}