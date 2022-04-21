
_NOTE: in some contexts, the term "account", refers to an address that has (ever) had a balance (and therefore state on-chain). In this context, it is not necessary for an "account" to have a balance, for it to be imported, for example._

## Switching accounts

Clicking the account icon (**TODO: icon here**) in the top right corner of the dashboard will navigate to the account selection screen.

## Creating a new account

From the [account selection screen](#switching-accounts), click the "+ Add Account" button to open the add account page.
Click on the "Create new account" button.
The next page generates either a 12 or 24 word long mnemonic [seed](TODO: lnk me!). It has buttons to choose the length and a field for account name.
Click on the "Next" button.
The next page contains a button for each word from the mnemonic which was generated in the previous step.
The buttons must be clicked in the order matching the mnemonic to complete account creation.

## Importing an existing account

#### Mnemonic / Private Key

From the [account selection screen](#switching-accounts), click the "+ Add Account" button to open the add account page.
Click on the "Import existing account" button.
The next page will ask for the ["seed"](TODO: link me! - basics?), which can be in either the mnemonic (set of words) or private key (hexidecimal), and the desired account name.
It is preferable (and likely more convenient) to use the mnemonic when possible because [hierarchical deterministic keys/addresses](TODO: link me! - BIP44 / BIP5X?) cannot be derived from the private key format.

#### Hardware wallet

_NOTE: currently only [ledger](https://www.ledger.com/) hardware wallets are supported_

From the [account selection screen](#switching-accounts), click the "+ Add Account" button to open the add account page.
Click on the "Import ledger" button.
The next page will ask for the account name.
Click the "Next" button and follow the instructions in the popup to connect with the ledger.

## Removing

From the [account selection screen](#switching-accounts), click the ellipsis icon (three dots, "...") to open the context menu.
Click on "Delete Account".
On the next page, enter your wallet password, note the warning about backing up and take the opportunity to do so (or ensure a viable one exists) if you haven't already.
Click "Confirm" to remove the account from your wallet.

## Migrating from ETH

ERC20 FET staked prior to the transition to a cosmos-sdk based ledger was migrated (via genesis) to native network accounts which correspond to the private key used to stake on ethereum.
These migrated accounts are accessible by transforming the original ethereum keypair into a native fetch keypair and address.

Copy/paste the private key of the ethereum account which staked the ERC20 FET into the "private key" textarea.
Enter an account name.
Click "next".

