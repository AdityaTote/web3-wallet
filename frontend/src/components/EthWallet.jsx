import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from "ethers";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { Alchemy, Network, Utils } from "alchemy-sdk";

const settings = {
  apiKey: "IC_Dtn04yXQ6uExL5BOPGLVyQ22p3dk0",
  network: Network.ETH_SEPOLIA,
};
const alchemy = new Alchemy(settings);

export default function SolWallet({ mnemonicString }) {
  const [mnemonic, setMnemonic] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [privateKeys, setPrivateKeys] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copyPublic, setCopyPublic] = useState("");
  const [copyPrivate, setCopyPrivate] = useState("");
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [resData, setResData] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    setMnemonic(mnemonicString);
  }, [mnemonicString]);

  const handleAddWallet = async () => {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);
    setCurrentIndex(currentIndex + 1);
    setPrivateKeys([...privateKeys, privateKey]);
    setAddresses([...addresses, wallet.address]);
  };

  const handleDeleteWallet = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    const updatedPrivateKeys = privateKeys.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    setPrivateKeys(updatedPrivateKeys);
    setCurrentIndex(currentIndex - 1);
  };

  const handleCopyPublic = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyPublic("Copied!");
        setTimeout(() => setCopyPublic(""), 2000);
      },
      () => {
        setCopyPublic("Failed to copy");
      }
    );
  };

  const handleCopyPrivate = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyPrivate("Copied!");
        setTimeout(() => setCopyPrivate(""), 2000);
      },
      () => {
        setCopyPrivate("Failed to copy");
      }
    );
  };

  const togglePrivateKeyVisibility = () => {
    setIsPrivateKeyVisible(!isPrivateKeyVisible);
  };

  const handleSendTransaction = async () => {
    if (addresses.length > 0 && privateKeys.length > 0) {
      console.log(privateKeys[0]);
      console.log(toAddress);
      console.log(amount);
      try {
        const response = await axios.post(
          "http://localhost:3000/api/send-eth",
          {
            avaliPrivateKey: privateKeys[0],
            toSend: toAddress,
            amountToSend: amount,
          }
        );

        console.log(response.data);
        setResData(JSON.stringify(response.data.data));
      } catch (error) {
        console.log(error);
        setResData(JSON.stringify(error));
      }
    }
  };

  useEffect(() => {
    const getBalance = async () => {
      try {
        if (!Array.isArray(addresses)) {
          throw new Error("Addresses should be an array");
        }

        const balancePromises = addresses.map(async (address) => {
          const walletBalance = await alchemy.core.getBalance(address);
          const formatBalance = Utils.formatEther(walletBalance);
          return formatBalance;
        });

        const balances = await Promise.all(balancePromises);
        setBalance(balances);
        
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    getBalance();
  }, [addresses]);

  return (
    <div>
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-[60rem] rounded-lg bg-slate-800 text-white shadow-lg dark:bg-surface-dark dark:text-white">
          <ul className="w-full">
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={handleAddWallet}
            >
              Add Wallet
            </button>
            <li className="w-full border-b-2 border-neutral-100 dark:border-white/10 p-4 text-lg font-bold">
              ETH Wallet {currentIndex}
            </li>
            {addresses.map((publicKey, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b-2 border-neutral-100 dark:border-white/10 p-6"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-semibold text-lg">Public Key:</span>
                  <p
                    className="break-words text-sm mt-2 max-h-24 overflow-auto"
                    style={{ wordBreak: "break-all" }}
                  >
                    {publicKey}
                  </p>
                  <button
                    onClick={() => handleCopyPublic(publicKey)}
                    className="mt-2 text-blue-400 hover:text-blue-600 focus:outline-none"
                  >
                    Copy Public Key
                  </button>
                  {copyPublic && (
                    <span className="text-green-500 ml-2">{copyPublic}</span>
                  )}
                </div>
                {privateKeys[index] && (
                  <div className="flex flex-col flex-1 ml-4">
                    <span className="font-semibold text-lg">Private Key:</span>
                    <p
                      className="break-words text-sm mt-2 max-h-24 overflow-auto"
                      style={{ wordBreak: "break-all" }}
                    >
                      {isPrivateKeyVisible
                        ? privateKeys[index]
                        : "************"}
                    </p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={togglePrivateKeyVisibility}
                        className="mr-2 text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        {isPrivateKeyVisible ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleCopyPrivate(privateKeys[index])}
                        className="text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        Copy Private Key
                      </button>
                      {copyPrivate && (
                        <span className="text-green-500 ml-2">
                          {copyPrivate}
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteWallet(index)}
                        className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-lg">Wallet Balance: {balance[index]}</p>
              </div>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-10 flex justify-center">
        <span>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="Recipient Address"
            className="text-black"
          />
        </span>
        <span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to Send"
            className="text-black ml-2"
          />
        </span>
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ml-4"
          onClick={handleSendTransaction}
        >
          Send Transaction
        </button>
      </div>
      <p className="text-center text-xl text-emerald-300">{resData}</p>
    </div>
  );
}
