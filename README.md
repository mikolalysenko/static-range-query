static-range-query
==================
Given a collection of points in n-dimensional space, preprocesses these points so that orthogonal range queries can be computed efficiently.  Internally, this library is built using range trees.

# Example

```javascript
var preprocess = require("static-range-query")

//Generate 10000 4D points
var D = 4, N = 10000
var points = new Array(N)
for(var i=0; i<N; ++i) {
  var p = new Array(D)
  for(var j=0; j<N; ++j) {
    p[j] = Math.random() * 1000
  }
  points[i] = p
}

//Construct query data structure
var rangeQuery = preprocess(points)

//Now execute a range query!
rangeQuery([2, 5, 0.25, -10], [10, 50, 5, 30], function(i) {
  console.log("In range: ", i , points[i])
})
```

# Install

    npm install static-range-query
    
# API

### `var rangeQuery = require("static-range-query")(points)`
Preprocesses the point set so that orthogonal range queries can be evaluated efficiently.

* `points` is an array of points (each point is represented as a tuple of D numbers)

**Returns** A `rangeSearch()` function (see below) which evaluates range queries on the point set.

**Time Complexity** `O(points.length * log(points.length)^points[0].length)`

**Space Complexity** `O(points.length * log(points.length)^points[0].length)`

**Notes** Internally, this function builds a range tree and binds it to the query method

### `rangeQuery(lo, hi, cb(index))`
Evaluates a range query on the point set.

* `lo` is a lower bound on the bounding rectangle to query
* `hi` is an upper bound on the bounding rectangle to query
* `cb` is a callback which gets called once per each point in the range with the index of a point.

**Time Complexity** `O(log(points.length)^points[0].length + k)` where `k` is the number of points processed in the range.

**Note** You can terminate the search early by returning `true` from `cb`, for example:

```javascript
rangeQuery([0, 0, 0], [100, 100, 100], function(i) {

  if(i === 100) {
    console.log("found it!")
    return true
  }

  //Continue processing ....
  return false
})
```

# Credits
(c) 2013 Mikola Lysenko. MIT License