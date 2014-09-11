var applescript = require("applescript");

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
  var script = 'try\nset parent_folder to first flattened folder where its name = \"' + group + '\"\ntry\nfirst flattened folder where its name = \"' + name + '\" and container = parent_folder\non error errStr number errorNumber\ntell parent_folder to make new ' + type + ' with properties {name:\"' + name + '\"}\nend try\non error errStr number errorNumber\ntry\nfirst flattened folder where its name = \"' + name + '\"\non error errStr number errorNumber\ntell it to make new ' + type + ' with properties {name:\"' + name + '\"}\nend try\nend try';
  executeScript(script, function(err, res) {
    if (err) {
      console.log(err);
    }
    callback();
  });
}

function create_task_if_possible_in_project(name, project, callback) {
  var script = 'try\nset parent_project to first flattened project where its name = \"' + project + '\"\ntry\nfirst flattened project where its name = \"' + name + '\" and container = parent_project\non error errStr number errorNumber\ntell parent_project to make new task with properties {name:\"' + name + '\"}\nend try\non error errStr number errorNumber\ntry\nfirst flattened project where its name = \"' + name + '\"\non error errStr number errorNumber\ntell it to make new task with properties {name:\"' + name + '\"}\nend try\nend try';
  executeScript(script, function(err, res) {
    if (err) {
      console.log(err);
    }
    callback();
  });
}
