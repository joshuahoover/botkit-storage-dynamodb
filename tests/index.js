var should = require('should'),
    sinon = require('sinon'),
    proxyquire = require('proxyquire').noCallThru();

require('should-sinon');

describe('Dynamo', function() {
    var dynastyMock,
        collectionMock,
        collectionObj,
        Storage,
        config;

    beforeEach(function() {
        config = {dynamoRegion: 'region',
                  dynamoAccessKey: 'key',
                  dynamoAccessSecret: 'secret'};

        collectionObj = {
            find: sinon.stub(),
            update: sinon.stub()
        };

        collectionMock = {
            table: sinon.stub().returns(collectionObj)
        };

        dynastyMock = sinon.stub().returns(collectionMock);

        Storage = proxyquire('../src/index', {dynasty: dynastyMock});
    });

    describe('Initialization', function() {
        it('should throw an error if config is missing', function() {
            Storage.should.throw('Need to provide dynamo dynamoRegion, ' +
            'dynamoAccessKey, dynamoAccessSecret');
        });

        it('should throw an error if dynamoRegion is missing', function() {
            config.dynamoRegion = null;
            (function() {Storage(config);}).should.throw('Need to provide dynamo dynamoRegion, ' +
            'dynamoAccessKey, dynamoAccessSecret');
        });

        it('should throw an error if dynamoAccessKey is missing', function() {
            config.dynamoAccessKey = null;
            (function() {Storage(config);}).should.throw('Need to provide dynamo dynamoRegion, ' +
            'dynamoAccessKey, dynamoAccessSecret');
        });

        it('should throw an error if dynamoAccessSecret is missing', function() {
            config.dynamoAccessSecret = null;
            (function() {Storage(config);}).should.throw('Need to provide dynamo dynamoRegion, ' +
            'dynamoAccessKey, dynamoAccessSecret');
        });

        it('should initialize dynasty with dynamoRegion, dynamoAccessKey, dynamoAccessSecret', function() {
            Storage(config);
            dynastyMock.callCount.should.equal(1);
            dynastyMock.args[0][0].should.deepEqual({
                region: 'region',
                accessKeyId: 'key',
                secretAccessKey: 'secret'
            });
        });
    });

    ['teams', 'channels', 'users'].forEach(function(method) {
        describe(method + '.get', function() {
            it('should call find with callback', function() {
                var cb = sinon.stub();

                Storage(config)[method].get('walterwhite', cb);
                collectionObj.find.should.be.calledWith({hash: method, range: 'walterwhite'});
            });
        });

        describe(method + '.save', function() {
            it('should call update', function() {
                var data = {id: 'walterwhite', type: method, username: 'username'},
                    cb = sinon.stub();

                Storage(config)[method].save(data, cb);
                collectionObj.update.should.be.calledWith(
                    {hash: method, range: 'walterwhite'},
                    {username: 'username'}
                );
            });
        });
    });
});
