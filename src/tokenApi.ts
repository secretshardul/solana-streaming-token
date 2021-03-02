import {
    Account,
    Connection,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
    clusterApiUrl,
} from '@solana/web3.js'
// @ts-ignore
import BufferLayout from 'buffer-layout'

const url = clusterApiUrl('devnet')
let connection: Connection

const PROGRAM_ID = 'ugSaSJkZZ2HjfrZguYUxJRT78bs7TFPbj2vg47RYvVk'
const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID)

// To get current time
const clockAccountKey = new PublicKey('SysvarC1ock11111111111111111111111111111111')

const dataLayout = BufferLayout.struct([
    BufferLayout.u32('numGreets'),
    BufferLayout.s32('flow'),
    BufferLayout.nu64('timestamp'),
])
const space = dataLayout.span

export async function establishConnection(): Promise<void> {
    connection = new Connection(url, 'singleGossip')
    const version = await connection.getVersion()
    console.log('Connection to cluster established:', url, version)
}

export async function getBalance(account: PublicKey) {
    const accountInfo = await connection.getAccountInfo(account)
    if (accountInfo === null) {
        throw 'Error: cannot find the greeted account'
    }
    console.log('Raw account info', accountInfo.data)
    const info = dataLayout.decode(Buffer.from(accountInfo.data))
    const staticBal = Number(info.numGreets.toString())
    const flow = Number(info.flow.toString())
    const lastTranTime = Number(info.timestamp.toString())
    console.log('Static balance', staticBal)
    console.log('Flow', flow)
    console.log('Last time(saved)', lastTranTime)

    return {staticBal, flow, lastTranTime}
}

export async function addBalance(address: PublicKey, payerAccount: Account) {
    console.log('Adding balance to', address.toBase58())

    const commandDataLayout = BufferLayout.struct([
        BufferLayout.u8('instruction')
    ])
    let data = Buffer.alloc(1024)
    {
        const encodeLength = commandDataLayout.encode(
            {
                instruction: 1,
            },
            data,
        )
        data = data.slice(0, encodeLength)
    }

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: clockAccountKey, isSigner: false, isWritable: false },
            { pubkey: address, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_PUBLIC_KEY,
        data,
    })

    const addBalanceResponse = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [payerAccount],
        {
            commitment: 'singleGossip',
            preflightCommitment: 'singleGossip',
        },
    )
    console.log('Response', addBalanceResponse)

    window.location.reload(false)
}

export async function startFlow(
    flow: number,
    senderPubKey: PublicKey,
    receiverPubKey: PublicKey,
    payerAccount: Account
    ) {
    console.log('Creating flow from', senderPubKey.toBase58(), 'to', receiverPubKey.toBase58())

    const commandDataLayout = BufferLayout.struct([
        BufferLayout.u8('instruction'),
        BufferLayout.u8('flow')
    ])
    let data = Buffer.alloc(1024)
    {
        const encodeLength = commandDataLayout.encode(
            {
                instruction: 2,
                flow
            },
            data,
        )
        data = data.slice(0, encodeLength)
    }

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: clockAccountKey, isSigner: false, isWritable: false },
            { pubkey: senderPubKey, isSigner: false, isWritable: true },
            { pubkey: receiverPubKey, isSigner: false, isWritable: true }
        ],
        programId: PROGRAM_PUBLIC_KEY,
        data,
    })
    const startFlowTransaction = await sendAndConfirmTransaction(
        connection,
        new Transaction().add(instruction),
        [payerAccount],
        {
            commitment: 'singleGossip',
            preflightCommitment: 'singleGossip',
        },
    )
    console.log('Response', startFlowTransaction)
    window.location.reload(false)
}

export async function createProgramAc(payerAccount: Account) {
    const senderAccount = new Account()
    const senderPubKey = senderAccount.publicKey
    console.log('Creating sender account', senderPubKey.toBase58())

    const lamports = await connection.getMinimumBalanceForRentExemption(
        dataLayout.span,
    )

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payerAccount.publicKey,
            newAccountPubkey: senderPubKey,
            lamports,
            space,
            programId: PROGRAM_PUBLIC_KEY,
        }),
    )
    const transactionId = await sendAndConfirmTransaction(
        connection,
        transaction,
        [payerAccount, senderAccount],
        {
            commitment: 'singleGossip',
            preflightCommitment: 'singleGossip',
        },
    )
    console.log('Create account transaction ID', transactionId)

    return senderPubKey
}