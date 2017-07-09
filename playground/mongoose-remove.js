const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/db/models/todo');
const {User} = require('../server/db/models/user');

Todo.remove({}).then((res) => {
    console.log(res);
});

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()