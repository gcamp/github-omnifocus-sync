var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function configValueForKey(key, callback) {
    execute("git config --global github." + key, function(name){
      callback(name.replace("\n", ""));
    });
}

var github_helper = require('./github_helper');
var omnifocus = require('./omnifocus');
var async = require("async");
configValueForKey("user", function (user) {
  configValueForKey("password", function (password) {
    var GitHubApi = require("github");

    var github = new GitHubApi({
      version: "3.0.0",
    });

    github.authenticate({
      type: "basic",
      username: user,
      password: password
    });

    github.issues.getAll({
      filter: "all"
    }, function(err, res) {
      var ownerMap = github_helper.group_issues(res);

      var asyncTasks = [];
      for (var ownerName in ownerMap) {
        asyncTasks.push(function(callback){
          omnifocus.create_folder_if_possible(ownerName + " projects", function () {
            var projects = ownerMap[ownerName];
            for (var projectIndex in projects) {
              var project = projects[projectIndex];
            }
            callback();
          });
        });
      }

      async.parallel(asyncTasks, function(){
        console.log("everything is done!")
      });
    });
  });
});
