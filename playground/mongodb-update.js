const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDb server.')
    }
    console.log('Connected to Mongodb server.');

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('595cce8612e800428cdf84e6')
    }, {
        $inc: {
            age: 1
        },
        $set: {
            name: 'Ivan'
        }
    }, {
        returnOriginal: false
    }).then(res => {
        console.log(res);
    });

    db.close();
});