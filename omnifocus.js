var applescript = require("applescript");
var sleep = require('sleep');

function executeScript(script, callback) {
  var finalScript = 'tell application "OmniFocus"\ntell front document\n' + script + '\nend tell\nend tell\n';
  applescript.execString(finalScript, callback);
}

module.exports.create_folder_if_possible = function (folder_name, callback) {
  create_object_if_possible(folder_name, 'folder', callback);
}

module.exports.create_folder_if_possible_in_group = function (folder_name, group, callback) {
  create_object_if_possible_in_group(folder_name, group, 'folder', callback);
}

module.exports.create_project_if_possible_in_group = function (project_name, group, callback) {
  create_object_if_possible_in_group(project_name, group, 'project', callback);
}

function create_object_if_possible(name, type, callback) {
  create_object_if_possible_in_group(name, "", type, callback);
}

function create_object_if_possible_in_group(name, group, type, callback) {

  var script =
  'try\n' +
    'set parent_folder to first flattened folder where its name = \"' + group + '\"\n' +
    'try\n' +
      'first flattened ' + type + ' where its name = \"' + name + '\" and container = parent_folder\n' +
    'on error errStr number errorNumber\n' +
      'tell parent_folder to make new ' + type + ' with properties {name:\"' + name + '\"}\n' +
    'end try\n' +
  'on error errStr number errorNumber\n' +
    'try\n' +
      'first flattened folder where its name = \"' + name + '\"\n' +
    'on error errStr number errorNumber\n' +
      'tell it to make new ' + type + ' with properties {name:\"' + name + '\"}\n' +
    'end try\n' +
  'end try';


  sleep.usleep(100);
  executeScript(script, function(err, res) {
    if (err) {
      console.log(err);
    }
    callback();
  });
}

function create_task_if_possible_in_project(name, project, callback) {
  var script =
  'try\n' +
    'set parent_project to first flattened project where its name = \"' + project + '\"\n' +
    'try\n' +
      'first flattened project where its name = \"' + name + '\" and container = parent_project\n' +
    'on error errStr number errorNumber\n' +
      'tell parent_project to make new task with properties {name:\"' + name + '\"}\n' +
    'end try\n' +
  'on error errStr number errorNumber\n' +
    'try\n' +
      'first flattened project where its name = \"' + name + '\"\n'
    'on error errStr number errorNumber\n' +
      'tell it to make new task with properties {name:\"' + name + '\"}\n' +
    'end try\n'
  'end try';
  
  sleep.usleep(100);
  executeScript(script, function(err, res) {
    if (err) {
      console.log(err);
    }
    callback();
  });
}
