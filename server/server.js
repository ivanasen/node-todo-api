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

app.listen(port, () => console.log(`Started on port ${port}`));

module.exports = {app};