var preprocess = require("../index.js")
  , noise = require("spatial-noise")

require("tap").test("static range tree", function(t) {
  var points, search
  function getRange(lo, hi, expected) {
    var result = []
    search(lo, hi, function(i) {
      result.push(i)
    })
    result.sort()
    expected.sort()
    t.equals(result.join(","), expected.join(","))
  }
  
  //1D singleton test
  points = [[0]]
  search = preprocess(points)
  getRange([-1], [1], [0])
  getRange([0], [0], [0])
  getRange([0], [1], [0])
  getRange([-1], [0], [0])
  getRange([-1], [-1], [])
  getRange([1], [1], [])
  getRange([1], [-1], [])
  
  //1D tests
  points = [[0], [1], [2], [2], [2], [3], [4], [5] ]
  search = preprocess(points)
  getRange([0], [2], [0,1,2,3,4])
  getRange([0], [3], [0,1,2,3,4,5])
  getRange([0], [2.5], [0,1,2,3,4])
  getRange([-1], [0], [0])
  getRange([-10], [-10], [])
  getRange([1000], [10000], [])
  getRange([3], [7], [5,6,7])
  getRange([3], [5], [5,6,7])
  getRange([2.2], [4], [5,6])
  getRange([0], [0], [0])
  getRange([5], [5], [7])
  
  //2D singleton test
  points = [[0,0]]
  search = preprocess(points)
  getRange([-1,-1], [1,1], [0])
  getRange([0,0], [0,0], [0])
  getRange([0,0], [1,0], [0])
  getRange([0,0], [0,1], [0])
  getRange([-1,0], [0,0], [0])
  getRange([0,-1], [0,0], [0])
  
  //2D line test
  points = [[0,0], [1,0], [2,0], [2,0], [2,0], [3,0], [4,0], [5,0] ]
  search = preprocess(points)
  getRange([0,0], [2,0], [0,1,2,3,4])
  getRange([0,0], [3,0], [0,1,2,3,4,5])
  getRange([0,0], [2.5,0], [0,1,2,3,4])
  getRange([-1,0], [0,0], [0])
  getRange([-10,0], [-10,0], [])
  getRange([1000,0], [10000,0], [])
  getRange([3,0], [7,0], [5,6,7])
  getRange([3,0], [5,0], [5,6,7])
  getRange([2.2,0], [4,0], [5,6])
  getRange([0,0], [0,0], [0])
  getRange([5,0], [5,0], [7])

  points = [[0,0], [1,1], [2,2], [2,2], [2,2], [3,3], [4,4], [5,5] ]
  search = preprocess(points)
  getRange([0,0], [2,2], [0,1,2,3,4])
  getRange([0,0], [3,3], [0,1,2,3,4,5])
  getRange([0,0], [2.5,2.5], [0,1,2,3,4])
  getRange([-1,-1], [0,0], [0])
  getRange([-10,-10], [-10,-10], [])
  getRange([1000,1000], [1000,1000], [])
  getRange([3,3], [7,7], [5,6,7])
  getRange([3,3], [5,5], [5,6,7])
  getRange([2.2,2.2], [4,4], [5,6])
  getRange([0,0], [0,0], [0])
  getRange([5,5], [5,5], [7])
  
  //n-d singleton test
  points = [[0,0,0,0,0,0,0,0,0,0]]
  search = preprocess(points)
  getRange([0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0], [0])
  getRange([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [1,1,1,1,1,1,1,1,1,1], [0])
  getRange([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [])
  getRange([1,1,1,1,1,1,1,1,1,1], [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [])
  
  
  //Test with 7 points
  points = [[0,0], [1,1], [2,2], [3,3], [4,4], [5,5], [6,6]]
  search = preprocess(points)
  getRange([0,0], [3,3], [0,1,2,3])
  
  
  //Fuzz test
  points = new Array(100)
  for(var i=0; i<100; ++i) {
    var p = new Array(3)
    for(var j=0; j<3; ++j) {
      p[j] = Math.random() * 1000
    }
    points[i] = p
  }
  var count = 0
  preprocess(points)([0, 0, 0], [1000, 1000, 1000], function(i) {
    ++count
  })
  t.equals(count, 100)
  
  t.end()
})