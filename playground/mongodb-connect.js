const { MongoClient, ObjectID } = require('mongodb');

let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb server.')
    }
    console.log('Connected to Mongodb server.');

    // db.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (err, res) => {
    //     if (err) {
    //         return console.log('Unable to insert todo', err);
    //     }

    //     console.log(JSON.stringify(res.ops, undefined, 2));
    // });
    db.collection('Users').insertOne({
        name: 'Pesho',
        age: 78,
        location: 'Israel'
    }, (err, res) => {
        if (err) {
            return console.log('Unable to insert todo', err);
        }

        console.log(JSON.stringify(res.ops, undefined, 2));
    });

    db.close();
});