const env = process.env.NODE_ENV || 'development';
console.log(`env **** ${env}`);
if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';    
}

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const { mongoose } = require('./db/mongoose'), 
    { Todo } = require('./db/models/todo'), 
    { User } = require('./db/models/user');

const port = process.env.PORT || 3000;

let app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    console.log(req.body);
    let todo = new Todo(req.body);

    todo.save().then(doc => res.send(doc),
        err => res.status(400).send(err));
});

app.get('/todos', (req, res) =>    
    Todo.find().then(todos => res.send({todos}),
        err => res.status(500).send(err))
);

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((err) => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    Todo.findByIdAndRemove(req.params.id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            return res.send({todo});
        }).catch(e => {
            res.status(400).send();
        });
});

app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']);
    
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            return res.send({todo});
        }).catch((e) => {
            res.status(400).send();
        });    
});

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};