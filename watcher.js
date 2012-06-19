var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    listenerFunction,
    excludes;

// recursive = items can be array or one file
function listFiles (items, dir) {
  dir = dir || '';

  if (!util.isArray(items)) {
    items = path.join(dir,items,"/");

    // do not return files/directories from excludes array
    if (!excludes || excludes.indexOf(items) === -1) {

      if (fs.statSync(items).isFile()) {
        console.log('started watching ' + items);
        fs.watch(items, listenerFunction);
      } else {
        return listFiles(fs.readdirSync(items), items);
      }
    }
  } else {
    //items is an array
    if (items.length !== 0) {
      items.forEach(function (item) { listFiles(item, dir)});
    }
  };
}

function normalizeWithSlash (item) {
  return path.join(item,'/');
}

debugger;
module.exports = exports = function (){

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

