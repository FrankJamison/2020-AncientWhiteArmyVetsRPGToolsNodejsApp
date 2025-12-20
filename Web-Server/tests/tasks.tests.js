const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// Integration tests (opt-in).
// Hostinger example: set RUN_INTEGRATION=1 API_BASE_URL=https://your-domain TEST_ACCESS_TOKEN=Bearer ...
const BASE_URL = process.env.API_BASE_URL || '';
const token = process.env.TEST_ACCESS_TOKEN || '';
const _describe = process.env.RUN_INTEGRATION ? describe : describe.skip;

_describe('Tasks API Service', function() {
    it('should GET all tasks', function(done) {
        if (!BASE_URL) return this.skip(); if (!token) return this.skip();
        chai
            .request(BASE_URL)
            .get('/api/tasks')
            .set('access_token', token)
            .end(function(err, resp) {
                if (err && !resp) return done(err);
                expect(resp.status).to.be.eql(200);
                expect(resp.body).to.be.a('array');
                expect(resp.body.length).to.not.be.eql(0);
                done();
            });
    });
});

