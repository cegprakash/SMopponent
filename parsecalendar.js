(function() {
 chrome.extension.sendMessage([1], function(response) {
  var games = document.getElementsByClassName('calresultado');
  chrome.storage.sync.get(null, function(storage) {
   if (!storage) storage = {};
   for (var i = 0; i < games.length; i++) {
    var game = games[i];
    var team = game.parentElement.previousElementSibling.attributes[0].nodeValue.match(/equipo\.php\?id=(\d+)/);
    if (!team) {
     continue; // cup match with no opponent
    }
    team = team[1];
    var teamname = game.parentElement.previousElementSibling.firstElementChild.title;
    var home = game.parentElement.parentElement.style.backgroundImage.length ? true : false;
    var score = game.innerHTML.match(/(\d+)\-(\d+)/);
    var date = document.getElementsByTagName('th')[0].firstElementChild.firstElementChild.nextElementSibling.innerHTML.match(/([a-zA-Z]+) (\d+)/);
    var year = date[2];
    var month = date[1];
    var day = game.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerHTML;
    var d = new Date(month + " " + day + ", " + year + " 12:00:00");
    var match = {};
    match.date = d.getTime();
    if (home) {
     match.home = response.myteam;
     match.away = team;
     match.awayteamname = teamname;
     match.homescore = score[1];
     match.awayscore = score[2];
    } else {
     match.away = response.myteam;
     match.home = team;
     match.hometeamname = teamname;
     match.homescore = score[2];
     match.awayscore = score[1];
    }
    if (!storage["team" + team]) {
     storage["team" + team] = [];
    }
    storage["team" + team][match.date] = match; // ensure we get no duplicates
   }
   chrome.storage.sync.set(storage, function(result) {});
  });
 });
})();