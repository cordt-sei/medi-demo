// MakeTx.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { parseEther } from "viem";
import { fetchFromIPFS, uploadToIPFS } from "../utils/ipfs";
import { Buffer } from "buffer";

export const MakeTx = ({ metadataCID, walletAddress, publicClient }) => {
  const [transactionHash, setTransactionHash] = useState("");

  MakeTx.propTypes = {
    metadataCID: PropTypes.string.isRequired,
    walletAddress: PropTypes.string.isRequired,
    publicClient: PropTypes.object.isRequired,
  };

  const handleSubmit = async () => {
    try {
      if (!publicClient || !walletAddress) {
        console.error("Public client or wallet address is missing.");
        return;
      }

      console.log("Fetching metadata from IPFS...");
      const metadata = await fetchFromIPFS(metadataCID);

      console.log("Hashing metadata...");
      const metadataHashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(JSON.stringify(metadata))
      );
      const metadataHash = Array.from(new Uint8Array(metadataHashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      console.log("Uploading metadata hash to IPFS...");
      const metadataHashCID = await uploadToIPFS({
        hash: metadataHash,
      });

      console.log("Building transaction data...");
      const txData = {
        image: { cid: metadataCID, hash: metadataHash },
        uploader: walletAddress,
        license: {
          type: "CC-BY-4.0",
          repository:
            "https://gist.githubusercontent.com/cordt-sei/bbcc2356d3c8d7f6c2b8f2e082751fdc/raw/8b52e2120b8b6a4209b1ef3c89925a667c4903e2/license.txt",
          hash_of_full_text: metadataHashCID,
        },
      };

      console.log("Submitting transaction with data:", txData);
      const tx = {
        to: walletAddress,
        value: parseEther("0.0000000001"),
        data: `0x${Buffer.from(JSON.stringify(txData)).toString("hex")}`,
      };

      const transaction = await publicClient.sendTransaction({
        account: walletAddress,
        ...tx,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transaction,
      });

      setTransactionHash(receipt.transactionHash);
      alert(
        `Transaction submitted! View it at https://seistream.app/transactions/${receipt.transactionHash}`
      );
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
      {transactionHash && (
        <p>
          Transaction Hash:{" "}
          <a
            href={`https://seistream.app/transactions/${transactionHash}`}
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
