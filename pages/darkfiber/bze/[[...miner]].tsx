import { NextPage } from "next";
import MinerTemplate, {
  SupportedCoins,
} from "../../../components/MinerTemplate";

const BtczHandler: NextPage = () => {
  return (
    <MinerTemplate
      coinType={SupportedCoins.BZE}
      displayName="Bze"
      blockReward={19.5}
    />
  );
};

export default BtczHandler;
