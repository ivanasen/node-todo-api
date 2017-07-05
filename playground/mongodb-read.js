const { MongoClient, ObjectID } = require('mongodb');

// let obj = new ObjectID();
// console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb server.')
    }
    console.log('Connected to Mongodb server.');

    // db.collection('Todos').find().toArray().then(docs => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, err => {
    //     console.log('Unable to fetch todos');
    // });

    let name = 'Toshko'
    db.collection('Users').find({name}).count().then(count => {
        console.log('Users');
        console.log(`Users with name of ${name} count: ${count}`);
    }, err => {
        console.log('Unable to fetch todos');
    });    

    db.close();
});