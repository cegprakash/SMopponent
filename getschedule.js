(function(){
 var team = document.body.innerHTML.match(/<a class="color_skin" target="marco" href="equipo.php\?id=(\d+)/)[1];
 $.ajax({
  url: "/equipo.php",
  success: function(data) {
   var doc = document.implementation.createHTMLDocument("stuff");
   doc.documentElement.innerHTML = data;
   var th = doc.getElementsByTagName('th');
   var myteamname;
   if (th[0].attributes[0].name == "colspan") {
    myteamname = th[0].firstChild.nodeValue.replace('&nbsp;', ' ').replace('&gt;', '>').replace('&lt;', '<').replace('&amp;', '&');
   } else {
    myteamname = th[1].firstChild.nodeValue.replace('&nbsp;', ' ').replace('&gt;', '>').replace('&lt;', '<').replace('&amp;', '&');
   }
   var user = data.match(/usuario\.php\?id=(\d+)/)[1];
   $.ajax({
    url: "/usuario.php",
    success: function(data) {
     var doc = document.implementation.createHTMLDocument("stuff");
     doc.documentElement.innerHTML = data;
     var rawdate = doc.getElementsByClassName('datosjugador')[0].querySelector('tr:nth-of-type(4) td:nth-of-type(2)').firstChild.nodeValue;
     var matches = rawdate.match(/(\d\d)\/(\d\d)\/(\d\d\d\d) (\d\d):(\d\d)/);
     var dateobj = new Date(matches[3], matches[2]-1, matches[1], matches[4], matches[5]);
     chrome.extension.sendMessage([0, {myteamname: myteamname, myteam: team, myuser: user, joindate: dateobj.getTime()}], function(response) {
     });
    }
   });
  }
 });
 chrome.extension.sendMessage([1], function(response) {
  chrome.storage.sync.get(null, function(storage) {
   if (!storage) storage = {};
   var startDate = new Date(response.joindate);
   var startSync;
   if (storage.lastsync) {
    var startMonth = new Date(storage.lastsync);
    startSync = new Date(storage.lastsync);
    // we have grabbed the dates before, only grab games since that date
   } else {
    // clear out anything from the last version of this extension
    chrome.storage.sync.clear();
    var startMonth = new Date(response.joindate);
    startSync = new Date(storage.joindate);
   }
   // determine the list of months to grab
   startMonth.setHours(0);
   startMonth.setMinutes(0);
   startMonth.setDate(1);
   var now = new Date();
   storage.lastsync = now.getTime();
   chrome.storage.sync.set({lastsync: now.getTime()}, function(){});
   var months = [];
   while (now >= startMonth) {
    months.push([now.getMonth() + 1, now.getFullYear()]);
    now.addMonths(-1);
   }
   for (var q = 0; q < months.length; q++) {
    var m = months[q][0] + "";
    var y = months[q][1];
    if (m.length == 1) m = "0" + m;
    $.ajax({
     url: "/proximos_partidos.php?mes=" + y + "-" + m + "&id_equipo=" + response.myteam,
     success:
      function (data) {
       var doc = document.implementation.createHTMLDocument("stuff");
       doc.documentElement.innerHTML = data;
       var games = doc.getElementsByClassName('calresultado');
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
        var date = doc.getElementsByTagName('th')[0].firstElementChild.firstElementChild.nextElementSibling.innerHTML.match(/([a-zA-Z]+) (\d+)/);
        var year = date[2];
        var month = date[1];
        var day;
        if (game.parentElement.previousElementSibling.previousElementSibling.previousElementSibling) {
         day = game.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.innerHTML;
        } else {
         // no simul available
         day = game.parentElement.previousElementSibling.previousElementSibling.innerHTML;
        }
        var d = new Date(month + " " + day + ", " + year + " 12:00:00").addDays(1);
        if (d < startSync) {
         continue;
        }
        var match;
        match = {};
        match.date = d.getTime();
        if (home) {
         match.home = response.myteam;
         match.away = team;
         match.awayteamname = teamname;
        } else {
         match.away = response.myteam;
         match.home = team;
         match.hometeamname = teamname;
        }
        match.homescore = score[1];
        match.awayscore = score[2];
        if (!storage["team" + team]) {
         storage["team" + team] = [];
         storage["team" + team].push(match);
        } else {
        var saved = false;
        // crude insertion sort
        for (var j = 0; j < storage["team" + team].length; j++) {
         if (storage["team" + team][j].date == match.date) {
          saved = true;
          break; // this is us, no need to duplicate
         }
         if (storage["team" + team][j].date < match.date) {
          if (j == 0) {
           storage["team" + team].unshift(match);
           saved = true;
           break;
          }
          storage["team" + team].splice(j, 0, match);
          saved = true;
          break;
         }
        }
        if (!saved) {
         storage["team" + team].push(match);
        }
       }
      }
      chrome.storage.sync.set(storage, function(result) {});
      console.log("parsed " + month + " " + year);
     }
    });
   }
   // calculate win/loss ratio
   var win = 0; loss = 0; draw = 0;
   var thismonth = {win:0, loss:0, draw:0};
   var lastmonth = {win:0, loss:0, draw:0};
   var homescore = {win:0, loss:0, draw:0};
   var awayscore = {win:0, loss:0, draw:0};
   for (var i in storage) {
    if (i == 'lastsync') continue;
    for (var j = 0; j < storage[i].length; j++) {
     var now = new Date(), gamedate = new Date(storage[i][j].date);
     var last = new Date().addMonths(-1);
     last.setHours(0);
     last.setMinutes(0);
     last.setDate(1);
     now.setHours(0);
     now.setMinutes(0);
     now.setDate(1);
     var game = storage[i][j], myscore, theirscore, home = false;
     if (game.awayteamname) {
      myscore = game.homescore;
      theirscore = game.awayscore;
      home = true;
     } else {
      home = false;
      myscore = game.awayscore;
      theirscore = game.homescore;
     }
     if (Number(myscore) == Number(theirscore)) {
      draw++;
      if (home) {
       homescore.draw++;
      } else {
       awayscore.draw++;
      }
      if (gamedate > now) {
       thismonth.draw++;
       continue;
      }
      if (gamedate > last) {
       lastmonth.draw++;
      }
      continue;
     }
     if (Number(myscore) > Number(theirscore)) {
      win++;
      if (home) {
       homescore.win++;
      } else {
       awayscore.win++;
      }
      if (gamedate > now) {
       thismonth.win++;
       continue;
      }
      if (gamedate > last) {
       lastmonth.win++;
      }
      continue;
     }
     if (home) {
      homescore.loss++;
     } else {
      awayscore.loss++;
     }
     if (gamedate > now) {
      thismonth.loss++;
      continue;
     }
     if (gamedate > last) {
      lastmonth.loss++;
     }
     loss++;
    }
   }
   // display it
   var container = document.createElement('div'), menu = document.getElementsByClassName('menupers')[0];
   menu.appendChild(container);
   container.style.color="#000";
   container.style.fontSize="12px";
   container.innerHTML = 'Won ' + Math.round((win/(win+loss+draw))*100) + '% ' + win + '-' + draw + '-' + loss + '<br>'
   + 'This month: Won ' + Math.round(((thismonth.win-1)/((thismonth.win-1)+thismonth.loss+thismonth.draw))*100) + '% ' +
      (thismonth.win-1) + '-' + thismonth.draw + '-' + thismonth.loss + '<br>'
   + 'Last month: Won ' + Math.round((lastmonth.win/(lastmonth.win+lastmonth.loss+lastmonth.draw))*100) + '% ' + lastmonth.win + '-' + lastmonth.draw + '-' + lastmonth.loss + '<br>'
   + 'Home: Won ' + Math.round((homescore.win/(homescore.win+homescore.loss+homescore.draw))*100) + '% ' + homescore.win + '-' + homescore.draw + '-' + homescore.loss + '<br>'
   + 'Away: Won ' + Math.round((awayscore.win/(awayscore.win+awayscore.loss+awayscore.draw))*100) + '% ' + awayscore.win + '-' + awayscore.draw + '-' + awayscore.loss + '<br>'
  });
 });
})();
