/*global describe, it, beforeEach, afterEach*/
'use strict';

var fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    when = require('when'),
    //should = require('should'),
    AllTypesPlugin = require('../lib/AllTypesPlugin'),
    wxrPath = path.join(__dirname, 'fixtures', 'example.wxr'),
    xmlPath = path.join(__dirname, 'fixtures', 'blogger.xml');

describe('AllTypesPlugin', function () {
    var sandbox,
        fakeGhost,
        fakeFilePath,
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

        fakeFilePath = wxrPath;

        fakeImportData = {
            getContents: function () {
                var contents = fs.readFileSync(fakeFilePath).toString();

                return when.resolve(contents);
            }
        };

        TestPlugin = AllTypesPlugin.extend({});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('can import Wordpress WXR', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        fakeImportData.type = "Wordpress WXR";

        plugin.checkIfImportable(fakeImportData).should.equal(true);

        plugin.doImport(fakeImportData).then(function () {

            fakeGhost.api.db.importJSONData.called.should.equal(true);

            fakeGhost.api.db.importJSONData.firstCall.args[0].data.posts.length.should.equal(5);

            done();
        }, done);
    });

    it('can import Blogger XML', function (done) {
        var plugin = new TestPlugin(fakeGhost);

        plugin.activate();

        fakeImportData.type = "Blogger XML";
        fakeFilePath = xmlPath;

        plugin.checkIfImportable(fakeImportData).should.equal(true);

        plugin.doImport(fakeImportData).then(function () {

            fakeGhost.api.db.importJSONData.called.should.equal(true);

            fakeGhost.api.db.importJSONData.firstCall.args[0].data.posts.length.should.equal(4);

            done();
        }, done);
    });
});