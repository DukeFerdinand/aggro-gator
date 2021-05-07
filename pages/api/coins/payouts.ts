import type { NextApiRequest, NextApiResponse } from "next";

export interface PayoutResponse {
  immature: string;
  owed: string;
  paid: string;
}

export interface WorkerStats {
  miner: string;
  totalHash: number; // likely float;
  totalShares: number; // likely float;
  networkSols: string; // string wrapped number;
  immature: number; // likely float;
  balance: number; // likely 0;
  paid: number; // likely float;
}

const BASE_URL =
  "https://{COIN_TYPE}.darkfibermines.com/api/worker_stats?{MINER_ID}";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(408).json({
      error: "Request method must be POST",
    });
  }

  const { minerId, coinType } = req.body;
  if (!minerId || !coinType) {
    return res.status(400).json({
      error: "Missing required minerId or coinType",
    });
  }

  const data: WorkerStats = await fetch(
    BASE_URL.replace("{COIN_TYPE}", coinType).replace("{MINER_ID}", minerId)
  ).then((res) => res.json());

  res.json({
    immature: data.immature.toFixed(5),
    owed: data.balance.toFixed(5),
    paid: data.paid.toFixed(5),
  } as PayoutResponse);
};
