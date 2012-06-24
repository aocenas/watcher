var child_process = require('child_process'),
    fs = require('fs'),
    watcher = require('./lib/watcher.js'),
    child;

function new_child () {
  var proc = child_process.spawn(
    'node',
    ['--debug', './../node/server.js']
  );

  proc.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  proc.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  return proc;
};

child = new_child();

// fs.watch('./../node/', function (event){
//   if(event === 'change'){
//     child.kill();
//     child = new_child();
//   }
// });


watcher().watch({
  includes :
    [
      './../node/'
    ],
  excludes :
    [
      './../node/web/',
      './../node/data/',
      './../node/node_modules/'
    ],
  process : 'node',
  procArgs : ['--debug', './../node/server.js'],
  afterCallback : function (filename) {
    console.log('restarting after change in file : ' + filename);
  }
});