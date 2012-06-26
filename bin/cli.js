var watcher = require('../lib/watcher.js'),
    program = require('commander'),
    fs = require('fs'),
    optsFilePath;

program
  .version('0.0.1')
  .option('-f, --file', 'config file in json format' +
                        ', if not specified, default is "watcher.json"');

program.on('--help', function(){
  console.log('  JSON config file:');
  console.log('');
  console.log('    includes - array of files or directories to watch');
  console.log('    excludes - array of files or directories to exclude');
  console.log('    process  - name of process to be executed');
  console.log('    procArgs - array of process arguments');
  console.log('    silent   - if true, no output is piped from the process');
  console.log('    debug    - if true, there is some debug output');
  console.log('');
});
program.parse(process.argv);

optsFilePath = program.file || 'watcher.json';

fs.readFile(optsFilePath, function (err, data) {
  if (err) {
    console.log(
      'File with path ' + optsFilePath + ' was not found.' +
      'Please specify valid file with -f/--file option or create' +
      'watcher.json file in current directory.');
    process.exit(1);
  };
  watcher().watch(JSON.parse(data));
});

