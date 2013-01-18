(function() {
 var otherteam = location.href.match(/otherteam=(\d+)/)[1];
 var mya = document.createElement('a');
 mya.className = 'boton';
 mya.appendChild(document.createTextNode('Your Rival'));
 mya.href = '/equipo.php?id=' + otherteam + '&viewopponent=1';
 mya.style.display = "none";
 document.getElementsByClassName('boton')[0].insertAdjacentElement('afterEnd', mya);
 document.getElementsByClassName('boton')[0].style.display="none";
 mya.style.display = "block";
})();