'use strict';

var _ = require('underscore'),
    when = require('when'),
    nodefn = require('when/node/function'),
    xml2js = require('xml2js'),
    ImportPlugin = require('ghost-plugin').ImportPlugin,
    WordpressImportPlugin = require('./WordpressPlugin'),
    BloggerImportPlugin = require('./BloggerPlugin'),
    AllTypesImportPlugin;

var IndividualPlugins = [
    WordpressImportPlugin,
    BloggerImportPlugin
];

AllTypesImportPlugin = ImportPlugin.extend({
    initialize: function () {
        var self = this;

        this.importPlugins = _.map(IndividualPlugins, function (Plugin) { return new Plugin(self.app); });

        this.supportedTypes = _.reduce(this.importPlugins, function (supported, plugin) {
            return supported.concat(plugin.supportedTypes || []);
        }, []);
    },

    checkIfImportable: function (importData) {
        return _.any(this.importPlugins, function (plugin) {
            return plugin.checkIfImportable(importData);
        });
    },

    doImport: function (importData) {
        var importPlugin = _.find(this.importPlugins, function (plugin) {
            return plugin.checkIfImportable(importData);
        });

        return importPlugin.doImport(importData);
    }
});

module.exports = AllTypesImportPlugin;