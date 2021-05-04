import { NextPage } from "next";
import { QueryClient, QueryClientProvider } from "react-query";
import MinerTemplate, {
  SupportedCoins,
} from "../../../components/MinerTemplate";

const nonSharedQuery = new QueryClient();

const BtczHandler: NextPage = () => {
  return (
    <QueryClientProvider client={nonSharedQuery}>
      <MinerTemplate
        coinType={SupportedCoins.BTCZ}
        displayName="BtcZ"
        blockReward={12_500}
      />
    </QueryClientProvider>
  );
};

export default BtczHandler;
