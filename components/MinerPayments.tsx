import React from "react";
import { useQuery } from "react-query";
import { SupportedCoins } from "./MinerTemplate";
import { StatTable } from "./StatTable";

interface MinerPaymentTableProps {
  minerId: string;
  coinDisplay: string;
  coinType: SupportedCoins;
  refetchAt: number;
}

interface MinerPayouts {
  immature: number;
  owed: number;
  paid: number;
}

export const MinerPaymentTable: React.FC<MinerPaymentTableProps> = ({
  minerId,
  coinDisplay,
  coinType,
  refetchAt,
}) => {
  const { data, isLoading, error } = useQuery<MinerPayouts, Error>(
    "miner-payments",
    async () => {
      const data: MinerPayouts & { error: string } = await fetch(
        `/api/coins/payouts`,
        {
          method: "POST",
          body: JSON.stringify({
            minerId,
            coinType,
          }),
        }
      ).then((r) => r.json());
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    },
    {
      refetchInterval: refetchAt * 1000,
    }
  );

  if (error) {
    return (
      <div>
        Error loading payment table: <p>{error.message}</p>
        <p>If this persists, please contact @DukeFerdinand in the Discord</p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading payment data...</div>;
  }

  const rows: Record<keyof MinerPayouts, (string | number)[]> = {
    immature: [],
    owed: [],
    paid: [],
  };

  if (data) {
    (Object.keys(data) as Array<keyof MinerPayouts>).forEach((key) => {
      if (key === "immature") {
        rows.immature = [
          data[key],
          "The amount of coins still locked in unconfirmed blocks",
        ];
      }
      if (key === "owed") {
        rows.owed = [
          data[key],
          "The amount of coins Dark Fiber has not sent out",
        ];
      }
      if (key === "paid") {
        rows.paid = [
          data[key],
          "The amount of coins already sent to your wallet",
        ];
      }
    });
  }

  return (
    <StatTable
      id={`${coinDisplay}-payments`}
      title={`${coinDisplay} Payments`}
      rows={rows}
      autoRefresh={refetchAt}
    />
  );
};
