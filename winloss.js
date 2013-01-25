(function(){
 var storage = {games:[]};
 // calculate win/loss ratio
 var win = 0; loss = 0; draw = 0;
 var league = {win:0, loss:0, draw:0};
 var games = document.getElementsByClassName('calresultado');
 for (var i = 0; i < games.length; i++) {
  var game = games[i];
  var leaguegame = game.parentElement.parentElement.parentElement.className == 'negro';
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
  var day;
  if (game.parentElement.previousElementSibling.previousElementSibling.previousElementSibling) {
   day = game.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerHTML;
  } else {
   // no simul available
   day = game.parentElement.previousElementSibling.previousElementSibling.innerHTML;
  }
  var d = new Date(month + " " + day + ", " + year + " 12:00:00");
  var match;
  match = {};
  match.league = leaguegame;
  match.date = d.getTime();
  if (home) {
   match.home = 'me';
   match.away = team;
   match.awayteamname = teamname;
  } else {
   match.away = 'me';
   match.home = team;
   match.hometeamname = teamname;
  }
  match.homescore = score[1];
  match.awayscore = score[2];
  storage.games.push(match);
 }
 for (var i in storage) {
  for (var j = 0; j < storage[i].length; j++) {
   var now = new Date(), gamedate = new Date(storage[i][j].date);
   var last = new Date().addMonths(-1);
   last.setHours(0);
   last.setMinutes(0);
   last.setDate(1);
   now.setHours(0);
   now.setMinutes(0);
   now.setDate(1);
   var game = storage[i][j], myscore, theirscore;
   if (game.awayteamname) {
    myscore = game.homescore;
    theirscore = game.awayscore;
   } else {
    myscore = game.awayscore;
    theirscore = game.homescore;
   }
   if (Number(myscore) == Number(theirscore)) {
    draw++;
    if (game.league) {
     league.draw++;
    }
    continue;
   }
   if (Number(myscore) > Number(theirscore)) {
    win++;
    if (game.league) {
     league.win++;
    }
    continue;
   }
   if (game.league) {
    league.loss++;
   }
   loss++;
  }
 }
 // display it
 var container = document.createElement('div'), menu = document.getElementsByClassName('bl')[0];
 menu.appendChild(container);
 container.style.color="#000";
 container.style.fontSize="12px";
 container.style.textAlign="center";
 container.innerHTML = 'This month: Won ' + Math.round((win/(win+loss+draw))*100) + '% ' + win + '-' + draw + '-' + loss + '<br>'
   + 'League record: Won ' + Math.round((league.win/(league.win+league.loss+league.draw))*100) + '% ' +
      league.win + '-' + league.draw + '-' + league.loss
})();