---
title: Introduction
description: Keplr is a non-custodial blockchain wallets for webpages that allow users to interact with blockchain applications.
aside: true
---

# Keplr wallet Documentation

## Introduction

Keplr is a non-custodial blockchain wallets for webpages that allow users to interact with blockchain applications.

## Why Keplr?

- Private keys are stored locally. This removes the friction and risk of webpages having to manage user private keys safely and securely.
- As the user's private key is not managed by the website, users do not have to worry about the level of security of the website. The user only has to trust the security guarantees of Keplr, and freely interact with various web applications as they wish (and verify the contents of the transaction).
- Keplr can easily connect to libraries such as CosmJS, simplifying the process of connecting webpages to blockchains.

## Sections
[Integrate with Keplr](./02-basic-api.md) describes how to integrate with Keplr in the webpage.  

[Use with cosmjs](./03-cosmjs.md) describes how to use cosmjs with Keplr.

[Use with secretjs](./04-secretjs.md) describes how to use secretjs with Keplr if you need to use the secret-wasm feature.
  
[Suggest chain](./05-suggest-chain.md) describes how to suggest the chain to Keplr if the chain is not supported natively in Keplr.

[EVM-based chains support](./06-evm.md) describes how to support EVM-based chains with Keplr.

[Starknet Support](./07-starknet.md) describes how to support Starknet chains with Keplr.
