'use strict';
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../sw.js").then(registration => {
    console.log("SW successfully registered!");
    console.log(registration);
  }).catch(e => {
    console.log("SW registration failed! " + e);
  });
} else {
  console.log("Service worker note supported.");
}