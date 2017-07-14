const { ObjectID } = require('mongodb');
const { Todo } = require('../../db/models/todo');
const { User } = require('../../db/models/user');
const jwt = require('jsonwebtoken');

const user1Id = new ObjectID();
const user2Id = new ObjectID();
const testUsers = [{
    _id: user1Id,
    email: 'ivan@asen.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: user1Id, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: user2Id,
    email: 'pesho@mail.com',
    password: 'userTwoPass' 
}];

const testTodos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: user1Id
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: user2Id
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => Todo.insertMany(testTodos))
        .then(() => done())
        .catch(err => done(err));
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User(testUsers[0]).save();
        let userTwo = new User(testUsers[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {testTodos, populateTodos, testUsers, populateUsers};