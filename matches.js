chrome.runtime.onConnect.addListener(function(port) {
  port.postMessage({counter: msg.counter+1});
});
