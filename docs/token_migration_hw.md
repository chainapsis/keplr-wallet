# Token Migration Guide for Hardware Wallets

This guide is for anyone with a hardware wallet (HW) who participated in the fetch.ai staking program, and who missed the deadline for withdrawing funds from the contract. 

**Your funds are safe, and you have several alternatives for accessing your tokens**. This applies to all tokens whether they were locked, unbonding or unbonded. This can be a stressful situation, but there are several simple and safe ways for you to access your funds, and we’ll be explaining them in this blog-post.

The fastest and simplest approaches use Metamask or another software wallet to reconstruct your private key from your HW wallet’s 24- or 12-word passphrase. The risk of this approach is that it will involve temporarily compromising the security of your HW wallet, but this is temporary and will enable you to move funds to a secure wallet later.

Before starting this process, we recommend that you:

- Move all other assets held in the HW wallet to a different safe address.
- Make sure that your computer (where you have metamask or other wallet installed) has an up-to-date OS and antivirus software.

## Key Migration (Desktop)

**Step 1**: User needs to open a private browser window.

**Step 2**: Use the 24 word ledger recovery phrase (mnemonic) which you have used to initialise your HW (hardware wallet) — that very phrase needs to be used when initialising a new Metamask account via import using Secret Recovery Phrase (which appears as blue link below UNLOCK button on metamask Lock Screen)

**Step 3**: Once this is done, connect your newly created metamask account’s private key (via importing ledger recovery phrase) to our fetch native wallet.

From this point you can follow the standard instructions [here](https://docs.fetch.ai/fetch-wallet/migrate_erc20/).

After completing the migration you should create a new mnemonic on your HW wallet and transfer the funds there from the newly-created software wallet. You're then set-up and free to stake tokens or benefit from the low transaction fees on mainnet with the security of your HW wallet.

## Key Migration (Mobile)

Another alternative is to use the Cosmostation app. This method will also work for users who generated accounts using other wallets such as MyEtherWallet or the legacy Ledger nano application. Once you have installed the Cosmostation app, you should select the "import mnemonic" option, and you will then be prompted to input either a 12- or 24- word passphrase.

After inputting the phrase you’ll be presented with the following options for creating your key:

- Common (44’/118’/0’/0/X)
- Non Ledger (44’/60’/0’/0/X)
- Ledger Live (44’/60’/X’/0/0)
- Ledger Legacy (44’/60’/0’/X)

Ledger Nano users should choose either the "Ledger live" or "Ledger legacy" options. After completing this step successfully you should see that your Cosmostation wallet holds funds on mainnet. We recommend transferring funds to the Fetch.ai browser extension wallet and accessing them with a hardware wallet for greater security.

## Reconciliation

A final alternative will be to use the Fetch.ai [reconciliation tool](https://docs.fetch.ai/native_and_erc20/reconciliation/?h=recon), which allows users of hardware wallets to specify a new address on mainnet for receiving their migrated tokens. This involves using the user’s Ethereum wallet to designate a new address on mainnet for receiving migrated tokens.
