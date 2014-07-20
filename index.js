var exec = require('child_process').exec;
function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

function configValueForKey(key, callback) {
    execute("git config --global github." + key, function(name){
      callback(name.replace("\n", ""));
    });
}

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
      var ownerMap = {};

      for (index in res) {
        var issue = res[index];
        var repo = issue["repository"];

        if (repo) {
          var repoName = repo["name"];
          var owner = repo["owner"]["login"];

          var projectsMap = ownerMap[owner];
          if (!projectsMap) {
            projectsMap = {};
          }

          var issues = projectsMap[repoName];
          if (!issues) {
            issues = [];
          }
          issues.push(issue["title"]);
          projectsMap[repoName] = issues;

          ownerMap[owner] = projectsMap;
        }
      }

      console.log(JSON.stringify(ownerMap));
    });
  });
});
