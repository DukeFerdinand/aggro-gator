import { NextPage } from "next";
import MinerTemplate, {
  SupportedCoins,
} from "../../../components/MinerTemplate";

const BtczHandler: NextPage = () => {
  return (
    <MinerTemplate
      coinType={SupportedCoins.BZE}
      displayName="Bze"
      // 12.675 = 19.5 - master node 6.825
      blockReward={12.675}
    />
  );
};

export default BtczHandler;
