var preprocess = require("../index.js")

var n = 100000
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

console.log("Processing...")
var start = Date.now()
var query = preprocess(points)
var end = Date.now()
console.log("Processing Time = ", (end-start))


console.log("Querying...")
function cb(i) {
  return i > 0.999*n
}

var start = Date.now()
for(var i=0; i<100000; ++i) {
  var lo = [Math.random() * 1000, Math.random()*1000, Math.random()*1000]
  var hi = [lo[0]+ (Math.random()+Math.random())*1000, lo[0]+Math.random()*1000, lo[0]+Math.random()*100]
  query(lo, hi, cb)
}
var end = Date.now()
console.log("Query time = ", (end-start))

