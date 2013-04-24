var preprocess = require("../index.js")

var n = 1000000
var d = 3
var max_count = 100
var time_limit = 1000
var warmup = 1


console.log("Testing uniform distribution, n=", n)
var points = new Array(n)
for(var i=0; i<n; ++i) {
  var p = new Array(d)
  for(var j=0; j<d; ++j) {
    p[j] = Math.random() * 1000
  }
  points[i] = p
}

preprocess(points)
