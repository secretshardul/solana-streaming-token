import { Component, useEffect, useState } from "react";
import TorusSdk from "@toruslabs/torus-direct-web-sdk";
import { Account } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as bs58 from "bs58";

import "./App.css";
import { verifierMap, GOOGLE, jwtParamsMap, networks } from "./config";
import { fromHexString, getAccountInfo } from "./utils";

function LoginScreen() {
  const [torus, setTorus] = useState()
  const [accountInfo, setAccountInfo] = useState()

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
    const selectedVerifier = GOOGLE

    const jwtParams = jwtParamsMap[selectedVerifier] || {}
    const { typeOfLogin, clientId, verifier } = verifierMap[selectedVerifier]
    console.log('Torus', torus)
    const loginDetails = await torus.triggerLogin({
      typeOfLogin,
      verifier,
      clientId,
      jwtParams,
    })
    const solanaPrivateKey = nacl.sign.keyPair.fromSeed(fromHexString(loginDetails.privateKey.padStart(64, 0))).secretKey
    const account = new Account(solanaPrivateKey)
    console.log(bs58.encode(account.secretKey), "secret key")
    console.log('Public key', account.publicKey.toBase58())
    setAccountInfo(account)
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
