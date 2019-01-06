var nThen = require('nthen');
var mancy = require('..');

// anonymous voting
// anonymous veto
  // possibly a special case of voting with yes/no only
    // strike the vote at the final stage for the most anonymity
  // can also be done with a commit-reveal protocol
    // if the result does not match the commit then someone veto'd

// we want votes to be anonymous, but voters should be able to check that their vote was counted

// use commutative encryption on a vote and a unique token
// everyone generates their own keypair
// everybody encrypts their own vote
// everybody encrypts everyone else's vote
// now all votes are encrypted with every key
// everyone generates a second keypair
// in serial, everybody encrypts every vote, shuffling as they go
// once everyone has shuffled, you have perfect anonymity
// everyone decrypts with their first key, in serial
// everyone decrypts with their second key, in serial
// everyone checks whether their [token,vote] pair is present

