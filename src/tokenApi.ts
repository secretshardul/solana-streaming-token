import {
    Account,
    Connection,
    BpfLoader,
    BPF_LOADER_PROGRAM_ID,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionInstruction,
    Transaction,
    sendAndConfirmTransaction,
    clusterApiUrl,
} from '@solana/web3.js';
// @ts-ignore
import BufferLayout from 'buffer-layout';

const url = clusterApiUrl('devnet')
let connection: Connection

const PROGRAM_ID = 'fGWURpxx1vPjgzt6n7ZR1dzXBQdKh4jPF7RZJ9BADN6'
const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID)

const greetedAccountDataLayout = BufferLayout.struct([
    BufferLayout.u32('numGreets'),
    BufferLayout.s32('flow')
])
const space = greetedAccountDataLayout.span

export async function establishConnection(): Promise<void> {
    connection = new Connection(url, 'singleGossip')
    const version = await connection.getVersion()
    console.log('Connection to cluster established:', url, version)
}

async function getProgramAccounts(payerAccount: Account) {

    // payerAccoun

}
export async function createProgramAc(payerAccount: Account) {
    const senderAccount = new Account()
    const senderPubKey = senderAccount.publicKey
    console.log('Creating sender account', senderPubKey.toBase58())

    const lamports = await connection.getMinimumBalanceForRentExemption(
        greetedAccountDataLayout.span,
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
    );
    console.log('Create account transaction ID', transactionId)

    return senderPubKey
}