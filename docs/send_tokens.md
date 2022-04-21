(how to use medium article)

## Native network transfer

From the dashboard, click on the "Send".
Enter the recipient address.
Select the type of token to send.
Enter an amount to send.
Click the "Send" button.
Click the "Approve" button.

## IBC transfer

_NOTE: In order to send IBC transactions, the "Show Advanced IBC Transfers" setting must be toggled on.
To navigate to the settings page from the dashboard, click on the hamburger menu (top-left).
Then click on "Settings"._

Ensure that the desired origin network is selected on the dashboard (top-center).
If the origin network supports IBC, an "IBC Transfer" section will be visible towards the bottom of the dashboard.
Click the "Transfer" button in the "IBC Transfer" section.

Enter the recipient's address.
Select the type of token to send.
Enter the amount to send.
Click "send".

#### First-time origin/destination transfer

Before transferring between any given origin and destination combination for the first time, IBC channels must be configured in the wallet.

_ NOTE: Future versions of the wallat may simplify or remove this configuration altogether for known "official" channels.
See [Fetch Network -> IBC](TODO: link me!) documentation for more details on the current channels we officially support._

Click the "Select Chain" drop-down.
Click "+ New IBC Transfer Channel".
Select the **destination** chain and enter the **source** channel ID (e.g. "channel-100").
Click "Save".

