'use strict';

import '../../node_modules/whatwg-fetch/fetch.js';

function getProducts() {
  console.log("Getting Products...");
  fetch('http://localhost/load?p=')
    .then(res => {
      console.log(".then"); 
      console.log(res.json());
    });
}

getProducts();