import React, { useState } from "react";
import PropTypes from "prop-types";
import { parseEther } from "viem";
import { fetchFromIPFS, uploadToIPFS, verifyContentHash } from "../utils/ipfs";
import { Buffer } from "buffer";
import { hashFile } from "../utils/hash";

export const MakeTx = ({ metadataCID, walletAddress, walletClient, publicClient, selectedLicense }) => {
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);

  const prepareTransactionData = async () => {
    // Step 1: Fetch metadata from IPFS
    console.log("Fetching metadata from IPFS...");
    const metadata = await fetchFromIPFS(metadataCID);

    // Step 2: Hash the fetched metadata
    console.log("Hashing metadata...");
    const metadataHash = await hashFile(new Blob([JSON.stringify(metadata)]));

    // Step 3: Upload the hash to IPFS for additional verification
    console.log("Uploading metadata hash to IPFS...");
    const metadataHashCID = await uploadToIPFS({ hash: metadataHash });

    // Step 4: Verify the hash integrity
    console.log("Verifying metadata hash...");
    const isVerified = await verifyContentHash(metadata, metadataHash);
    if (!isVerified) {
      throw new Error("Metadata hash verification failed.");
    }

    // Step 5: Construct transaction data
    console.log("Constructing transaction data...");
    const txData = {
      image: { cid: metadataCID, hash: metadataHash },
      uploader: walletAddress,
      license: { type: selectedLicense, hash_of_full_text: metadataHashCID },
    };

    return {
      transactionData: {
        from: walletAddress,
        to: walletAddress,
        value: parseEther("0.0000000001"),
        data: `0x${Buffer.from(JSON.stringify(txData)).toString("hex")}`,
      },
    };
  };

  const handleSubmit = async () => {
    try {
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        throw new Error("MetaMask is not installed or not active.");
      }
      if (!walletClient || !publicClient || !metadataCID || !selectedLicense) {
        alert("All fields are required. Ensure the wallet is connected.");
        return;
      }

      setLoading(true);

      // Preprocess and construct transaction data
      const { transactionData } = await prepareTransactionData();

      // Step 6: Estimate gas
      console.log("Estimating gas...");
      const gasEstimate = await walletClient.request({
        method: "eth_estimateGas",
        params: [transactionData],
      }).catch(() => "50000");

      // Step 7: Submit transaction
      console.log("Sending transaction...");
      const txHash = await walletClient.request({
        method: "eth_sendTransaction",
        params: [{ ...transactionData, gas: gasEstimate }],
      });

      // Store transaction hash and inform the user
      setTransactionHash(txHash);
      alert(`Transaction submitted successfully. Hash: ${txHash}`);
    } catch (error) {
      console.error("Transaction error:", error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Submit Transaction</h3>
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
      {transactionHash && (
        <p>
          Transaction Hash:{" "}
          <a
            href={`https://testnet.seistream.app/transactions/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {transactionHash}
          </a>
        </p>
      )}
    </div>
  );
};

MakeTx.propTypes = {
  metadataCID: PropTypes.string.isRequired,
  walletAddress: PropTypes.string.isRequired,
  walletClient: PropTypes.object.isRequired,
  publicClient: PropTypes.object.isRequired,
  selectedLicense: PropTypes.string.isRequired,
};
