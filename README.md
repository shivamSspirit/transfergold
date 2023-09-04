# Transfergoldtoken
transfer gold(fungible spl tokens) tokens to one account to another using solana cross program invocation

## How to Run this program

First setup system requirements using this blog post-> [blog_link](https://dev.to/shivamsspirit/minting-fungible-tokens-in-solana-using-solidity-solang-programming-languagepart-2-4lbc#:~:text=Setting%20up%20the,the%20project%20files.)

### Prerequisites

1. Node.js - I recommend installing Node using either [node]([https://github.com/nvm-sh/nvm](https://nodejs.org/en))

2. Solana Tool Suite - You can see the installation instructions [here](https://docs.solana.com/cli/install-solana-cli-tools).

3. Anchor - Anchor installation was pretty straight-forward for me. You can find the installation instructions [here](https://www.anchor-lang.com/docs/installation).

### To build

1. Clone the repo

```sh
git clone git@github.com:shivamsoni00/transfergold.git
```

2. Change into the project directory you'd like to run

3. Install the dependencies

```sh
npm install
```

```sh
npm i -g yarn
```

4. set your wallet keypair path in ``anchor.toml`` file

5. Start a local Solana node

```sh
solana-test-validator
```

6. Build the anchor project

```sh
anchor build
```

7. Fetch the project ID for the build:

```sh
anchor deploy
```

8. Update the project ID in the solidity program and anchor.toml file and run command.

```sh
anchor build
```

9. Run the tests

```sh
anchor test
```
