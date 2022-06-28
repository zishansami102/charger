# Demo
* Product URL - User Side (Works on Ropsten - 

```
https://recurring-billing.netlify.app
```

* Product URL - Service Side (Works on Ropsten) - 

```
https://recurring-billing.netlify.app/user/account
```

* Demo from the service side - 

```
https://drive.google.com/file/d/1oNGnT2xBLL19esc6m93pv7xmKHxH5tgX/view?usp=sharing
```

* Demo from the user side - 

```
https://drive.google.com/file/d/1Ie1KocsExknEXDgmO1bH1FQDgE1E4-J8/view?usp=sharing
```

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