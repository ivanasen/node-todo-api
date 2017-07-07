const express = require('express'),
    bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose'), 
    { Todo } = require('./db/models/todo'), 
    { User } = require('./db/models/user');

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

app.listen(3000, () => console.log('Started on port 3000'));

module.exports = {app};