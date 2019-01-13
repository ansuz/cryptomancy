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
* cryptomancy-accumulator
  * my toy implementation of an RSA accumulator using a bignum library, similarly with little regard for your safety

## Namespace

Cryptomancy exports a variety of compatible modules which follow the `cryptomancy-*` naming scheme.

* [cryptomancy-format](https://github.com/ansuz/cryptomancy-format)
* [cryptomancy-methods](https://github.com/ansuz/cryptomancy-methods)
* [cryptomancy-source](https://github.com/ansuz/cryptomancy-source)
* [cryptomancy-nonce](https://github.com/ansuz/cryptomancy-nonce)
* [cryptomancy-prime](https://github.com/ansuz/cryptomancy-prime)
* [cryptomancy-secret](https://github.com/ansuz/cryptomancy-secret)
* [cryptomancy-util](https://github.com/ansuz/cryptomancy-util)
* [cryptomancy-accumulator](https://github.com/ansuz/cryptomancy-accumulator)

## Learning more

Nothing is very well documented, and unfortunately the best way to learn more is to read the code, or ask the author.

