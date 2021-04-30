import { NextApiRequest, NextApiResponse } from "next";

import cheerio from "cheerio";
import axios from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(408).json({
      error: "Only POST method is allowed",
    });
  }

  const { minerId } = req.query;
  const body = req.body;
  console.log(body, minerId);
  let config = {
    coinType: "",
    blockReward: 0,
  };
  if (body) {
    const { coinType, blockReward } = JSON.parse(body);

    if (!coinType || !blockReward) {
      return res.status(405).json({
        error: "Missing either coinType or blockReward in request",
      });
    }

    config.coinType = coinType;
    config.blockReward = blockReward;
  }
  const URL = `https://${config.coinType}.darkfibermines.com`;

  // // Pull fresh data
  const page = await axios.get(URL).catch((e) => {
    throw new Error(e);
  });
  const scraper = cheerio.load(page.data);
  const miners: Record<string, number> = {};

  const table = cheerio.load(scraper(".poolWrapper").html());

  scraper("tr.pure-table-odd").each((i, e) => {
    const $ = cheerio;
    const tr = $(e).children();
    if ($(tr[0]).text().startsWith("t")) {
      miners[$(tr[0]).text()] = parseFloat($(tr[1]).text());
    }
  });

  let totalShares = 0;
  const highest: [string, number] = ["", 0];
  for (const miner of Object.keys(miners)) {
    const shares = miners[miner];
    if (shares > highest[1]) {
      highest[0] = miner;
      highest[1] = shares;
    }

    totalShares += shares;
  }

  // Catch missing miner id
  if (!miners[minerId as string]) {
    return res.status(404).json({ error: `Miner '${minerId}' not found` });
  }

  const myPercentage = miners[minerId as string] / totalShares;

  console.log("[total shares]", totalShares.toFixed(2));
  console.log(
    "[your share percentage / estimated payout]",
    myPercentage.toFixed(5) + "%",
    myPercentage * config.blockReward
  );

  res.json({
    shares: miners[minerId as string],
    totalShares,
    userPercentage: myPercentage.toFixed(5) + "%",
    estimatedPayout: myPercentage * config.blockReward,
  });
};
