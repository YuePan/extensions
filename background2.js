/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function check(url, tabId) {
  var checkUrl = 'http://c7n6yx1:8080/check' +
    '?v=1.0&u=' + url;
  var x = new XMLHttpRequest();
  x.open('GET', checkUrl);
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Auriga server.
    var response = x.response;
    if (!response || !response.data) {
      errorCallback('No response from Auriga!');
      return;
    }
    var message = response.data;
	if (message == "True") 
		chrome.pageAction.show(tabId);
  };
  x.onerror = function() {
    console.log('background: Network error.');
  };
  console.log("background: sending");
  x.send();
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	check(tab.url, tabId);
})