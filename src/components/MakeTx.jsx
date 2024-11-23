// MakeTx.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import { parseEther } from "viem";
import { fetchFromIPFS, uploadToIPFS } from "../utils/ipfs";
import { Buffer } from "buffer";

export const MakeTx = ({ metadataCID, walletAddress, walletClient }) => {
  console.log("MakeTx Props:", { metadataCID, walletAddress, walletClient });

  // Validate props
  if (!metadataCID || !walletAddress || !walletClient) {
    console.error("Missing props in MakeTx:", {
      metadataCID,
      walletAddress,
      walletClient,
    });
    return null;
  }

  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for better UX.

  const handleSubmit = async () => {
    if (!metadataCID || !walletAddress || !walletClient) {
      alert(
        "Please ensure you have connected your wallet, entered a Metadata CID, and selected a license."
      );
      return;
    }

    try {
      setLoading(true); // Disable button during submission.
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

      console.log("Preparing transaction...");
      const tx = {
        to: walletAddress,
        value: parseEther("0.0000000001"),
        data: `0x${Buffer.from(JSON.stringify(txData)).toString("hex")}`,
      };

      console.log("Signing and sending transaction...");
      const signedTransaction = await walletClient.signTransaction(tx); // Use walletClient for signing.
      const transactionHash = await walletClient.sendSignedTransaction(signedTransaction); // Send signed transaction.

      console.log("Waiting for transaction receipt...");
      const receipt = await walletClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      setTransactionHash(receipt.transactionHash);
      alert(
        `Transaction submitted! View it at https://seistream.app/transactions/${receipt.transactionHash}`
      );
    } catch (error) {
      console.error("Error submitting transaction:", error);
      alert("An error occurred while submitting the transaction.");
    } finally {
      setLoading(false); // Re-enable button after completion.
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

MakeTx.propTypes = {
  metadataCID: PropTypes.string.isRequired,
  walletAddress: PropTypes.string.isRequired,
  walletClient: PropTypes.object.isRequired,
};
