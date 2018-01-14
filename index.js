var Cryptomancy = module.exports;

Cryptomancy.util = require("cryptomancy-util");
Cryptomancy.source = require("cryptomancy-source");
Cryptomancy.methods = require("cryptomancy-methods");
Cryptomancy.format = require("cryptomancy-format");
Cryptomancy.prime = require("cryptomancy-prime");
Cryptomancy.shamir3pass = require("shamir3pass");
Cryptomancy.nonce = require("cryptomancy-nonce");

var nacl = require("tweetnacl");
Cryptomancy.hash = nacl.hash;

Cryptomancy.commit = function (nonce, value) {
    return nacl.hash(Cryptomancy.util.concat([Cryptomancy.format.decodeUTF8(JSON.stringify(value)), nonce]));
};

Cryptomancy.commit.reveal = function (nonce, value, commit) {
    return Cryptomancy.format.encode64(commit) === Cryptomancy.format.encode64(Cryptomancy.commit(nonce, value));
};

