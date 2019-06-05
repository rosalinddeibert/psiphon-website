// Generated by CoffeeScript 2.4.1
(function() {
  /*
  For each English document, this plugin creates virtual documents at the root that serve
  as language redirectors -- when hit, they'll send visitors to the appropriate language
  page.

  If a given document already really exists on disk, it won't be overwritten.
  */
  // Export Plugin
  module.exports = function(BasePlugin) {
    var LanguageRedirector, TaskGroup, path;
    path = require('path');
    ({TaskGroup} = require('taskgroup'));
    return LanguageRedirector = (function() {
      // Define Plugin
      class LanguageRedirector extends BasePlugin {
        populateCollections(opts, next) {
          var config, docpad, pathStart, tasks;
          // We will add language-redirect pages for each language-specific page.

          // Prepare
          docpad = this.docpad;
          config = this.config;
          docpad.log('debug', 'langredirectmaker: generating language-redirect documents');
          pathStart = path.normalize(`${config.defaultLanguage}/`);
          tasks = new TaskGroup({
            concurrency: 1
          }).done(function(err) {
            return next(err);
          });
          docpad.getCollection('documents').findAll({
            relativePath: {
              $startsWith: pathStart
            }
          }).forEach(function(document) {
            return tasks.addTask(function(complete) {
              var newDoc, redirectOutPath, relativePath;
              // document.get('relativePath') is like 'en/blog/index.html.eco'
              relativePath = document.get('relativePath').replace(pathStart, '');
              // relativePath is like 'blog/index.html.eco'
              // See the comment in languagemaker.plugin.coffee for an explanation of this
              redirectOutPath = relativePath.split('.').slice(0, 2).join('.');
              // redirectOutPath is like 'blog/index.html'
              docpad.log('debug', `langredirectmaker: generating language-redirect document: '${redirectOutPath}'`);
              // Don't clobber an existing document
              if (docpad.getCollection('documents').findOne({
                relativePath: {
                  $startsWith: redirectOutPath.replace('\\', '/')
                }
              })) {
                docpad.log('info', `langredirectmaker: file already exists, so not making '${redirectOutPath}'`);
                return complete();
              }
              // Create the new virtual document
              newDoc = docpad.createDocument({
                isDocument: true,
                encoding: 'utf8',
                relativePath: redirectOutPath,
                meta: {
                  layout: config.languageRedirectLayout,
                  targetFilename: '/' + redirectOutPath.replace('\\', '/'),
                  language: 'en'
                }
              });
              return newDoc.action('load', function(err) {
                if (err) {
                  return complete(err);
                }
                docpad.getDatabase().add(newDoc);
                docpad.log('debug', `langredirectmaker: finished creating redirect for document: ${document.get('relativePath')}`);
                return complete();
              });
            });
          });
          tasks.run();
          // chain
          return this;
        }

      };

      // Plugin Name
      LanguageRedirector.prototype.name = 'languageredirector';

      // Default configuration
      LanguageRedirector.prototype.config = {
        defaultLanguage: 'en',
        languageRedirectLayout: '_/language-redirect'
      };

      return LanguageRedirector;

    }).call(this);
  };

}).call(this);