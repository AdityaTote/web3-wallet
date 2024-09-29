import { Alchemy, Network, Wallet, Utils } from "alchemy-sdk";
import dotenv from "dotenv";

dotenv.config();
const { ALCHEMY_API_KEY } = process.env;

const settings = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);

let wallet = new Wallet(PRIVATE_KEY);

async function main( toSendAddress,  ) {
  const nonce = await alchemy.core.getTransactionCount(
    wallet.address,
    "latest"
  );

  let transaction = {
    to: "0xa238b6008Bc2FBd9E386A5d4784511980cE504Cd",
    value: Utils.parseEther("0.001"),
    gasLimit: "21000",
    maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
    maxFeePerGas: Utils.parseUnits("20", "gwei"),
    nonce: nonce,
    type: 2,
    chainId: 11155111,
  };

  let rawTransaction = await wallet.signTransaction(transaction);
  let tx = await alchemy.core.sendTransaction(rawTransaction);
  console.log("Sent transaction", tx);
}

main();