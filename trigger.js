function aprilfool() {
var d = new Date();
if (d.getMonth() == 3 && d.getDate() == 1) {
 if (Math.random() > .9) {
  chrome.extension.sendMessage([911], function(response) {
  });
 } else {
    chrome.extension.sendMessage([311], function(response) {
  });

 }
}
}