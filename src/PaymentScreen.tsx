import {
    Account
} from '@solana/web3.js';
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import FormLabel from '@material-ui/core/FormLabel'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Paper from '@material-ui/core/Paper'
import { Button, Typography } from '@material-ui/core'
import { createProgramAc, establishConnection } from './tokenApi'
import { useEffect } from 'react'

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
        margin: theme.spacing(10)
    },
    flowButton: {
        margin: theme.spacing(2)
    },
    tokenCount: {
        marginTop: theme.spacing(2)
    }
}));

type Props = {
    privateKey: string
}
export default function PaymentScreen({ privateKey }: Props) {
    const classes = useStyles();
    console.log('Got private key in payment screen', privateKey)
    const parsedKey = privateKey.split(',').map(value => Number(value))
    console.log('Parsed key', parsedKey)
    const account = new Account(parsedKey)

    return(
        // <div>gg</div>
        <Grid container className={classes.root} spacing={10}>
            <Grid item xs={12} className={classes.balances}>
                <Grid container justify="center" spacing={10}>
                    <Grid item xs={4}>
                        <Typography variant="h4">You</Typography>
                        <Typography variant="h5" className={classes.tokenCount}>5.00 fluid</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="h4">Vendor</Typography>
                        <Typography variant="h5" className={classes.tokenCount}>5.00 fluid</Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} className={classes.flowButton}>
                <Button variant="contained" color="primary">
                    Flow
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Button variant="contained" color="secondary">
                    Stop
                </Button>
            </Grid>
        </Grid>
    )
}
