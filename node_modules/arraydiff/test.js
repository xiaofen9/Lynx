var expect = require('expect.js');
var arrayDiff = require('./index');
var InsertDiff = arrayDiff.InsertDiff;
var RemoveDiff = arrayDiff.RemoveDiff;
var MoveDiff = arrayDiff.MoveDiff;

function insert(array, index, values) {
  array.splice.apply(array, [index, 0].concat(values));
}

function remove(array, index, howMany) {
  return array.splice(index, howMany);
}

function move(array, from, to, howMany) {
  var values = remove(array, from, howMany);
  insert(array, to, values);
}

function applyDiff(before, diff) {
  var out = before.slice();
  for (var i = 0; i < diff.length; i++) {
    var item = diff[i];
    // console.log 'applying:', out, item
    if (item instanceof InsertDiff) {
      insert(out, item.index, item.values);
    } else if (item instanceof RemoveDiff) {
      remove(out, item.index, item.howMany);
    } else if (item instanceof MoveDiff) {
      move(out, item.from, item.to, item.howMany);
    }
  }
  return out;
}

function randomWhole(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randomArray(maxLength, maxValues) {
  if (maxLength == null) maxLength = 20;
  if (maxValues == null) maxValues = maxLength;
  var results = [];
  for (var i = randomWhole(maxLength); i--;) {
    results.push(randomWhole(maxValues));
  }
  return results;
}

function testDiff(before, after, equalFn) {
  // console.log()
  // console.log 'before =', before
  // console.log 'after =', after
  var diff = arrayDiff(before, after, equalFn);
  var expected = applyDiff(before, diff);
  expect(expected).to.eql(after);
}

describe('arrayDiff', function() {

  it('diffs empty arrays', function() {
    testDiff([], []);
    testDiff([], [0, 1, 2]);
    testDiff([0, 1, 2], []);
  });

  it('supports custom equality comparisons', function() {
    var before = [{id: 1}, {id: 2}];
    var after = [{id: 1}];
    testDiff(before, after, function(a, b) {
      return a.id === b.id;
    });
  });

  it('diffs randomly rearranged arrays of numbers', function() {
    function randomSort() {
      return Math.random() - 0.5;
    }
    for (var i = 1000; i--;) {
      // before = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]
      var before = randomArray(50);
      var after = before.slice().sort(randomSort);
      testDiff(before, after);
    }
  });

  it('diffs random arrays of numbers', function() {
    for (var i = 1000; i--;) {
      var before = randomArray(50, 20);
      var after = randomArray(50, 20);
      testDiff(before, after);
    }
  });

});
