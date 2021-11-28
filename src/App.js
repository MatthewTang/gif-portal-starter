import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import idl from "./idl.json";
import kp from "./keypair.json";

// SystemProgram is a reference to the Solana runtime
const { SystemProgram, Keypair } = web3;

// create a keypair for the account that will hold the GIF data
// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the idl file
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet
const network = clusterApiUrl("devnet");

// controls how we want to ack when a tx is "done"
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TWITTER_HANDLE_MATTHEW = "siusiuhin";
const TWITTER_LINK_MATTHEW = `https://twitter.com/${TWITTER_HANDLE_MATTHEW}`;

const TEST_GIFS = [
  "https://media.giphy.com/media/l4pTldWDec8WamJUc/giphy.gif",
  "https://media.giphy.com/media/e7PqS0VCIsmi6LKkY4/giphy.gif",
  "https://media.giphy.com/media/wHB67Zkr63UP7RWJsj/giphy.gif",
  "https://media.giphy.com/media/FUi94opKPNopjUmQvR/giphy.gif",
];

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          /*
           * The solana object gives us function that will allow us to connect
           * directly with the user's wallet.
           */
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "connected with public key:",
            response.publicKey.toString()
          );

          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found ! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Let's define this method
   */
  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with public key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount],
      });
      console.log(
        "created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("error creating baseAccount account:", error);
    }
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("no gif link given!");
      return;
    }
    console.log("gif link: ", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", inputValue);

      await getGifList();
    } catch (error) {
      console.log("error sending GIF:", error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGifAccount}
          >
            Do One-time Initialisation for GIF program account
          </button>
        </div>
      );
    } else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input
              type="text"
              placeholder="Enter gif link"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submitted" className="cta-button submit-gif-button">
              {" "}
              Submit
            </button>
          </form>
          <div className="gif-grid">
            {/* we use index as the key instead, also the src is now item.gifList*/}
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} alt={item.gifLink} />
                <p style={{ color: "white" }}>{item.userAddress.toString()}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  // useEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("got the account: ", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("error in getGifList", error);
      setGifList(null);
    }
  };

  // fetch gif list after walletAddress is set
  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      getGifList();
      //createGifAccount();
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? "auth-container" : "container"}>
        <div className="header-container">
          <p className="header">🚀 X dad GIFS </p>
          <p className="sub-text">x daddy in da metaverse 🕹</p>
          {/* Render your connect to wallet button right here */}
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />

          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>

          <a
            className="footer-text"
            href={TWITTER_LINK_MATTHEW}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE_MATTHEW}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
