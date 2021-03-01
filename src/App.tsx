import React, { Component, Fragment, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import "./App.css";
import { verifierMap, GOOGLE, jwtParamsMap, networks } from "./config";
import { fromHexString, getAccountInfo } from "./utils";
import LoginScreen from "./LoginScreen"
import PaymentScreen from "./PaymentScreen"
import { Account } from "@solana/web3.js"

export default function App() {
  // const [account, setAccount] = useState()
  const [privateKey, setPrivateKey] = useState(
    window.localStorage.getItem('privateKey')
  )
  console.log('Private key', privateKey)

  return(
    <Fragment>
      {
        privateKey
          ? <PaymentScreen privateKey={privateKey} />
          : <LoginScreen setPrivateKey={setPrivateKey} />
      }
    </Fragment>
  )
}
