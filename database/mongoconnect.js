const {MongoClient, ObjectID} = require('mongodb').MongoClient;



MongoClient.connect('mongodb://localhost:27017/whatstradelocked', (err, client)=>{
    if(err){
        return console.log("Unable to connect to MongoDB server");
    }

    var id = new ObjectID("iddddddd");

    console.log("Connected to MongoDB server");

    const db = client.db("whatstradelocked");

    db.collection("Users").insertOne({
        text: 'Something to do',
        completed: false

    }, (err, result)=>{
        if(err){
            return console.log("Unable to insert todo", err);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    db.collection("Users").find({completed: false}).toArray().then((docs)=> {
        console.log("User");
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) =>{
        console.log("Unable to fetch user", err);
    });

    // client.close();
});
