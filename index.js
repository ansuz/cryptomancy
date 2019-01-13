var Cryptomancy = mancy = module.exports;

var Util = Cryptomancy.util = require("cryptomancy-util");
Cryptomancy.source = require("cryptomancy-source");
Cryptomancy.methods = require("cryptomancy-methods");
var Format = Cryptomancy.format = require("cryptomancy-format");
Cryptomancy.prime = require("cryptomancy-prime");
Cryptomancy.shamir3pass = require("shamir3pass");
Cryptomancy.nonce = require("cryptomancy-nonce");
Cryptomancy.accumulator = require("cryptomancy-accumulator");
var Secret = require("cryptomancy-secret");

var nacl = require("tweetnacl");
var Hash = Cryptomancy.hash = nacl.hash;

Cryptomancy.commit = function (nonce, value) {
    return nacl.hash(Cryptomancy.util.concat([Cryptomancy.format.decodeUTF8(JSON.stringify(value)), nonce]));
};

Cryptomancy.commit.reveal = function (nonce, value, commit) {
    return Cryptomancy.format.encode64(commit) === Cryptomancy.format.encode64(Cryptomancy.commit(nonce, value));
};

var keys = Cryptomancy.keys = {};

keys.signing = function (seed) {
    // TODO check that the seed is valid
    // according to length
    // according to type
    return nacl.sign.keyPair.fromSeed(seed);
};

keys.symmetric = function (seed) {
    // TODO check that the seed is valid
    // according to type
    // according to length (nacl.secretbox.keyLength)
    // FIXME return a nice function that does everything you want.
    // OR an object with encrypt/decrypt
    //return nacl.secretbox
};

var protocol = Cryptomancy.protocol = {};


/*

IDENTIFICATION

An interactive protocol through which an actor declares their identity in a verifiable way

1. an actor joins an insecure channel and declares their identity
  * [public_signing_key, sign([preferred_pet_name || ANON, public_encryption_key])]
2. any actor may challenge another at any time to prove that they hold the keys they have claimed to hold, by:
  * publishing `concat([challenged_public_signing_key, encrypt([TOKEN, challenger_public_encryption_key])])`
3. the challenged user:
  * decrypts the encrypted challenge, discovering the token which was revealed only to them
  * signs the token and a salt with their public key
  * encrypts the signature and content for the challenger's public key
4. the challenged user reveals the encrypted signature in public
5. upon receiving the proof, the challenger signs a message asserting that the credentials they challenged are valid
6. users who trust the challenger can assume that the user is who they claim to be
  * in the event that they need to work with the challenged user, they can always issue their own challenge

*/

/*

SIZE-DETERMINANT CLIQUE FORMATION

An interactive protocol through which members of a larger group voluntarily organize into a smaller group for the purpose of some activity

We define several terms

* SUPERSET: the group of all possible participants amongst whom global reachability is not necessarily possible
* BROADCAST: an action through which a participant delivers a message to the SUPERSET

1. any participant may BROADCAST that they would like to form a clique
  * for a particular purpose
  * of a particular size
  * with a random identifier
2. any other participant may BROADCAST that they are interested in joining that clique
3. any participant may propose a group using their knowledge of the interested participants
  * ids of participants are given a deterministic orderinig, and the proposed clique is identified by the hash of that ordering
4. any participant included in a group may:
  * publically endorse that proposal by signing its hash
  * reject the proposal, optionally providing a list of participants whom they like to exclude from future cliques
    * privately to avoid hurt feelings
    * publicly to facilitate faster clique-forming
  * reject a proposal on the basis that they are no longer available
5. once all members of a proposed clique have endorsed its formation, the clique may proceed

PROBLEM: race conditions between forming a quorum and member dropout
SOLUTION: blockchain for consensus? fuck

*/

/*
FAIR ORDER

An interactive protocol through which equal participants fairly order themselves

0. a finite group of participants is chosen and agreed upon by all participants (forming a clique, or quorum)
  * the clique agrees upon a set of parameters (cypher algorithm, key length, salt length, hash function, sorting function)
1. each participant generates a symmetric keypair
2. each participant hashes their own public key with a salt, and reveals the output (their commit)
3. once all participants have revealed their commit, all participants can reveal its input (their public key and salt)
4. once all inputs have been revealed, a deterministic sorting function is executed by all participants
  * the algorithm is considered correct if:
    * for any set of inputs in any order, there is only one possible output
    * no one participant can predict or influence their ordering without colluding with all other participants
5. optionally, every participant may reveal their ordering to confirm that nobody is cheating (or that there is nothing wrong with the sorting function)
  * a hash of the concatenated public keys can be exchanged as a checksum to confirm that everybody arrived at the same result
  * any participant who does not arrive at the same result can be considered malicious or inept
    * checksums can be revealed with an additional commit-reveal protocol
    * participants may track reputations of identities who have demonstrated themselves to be reliable

*/


/*  given a list of base64 encoded ids
    produce a deterministic ordering

    hash(id, sorted_id_list)
    lowest hash wins */
protocol.fair_sort = function (orig_id64_list) {
    var map = {}; // keep a map of Uint8Arrays by base64 keys

    // make a copy of the supplied inputs to avoid mutation
    var id64_list = Util.slice(orig_id64_list);

    // assign values to the map and also produce a list of Uint8 Arrays
    idU8_list = id64_list.map(function (id64) {
        return (map[id64] = Format.decode64(id64));
    });

    // take the xor sum of all the Uint8Arrays
    // this value is universally unpredictable with even one honest node
    var xor_sum = mancy.util.reduce(idU8_list, function (A, B) {
        // xor every element of A and B together, and return B
        if (!A || !B) { throw new Error("Expected inputs"); }
        if (A.length !== B.length) { throw new Error("Expected inputs to have equal length"); }

        return new Uint8Array(mancy.util.map(A, function (a, i) {
            return mancy.util.xor(a, B[i]);
        }));
    });

    // hash the concatenation of each user's id with the xor sum
    var hashes = {};
    id64_list.forEach(function (id) {
        // [your_id].concat(sorted_list)
        var this_id = map[id];
        hashes[id] = Hash(Util.concat([this_id].concat(xor_sum)));
    });

    // sort according to lowest hash
    return id64_list.sort(function (id_a, id_b) {
        return Util.lower_hash(hashes[id_a], hashes[id_b]);
    });
};

/*  TODO fair random number
    alice picks a random number, hashes it, and sends the hash
    bob picks a random number, signs it, and sends it to alice
    alice xors their numbers together and reveals the result
    bob can reconstruct the original by xoring against his number
    hashing the result, and checking against alice's commitment
*/

