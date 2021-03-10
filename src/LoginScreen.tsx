import { useEffect, useState } from 'react'
import TorusSdk from '@toruslabs/torus-direct-web-sdk'
import nacl from 'tweetnacl'
import { Button, makeStyles, Typography } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import './App.css'
import { fromHexString } from './utils'
import brandIcon from './brandIcon.svg'

const useStyles = makeStyles((theme) => ({
  loginButton: {
    marginTop: theme.spacing(5)
  },
  icon: {
    maxHeight: theme.spacing(7)
  }
}))

type Props = {
  setPrivateKey: React.Dispatch<React.SetStateAction<string | null>>
}
function LoginScreen({ setPrivateKey }: Props) {
  const classes = useStyles()
  const [torus, setTorus] = useState<TorusSdk>()
  const history = useHistory()

  useEffect(() => {
    async function initTorus() {
      const torusdirectsdk = new TorusSdk({
        baseUrl: `${window.location.origin}/serviceworker`,
        network: 'testnet',
        enableLogging: true,
      })

      await torusdirectsdk.init({ skipSw: false })
      setTorus(torusdirectsdk)
    }
    initTorus()
  }, [])

  async function login() {
    console.log('Torus', torus)
    const loginDetails = await torus!.triggerLogin({
      typeOfLogin: 'google',
      clientId: '200932224620-4klf8kflcdqic8t1dptivlj55gds2ml0.apps.googleusercontent.com',
      verifier: 'solana-streaming-token',
    })
    const solanaPrivateKey = nacl.sign.keyPair.fromSeed(fromHexString(loginDetails.privateKey.padStart(64))).secretKey

    const stringKey = '' + solanaPrivateKey
    console.log('Stringified key', stringKey)
    window.localStorage.setItem('privateKey', stringKey)
    setPrivateKey(stringKey)
  }

  return (
    <div className='App'>
      {
        torus && <>
          <img src={brandIcon} className={classes.icon}/>
          <Typography variant='h4'>SolarStream</Typography>
          <Typography variant='h6'>Streamable tokens on Solana</Typography>
        <Button variant='contained' color='primary' onClick={login} className={classes.loginButton}>Login with Google</Button>
        </>
      }
    </div>
  )
}

export default LoginScreen
