require("cryptomancy-source/test");
var assert = require('assert'),
    mancy = require('..'),
    source = mancy.source,
    methods = mancy.methods;

console.log("Testing API uniformity of methods and entropy sources");

['insecure', 'secure', 'deterministic']
.forEach(function (mode) {
    f = source[mode](5);
    assert.equal(typeof(f()), 'number');

    var generator = source.bytes[mode](5);
    assert.equal(generator(13).length, 13);

    // an n-sided die returns a positive integer which is strictly less than n
    var die = methods.die(f);
    assert(typeof(die(100)) === 'number');
    assert(die(100) >= 0);
    assert(die(5) < 5);
    assert(0 === die(23) % 1);

    // a coin returns boolean
    assert([true, false].indexOf(methods.coin(f)) !== -1);

    // floating_points are positive numbers
    var _float = methods.floating_point(f);
    assert(typeof(_float) === 'number');
    assert(_float >= 0);

    // perturb
    var A = [0,1,2,3,4,5,6,7,8];

    methods.perturb(die, A)
    A.forEach(function (n, i) {
        assert(n !== i);
    });

    // shuffle
});

