require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const bcrypt = require('bcryptjs');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./db/models/todo'); 
const { User } = require('./db/models/user');
const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT || 3000;
let app = express();
app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    console.log(req.body);
    let todo = new Todo({
        text: req.body,
        _creator: req.user._id
    });

    todo.save().then(doc => res.send(doc),
        err => res.status(400).send(err));
});

app.get('/todos', authenticate, (req, res) =>
    Todo.find({
        _creator: req.user._id
    }).then(todos => res.send({todos}),
        err => res.status(500).send(err))
);

app.get('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.find({
        _id: new ObjectID(id),
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((err) => res.status(400).send());
});

app.delete('/todos/:id', authenticate, (req, res) => {
    Todo.findAndRemove({
        _id: req.params.id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        return res.send({todo});
    }).catch(e => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', authenticate, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);
    
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findAndUpdate({
        _id: id,
        _creator: req.user._id
    }, {$set: body}, {new: true})
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            return res.send({todo});
        }).catch((e) => {
            res.status(400).send();
        });    
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
})

app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save().then((user) => {
        return user.generateAuthToken();
    }).then((token) => {        
        res.header('x-auth', token).send(user);
    }).catch(e => res.status(400).send(e));
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        user.generateAuthToken().then((token) => 
            res.header('x-auth', token).send(user)
        );
    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    })
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};