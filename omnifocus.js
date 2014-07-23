var applescript = require("applescript");

function executeScript(script, callback) {
  var finalScript = 'tell application "OmniFocus"\ntell front document\n' + script + '\nend tell\nend tell\n';
  applescript.execString(finalScript, callback);
}

module.exports.create_folder_if_possible = function (folder_name, callback) {
  create_object_if_possible(folder_name, 'folder', callback);
}

module.exports.create_project_if_possible = function (project_name, callback) {
  create_object_if_possible(project_name, 'project', callback);
}

function create_object_if_possible(name, type, callback) {
  var script = 'try\nfirst flattened ' + type + ' where its name = \"' + name + '\"\non error errStr number errorNumber\ntell it to make new ' + type + ' with properties {name:\"' + name + '\"}\nend try'
  executeScript(script, function(err, res) {
    if (err) {
      console.log(err);
    }
    callback();
  });
}
