import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";

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

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log("gif link:", inputValue);
    } else {
      console.log("empty input. Try again.");
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

  const renderConnectedContainer = () => (
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
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt="Gif" />
          </div>
        ))}
      </div>
    </div>
  );

  // useEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      // call solana program here.

      // setState
      setGifList(TEST_GIFS);
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
