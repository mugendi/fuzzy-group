//only uniq
const crypto = require("crypto"),
  _each = require("lodash/each"),
  _uniq = require("lodash/uniq"),
  _lCase = require("lodash/lowerCase"),
  _map = require("lodash/map"),
  _countBy = require("lodash/countBy"),
  _orderBy = require("lodash/orderBy"),
  _filter = require("lodash/filter"),
  _groupBy = require("lodash/groupBy"),
  _first = require("lodash/first"),
  _flatten = require("lodash/first"),
  _compact = require("lodash/compact"),
  _intersection = require("lodash/intersection"),
  _difference = require('lodash/difference');


function fuzzyGroup(list, opts) {
  var g = {},
    l,
    w,
    r,
    m,
    intersection,
    threshold;

  var threshold = 0.5;
  var tList = {};

  _each(list, a => {
    var k = u_words(a).join(" ");
    //console.log(k)
    tList[k] = tList[k] || [];
    tList[k].push(a);
  });

  //   console.log(tList);

  //loop through list
  var tListKeys = Object.keys(tList);
  _each(tList, (cc, a) => {
    //g[a] = []
    //get words
    w = u_words(a);
    //get length
    l = w.length;
    //create object
    g[a] = {
      l,
      a,
      res: []
    };

    //fuzzy search and add matches
    w.map(n => {
      m = fuzzyFilter(n, tListKeys);
      g[a].res = g[a].res.concat(m);
    });

    g[a].res = _map(_countBy(g[a].res, _lCase), (c, s) => {
      return {
        count: c,
        string: s,
        similarity: c / l
      };
    });

    //console.log(g)
    //only keep similar
    g[a].res = _filter(g[a].res, o => o.similarity > threshold);
  });
  //console.log(g)

  //order by length
  g = _orderBy(g, "l");

  //add fuzzy key
  g = _map(g, o => {
    o.key = crypto
      .createHash("md5")
      .update(_map(o.res, "string").join("-"))
      .digest("hex");
    return o;
  });

  //group by key
  g = _groupBy(g, "key");

  //pick out array and group
  g = _map(g, (o, k) => {
    //console.log(o)
    return {
      group: _first(o).a,
      key: k,
      list: {
        unique: _uniq(_map(_flatten(_map(o, "res")), "string"))
      }
    };
  });

  //console.log(g)
  //collapse groups
  var war = [];
  _each(g, (a, i) => {
    if (a) {
      //a.matches = a.matches || a.values.length

      _each(g, (b, j) => {
        //ue other threshold s
        if (b) {
          intersection = _intersection(b.list.unique, a.list.unique);
          similarity = intersection.length / b.list.unique.length ;
        
          if (i < j && similarity > threshold) {
            //delete collapsed group
            delete g[j];
          }
        }
      });

      // count matches
      a.list.matches = a.list.unique.reduce((a, b) => {
        return a.concat(tList[b]);
      }, []);

      a.total = {
        unique: a.list.unique.length,
        matches: a.list.matches.length
      };
    }
  });

  return _compact(g);
}

function u_words(s) {
  return _uniq(
    _lCase(s)
      .replace(/[^a-z0-9\s\-']/gi, "")
      .split(/\s+/)
  );
}


function fuzzyFilter(n, list){
  var pat = new RegExp(`\\b${n}\\b`, 'i');
  return list.filter(s=> {
    // console.log(s, pat, pat.test(s));
    return pat.test(s)
  })
}

module.exports = fuzzyGroup;
