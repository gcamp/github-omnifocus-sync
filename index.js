var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function configValueForKey(key, callback) {
    execute("git config --global github." + key, function(name){
      callback(name.replace("\n", ""));
    });
}

function createFoldersAndIssues(projects, folderName, callback) {
  var projectTasks = [];
  for (var projectIndex in projects) {
    var issues = projects[projectIndex];
    var projectName = issues[0]["repository"]["name"];

    (function(issues) {
      projectTasks.push(function (callback) {
        var projectName = issues[0]["repository"]["name"];
        omnifocus.create_folder_if_possible_in_group(projectName, folderName, function () {
          var hasMilestones = github_helper.issues_have_milestones(issues);

          console.log(projectName + " has milesones " + hasMilestones);

          callback();
        });
      });
    })(issues);
  }

  async.parallel(projectTasks, function(){
    callback();
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
    }, function(err, res) {
      var ownerMap = github_helper.group_issues(res);

      var asyncTasks = [];
      for (var ownerName in ownerMap) {
        (function(ownerName) {
          asyncTasks.push(function(callback){
            var ownerFolderName = ownerName + " projects";
            omnifocus.create_folder_if_possible(ownerFolderName, function () {
              var projects = ownerMap[ownerName];

              createFoldersAndIssues(projects, ownerFolderName, callback);
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
