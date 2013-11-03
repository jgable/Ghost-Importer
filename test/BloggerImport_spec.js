/*global describe, it, beforeEach, afterEach*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    when = require('when'),
    //should = require('should'),
    BloggerImport = require('../lib/BloggerPlugin'),
    xmlPath = path.join(__dirname, 'fixtures', 'blogger.xml');

describe('BloggerImport', function () {
    var sandbox,
        fakeGhost,
        fakeImportData,
        TestPlugin;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        fakeGhost = {
            registerFilter: sandbox.stub(),
            unregisterFilter: sandbox.stub(),

            api: {
                db: {
                    importJSONData: sandbox.stub().returns(when.resolve({ posts: []}))
                }
            }
        };

        fakeImportData = {
            getContents: function () {
                var contents = fs.readFileSync(xmlPath).toString();

                return when.resolve(contents);
            }
        };

        TestPlugin = BloggerImport.extend({});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('can import Blogger Xml', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        plugin.doImport(fakeImportData).then(function () {

            fakeGhost.api.db.importJSONData.called.should.equal(true);

            fakeGhost.api.db.importJSONData.firstCall.args[0].data.posts.length.should.equal(4);

            done();
        }, done);
    });
});