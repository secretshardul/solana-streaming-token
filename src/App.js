import { Component } from "react";
import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import { Account } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as bs58 from "bs58";

import "./App.css";
import { verifierMap, GOOGLE, jwtParamsMap, networks } from "./config";
import { fromHexString, getAccountInfo } from "./utils";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVerifier: GOOGLE,
      torusdirectsdk: null,
      consoleText: "",
      account: null,
      solanaNetwork: networks.mainnet,
      accountInfo: null,
    };
    console.log(networks);
  }

  componentDidMount = async () => {
    try {
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${window.location.origin}/serviceworker`,
        enableLogging: true,
        proxyContractAddress: "0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183", // details for test net
        network: "testnet", // details for test net
      });

      await torusdirectsdk.init({ skipSw: false });

      this.setState({ torusdirectsdk: torusdirectsdk });
    } catch (error) {
      console.error(error, "mounted caught");
    }
  };

  login = async (e) => {
    e.preventDefault();
    const { selectedVerifier, torusdirectsdk } = this.state;

    try {
      const jwtParams = jwtParamsMap[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      const loginDetails = await torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });
      const solanaPrivateKey = nacl.sign.keyPair.fromSeed(
        fromHexString(loginDetails.privateKey.padStart(64, 0))
      ).secretKey;
      const account = new Account(solanaPrivateKey);
      console.log(bs58.encode(account.secretKey), "secret key");
      this.setState({
        consoleText:
          typeof loginDetails === "object"
            ? JSON.stringify(loginDetails)
            : loginDetails,
        account,
      });
      this.updateAccountInfo();
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  updateAccountInfo = async () => {
    const { account, solanaNetwork } = this.state;
    if (!account) return;
    const accountInfo = await getAccountInfo(
      solanaNetwork.url,
      account.publicKey
    );
    this.setState({ accountInfo });
  };

  onChangeNetwork = async (e) => {
    const requiredNetwork = Object.values(networks).find(
      (x) => x.url === e.target.value
    );
    this.setState({ solanaNetwork: requiredNetwork }, async () => {
      await this.updateAccountInfo();
    });
  };

  render() {
    const {
      selectedVerifier,
      consoleText,
      solanaNetwork,
      account,
      accountInfo,
    } = this.state;
    return (
      <div className="App">
        <form onSubmit={this.login}>
          <div>
            <span style={{ marginRight: "10px" }}>Verifier:</span>
            <select
              value={selectedVerifier}
              onChange={(e) =>
                this.setState({ selectedVerifier: e.target.value })
              }
              style={{ marginRight: "10px" }}
            >
              {Object.keys(verifierMap).map((login) => (
                <option value={login} key={login.toString()}>
                  {verifierMap[login].name}
                </option>
              ))}
            </select>
            <select value={solanaNetwork.url} onChange={this.onChangeNetwork}>
              {Object.keys(networks).map((network) => (
                <option value={networks[network].url} key={network}>
                  {networks[network].displayName}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "20px" }}>
            <button>Login with Torus</button>
          </div>
        </form>
        {account && (
          <section
            style={{
              fontSize: "14px",
              marginTop: "20px",
            }}
          >
            <div>
              Account: <i>{account.publicKey.toBase58()}</i>
            </div>
            <div>
              Balance: <i>{(accountInfo && accountInfo.lamports) || 0}</i>
            </div>
          </section>
        )}

        <div className="console">
          <code>{consoleText}</code>
        </div>
      </div>
    );
  }
}

export default App;
