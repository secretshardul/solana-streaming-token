import { Connection } from "@solana/web3.js";

export const fromHexString = (hexString) => new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

export async function getAccountInfo(connectionUrl, publicKey) {
  const connection = new Connection(connectionUrl, "recent");
  const accountInfo = await connection.getAccountInfo(publicKey);
  return accountInfo;
}
