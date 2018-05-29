const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Blog containing entries', function() {
    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    it('should show all blog posts on GET', function() {
        return chai.request(app)
        .get('/blog-posts')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a.a('array');
            expect(res.body.length).to.be.at.least(1);

            const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
            res.body.forEach(function(item) {
                expect(item).to.be.a('object');
                expect(item).to.include.keys(expectedKeys);
            });
        });
    });

    it('should add a new entry on POST', function() {
        const newPost = {title: 'Post Test', content: 'This is the body of my test', author: 'M. Bulgakov'};

        return chai.request(app)
        .post('/blog-posts')
        .send(newPost)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'title', 'content', 'author');
            expect(res.body.id).to.not.equal(null);
            expect(res.body).to.deep.equal(Object.assign(newPost, {id: res.body.id, publishDate: res.body.publishDate}));
        });
    });


    it('should update a blog post on PUT', function() {

       return chai.request(app)
       .get('/blog-posts')
       .then(function(res) {
            const updatePost = Object.assign(res.body[0], {
                title: 'This is Me',
                author: 'Winnie the Pooh'
            });

           return chai.request(app)
           .put(`/blog-posts/${res.body[0].id}`)
           .send(updatePost)
           .then(function(res) {
            expect(res).to.have.status(204);
           });
       });
    });

   
    it('should remove blog entries on DELETE', function() {
        return chai.request(app)
        .get('/blog-posts')
        .then(function(res) {
            return chai.request(app)
            .delete(`/blog-posts/${res.body[0].id}`);
        })
        .then(function(res) {
            expect(res).to.have.status(204);
        });
    });
});