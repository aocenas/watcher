var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    child_process = require('child_process');

module.exports = exports = function (){

  var listenerFunction,
      excludes,
      lastModified,
      childProc,
      silent,
      opts;

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
          debug && console.log('starting to watch file ' + items);
          opts.onBeforeWatch && opts.onBeforeRestart(items);
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
  function createListenerFunction () {

    return function (event, filename) {
      if (event === 'change') {

        debug && console.log(filename + ' changed');

        if(!lastModified){
          lastModified = new Date().getTime();
          setTimeout(function timedRestart() {
            if((lastModified + 5000) < (new Date()).getTime()){

              opts.onBeforeRestart && opts.onBeforeRestart(filename);
              restartChildProcess(opts.process, opts.procArgs);
              opts.onAfterRestart && opts.onAfterRestart(filename);
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
    debug && console.log('restarting...');
    childProc && childProc.kill();
    childProc = child_process.spawn(process,args);

    if(!silent){
      childProc.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
      });

      childProc.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
      });
    }
  }

  return {
    watch : function (options) {

      options.includes = options.includes.map(normalizeWithSlash);
      excludes = options.excludes && options.excludes.map(normalizeWithSlash);
      silent = options.silent;
      debug = options.debug;
      opts = options;

      // This will also start the process
      restartChildProcess(opts.process, opts.procArgs);
      listenerFunction = createListenerFunction();
      watchFiles(opts.includes, null);

    }
  };

}

