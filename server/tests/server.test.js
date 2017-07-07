const {expect} = require('chai');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../db/models/todo');

const testTodos = [
    {text: 'First test todo'},
    {text: 'Second test todo'}
];

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