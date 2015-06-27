var github_helper = require('./github_helper');
var omnifocus = require('./omnifocus');
var async = require("async");

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

        if (github_helper.issues_have_milestones(issues)) {
          omnifocus.create_folder_if_possible_in_group(projectName, folderName, function () {
              createProjectsForMilestones(issues, projectName, callback);
          });
        }
        else {
          omnifocus.create_project_if_possible_in_group(projectName, folderName, function () {
            callback();
          });
        }

      });
    })(issues);
  }

  async.parallel(projectTasks, function(){
    callback();
  });
}

function createProjectsForMilestones(issues, folderName, callback) {
  console.log("Updating project " + folderName + " based on milestones");

  var issueTasks = [];

  for (var issueIndex in issues) {
    var issue = issues[issueIndex];

    (function(issue) {
      issueTasks.push(function (callback) {
        var milestoneName = issue["milestone"] == null ? "No milestone" : issue["milestone"]["title"];
        console.log("Updating milestone " + milestoneName + " for " + folderName);
        omnifocus.create_project_if_possible_in_group(milestoneName, folderName, function () {
          callback();
        });
      });
    })(issue);
  }

  async.parallel(issueTasks, function(){
    callback();
  });
}

configValueForKey("of-oauth-token", function (token) {
    var GitHubApi = require("github");

    var github = new GitHubApi({
      version: "3.0.0",
    });

    github.authenticate({
      type: "oauth",
      token: token
    });

    github.issues.getAll({}, function(err, res) {
      var ownerMap = github_helper.group_issues(res);

      var asyncTasks = [];
      for (var ownerName in ownerMap) {
        (function(ownerName) {
          asyncTasks.push(function(callback){
            console.log("Updating tasks for owner " + ownerName);

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
