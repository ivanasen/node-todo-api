const {expect} = require('chai');
const {ObjectID} = require('mongodb');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../db/models/todo');

const testTodos = [{
    _id: new ObjectID(),
    text: 'First test todo'
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333
}];

beforeEach((done) => {
    Todo.remove({}).then(() => Todo.insertMany(testTodos))
        .then(() => done())
        .catch(err => done(err));
});

describe('POST /todos', () => {
    it('should create a new todo', done => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .send(new Todo({
                text
            }))
            .expect(200)
            .expect(res => {
                expect(res.body.text).to.equal(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({
                        text
                    })
                    .then(todos => {
                        expect(todos.length).to.equal(1);
                        expect(todos[0].text).to.equal(text);
                        done();
                    }).catch(err => done(err))
            });
    });

    it('should not create todo with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(todos => {
                    expect(todos.length).to.equal(testTodos.length);
                    done();
                }).catch(err => done(err));
            })
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(testTodos.length);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${testTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(testTodos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 non object valid ids', (done) => {
        request(app)
            .get(`/todos/asdsfgffhtrh`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
        request(app)
            .delete(`/todos/${testTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).to.equal(testTodos[0].text);                
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find(res).then((todo) => {
                    expect(todo).to.not.exist();
                }).catch(e => done(e));
                done();
            });
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });

    it('should return 400 non object valid ids', (done) => {
        request(app)
            .delete(`/todos/asdsfgffhtrh`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const update = {
                text: 'Hellou Peshou',
                completed: true
        };

        request(app)
            .patch(`/todos/${testTodos[0]._id}`)
            .send(update)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                const {todo} = res.body;
                expect(todo.text).to.equal(update.text);
                expect(todo.completed).to.equal(update.completed);
                expect(todo.completedAt).to.be.a('number');
                done();
            });    
    });

    it('should clear completedAt when todo is not completed', (done) => {
        request(app)
            .patch(`/todos/${testTodos[1]._id}`)
            .send({
                completed: false
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                const {todo} = res.body;
                expect(todo.completed).to.equal(false);
                expect(todo.completedAt).to.not.exist;
                done();
            });
    });
});