import { NextPage } from "next";
import MinerTemplate, {
  SupportedCoins,
} from "../../../components/MinerTemplate";

const BtczHandler: NextPage = () => {
  return (
    <MinerTemplate
      coinType={SupportedCoins.BTCZ}
      displayName="BtcZ"
      blockReward={12_5000}
    />
  );
};

export default BtczHandler;
