console.log("Testing determinacy of fair ordering");

var mancy = require("..");
var assert = require("assert");

var Sort = mancy.protocol.fair_sort;

var bytes = mancy.source.bytes.secure();

var ids = [1,2,3,4,5,6,7,8].map(function () {
    return mancy.format.encode64(bytes(32));
});

var checksum = function (ids) {
    var u8s = ids.map(function (id) {
        return mancy.format.decode64(id);
    });
    var sum = mancy.hash(mancy.util.concat(u8s));
    return mancy.format.encode64(sum);
};

var previous = checksum(Sort(ids));

var die = mancy.methods.die(mancy.source.secure());

var i = 1000;
var current;
while (i--) {
    ids = mancy.methods.perturb(die, ids);
    current = checksum(Sort(ids));
    assert(current === previous);
    previous = current;
}

