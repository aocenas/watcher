var child_process = require('child_process'),
    fs = require('fs'),
    watcher = require('./watcher'),
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
  onchange : function (filename) {
    console.log('restarting process because file %s was changed', filename);
    child.kill();
    child = new_child();
  },
  pipeOutput : true
});