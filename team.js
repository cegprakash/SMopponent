(function(){
 var insertpoint = document.getElementsByClassName('caja50')[0].querySelector('tr:last-of-type');
 var newel = document.createElement('tr');
 var td1 = document.createElement('td');
 var td2 = document.createElement('td');
 var mya = document.createElement('a');
 mya.href='#';
 mya.addEventListener("click", function() {
  $.ajax({
   url: chrome.extension.getURL('/source.html'),
   success: function(data) {
    document.body.innerHTML = data;
    $('.page').jScrollPane({showArrows:true, scrollbarWidth:13, animateInterval: 50, animateStep: 1, animateTo: true, maintainPosition: true});
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
})();