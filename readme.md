# Cryptomancy

## **WARNING** ##

The cryptography implemented in this library is strictly for **PLAY**.

**DO NOT** depend on this code to ensure your safety or general well-being.

---

## Intent

Cryptomancy bundles a variety of freely composeable components with applications in secure p2p gaming.

It provides:

* various flavours of entropy
* generic functions compatible with pluggable entropy sources
* utilities for various formats useful when working with cryptography
* prime number generation
* a variety of cyphers with varying properties

## Cryptography

Cryptomancy depends on a few other cryptographic libraries of varying quality.

* tweetnacl
  * for hashes, authenticated symmetric and assymmetric public key cyphers and signing.
* scryptjs-async
  * a nice password-based key derivation function
* secrets.js-grempe
  * an implementation of shamir's secret sharing for key escrow
* shamir3pass
  * my own toy implementation of the non-authenticated commutative SRA cypher, using a bignum library and with little regard for your safety

## Namespace

Cryptomancy exports a variety of compatible modules which follow the `cryptomancy-*` naming scheme.

* [cryptomancy-format](#)
* [cryptomancy-methods](#)
* [cryptomancy-source](#)
* [cryptomancy-nonce](#)
* [cryptomancy-prime](#)
* [cryptomancy-secret](#)
* [cryptomancy-util](#)
* [cryptomancy-](#)
* [cryptomancy-](#)

## Learning more

Nothing is very well documented, and unfortunately the best way to learn more is to read the code, or ask the author.


