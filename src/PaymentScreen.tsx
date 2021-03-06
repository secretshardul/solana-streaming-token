import { Account, PublicKey } from '@solana/web3.js'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Button, Typography } from '@material-ui/core'
import { addBalance, connection, createProgramAc, establishConnection, getStreamBalance, startFlow } from './tokenApi'
import { useEffect, useState } from 'react'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: 140,
        width: 100,
    },
    control: {
        padding: theme.spacing(2),
    },
    balances: {
        margin: theme.spacing(10),
    },
    address: {
        marginTop: theme.spacing(1),
    },
    flowButton: {
        margin: theme.spacing(2),
    },
    flowButtonGroup: {
        marginTop: theme.spacing(1),
    },
    tokenCount: {
        marginTop: theme.spacing(2),
    },
    airdropButton: {
        marginTop: theme.spacing(1),
    },
}))

type Props = {
    privateKey: string
}
export default function PaymentScreen({ privateKey }: Props) {
    const classes = useStyles()
    const parsedKey = privateKey.split(',').map(value => Number(value))
    const account = new Account(parsedKey)

    const [senderKey, setSenderKey] = useState<PublicKey>()
    const [receiverKey, setReceiverKey] = useState<PublicKey>()

    const [senderBal, setSenderBal] = useState(0)
    const [receiverBal, setReceiverBal] = useState(0)

    async function setPublicKey(
        localStorageKey: string,
        setter: React.Dispatch<React.SetStateAction<PublicKey | undefined>>
    ) {
        console.log('Settig public key for', localStorageKey)

        const keyString = window.localStorage.getItem(localStorageKey)
        if (keyString) {
            console.log('Stored', localStorageKey, ':', keyString)
            setter(new PublicKey(keyString))
        } else {
            console.log('No account found, creating new')
            const newPublicKey = await createProgramAc(account)
            window.localStorage.setItem(localStorageKey, newPublicKey.toBase58())
            setter(newPublicKey)
        }
    }

    async function startFlowHandler() {
        if(senderKey && receiverKey) {
            await startFlow(1, senderKey, receiverKey, account)
        }
    }

    async function stopFlowHandler() {
        if (senderKey && receiverKey) {
            await startFlow(0, senderKey, receiverKey, account)
        }
    }

    async function checkLamportBalance() {
        const lamportBal = await connection.getBalance(account.publicKey)
        console.log('Lamport balance', lamportBal)
        const airdropResp = await connection.requestAirdrop(account.publicKey, 100000000)
        console.log('Airdrop response', airdropResp)
    }

    async function setupAccounts() {
        const lamportBal = await connection.getBalance(account.publicKey)
        console.log('Lamport balance', lamportBal)
        const minimumBal = 100000000

        if (lamportBal < minimumBal) {
            const airdropResp = await connection.requestAirdrop(account.publicKey, minimumBal)
            console.log('Airdrop response', airdropResp)
        }
        setPublicKey('senderKey', setSenderKey)
        setPublicKey('receiverKey', setReceiverKey)
    }

    useEffect(() => {
        establishConnection()
        setupAccounts()
    }, [])

    async function setBalanceListener(setter: React.Dispatch<React.SetStateAction<number>>, publicKey?: PublicKey) {
        if (publicKey) {
            const { staticBal, flow, lastTranTime } = await getStreamBalance(publicKey)
            const timer = setInterval(() => {
                let timeDiff = 0
                if (lastTranTime) {
                    const currentTime = Math.floor(Date.now() / 1000)
                    timeDiff = currentTime - lastTranTime
                }
                const bal = staticBal + timeDiff * flow
                setter(bal)
            }, 1000)
            return () => clearInterval(timer)
        } else {
            console.log('Account not yet set')
        }
    }

    async function addTokens() {
        if(senderKey) {
            await addBalance(
                senderKey, account
            )
        }

    }

    useEffect(() => {
        console.log('Getting sender balance')
        setBalanceListener(setSenderBal, senderKey)
    }, [senderKey])

    useEffect(() => {
        console.log('Getting receiver balance')
        setBalanceListener(setReceiverBal, receiverKey)
    }, [receiverKey])


    return(
        <Grid container justify='center' className={classes.root} spacing={1}>
            <Grid item xs={12} className={classes.address}>
                <Typography variant="subtitle1">Account: {account.publicKey.toBase58()}</Typography>
            </Grid>

            <Grid item xs={12} className={classes.balances}>
                <Grid container justify='center' spacing={10}>
                    <Grid item xs={4}>
                        <Typography variant='h4'>Sender</Typography>
                        <Typography variant='h5' className={classes.tokenCount}>{senderBal} coins</Typography>
                        <Button variant='outlined' color='primary' className={classes.airdropButton} onClick={addTokens}>
                            +50 Airdrop
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant='h4'>Receiver</Typography>
                        <Typography variant='h5' className={classes.tokenCount}>{receiverBal} coins</Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} className={classes.flowButtonGroup}>
                <Button variant='contained' color='primary' className={classes.flowButton} onClick={startFlowHandler}>
                    Flow
                </Button>
                <Button variant='contained' color='secondary' className={classes.flowButton} onClick={stopFlowHandler}>
                    Stop
                </Button>
            </Grid>
        </Grid>
    )
}
