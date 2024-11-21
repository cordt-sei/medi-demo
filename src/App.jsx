import { WalletConnect } from "./components/WalletConnect";
import UploadForm from "./components/UploadForm";
import TransactionTracker from "./components/TransactionTracker";

const App = () => {
  const [metadataCID, setMetadataCID] = useState("");
  const [txHash, setTxHash] = useState("");

  return (
    <WalletConnect>
      <div>
        <h1>IPFS Metadata Manager</h1>
        <UploadForm setMetadataCID={setMetadataCID} walletAddress="0xYourWalletAddress" />
        <TransactionTracker txHash={txHash} />
      </div>
    </WalletConnect>
  );
};

export default App;
