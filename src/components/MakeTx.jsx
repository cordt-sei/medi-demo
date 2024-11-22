import { useState } from 'react';
import PropTypes from 'prop-types';
import { ethers } from "ethers";

export const MakeTx = ({ metadataCID, walletAddress }) => {
  const [transactionHash, setTransactionHash] = useState("");

  const handleSubmit = async () => {
    if (!metadataCID || !walletAddress) {
      alert("Wallet address or Metadata CID is missing!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const tx = {
        to: "0x0000000000000000000000000000000000000000",
        value: ethers.utils.parseEther("0.00000000000000001"),
        data: ethers.utils.toUtf8Bytes(`ipfs://${metadataCID}`),
      };

      const transaction = await signer.sendTransaction(tx);
      setTransactionHash(transaction.hash);
      console.log(`Transaction submitted! Hash: ${transaction.hash}`);
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  return (
    <div>
      <h3>Submit Transaction</h3>
      <button onClick={handleSubmit} disabled={!metadataCID}>
        Submit Transaction
      </button>
      {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
    </div>
  );
};

MakeTx.propTypes = {
  metadataCID: PropTypes.string.isRequired,
  walletAddress: PropTypes.string.isRequired,
};
