var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    child_process = require('child_process');

module.exports = exports = function (){

  var listenerFunction,
      excludes,
      lastModified,
      childProc;

  //
  // Goes through all defined files except those in excludes array, and
  // for each file starts watching for changes.
  //
  function watchFiles (items, dir) {
    dir = dir || '';

    if (!util.isArray(items)) {
      items = path.join(dir,items,"/");

      // do not watch files/directories from excludes array
      if (!excludes || excludes.indexOf(items) === -1) {

        if (fs.statSync(items).isFile()) {
          console.log('started watching ' + items);
          fs.watch(items, listenerFunction);
          return;
        } else {
          dir = items;
          items = fs.readdirSync(items)
        }
      }else{
        return;
      }
    }
    // Items was an array or was a directory either way it should be an array
    // by now
    debugger;
    if (items.length !== 0) {
      items.forEach(function (item) { watchFiles(item, dir)});
    }
  }

  function normalizeWithSlash (item) {
    return path.join(item,'/');
  }

  //
  // Function to create the litener funciton that will be called in case
  // some file has changed. Gets before and after callbacks from options
  // argument. Actual restart of the process is timed so multiple file
  // updates triger just one restart.
  //
  function createListenerFunction (options) {

    return function (event, filename) {
      if (event === 'change') {

        if(!lastModified){
          lastModified = new Date().getTime();
          setTimeout(function timedRestart() {
            if((lastModified + 5000) < (new Date()).getTime()){

              options.beforeCallback && options.beforeCallback(filename);
              restartChildProcess(options.process, options.procArgs);
              options.afterCallback && options.afterCallback(filename);
              lastModified = null;

            }else{
              setTimeout(timedRestart, 5000);
            }
          },5000);
        }
      }
    };
  }

  //
  // Restarts the defined process
  //
  function restartChildProcess (process, args) {
    childProc && childProc.kill();
    childProc = child_process.spawn(process,args);

    childProc.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    childProc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  }

  return {
    watch : function (options) {

      restartChildProcess(options.process, options.procArgs);

      options.includes = options.includes.map(normalizeWithSlash);
      excludes = options.excludes && options.excludes.map(normalizeWithSlash);

      listenerFunction = createListenerFunction(options);

      watchFiles(options.includes, null);

    }
  };

};

