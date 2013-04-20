"use strict"

var bfs = require("bfs-tree-layout")
  , inorder = require("inorder-tree-layout")
  , lowerBound = require("lower-bound")
  , upperBound = require("upper-bound")

//Comparison functions, reuse and generate lazily
var CACHED = []

function TerminalTree(coords, indices) {
  this.coords = coords
  this.indices = indices
}

//Terminal tree is easy:  just binary search and iterate over interval
TerminalTree.prototype.search = function(d, lo, hi, cb) {
  var coords = this.coords
    , begin = lowerBound(coords, lo[d])
    , end = upperBound(coords, hi[d])
    , indices = this.indices
  if(begin <= end) {
    //Edge case
    if(begin < 0) {
      begin = 0
    }
    if(coords[begin] < lo[d]) {
      ++begin
    }
    //Search over range
    for(var i=begin; i<end; ++i) {
      if(cb(indices[i])) {
        return true
      }
    }
  }
  return false
}

function RangeTree(coords, indices, children) {
  this.coords = coords
  this.indices = indices
  this.children = children
}

RangeTree.prototype.search = function(d, bounds_lo, bounds_hi, cb) {
  var coords = this.coords
    , children = this.children
    , n = coords.length
    , lo = bounds_lo[d]
    , hi = bounds_hi[d]
    , v = bfs.root(n), l, r
    , vsplit
    , x
    , vsplit = -1
  if(hi < lo) {
    return
  }
  while(v < n) {
    x = coords[v]
    if(lo < x && hi < x) {
      v = bfs.left(n, v)
    } else if(lo > x && hi > x) {
      v = bfs.right(n, v)
    } else {

      //Handle case where tree is complete contained
      if(lo <= coords[bfs.lo(n, v)] && coords[bfs.hi(n,v)] <= hi) {
        return children[v].search(d+1, bounds_lo, bounds_hi, cb)
      }
            
      //Save split node
      vsplit = v
      
      //Visit left trees
      v = bfs.left(n, vsplit)
      while(v < n) {
        l = bfs.left(n, v)
        r = l + 1
        if(lo <= coords[bfs.lo(n, v)]) {
          if(children[v].search(d+1, bounds_lo, bounds_hi, cb)) {
            return true
          }
          break
        }
        if(lo <= coords[v]) {
          if(r < n) {
            if(children[r].search(d+1, bounds_lo, bounds_hi, cb)) {
              return true
            }
          }
          v = l
        } else {
          v = r
        }
      }
      
      //Visit split node
      if(cb(this.indices[vsplit])) {
        return true
      }

      
      //Visit right trees
      v = bfs.right(n, vsplit)
      while(v < n) {
        l = bfs.left(n, v)
        r = l + 1
        if(coords[bfs.hi(n, v)] <= hi) {
          return children[v].search(d+1, bounds_lo, bounds_hi, cb)
        }
        if(coords[v] <= hi) {
          if(l < n) {
            if(children[l].search(d+1, bounds_lo, bounds_hi, cb)) {
              return true
            }
          }
          v = r
        } else {
          v = l
        }
      }
      return false
    }
  }
  return false
}

function makeRangeTree(points, d) {
  var cmp = CACHED[d]
    , n = points.length
    , coords = new Float64Array(n)
    , indices = new Uint32Array(n)
    , i, j, p
    , dim = points[0].length
  points.sort(cmp)
  if(d === dim - 2) {
    for(i = 0; i<n; ++i) {
      p = points[i]
      coords[i] = p[d]
      indices[i] = p[d+1]
    }
    return new TerminalTree(coords, indices)
  } else {
    var children  = new Array(n)
    for(i=0, j=bfs.begin(n); i<n; ++i, j=bfs.next(n, j)) {
      coords[j] = points[i][d]
      indices[j] = points[i][dim-1]
      children[j] = makeRangeTree(points.slice(inorder.lo(n, i), inorder.hi(n, i)+1), d+1)
    }
    return new RangeTree(coords, indices, children)
  }
}

function buildTree(points) {
  var n = points.length
  if(n === 0) {
    return noop
  }
  //Create decorated points array
  var d = points[0].length
    , dec_points = new Array(n)
    , i, j, p, q
  
  for(i=CACHED.length; i<=d; ++i) {
    CACHED[i]= new Function("a", "b", "return a["+i+"]-b["+i+"]")
  }
  
  for(i=0; i<n; ++i) {
    p = new Array(d+1)
    q = points[i]
    for(j=0; j<d; ++j) {
      p[j] = q[j]
    }
    p[d] = i
    dec_points[i] = p
  }
  
  var tree = makeRangeTree(dec_points, 0)
  return tree.search.bind(tree, 0)
}
module.exports = buildTree
