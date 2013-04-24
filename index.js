"use strict"

var bfs = require("bfs-tree-layout")
  , bits = require("bit-twiddle")
  , bfs2inorder = require("bfs2inorder")
  , inorder = require("inorder-tree-layout")
  , lowerBound = require("lower-bound")
  , upperBound = require("upper-bound")
  , assert = require("assert")

var TREE_CUTOFF = 8

var SCRATCH = [new Uint32Array(1024)]
  , BUFFER  = [new Uint32Array(1024)]
  , TEMP    = [new Uint32Array(SCRATCH[0].buffer)]
  
function merge(d, begin, pivot, end) {
  var a_ptr = begin|0, a_end = pivot|0, a
    , b_ptr = pivot|0, b_end = (pivot+1)|0, b
    , c_ptr = (pivot+1)|0, c_end = end|0, c
    , d_ptr = 0, d_end = (end - begin)|0
    , next, i, j, src, dst, data = BUFFER[d]
  for(d_ptr=0; d_ptr<d_end; ++d_ptr) {
    a = a_ptr < a_end ? data[a_ptr] : Infinity
    b = b_ptr < b_end ? data[b_ptr] : Infinity
    c = c_ptr < c_end ? data[c_ptr] : Infinity
    if(a <= b) {
      if(a <= c) {
        next = a_ptr++
      } else if(b <= c) {
        next = b_ptr++
      } else {
        next = c_ptr++
      }
    } else if(b <= c) {
      next = b_ptr++
    } else {
      next = c_ptr++
    }
    for(i=0; i<=d; ++i) {
      SCRATCH[i][d_ptr] = BUFFER[i][next]
    }
  }
  for(j=0; j<=d; ++j) {
    src = SCRATCH[j]
    dst = BUFFER[j]
    for(i=0; i<d_end; ++i) {
      dst[i+begin] = src[i]
    }
  }
}

function TerminalNode(points) {
  this.points = points
}

TerminalNode.prototype.search = function(DIMENSION, lo, hi, cb) {
  var points = this.points
    , n = points.length|0
    , i, j, p
i_loop:
  for(i=0; i<n; ++i) {
    p = points[i]
    for(j=0; j<DIMENSION; ++j) {
      if(!(lo[j] <= p[j+1] && p[j+1] <= hi[j])) {
        continue i_loop
      }
    }
    if(cb(p[0])) {
      return true
    }
  }
  return false
}

function RangeTree1D(coords, indices) {
  this.coords = coords
  this.indices = indices
}

