import { generateMnemonic } from "bip39";
import "./App.css";
import { useState } from "react";
import { EthWallet,  SolWallet } from "./components/export";

export default function App() {
  const [mnemonic, setMnemonic] = useState("");

  const handleMnemonic = () => {
    const mnemonicString = generateMnemonic();
    setMnemonic(mnemonicString);
  };

  return (
    <>
      <div className="flex flex-col">
        <span className="text-center ">
          <h2 className="text-blue-200 mt-10 text-5xl font-semibold">
            Wallet
          </h2>
        </span>

        <span className="mt-10">
          <p className="text-sky-200 text-3xl font-mono font-thin text-center">
            Create Wallet in Single Click!
          </p>
        </span>
      </div>
      <p className="text-center text-xl text-orange-600 mt-5 border border-amber-400 mx-72 rounded-xl">
        {mnemonic}
      </p>
      <div className="flex justify-center mt-10">
        <button
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          onClick={handleMnemonic}
        >
          Generate Mnemonic
        </button>
      </div>

      {mnemonic && <SolWallet mnemonic={mnemonic} />}
      {mnemonic && <EthWallet mnemonic={mnemonic} />}
    </>
  );
}
