import React, { useState } from "react";
import { useAccount, useSigner } from "viem";
import { uploadJsonToIPFS } from "../utils/ipfs";
import { hashFile } from "../utils/hash";
import LicenseMenu from "./LicenseMenu";
import { ethers } from "ethers";

const UploadForm = () => {
  const { address: walletAddress } = useAccount(); // Get wallet address from Wagmi
  const { data: signer } = useSigner(); // Get the signer from Wagmi

  const [cid, setCid] = useState("");
  const [hash, setHash] = useState("");
  const [license, setLicense] = useState(null);
  const [metadataCID, setMetadataCID] = useState("");

  const verifyCID = async () => {
    try {
      const fetchedFile = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      const fileBlob = await fetchedFile.blob();
      const calculatedHash = await hashFile(fileBlob);
      if (calculatedHash !== hash) {
        alert("Hash verification failed!");
        return false;
      }
      alert("CID and Hash verified successfully!");
      return true;
    } catch (error) {
      console.error("Verification error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet.");
      return;
    }

    const isVerified = await verifyCID();
    if (!isVerified) return;

    try {
      const metadata = {
        image: { cid: `ipfs://${cid}`, hash },
        uploader: walletAddress,
        license: {
          type: license.type,
          license_file: "ipfs-cid-of-license", // Replace with license upload logic
          hash_of_full_text: await hashFile(new Blob([license.content])),
        },
      };

      // Upload metadata JSON to IPFS
      const metadataCID = await uploadJsonToIPFS(metadata);
      setMetadataCID(metadataCID);

      // Add metadataCID as a memo in the blockchain transaction
      const tx = {
        to: "0x0000000000000000000000000000000000000000", // Burn address
        value: ethers.utils.parseEther("0.00001"), // Minimal cost transaction
        data: ethers.utils.toUtf8Bytes(`ipfs://${metadataCID}`), // Memo
      };

      const transaction = await signer.sendTransaction(tx);
      alert(`Transaction submitted! Hash: ${transaction.hash}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit metadata and transaction.");
    }
  };

  return (
    <div>
      <h3>Upload Metadata</h3>
      <input
        type="text"
        placeholder="IPFS CID"
        onChange={(e) => setCid(e.target.value)}
      />
      <input
        type="text"
        placeholder="File Hash"
        onChange={(e) => setHash(e.target.value)}
      />
      <LicenseMenu onSelect={setLicense} />
      <button onClick={handleSubmit} disabled={!walletAddress}>
        Submit
      </button>
      {metadataCID && (
        <p>
          Metadata CID: <a href={`https://gateway.pinata.cloud/ipfs/${metadataCID}`} target="_blank" rel="noopener noreferrer">{metadataCID}</a>
        </p>
      )}
    </div>
  );
};

export default UploadForm;
