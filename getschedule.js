(function(){
 var team = document.body.innerHTML.match(/<a class="color_skin" target="marco" href="equipo.php\?id=(\d+)/)[1];
 $.ajax({
  url: "/equipo.php",
  success: function(data) {
   var user = data.match(/usuario\.php\?id=(\d+)/)[1];
   $.ajax({
    url: "/usuario.php",
    success: function(data) {
     var doc = document.implementation.createHTMLDocument("stuff");
     doc.documentElement.innerHTML = data;
     var rawdate = doc.getElementsByClassName('datosjugador')[0].querySelector('tr:nth-of-type(4) td:nth-of-type(2)').firstChild.nodeValue;
     var matches = rawdate.match(/(\d\d)\/(\d\d)\/(\d\d\d\d) (\d\d):(\d\d)/);
     var dateobj = new Date(matches[3], matches[2]-1, matches[1], matches[4], matches[5]);
     chrome.extension.sendMessage([0, {myteam: team, myuser: user, joindate: dateobj.getTime()}], function(response) {
     });
    }
   });
  }
 });
})();