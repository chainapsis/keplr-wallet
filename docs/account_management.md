## Welcome Page

You can [create a new account](#creating-a-new-account), [import an existing account](#importing-an-existing-account), [connect your hardware wallet](#using-a-hardware-wallet), or [recover migrated Ethereum accounts](./migrate_erc20.md) from the **welcome page**. To get there: 

### First time Use

The first time you open the wallet, you will be presented with the welcome page. 

### Not the First Time

1. Ensure you are logged into the wallet.
2. Click the account icon ![Account icon](../images/account.png) in the top right corner of the dashboard, then **+ Add Account**.

!!! info
    In some contexts, the term **account** refers to an address that has, at some point in time, had a balance (and therefore a state on the ledger). In this context, it is not necessary for an account to have a balance, for example for it to be [imported](#importing-an-existing-account).

## Creating a new account

Using the wallet, you can create a new account and address on the Fetch ledger:

1. On the [welcome page](#welcome-page), click **Create new account**.
2. Choose a 12 or 24 word long mnemonic seed and securely back it up.

    !!! warning
        **KEEP IT SAFE!** Anyone with your mnemonic seed can access your wallet and take your assets.
    !!! danger
        **DON'T LOSE IT!** Lost mnemonic seed cannot be recovered! If you lose your mnemonic seed you will lose access to your wallet.

3. Give your account a name and set a password if one is not set (i.e. if it is the first time you open the wallet, or in case you have removed all of your accounts). The password will be used the next time you want to use the wallet or make important changes to your account. Hit **Next**.
4. Rearrange the mnemonic phrases by clicking on them in the correct order to confirm your mnemonic seed. Then click **Register**.

## Existing account

#### Importing an existing account

If you have an account on the Fetch network, for example having had one already on the Fetch wallet and want to access it again, have an account on another wallet (e.g. Cosmostation, Keplr, ...) and wish to bring it to the Fetch wallet, or having created an address using one of our tools (e.g. the [AEA framework](https://docs.fetch.ai/aea)), you can import it into the Fetch wallet:

1. On the [welcome page](#welcome-page), click **Import existing account**.
2. Enter your mnemonic seed (set of words) or private key (hexidecimal).

    !!! warning
        **KEEP IT SAFE!** Anyone with your mnemonic seed or private key can access your wallet and take your assets.

    !!! tip
        It is preferable, and likely more convenient, to use the mnemonic when possible because [hierarchical deterministic keys/addresses](TODO: link me! - BIP44 / BIP5X?) cannot be derived from the private key format.

3. Give your account a name and set a password if one is not set (i.e. if it is the first time you open the wallet, or in case you have removed all of your accounts). The password will be used the next time you want to use the wallet or make important changes to your account. Hit **Next**.

#### Using a Hardware Wallet

If you have a [Ledger](https://www.ledger.com/) hardware wallet and wish to keep your key and mnemonics on that device while using the Fetch wallet:

!!! info
    Currently only [ledger](https://www.ledger.com/) hardware wallets are supported.

1. On the [welcome page](#welcome-page), click **Import ledger**.
2. Give your account a name and set a password if one is not set (i.e. if it is the first time you open the wallet, or in case you have removed all of your accounts). The password will be used the next time you want to use the wallet or make important changes to your account. Hit **Next**.
3. Follow the instructions on the popup to connect your device.

!!! warning
    Please ensure you keep your mnemonic seed somewhere safe where others cannot access it. If you lose it, your wallet will be inaccessible once you log out. The password for your account should also be kept safe but is not necessary for recovery if you have your mnemonic seed.

!!! info
    If you lose your password, you need to uninstall and re-install the Fetch wallet and select `Import existing account`. Then use the mnemonic seed for your account and choose a new password.


## Switching accounts

If you have multiple accounts set up on the Fetch wallet, to switch between them: 

1. Ensure you are logged into the wallet. 
2. Click the account icon ![Account icon](../images/account.png) in the top right corner of the dashboard. 
3. Select the account you want to switch to.

## Removing an Account

To remove an account from your Fetch wallet:

1. Ensure you are logged into the wallet.
2. Click the account icon ![Account icon](../images/account.png) in the top right corner of the dashboard.
3. Hit <b style="vertical-align: text-bottom;font-weight: 900;">...</b> (the three dots icon) for the account you want to remove and choose **Delete Account**. 
4. Enter your wallet password.

    !!! warning
        If you have not yet backed up your mnemonic seed, click on **Back-up account** and enter you password to view it.<br />
        Then back it up safely. If you lose your mnemonic seed you will lose access to your account.

5. Click **Confirm** to remove the account from your wallet.
