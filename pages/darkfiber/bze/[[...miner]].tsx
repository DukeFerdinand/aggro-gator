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
        coinType={SupportedCoins.BZE}
        displayName="Bze"
        // 12.675 = 19.5 - master node 6.825
        blockReward={12.675}
      />
    </QueryClientProvider>
  );
};

export default BtczHandler;
