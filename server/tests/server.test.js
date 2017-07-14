const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../db/models/todo');
const { User } = require('../db/models/user');
const { testTodos, populateTodos, testUsers, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        let text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', testUsers[0].tokens[0].token)
            .send(new Todo({
                text
            }))
            .expect(200)
            .expect(res => {
                console.log(res.body);
                expect(res.body.text).to.equal(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text})
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
            .set('x-auth', testUsers[0].tokens[0].token)
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
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).to.equal(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${testTodos[0]._id.toHexString()}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                console.log(res.body);
                expect(res.body.todo.text).to.equal(testTodos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 400 non object valid ids', (done) => {
        request(app)
            .get(`/todos/asdsfgffhtrh`)
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
        request(app)
            .delete(`/todos/${testTodos[0]._id.toHexString()}`)
            .set('x-auth', testUsers[0].tokens[0].token)
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
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 400 non object valid ids', (done) => {
        request(app)
            .delete(`/todos/asdsfgffhtrh`)
            .set('x-auth', testUsers[0].tokens[0].token)
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
            .set('x-auth', testUsers[0].tokens[0].token)
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
            .patch(`/todos/${testTodos[0]._id}`)
            .send({
                completed: false
            })
            .set('x-auth', testUsers[0].tokens[0].token)
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

describe('GET users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).to.equal(testUsers[0]._id.toHexString());
                expect(res.body.email).to.equal(testUsers[0].email);                
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).to.be.empty;
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        let email = 'pesho@gosho.bg';
        let password = 'greshnaparola';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).to.exist;
                expect(res.body.email).to.equal(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).to.exist;
                    expect(user.password).to.not.equal(password);
                    done();
                }).catch((err) => {
                    done(err);
                });                
            });
    });

    it('should return validation erros if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'invalid.com',
                password: '123'
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: testUsers[0].email,
                password: 'pass123!'
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should return a token when user has logged in', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: testUsers[1].email,
                password: testUsers[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).to.exist;
                expect(res.body.email).to.equal(testUsers[1].email);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(testUsers[1]._id).then((user) => {
                    expect(user.tokens[0]).to.include({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((err) => {
                    done(err);
                });
            });
    });

    it('should return 400 when wrong credentials', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: 'wrong.com',
                password: '123'
            })
            .expect(400)
            .end(done);
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(testUsers[0]._id).then((user) => {
                    expect(user.tokens).to.be.empty;
                    done();
                }, (err) => {
                    done(err);
                });
            });
    });
});