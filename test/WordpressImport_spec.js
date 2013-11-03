/*global describe, it, beforeEach, afterEach*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    when = require('when'),
    //should = require('should'),
    WordpressImport = require('../lib/WordpressPlugin'),
    wxrPath = path.join(__dirname, 'fixtures', 'example.wxr');

describe('WordpressImport', function () {
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
                var contents = fs.readFileSync(wxrPath).toString();

                return when.resolve(contents);
            }
        };

        TestPlugin = WordpressImport.extend({});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('can import Wordpress WXR', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        plugin.doImport(fakeImportData).then(function () {

            fakeGhost.api.db.importJSONData.called.should.equal(true);

            fakeGhost.api.db.importJSONData.firstCall.args[0].data.posts.length.should.equal(5);

            done();
        }, done);
    });
});