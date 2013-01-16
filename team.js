(function(){
 var insertpoint = document.getElementsByClassName('caja50')[0].querySelector('tr:last-of-type');
 var newel = document.createElement('tr');
 var td1 = document.createElement('td');
 var td2 = document.createElement('td');
 var mya = document.createElement('a');
 var teamdata = {};
 mya.href='#';
 mya.addEventListener("click", function() {
  $.ajax({
   url: chrome.extension.getURL('/source.html'),
   success: function(data) {
    document.body.innerHTML = data;
    $('.page').jScrollPane({showArrows:true, scrollbarWidth:13, animateInterval: 50, animateStep: 1, animateTo: true, maintainPosition: true});
    for (var i in teamdata) {
     document.getElementById(i).innerHTML = teamdata[i];
    }
   }
  });
 });
 mya.className = 'botonrojocorto';
 mya.appendChild(document.createTextNode('View'));
 td1.appendChild(document.createTextNode('View as Opponent'));
 td2.appendChild(mya);
 newel.className = 'tipo2';
 newel.appendChild(td1);
 newel.appendChild(td2);
 insertpoint.insertAdjacentElement("afterEnd", newel);
 var thisteam = location.href.match(/id=(\d+)/)[1];
 var parseResult = function(resultsnode) {
  var gamelink = resultsnode.parentElement.previousElementSibling.previousElementSibling.attributes[0].nodeValue;
  $.ajax({
   url: gamelink + "&accion=alineaciones",
   success: function(data) {
    var doc = document.implementation.createHTMLDocument("stuff");
    doc.documentElement.innerHTML = data;
    // determine which team number is this team
    var team2 = doc.getElementsByClassName('nombreequipo2')[0].firstElementChild.attributes[1].nodeValue.match(/=(\d+)/)[1];
    var us = '0';
    if (team2 == thisteam) {
     us = '1';
    }
    teamdata.campog2 = doc.getElementById('jugadores' + us).firstElementChild.innerHTML;
    var lineupcontainer = doc.getElementById('valequipo' + us);
    for (var i = 0; i < 6; i++) {
     lineupcontainer = lineupcontainer.firstElementChild;
    }
    teamdata.lineup = lineupcontainer.innerHTML.replace('Starting 11', 'Line-up');
    // strip subs
    var subs = teamdata.lineup.indexOf("	<tr>\n"+"		<th colspan=\"6\">Sub");
    teamdata.lineup = teamdata.lineup.slice(0, subs);
    // get team average
    var averages = teamdata.lineup.match(/<td class="rojo">\d+/g);
    var total = 0;
    for (var i = 0; i < averages.length; i++) {
      total += Number(averages[i].match(/<td class="rojo">(\d+)/)[1]);
    }
    teamdata.average = String(Math.round(total/averages.length));
    // for now this will be empty
    teamdata.previousmatches = '<tr><td>Data unavailable</td></tr>';
   }
  });
 };
 $.ajax({
  url: "/proximos_partidos.php?id_equipo=" + thisteam,
  success: function(data) {
   var doc = document.implementation.createHTMLDocument("stuff");
   doc.documentElement.innerHTML = data;
   var results = doc.getElementsByClassName('calresultado');
   if (!results.length) {
    // have to go back a month
    var month = data.match(/<a href="\?mes=([0-9-]+)&id_equipo=\d+"><img/)[1];
    $.ajax({
     url: "/proximos_partidos.php?mes=" + month + "&id_equipo=" + thisteam,
     success: function(data) {
      var doc = document.implementation.createHTMLDocument("stuff");
      doc.documentElement.innerHTML = data;
      var results = doc.getElementsByClassName('calresultado');
      var lastgame = results[results.length - 1];
      parseResult(lastgame);
     }
    });
    return;
   }
   var lastgame = results[results.length - 1];
   parseResult(lastgame);
  }
 });
 $.ajax({
  url: "/equipo.php?id=" + thisteam,
  success: function(data) {
   var doc = document.implementation.createHTMLDocument("stuff");
   doc.documentElement.innerHTML = data;
   var fields = doc.getElementsByTagName('tr');
   for (var i = 0; i < fields.length; i++) {
    var f = fields[i];
    if (f.firstElementChild.tagName == 'TH') {
     if (f.firstElementChild.firstChild.nodeValue == 'Press Releases') continue;
     teamdata.teamname = f.firstElementChild.firstChild.nodeValue;
     continue;
    }
    // the rest have td children
    var s = f.firstElementChild.nextElementSibling;
    switch (f.firstElementChild.firstChild.nodeValue) {
     case 'Manager' :
      teamdata.manager = s.innerHTML;
      break;
     case 'Stadium' :
      teamdata.stadium = s.innerHTML;
      break;
     case 'League' :
      teamdata.league = s.innerHTML;
      break;
     case 'Board' :
      teamdata.board = s.innerHTML;
      break;
     case 'Game streak' :
      teamdata.streak = s.innerHTML;
      break;
     case 'Ranking' :
      teamdata.ranking = s.innerHTML;
      break;
     case 'Region' :
      s.firstElementChild.style.float = 'inherit';
      teamdata.teamname = s.firstElementChild.outerHTML + teamdata.teamname;
      break;
    }
   }
  }
 })
})();