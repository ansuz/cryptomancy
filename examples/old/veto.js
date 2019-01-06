var ansuz = require("ansuz");

var mancy = require("cryptomancy");
var source = mancy.source;
var s = mancy.shamir3pass;

var format = mancy.format;
var nacl = require("tweetnacl");

var bytes = source.bytes.secure;

var names = "Alice Bob Carol Dan Ed".split(" ");

var Token = function () {
    return Number(ansuz.die(1024 * 1024)).toString(32);
};

var DEBUG = true;

var debug = function () {
    if (!DEBUG) { return; }
    console.log.apply(console, Array.prototype.slice.call(arguments));
};

var SIZE = 512;

debug('generating a public prime');
var P = s.prime.sync(bytes, SIZE);

// generate keys...
var keys = {};
var tokens = {};
var values = {};
var commits = {};
var disagrees = {};

//debug('\n=== \\ ===\n');
names.forEach(function (name) {
    disagrees[name] = !(ansuz.die(15));
    //debug("%s disagrees: %s", name, disagrees[name]);
});

debug('\n=== / ===');
names.forEach(function (name) {
    tokens[name] = Token();
    debug("generating key for %s, who would %s", name, disagrees[name]?
        "like to veto the proposal": "like the proposal to pass");
    keys[name] = s.genkeys.sync(bytes, SIZE, P);
});

var iterate = function (f) {
    var i = 0, temp;
    while (!(temp = f(i++))) {}
};

// inclusive range 
iterate(function (n) {
    debug('\n=== %s ===', n);
    // five names, six passes
    if (n === 0) { // 0
        return names.forEach(function (name) {
            var plain = format.decodeUTF8(tokens[name]);
            // every user encrypts their token and adds it to the list
            values[name] = s.encrypt(plain, keys[name]);

            // commit to your token's value
            commits[name] = format.encode64(nacl.hash(plain));
            debug("%s encrypts their token [%s]", name, tokens[name]);
        });
    }

    if (n === names.length - 1) {
        // the last encryption key is the most deniable
        // if you want to veto, sabotage this round

        return names.forEach(function (name, i) {
            // every user encrypts the value of the user n steps to the left
            var target = names[(i + n) % names.length];
            //debug("%s encrypts the token belonging to %s", name, target);

            values[target] = disagrees[name]?
                s.decrypt(values[target], keys[name]):
                s.encrypt(values[target], keys[name]);

            debug("%s %s the token belonging to %s: [%s]", name,
                disagrees[name]? "trashes": "encrypts",
                target, format.encode64(values[target]));
        });
    }

    // 5
    if (n === names.length) {
        // every token is encrypted with every key
        return names.forEach(function (me) {
            debug("%s decrypts every message", me);
            // everybody decrypts everything
            names.forEach(function (them) {
                return (values[them] = s.decrypt(values[them], keys[me]));
            });
        });
    }

    // 6
    if (n > names.length) {
        var veto = names.some(function (name) {
            try {
                var hash = format.encode64(nacl.hash(values[name]));
                if (hash !== commits[name]) { return true; }
            } catch (e) { return true; }
        });
        if (veto) { console.log("The proposal was vetoed"); }
        else { console.log("The proposal passed"); }

        return true;
    }

    // 1, 2, 3, 4
    return names.forEach(function (name, i) {
        // every user encrypts the value of the user n steps to the left
        var target = names[(i + n) % names.length];
        values[target] = s.encrypt(values[target], keys[name]);
        debug("%s encrypts the token belonging to %s: [%s]", name, target, format.encode64(values[target]));
    });
});


