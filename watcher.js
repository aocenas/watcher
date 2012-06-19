var fs = require('fs'),
    util = require('util'),
    path = require('path');

module.exports = exports = function (){

  var listenerFunction,
      excludes,
      lastModified;

  function watchFiles (items, dir) {
    dir = dir || '';

    if (!util.isArray(items)) {
      items = path.join(dir,items,"/");

      // do not return files/directories from excludes array
      if (!excludes || excludes.indexOf(items) === -1) {

        if (fs.statSync(items).isFile()) {
          console.log('started watching ' + items);
          fs.watch(items, listenerFunction);
        } else {
          dir = items;
          items = fs.readdirSync(items)
        }
      }
    }
    //items was an array or was a directory either way it should array now
    if (items.length !== 0) {
      items.forEach(function (item) { watchFiles(item, dir)});
    }
  }

  function normalizeWithSlash (item) {
    return path.join(item,'/');
  }

  function createListenerFunction (options) {
    return function listener (event, filename) {
      if (event === 'change') {
        options.beforeCallback(filename);
        if(!lastModified){
          lastModified = new Date();

        }
        options.afterCallback(filename);

    };
  }

  return {
    watch : function (options) {



      options.includes = options.includes.map(normalizeWithSlash);
      excludes = options.excludes && opts.excludes.map(normalizeWithSlash);

      listenerFunction = function (event, filename) {
          if (event === 'change') {
            options.onchange(filename);
          }
        }

      listFiles(options.includes, null);

    }
  };

};

