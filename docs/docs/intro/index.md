# Keplr Wallet Documentation

## Introduction

Keplr is a fast, simple, and secure wallet built from day one with a multi-chain future in mind. Unlike wallets designed around a single ecosystem, Keplr was architected to scale across heterogeneous blockchain environments.

From Cosmos SDK chains to EVM-based networks, Bitcoin, and Starknet, Keplr offers a unified interface and integration model. This makes it easier for both dApp developers and chain builders to reach users across ecosystems without having to manage multiple wallet integrations.


## Why Keplr?

#### Local Key Management
Keplr stores all private keys locally on the user’s device. dApps have no direct access to these keys, and all signing operations must be explicitly approved through the Keplr interface, ensuring users retain full control over their accounts.

#### Developer Convenience
Keplr simplifies blockchain integration for developers by offering seamless compatibility with libraries like CosmJS. This eliminates complex connection processes, making it easier for developers to link web applications to blockchains and focus on creating user-centric experiences.

#### Multi-Ecosystem Support
Keplr supports Cosmos SDK chains, EVM networks, Bitcoin, and Starknet, with more ecosystems on the way. It’s built to be a future-proof solution for projects looking to reach users across multiple blockchain environments.

#### Cross-Platform UX
Keplr is available as both a [browser extension and a mobile app](https://www.keplr.app/get), providing users with a secure and seamless experience when accessing their wallets and dApps, whether at a desk or on the go.


## Sections
[Connect to Keplr](/api/getting-started/connect-to-keplr) describes how to integrate Keplr into your web app.  

[Use with cosmjs](/api/use-with/cosmjs) describes how to use Keplr with CosmJS to build applications on Cosmos SDK-based chains.

[Use with secretjs](/api/use-with/secretjs) describes how to interact with Secret Network using Keplr and secret-wasm features.
  
[Suggest chain](/api/guide/suggest-chain) describes how to add support for custom or non-native chains to Keplr.

[EVM-based chains support](/api/multi-ecosystem-support/evm) describes how to enable support for EVM-based chains with Keplr.

[Starknet Support](/api/multi-ecosystem-support/starknet) describes how to enable support for Starknet chains with Keplr.
