module.exports.group_issues = function (api_response) {
  var ownerMap = {};

  for (index in api_response) {
    var issue = api_response[index];
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

  return ownerMap;
}
