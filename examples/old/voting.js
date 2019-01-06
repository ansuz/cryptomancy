var mancy = require("cryptomancy");

var s = mancy.shamir3pass;

var nThen = require("nthen");
var ansuz = require("ansuz");

var Format = mancy.format;
//var Format = require("../src/format");
//var zk = require("..");

var keys = {};
var votes = {};
var names = ("ABCDEFGHIJKLM"
//+ "NOPQRSTUVWXYZ"
).split("");

var anon_keys = {};

var panic = function (e) {
    console.error(e);
    //process.exit(1);
};


var SHARED_KEY_BITS = 512;
var PERSONAL_KEY_BITS = SHARED_KEY_BITS;
var prime;

var Source = mancy.source;

var bigIntToBase64 = function (big) {
    return Format.encode64(Format.decodeBigInt(big));
};

nThen(function (w) {
    // generate a shared prime
    console.log("generating a public prime");

    s.prime(Source.bytes.secure, 1024, w(function (e, p) {
        console.log("Done: %s\n", bigIntToBase64(p));
        if (e) { panic(e); }
        prime = p;
    }));
}).nThen(function (w) {
    // generate 13 keys in parallel
    console.log("generating personal keys");
    names.forEach(function (id) {
        s.genkeys(Source.bytes.secure, PERSONAL_KEY_BITS, prime, w(function (e, key) {
            console.log("generated principle key for %s", id);
            if (e) { panic(e); }
            keys[id] = key;
        }));
    });
}).nThen(function () {
    console.log();

    // everybody chooses who they would like to elect
    // and encrypts their vote
    names.forEach(function (id) {
        var choice = [
            ansuz.choose(names),
            Number(ansuz.die(1024 * 1024)).toString(32)
        ].join('|');
        //console.log(choice);
        var plain = Format.decodeUTF8(choice);
        // s.UTF8ToBigInt(choice);
        votes[id] = s.encrypt(plain, keys[id]);
        console.log("%s casts vote: %s\n[%s]",
            id,
            choice,
            Format.encode64(votes[id]));
    });

    console.log("\neach citizen encrypts every other citizen's vote\n");
    // encrypt everybody else's votes too
    names.forEach(function (my_id) {
        names.forEach(function (their_id) {
            if (my_id === their_id) { return; }
            votes[their_id] = s.encrypt(votes[their_id], keys[my_id]);
        });
    });

    // now everybody's vote is encrypted with every key
}).nThen(function (w) {
    // now everybody generates a second key...
    names.forEach(function (id) {
        s.genkeys(Source.bytes.secure, PERSONAL_KEY_BITS, prime, w(function (e, key) {
            console.log("generated secondary key for %s", id);
            if (e) { panic(e); }
            anon_keys[id] = key;
        }));
    });
}).nThen(function () {
    console.log();
    // now that everybody has a second key...

    // put all the votes in a list
    var list = Object.keys(votes).map(function (k) {
        return votes[k];
    });

    // everybody takes turns encrypting every vote with their second key
    // and shuffling the list...
    names.forEach(function (id) {
        console.log("%s encrypts every vote with their secondary key, and reorders the list", id);
        list.forEach(function (value, index) {
            list[index] = s.encrypt(value, anon_keys[id]);
        });
        ansuz.shuffle(list);
    });

    console.log();
    // and now, everybody has had a chance to shuffle the votes
    // nobody knows their original order, or has to trust that anyone else tampered
    // now it's safe to decrypt all the votes with all the keys

    names.forEach(function (id) {
        console.log("%s decrypts every vote with both their keys", id);
        list.forEach(function (value, index) {
            // remove your original key
            list[index] = s.decrypt(value, keys[id]);
        });
        list.forEach(function (value, index) {
            list[index] = s.decrypt(value, anon_keys[id]);
        });
    });

    console.log();
    list.forEach(function (value, index) {
        var original = Format.encodeUTF8(value);
        console.log("counted vote: [%s]", original);
        var vote = original.split('|')[0];
        list[index] = vote;
    });

    // let's see who won...
    var tally = {};

    list.forEach(function (value) {
        tally[value] = (tally[value] || 0) + 1;
    });

    console.log();
    Object.keys(tally).sort(function (a, b) {
        return tally[b] - tally[a];
    }).forEach(function (k) {
        console.log('%s: %s votes', k, tally[k]);
    });
});

