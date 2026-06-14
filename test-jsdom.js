const { JSDOM } = require('jsdom');
const dom = new JSDOM();
console.log(dom.window.location.origin);
