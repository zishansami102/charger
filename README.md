# documents

### Steps to setup in local

* Install dependencies

```
yarn
```

* Install and quickstart [Ganache](https://www.trufflesuite.com/ganache) 

* Compile the contracts

```
truffle compile
```

* Run migrations

```
truffle migrate --reset
```

* Run tests

```
truffle test
```

* Start the server

```
yarn start
```

### Steps to deploy to Ropsten Test Network and test in local

* Add `INFURA_PROJECT_ID` and `MNEMONIC` in the `.env` file in the main directory and set NETWORK_ID to 3

```
INFURA_PROJECT_ID = 'YOUR_PROJECT_ID'
MNEMONIC = 'YOUR MNEMONICS'
REACT_APP_NETWORK_ID = 3
```

* Run migrations

```
truffle migrate --reset
```

* Start the server

```
yarn start
```