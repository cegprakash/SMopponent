(function (){
  var teaminfo;
  var sendthis = false;
  chrome.extension.onMessage.addListener(
    function(info, sender, sendResponse) {
      switch (info[0]) {
        case 0 :
          teaminfo = info[1];
          if (sendthis) {
            sendthis(teaminfo);
            sendthis = null;
          }
          break;
        case 1 :
          if (teaminfo) {
            sendResponse(teaminfo);
          } else {
            sendthis = sendResponse;
          }
          break;
        case 911 :
         chrome.tabs.getSelected(null, function(tab) {
          chrome.tabs.insertCSS(tab.id, {'file' : 'foo.css', 'allFrames' : true});
         });
         break;
        case 311 :
         chrome.tabs.getSelected(null, function(tab) {
          chrome.tabs.insertCSS(tab.id, {'file' : 'fooundo.css', 'allFrames' : true});
         });
         break;
      }
      return true;
    });
})();