import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Alchemy, Network, Wallet, Utils } from 'alchemy-sdk';
import dotenv from 'dotenv';

dotenv.config();

const { ALCHEMY_API_KEY, PORT } = process.env;

const port = PORT || 4000;
const app = express();
const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/send-eth', async (req, res) => {
    const { avaliPrivateKey, toSend, amountToSend } = req.body;

    
    let wallet = new Wallet(avaliPrivateKey);

    try {
        const nonce = await alchemy.core.getTransactionCount(wallet.address, 'latest');

        let transaction = {
            to: toSend,
            value: Utils.parseEther(`${amountToSend}`),
            gasLimit: '21000',
            maxPriorityFeePerGas: Utils.parseUnits('5', 'gwei'),
            maxFeePerGas: Utils.parseUnits('20', 'gwei'),
            nonce: nonce,
            type: 2,
            chainId: 11155111,
        };

        let rawTransaction = await wallet.signTransaction(transaction);
        let tx = await alchemy.core.sendTransaction(rawTransaction);
        console.log('Sent transaction', tx);

        return res.status(200).json({
            message: 'Success',
            data: tx,
        });
    } catch (error) {
        console.error('Error sending transaction:', error);

        if (error.code === -32000 && error.message === 'already known') {
            return res.status(200).json({
                message: 'Transaction already known and is being processed.',
                transactionHash: error.transactionHash || null,
            });
        }

        return res.status(500).json({
            message: 'Failed to send transaction',
            error: error.message,
        });
    }
});


app.listen(port, () => {
    console.log(`Server is running on : http://localhost:${port}`);
});