//Terminal tree is easy:  just binary search and iterate over interval
RangeTree1D.prototype.search = function(DIMENSION, lo, hi, cb) {
  var coords = this.coords
    , begin = lowerBound(coords, lo[0])
    , end = upperBound(coords, hi[0])
    , indices = this.indices
  if(begin <= end) {
    //Edge case
    if(begin < 0) {
      begin = 0
    }
    if(coords[begin] < lo[0]) {
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

RangeTree.prototype.search = function(DIMENSION, bounds_lo, bounds_hi, cb) {
  DIMENSION = (DIMENSION-1)|0
  var coords = this.coords
    , children = this.children
    , n = coords.length
    , lo = +bounds_lo[DIMENSION]
    , hi = +bounds_hi[DIMENSION]
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

      //Handle case where tree is completely contained
      if(lo <= coords[bfs.lo(n, v)] && coords[bfs.hi(n,v)] <= hi) {
        return children[v].search(DIMENSION, bounds_lo, bounds_hi, cb)
      }
      
      //Save split node
      vsplit = v
      
      //Visit left trees
      v = bfs.left(n, vsplit)
      while(v < n) {
        l = bfs.left(n, v)
        r = l + 1
        if(lo <= coords[bfs.lo(n, v)]) {
          if(children[v].search(DIMENSION, bounds_lo, bounds_hi, cb)) {
            return true
          }
          break
        }
        if(lo <= coords[v]) {
          if(r < n) {
            if(children[r].search(DIMENSION, bounds_lo, bounds_hi, cb)) {
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
          return children[v].search(DIMENSION, bounds_lo, bounds_hi, cb)
        }
        if(coords[v] <= hi) {
          if(l < n) {
            if(children[l].search(DIMENSION, bounds_lo, bounds_hi, cb)) {
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


function comparePoints(a, b) {
  var i, d
  for(i=a.length-1; i>0; --i) {
    d = a[i] - b[i]
    if(d) { return d }
  }
  return a[0] - b[0]
}

function makeTerminal(DIMENSION, begin, end) {
  DIMENSION   = DIMENSION|0
  begin       = begin|0
  end         = end|0
  var n       = (end - begin)|0
    , points  = new Array(n)
    , i, j, p
  for(i=0; i<n; ++i) {
    p = new Array(DIMENSION+1)
    for(j=0; j<=DIMENSION; ++j) {
      p[j] = BUFFER[j][i+begin]
    }
    points[i] = p
  }
  points.sort(comparePoints)
  return new TerminalNode(points)
}

function makeRangeTree(DIMENSION, begin, end) {
  DIMENSION   = DIMENSION|0
  begin       = begin|0
  end         = end|0
  if(DIMENSION === 1) {
    return new RangeTree1D(new Float64Array(BUFFER[1].buffer.slice(begin*8, end*8)), new Uint32Array(BUFFER[0].buffer.slice(begin*4, end*4)))
  }
  var n         = (end-begin)|0
    , coords    = new Float64Array(n)
    , indices   = new Uint32Array(n)
    , children  = new Array(n)
    , carray    = BUFFER[DIMENSION]
    , iarray    = BUFFER[0]
    , b2i       = TEMP[DIMENSION]
    , cutoff    = Math.pow(TREE_CUTOFF, DIMENSION)|0
    , i, j, k, lo, hi
  for(i=0, j=bfs.begin(n); i<n; ++i, j=bfs.next(n, j)) {
    k          = i + begin
    coords[j]  = carray[k]
    indices[j] = iarray[k]
    b2i[j]     = k
  }
  for(j=n-1; j>=0; --j) {
    lo = b2i[bfs.lo(n, j)]
    hi = b2i[bfs.hi(n, j)] + 1
    merge(DIMENSION-1, lo, b2i[j], hi)
    if(hi - lo < cutoff) {
      children[j] = makeTerminal(DIMENSION-1, lo, hi)
    } else {
      children[j] = makeRangeTree(DIMENSION-1, lo, hi)
    }
  }
  return new RangeTree(coords, indices, children)
}

function buildTree(points) {
  var n = points.length
  if(n === 0) {
    return noop
  }
  //Create decorated points array
  var d = points[0].length
    , dec_points = new Array(n)
    , i, j, p, q, dst
  
  for(i=0; i<n; ++i) {
    p = new Array(d+1)
    q = points[i]
    p[0] = i
    for(j=0; j<d; ++j) {
      p[j+1] = q[j]
    }
    dec_points[i] = p
  }
  
  dec_points.sort(function(a, b) { return a[d] - b[d] })
  
  //Unpack points into buffers
  for(i=0; i<=d; ++i) {
    if(BUFFER.length <= i) {
      BUFFER.push(new Float64Array(Math.max(1024, bits.nextPow2(n))))
      SCRATCH.push(new Float64Array(Math.max(1024, bits.nextPow2(n))))
      TEMP.push(new Uint32Array(SCRATCH[i].buffer))
    } else if(BUFFER[i].length < n) {
      if(i === 0) {
        BUFFER[i] = new Uint32Array(bits.nextPow2(n))
        SCRATCH[i] = new Uint32Array(bits.nextPow2(n))
      } else {
        BUFFER[i] = new Float64Array(bits.nextPow2(n))
        SCRATCH[i] = new Float64Array(bits.nextPow2(n))
      }
      TEMP[i] = new Uint32Array(SCRATCH[i].buffer)
    }
    dst = BUFFER[i]
    for(j=0; j<n; ++j) {
      dst[j] = dec_points[j][i]
    }
  }
  
  var tree = makeRangeTree(d, 0, n)
  return tree.search.bind(tree, d)
}
module.exports = buildTree
