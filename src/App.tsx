import React, { Component, useState } from "react";
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

export default function App() {
  const [account, setAccount] = useState()

  return(
    <Router>
      <Switch>
        <Route path="/payment">
          <PaymentScreen account={account} />
        </Route>
        <Route path="/">
          <LoginScreen setAccount={setAccount}/>
        </Route>
      </Switch>
    </Router>
  )
}
