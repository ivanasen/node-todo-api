const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/db/models/todo');
const {User} = require('../server/db/models/user');

let _id = '695dwefd5cef885ffb3bfcc8b886';

if (!ObjectID.isValid(_id)) {
    console.log('Id not valid');
} else {
    User.findById(_id).then((user) => {
        if (!user) {
            return console.log(`User with ID of ${_id} was not found`);
        }
        console.log(user);
    }, (err) => {console.log(err)});
}

// let _id = '595ffd6cd08e061e04faab0e';

// if (!ObjectID.isValid(_id)) {
//     console.log('Id not valid');
// }

// Todo.find({_id}).then((todos) => {
//     console.log('Todos', todos);
// });

// Todo.findOne({_id}).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(_id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo by id', todo);
// }).catch(err => console.log(err));