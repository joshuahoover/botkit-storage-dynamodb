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
        config = {region: 'region',
                  accessKeyId: 'key',
                  secretAccessKey: 'secret'};

        collectionObj = {
            find: sinon.stub().resolves({}),
            update: sinon.stub().resolves(true),
            findAll: sinon.stub().resolves([])
        };

        collectionMock = {
            table: sinon.stub().returns(collectionObj)
        };

        dynastyMock = sinon.stub().returns(collectionMock);

        Storage = proxyquire('../src/index', {dynasty: dynastyMock});
    });

    describe('Initialization', function() {
        it('should throw an error if config is missing', function() {
            Storage.should.throw('Need to provide region, accessKeyId,' +
            ' secretAccessKey');
        });

        it('should throw an error if region is missing', function() {
            config.region = null;
            (function() {Storage(config);}).should.throw('Need to provide region, accessKeyId,' +
            ' secretAccessKey');
        });

        it('should throw an error if accessKeyId is missing', function() {
            config.accessKeyId = null;
            (function() {Storage(config);}).should.throw('Need to provide region, accessKeyId,' +
            ' secretAccessKey');
        });

        it('should throw an error if secretAccessKey is missing', function() {
            config.secretAccessKey = null;
            (function() {Storage(config);}).should.throw('Need to provide region, accessKeyId,' +
            ' secretAccessKey');
        });

        it('should initialize dynasty with region, accessKeyId, secretAccessKey', function() {
            Storage(config);
            dynastyMock.callCount.should.equal(1);
            dynastyMock.args[0][0].should.deepEqual({
                region: 'region',
                accessKeyId: 'key',
                secretAccessKey: 'secret',
                dynamoTable: 'botkit'
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

        describe(method + '.all', function() {
            it('should call findAll', function() {
                var cb = sinon.stub();

                Storage(config)[method].all(cb);
                collectionObj.findAll.should.be.calledWith(method);
            });
        });
    });
});
