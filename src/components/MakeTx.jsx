import { useState } from 'react';
import PropTypes from 'prop-types';
import { ethers } from "ethers";

const MakeTx = ({ metadataCID, walletAddress }) => {

  
  const [transactionHash, setTransactionHash] = useState("");

  MakeTx.propTypes = {
    metadataCID: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
  };
  
  const handleSubmit = async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://evm-rpc-testnet.sei-apis.com"
      );
      const signer = provider.getSigner(walletAddress);

      const tx = {
        to: "0x0000000000000000000000000000000000000000", // Burn address
        value: ethers.utils.parseEther("0.00000000000000001"), // Low cost
        data: ethers.utils.toUtf8Bytes(`ipfs://${metadataCID}`), // Embed CID
      };

      const transaction = await signer.sendTransaction(tx);
      setTransactionHash(transaction.hash);
      alert(`Transaction submitted! Hash: ${transaction.hash}`);
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  
  return (
    <div>
      <h3>Submit Transaction</h3>
      <button onClick={handleSubmit} disabled={!metadataCID}>
        Submit
      </button>
      {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
    </div>
  );
};

export default MakeTx;
