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
      //filter: "all"
    }, function(err, res) {
      var ownerMap = github_helper.group_issues(res);

      var asyncTasks = [];
      for (var ownerName in ownerMap) {
        (function(ownerName) {
          asyncTasks.push(function(firstCallback){
            var ownerFolderName = ownerName + " projects";
            omnifocus.create_folder_if_possible(ownerFolderName, function () {
              var projectTasks = [];

              var projects = ownerMap[ownerName];
              for (var projectIndex in projects) {
                var project = projects[projectIndex];

                var projectName = project[0]["repository"]["name"];

                (function(projectName) {
                  projectTasks.push(function (callback) {
                    omnifocus.create_folder_if_possible_in_group(projectName, ownerFolderName, function () {
                      callback();
                    });
                  });
                })(projectName);
              }

              async.parallel(projectTasks, function(){
                firstCallback();
              });
            });
          });
        })(ownerName);
      }

      async.parallel(asyncTasks, function(){
        console.log("everything is done!")
      });
    });
  });
});
