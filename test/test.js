var preprocess = require("../index.js")

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
  getRange([-1], [-1], [])
  getRange([1], [1], [])
  getRange([1], [-1], [])
  
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
  
  //n-d singleton test
  points = [[0,0,0,0,0,0,0,0,0,0]]
  search = preprocess(points)
  getRange([0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0], [0])
  getRange([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [1,1,1,1,1,1,1,1,1,1], [0])
  getRange([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [])
  getRange([1,1,1,1,1,1,1,1,1,1], [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], [])
  
  /*
  //2D tests
  points = [[0, 0], [0,1], [0,2],
            [1, 0], [1,1], [1,2] ]
  search = preprocess(points)
  
  getRange([0, 0], [1,1], [0,1,3,4])
  */
  

  t.end()
})