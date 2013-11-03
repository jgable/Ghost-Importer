'use strict';

var _ = require('underscore'),
    when = require('when'),
    nodefn = require('when/node/function'),
    xml2js = require('xml2js'),
    ImportPlugin = require('ghost-plugin').ImportPlugin,
    BloggerImportPlugin;

BloggerImportPlugin = ImportPlugin.extend({
    supportedTypes: [{
        name: 'Blogger XML'
    }],

    doImport: function (importData) {
        var self = this;

        return importData.getContents().then(function (fileContents) {
            // Parse the xml data
            return nodefn.call(xml2js.parseString, fileContents);
        }).then(function (parsedData) {
            // Convert to Ghost format
            try {
                if (!parsedData || !parsedData.feed || !parsedData.feed.entry) {
                    // This error is caught below and returned with when.reject()
                    throw new Error('Invalid format: No rss or channel elements found');
                }

                var posts = _.reduce(parsedData.feed.entry, function (memo, item) {

                        if (!self.isEntryPost(item)) {
                            return memo;
                        }

                        var post = self.getPostFieldsFromXml(item, {
                            'title': 'title',
                            'content': 'html',
                            'published': 'published_at'
                        });

                        // Massage the status a little
                        post.status = 'published';

                        /*jshint camelcase: false */
                        // Update the published_at to a timestamp.
                        post.published_at = post.published_at || '';
                        post.published_at = new Date(post.published_at).getTime();
                        /*jshint camelcase: true */

                        memo.push(post);

                        return memo;
                    }, []);

                return {
                    meta: {
                        /*jshint camelcase: false */
                        // TODO: Get this from WXR file?
                        exported_on: new Date().getTime(),
                        /*jshint camelcase: true */
                        version: '000'
                    },
                    data: {
                        posts: posts
                    }
                };
            } catch (e) {
                return when.reject(e);
            }

            return when.resolve(parsedData);
        }).then(function (ghostImportFormatData) {
            // Inject into database or use import api

            return self.app.api.db.importJSONData(ghostImportFormatData);
        });
    },

    isEntryPost: function (entry) {
        return entry.category && entry.category[0] && !!entry.category[0].$.term.match(/kind#post$/g);
    },

    getPostFieldsFromXml: function (item, fieldMap) {
        var fields = _.keys(fieldMap),
            data = _.pick.apply(_, [item].concat(fields));

        // Fields all are arrays and need to be converted.
        return _.reduce(data, function (result, val, key) {
            var realVal = _.isArray(val) ? _.first(val) : val;

            if (_.isObject(realVal)) {
                realVal = realVal._;
            }

            result[fieldMap[key] || key] = realVal;

            return result;
        }, {});
    }
});

module.exports = BloggerImportPlugin;