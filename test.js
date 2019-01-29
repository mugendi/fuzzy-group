

var fg = require('.');



var list = [
  "nairobi serena",
  "nairobi serena",
  "nairobi serena hotel",
  "nairobi beer",
  "serena mara",
  "nairobi raha",
  "Nairobu Raha Website",
  "serena Nairobi",
  "nairobi beer makers",
  "The Nairobi serena hotel",
  "the makers of beer",
  "nairobi serena, Nairobi"
];


var g = fg(list);

console.log(JSON.stringify(g,0,4));