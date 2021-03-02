import React, { Fragment, useState } from 'react'

import './App.css';
import LoginScreen from './LoginScreen'
import PaymentScreen from './PaymentScreen'

export default function App() {
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
