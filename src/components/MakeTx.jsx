// MakeTx.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { parseEther } from 'viem';

export const MakeTx = ({ metadataCID, walletAddress, publicClient }) => {
  const [transactionHash, setTransactionHash] = useState("");

  MakeTx.propTypes = {
    metadataCID: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
    publicClient: PropTypes.object.isRequired,
  };

  const handleSubmit = async () => {
    try {
      // Ensure publicClient and walletAddress are defined
      if (!publicClient || !walletAddress) {
        console.error("Public client or wallet address is missing.");
        return;
      }

      // Prepare the transaction
      const tx = {
        to: "0x0000000000000000000000000000000000000000", // Update this to a valid address
        value: parseEther("0.00000000000000001"), // Minimal ETH for testing
        data: `0x${Buffer.from(`ipfs://${metadataCID}`).toString('hex')}`,
      };

      // Request the transaction
      const transaction = await publicClient.sendTransaction({
        account: walletAddress,
        ...tx,
      });

      // Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transaction,
      });

      setTransactionHash(receipt.transactionHash);
      alert(`Transaction submitted! Hash: ${receipt.transactionHash}`);
    } catch (error) {
      console.error("Error submitting transaction:", error);
    }
  };

  return (
    <div>
      <h3>Submit Transaction</h3>
      <button onClick={handleSubmit} disabled={!metadataCID || !walletAddress}>
        Submit
      </button>
      {transactionHash && <p>Transaction Hash: {transactionHash}</p>}
    </div>
  );
};
