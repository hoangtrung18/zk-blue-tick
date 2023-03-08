# Zk Blue Tick NEAR Contract

<br />

# Quickstart

1. Make sure you have installed [node.js](https://nodejs.org/en/download/package-manager/) >= 16.
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />

## 1. Build and Deploy the Contract
You can automatically compile and deploy the contract in the NEAR testnet by running:

```bash
npm run deploy
```

Once finished, check the `neardev/dev-account` file to find the address in which the contract was deployed:

```bash
cat ./neardev/dev-account
# e.g. dev-1659899566943-21539992274727
```

<br />

## 2. Retrieve the Greeting

`get_greeting` is a read-only method (aka `view` method).

`View` methods can be called for **free** by anyone, even people **without a NEAR account**!

```bash
# Use near-cli to get the greeting
near view <dev-account> get_greeting
```

<br />

## 3. Store a New Greeting
`set_greeting` changes the contract's state, for which it is a `call` method.

`Call` methods can only be invoked using a NEAR account, since the account needs to pay GAS for the transaction.

```bash
# Use near-cli to set a new greeting
near call <dev-account> set_greeting '{"greeting":"howdy"}' --accountId <dev-account>
```

**Tip:** If you would like to call `set_greeting` using your own account, first login into NEAR using:

```bash
# Use near-cli to login your NEAR account
near login
```

and then use the logged account to sign the transaction: `--accountId <your-account>`.


```bash
# Init:
near call zk-blue-tick.YOUR-NAME.testnet init '{"owner_id": "YOUR-NAME.testnet"}' --accountId zk-blue-tick.YOUR-NAME.testnet
```

```bash
# Set operator
near call zk-blue-tick.YOUR-NAME.testnet set_operator '{"operator_address": "YOUR-ACCOUNT-2.testnet", "value": true}' --accountId YOUR-NAME.testnet
```

```bash
# Approval kyc
near call zk-blue-tick.YOUR-NAME.testnet approved_kyc '{"address": "YOUR-ACCOUNT-test.testnet", "identifyId":"12384517623" }' --accountId YOUR-ACCOUNT-2.testnet
```

```bash
# Check my Kyc
near call zk-blue-tick.tny.testnet get_my_kyc --accountId dark2.testnet --depositYocto 1
```

```bash
# Set fee 0.25 near
near call zk-blue-tick.YOUR-NAME.testnet set_fee '{"new_fee": 0.25}' --accountId YOUR-NAME.testnet
```

```bash
# Set receiver fee
near call zk-blue-tick.YOUR-NAME.testnet set_receiver_fee '{"address": "test_account.testnet"}' --accountId YOUR-NAME.testnet
```

```bash
# get fee
near view zk-blue-tick.YOUR-NAME.testnet get_fee
```

```bash
# Add wallet to kyc
near call zk-blue-tick.YOUR-NAME.testnet add_wallet_to_kyc '{"address": "test_account.testnet"}' --accountId YOUR-NAME.testnet --deposit 0.25
```

```bash
# Check kyc
near view zk-blue-tick.YOUR-NAME.testnet check_kyc '{"address": "test_account.testnet" }'
```
