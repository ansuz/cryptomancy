var nThen = require('nthen');
var mancy = require('..');

var sort = mancy.protocol.fair_sort;
var assert = require('assert');


var data = {
    keys: {},
    keys_64: {},
    salts: {},
    commits: {},
    results: {},
    checksums: {},
    playersByKey: {},
};

var SALT_LENGTH = 32;
var KEY_LENGTH = 32;
var PLAYERS = [1, 2, 3, 4, 5, 6, 7, 8];
var byteSource = mancy.source.bytes.secure();

var each = function (f) {
    PLAYERS.forEach(function (i) {
        f(i);
    });
};

nThen(function (w) { // INIT
    // everybody generates a salt and public key
    each(function (id) {
        // salt
        data.salts[id] = byteSource(SALT_LENGTH);
        data.keys[id] = byteSource(KEY_LENGTH);
        data.keys_64[id] = mancy.format.encode64(data.keys[id]);
        data.playersByKey[data.keys_64[id]] = id;
    });
}).nThen(function (w) { // COMMIT
    // everybody hashes their public key with a salt, and reveals the hash
    each(function (id) {
        data.commits[id] = mancy.commit(data.salts[id], data.keys[id]);
    });
}).nThen(function (w) { // REVEAL
    // once everyone has received everyone else's commit
    // everyone reveals their public key and salt

    // NOTE: this happens implicitly because it's all in memory

}).nThen(function (w) { // CONFIRM
    // once everyone has revealed their public key and seen everyone else's...
    // 1. check that the revealed public key and salt hash to the committed hash
    // 2. compute the turn ordering
    each(function (myId) {
        each(function (theirId) {
            if (myId === theirId) { return; }
            var theirs = mancy.format.encode64(data.commits[theirId]);
            var mine = mancy.format.encode64(mancy.commit(data.salts[theirId], data.keys[theirId]));
            //console.log(theirs);
            //console.log(mine);
            assert(theirs === mine);
        });
        var unsorted = PLAYERS.map(function (id) { return data.keys_64[id]; });
        var sorted = data.results[myId] = sort(unsorted);
        //console.log(sorted);
        data.checksums[myId] = mancy.format.encode64(mancy.hash(mancy.util.concat(sorted.map(function (id) {
            return mancy.format.decode64(id);
        }))));
    });
}).nThen(function (w) { // CHECKSUM
    // once everyone has computed a checksum for the turn ordering
    // check that everyone's checksum matches
    PLAYERS.reduce(function (a, b) {
        assert(data.checksums[a] === data.checksums[b]);
        return b;
    });

    data.results[1].forEach(function (key) {
        var id = data.playersByKey[key];
        console.log('%s: [%s]', id, key);
    });
});

