import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SplTokenMinter } from "../target/types/spl_token_minter";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL,ParsedAccountData } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { assert } from "chai";


import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

describe("spl-token-minter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Generate a new keypair for the data account for the program
  const dataAccount = anchor.web3.Keypair.generate();
  // Generate a mint keypair
  const mintKeypair = anchor.web3.Keypair.generate();
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  const program = anchor.workspace.SplTokenMinter as Program<SplTokenMinter>;

  // Metadata for the Token
  const tokenTitle = "Solana pro";
  const tokenSymbol = "GM";
  const tokenUri =
    "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json";

  it("Is initialized!", async () => {
    // Initialize data account for the program, which is required by Solang
    const tx = await program.methods
      .new()
      .accounts({ dataAccount: dataAccount.publicKey })
      .signers([dataAccount])
      .rpc();
    console.log("Your transaction signature", tx);
  });



  it("Create an SPL Token!", async () => {
    // Get the metadata address for the mint
    const metaplex = Metaplex.make(connection);
    const metadataAddress = await metaplex
      .nfts()
      .pdas()
      .metadata({ mint: mintKeypair.publicKey });

    // Create the token mint
    const tx = await program.methods
      .createTokenMint(
        wallet.publicKey, // payer
        mintKeypair.publicKey, // mint
        wallet.publicKey, // mint authority
        wallet.publicKey, // freeze authority
        metadataAddress, // metadata address
        9, // decimals
        tokenTitle, // token name
        tokenSymbol, // token symbol
        tokenUri // token uri
      )
      .accounts({ dataAccount: dataAccount.publicKey })
      .remainingAccounts([
        {
          pubkey: wallet.publicKey,
          isWritable: true,
          isSigner: true,
        },
        { pubkey: mintKeypair.publicKey, isWritable: true, isSigner: true },
        {
          pubkey: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), // Metadata program id
          isWritable: false,
          isSigner: false,
        },
        { pubkey: metadataAddress, isWritable: true, isSigner: false },
        { pubkey: SystemProgram.programId, isWritable: false, isSigner: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isWritable: false, isSigner: false },
      ])
      .signers([mintKeypair])
      .rpc({ skipPreflight: true });
    console.log("Your transaction signature", tx);
  });

  it("Mint some tokens to your wallet!", async () => {
    // Wallet's associated token account address for mint
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer, // payer
      mintKeypair.publicKey, // mint
      wallet.publicKey // owner
    );

    console.log("sendertokenAccount", tokenAccount)

    const tx = await program.methods
      .mintTo(
        wallet.publicKey, // payer
        tokenAccount.address, // associated token account address
        mintKeypair.publicKey, // mint
        new anchor.BN(199000000000) // amount to mint
      )
      .accounts({ dataAccount: dataAccount.publicKey })
      .remainingAccounts([
        {
          pubkey: wallet.publicKey,
          isWritable: true,
          isSigner: true,
        },
        { pubkey: tokenAccount.address, isWritable: true, isSigner: false },
        { pubkey: mintKeypair.publicKey, isWritable: true, isSigner: false },
        {
          pubkey: SystemProgram.programId,
          isWritable: false,
          isSigner: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isWritable: false, isSigner: false },
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isWritable: false,
          isSigner: false,
        },
      ])
      .rpc({ skipPreflight: true });
    console.log("Your transaction signature", tx);

    // Get the minted token amount on the associated token account
    const tokenAmount = (await getAccount(connection, tokenAccount.address)).amount;
    console.log("tokenAmount", tokenAmount);
    // Converting tokenAmount to a regular number using Number()
    let tokens = Number(tokenAmount);
    console.log("minted token amounts", tokens / LAMPORTS_PER_SOL);
    assert.equal(tokens / LAMPORTS_PER_SOL, 199);
  });


// transfer token to another wallet via cpi

it("Transfer some tokens to another wallet!", async () => {
  // Wallet's associated token account address for mint
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.payer, // payer
    mintKeypair.publicKey, // mint
    wallet.publicKey // owner
  );

  const receipient = anchor.web3.Keypair.generate();
  const receipientTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.payer, // payer
    mintKeypair.publicKey, // mint account
    receipient.publicKey // owner account
  );

  console.log("receipientTokenAccount",receipientTokenAccount)

  const tx = await program.methods
    .transferTokens(
      tokenAccount.address,
      receipientTokenAccount.address,
      new anchor.BN(54000000000)
    )
    .accounts({ dataAccount: dataAccount.publicKey })
    .remainingAccounts([
      {
        pubkey: wallet.publicKey,
        isWritable: true,
        isSigner: true,
      },
      {
        pubkey: mintKeypair.publicKey,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: tokenAccount.address,
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: receipientTokenAccount.address,
        isWritable: true,
        isSigner: false,
      },
    ])
    .rpc();
  console.log("Your transaction signature", tx);
});

  const recepienttokenAmount = (await getAccount(connection, receipientTokenAccount.address)).amount;
  console.log("recipienttokenAmount", recepienttokenAmount);
  let tokens = Number(recepienttokenAmount);
  assert.equal(tokens / LAMPORTS_PER_SOL, 54);

});


