import React, { Component } from "react";
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
  return(
    <Router>
      <Switch>
        <Route path="/">
          {/* <PaymentScreen></PaymentScreen> */}
          <LoginScreen />
        </Route>
      </Switch>
    </Router>
  )
}
