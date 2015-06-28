// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getMessage(url, query, callback, errorCallback) {
  // Google image search - 100 searches per day.
  var searchUrl = 'http://localhost:8080/search' +
    '?v=1.0&q=' + encodeURIComponent(query) + '&u=' + url;
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Auriga server.
    var response = x.response;
    if (!response || !response.data) {
      errorCallback('No response from Auriga!');
      return;
    }
    var message = response.data;
    callback(message);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  console.log("sending");
  x.send();
}

function renderMessage(messageText) {
  document.getElementById('message').textContent = messageText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    console.log('Check task related message for ' + url);
    renderMessage('...');

    getMessage(url, "",
      function(message) {
        console.log('Auriga: ' + message);
        renderMessage(message);
      }, 
      function(errorMessage) {
        renderMessage('Cannot retrieve task related message. ' + errorMessage);
      });
  });
});

document.addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
    getCurrentTabUrl(function(url) {
      query = document.getElementById('command').value;
      getMessage(url, query,
        function(message) {
          console.log('Auriga: ' + message);
          renderMessage(message);
        }, 
        function(errorMessage) {
          renderMessage('Cannot retrieve task related message. ' + errorMessage);
        });
        document.getElementById('command').value = "";
    });
  };
});
