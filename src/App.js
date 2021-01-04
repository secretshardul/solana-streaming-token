import { Component } from "react";
import TorusSdk from "@toruslabs/torus-direct-web-sdk";

import "./App.css";
import {
  verifierMap,
  GOOGLE,
  APPLE,
  AUTH_DOMAIN,
  EMAIL_PASSWORD,
  GITHUB,
  HOSTED_EMAIL_PASSWORDLESS,
  HOSTED_SMS_PASSWORDLESS,
  LINE,
  LINKEDIN,
  TWITTER,
  WEIBO,
} from "./config";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedVerifier: GOOGLE, torusdirectsdk: null, consoleText: "" };
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
      const jwtParams = this._loginToConnectionMap()[selectedVerifier] || {};
      const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier];
      const loginDetails = await torusdirectsdk.triggerLogin({
        typeOfLogin,
        verifier,
        clientId,
        jwtParams,
      });
      this.setState({ consoleText: typeof loginDetails === "object" ? JSON.stringify(loginDetails) : loginDetails });
    } catch (error) {
      console.error(error, "login caught");
    }
  };

  _loginToConnectionMap = () => {
    const { loginHint } = this.state;
    return {
      [EMAIL_PASSWORD]: { domain: AUTH_DOMAIN },
      [HOSTED_EMAIL_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "", isVerifierIdCaseSensitive: false },
      [HOSTED_SMS_PASSWORDLESS]: { domain: AUTH_DOMAIN, verifierIdField: "name", connection: "" },
      [APPLE]: { domain: AUTH_DOMAIN },
      [GITHUB]: { domain: AUTH_DOMAIN },
      [LINKEDIN]: { domain: AUTH_DOMAIN },
      [TWITTER]: { domain: AUTH_DOMAIN },
      [WEIBO]: { domain: AUTH_DOMAIN },
      [LINE]: { domain: AUTH_DOMAIN },
    };
  };

  render() {
    const { selectedVerifier, consoleText } = this.state;
    return (
      <div className="App">
        <form onSubmit={this.login}>
          <div>
            <span style={{ marginRight: "10px" }}>Verifier:</span>
            <select value={selectedVerifier} onChange={(e) => this.setState({ selectedVerifier: e.target.value })}>
              {Object.keys(verifierMap).map((login) => (
                <option value={login} key={login.toString()}>
                  {verifierMap[login].name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "20px" }}>
            <button>Login with Torus</button>
          </div>
        </form>
        <div className="console">
          <p>{consoleText}</p>
        </div>
      </div>
    );
  }
}

export default App;
