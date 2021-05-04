import React from "react";
import { useQuery } from "react-query";
import { SupportedCoins } from "./MinerTemplate";
import { StatTable } from "./StatTable";

interface MinerStatTableProps {
  minerId: string;
  coinDisplay: string;
  coinType: SupportedCoins;
  blockReward: number;
  refetchAt: number;
}

interface MinerShares {
  estimatedPayout: number;
  shares: number;
  totalShares: number;
  userPercentage: string;
}

export const MinerStatTable: React.FC<MinerStatTableProps> = ({
  minerId,
  blockReward,
  coinDisplay,
  coinType,
  refetchAt,
}) => {
  const { data, isLoading, error } = useQuery<MinerShares, Error>(
    "miner-stats",
    async () => {
      const data: MinerShares & { error: string } = await fetch(
        `/api/coins/stats`,
        {
          method: "POST",
          body: JSON.stringify({
            minerId,
            coinType,
            blockReward,
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

  console.log(error);

  if (error) {
    return (
      <div>
        Error loading miner stats <p>{error.message}</p>
        <p>If this persists, please contact @DukeFerdinand in the Discord</p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading miner stats...</div>;
  }

  const rows: Record<keyof MinerShares, (string | number)[]> = {
    estimatedPayout: [],
    shares: [],
    totalShares: [],
    userPercentage: [],
  };

  if (data) {
    rows.totalShares = [
      data.totalShares.toFixed(2),
      "All shares the group has submitted",
    ];
    rows.shares = [data.shares.toFixed(2), "The shares you have submitted"];
    rows.estimatedPayout = [
      data.estimatedPayout.toFixed(5),
      "The amount you would receive based on currently online miners (does not account for offline)",
    ];
    rows.userPercentage = [
      data.userPercentage,
      "Percentage your shares to group shares",
    ];
  }

  return (
    <StatTable
      id={`${coinDisplay}-payments`}
      title={`${coinDisplay} Stats`}
      rows={rows}
      autoRefresh={refetchAt}
    />
  );
};
