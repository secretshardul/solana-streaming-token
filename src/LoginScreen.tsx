import { Component, useEffect, useState } from "react";
import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import { Account } from "@solana/web3.js";
import nacl from "tweetnacl";
import { useHistory } from "react-router-dom";
import "./App.css";
import { fromHexString, getAccountInfo } from "./utils";

type Props = {
  setPrivateKey: React.Dispatch<React.SetStateAction<string | null>>
}
function LoginScreen({ setPrivateKey }: Props) {
  const [torus, setTorus] = useState<TorusSdk>()
  const history = useHistory()

  useEffect(() => {
    async function initTorus() {
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${window.location.origin}/serviceworker`,
        network: "testnet", // details for test net
      })

      await torusdirectsdk.init({ skipSw: false });
      setTorus(torusdirectsdk)
    }
    initTorus()
  }, [])

  async function login() {
    console.log('Torus', torus)
    const loginDetails = await torus!.triggerLogin({
      typeOfLogin: "google",
      clientId: "221898609709-obfn3p63741l5333093430j3qeiinaa8.apps.googleusercontent.com",
      verifier: "google-lrc",
    })
    const solanaPrivateKey = nacl.sign.keyPair.fromSeed(fromHexString(loginDetails.privateKey.padStart(64))).secretKey

    const stringKey = '' + solanaPrivateKey
    console.log('Stringified key', stringKey)
    window.localStorage.setItem('privateKey', stringKey)
    setPrivateKey(stringKey)
  };

  return (
    <div className="App">
      {
        torus && <button onClick={login}>Login with Google</button>
      }
    </div>
  )
}

export default LoginScreen;
