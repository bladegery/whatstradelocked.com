const {mongoose} = require('./../database/mongoose'),
    {Bookmark} = require('./../models/bookmark'),
    {User} = require('./../models/user'),
    {MongoClient, ObjectID} = require('mongodb').MongoClient;

var id = 'asdasdasd';


if(!ObjectID.isValid(id)){
    console.log("ID not valid")
}

Bookmark.find({
    _id: id
}).then((bookmarks) =>{
   console.log('Bookmarks', bookmarks)
});

Bookmark.findOne({
    _id: id
}).then((bookmark) =>{
    console.log('Bookmarks', bookmark)
});

Bookmark.findById(id).then((bookmark) =>{
    if(!bookmark){
        console.log("Not found");
    }
    console.log('Bookmark by id: ' , bookmark);
}).catch((e)=> console.log(e);