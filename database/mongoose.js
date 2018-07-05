const mongoose = require('mongoose');


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/whatstradelocked');


// var newBookmark = new Bookmark({
//     itemID: '6351654'
// });
//
// newBookmark.save().then((doc)=>{
//     console.log('Saved Bookmark', doc);
// }, (e) => {
//     console.log('Unable to save Bookmark');
// });

module.exports = {mongoose};