const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb server.')
    }
    console.log('Connected to Mongodb server.');

    // db.collection('Users').deleteMany({name: 'Pesho'}).then(res => {
    //     console.log(res);
    // }, rej => {
    //     console.log(err);
    // });    

    db.collection('Users').findOneAndDelete({_id: new ObjectID("595cd17c6d2fed2d84acea6d")}).then(res => {
        console.log(res);
    }, rej => {
        console.log(rej);
    });

    db.close();
});