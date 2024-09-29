import { useState, useEffect } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Buffer } from "buffer";

export default function SolWallet({ mnemonicString }) {
  const [mnemonic, setMnemonic] = useState("");
  const [publicKeys, setPublicKeys] = useState([]);
  const [privateKeys, setPrivateKeys] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copyPublic, setCopyPublic] = useState("");
  const [copyPrivate, setCopyPrivate] = useState("");
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);

  useEffect(() => {
    setMnemonic(mnemonicString);
  }, [mnemonicString]);

  const handleAddWallet = () => {
    const seed = mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    const pvtKey = Buffer.from(secret).toString("hex");
    const pubKey = keypair.publicKey.toBase58();
    setCurrentIndex(currentIndex + 1);
    setPrivateKeys([...privateKeys, pvtKey]);
    setPublicKeys([...publicKeys, pubKey]);
  };

  const handleDeleteWallet = (index) => {
    const updatedAddresses = publicKeys.filter((_, i) => i !== index);
    const updatedPrivateKeys = privateKeys.filter((_, i) => i !== index);

    setPublicKeys(updatedAddresses);
    setPrivateKeys(updatedPrivateKeys);

    // Decrease the currentIndex
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

  return (
    <div>
      <div className="flex justify-center mt-10">
        <div className="w-full max-w-[40rem] rounded-lg bg-slate-800 text-white shadow-lg dark:bg-surface-dark dark:text-white">
          <ul className="w-full">
            <button
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              onClick={handleAddWallet}
            >
              Add Wallet
            </button>
            <li className="w-full border-b-2 border-neutral-100 dark:border-white/10 p-4">
              SOL Wallet {currentIndex}
            </li>
            {publicKeys.map((publicKey, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b-2 border-neutral-100 dark:border-white/10 p-4"
              >
                <div className="flex flex-col flex-1">
                  <span className="font-semibold">Public Key:</span>
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
                    <span className="font-semibold">Private Key:</span>
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
              </div>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
