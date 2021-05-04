import { NextApiRequest, NextApiResponse } from "next";

import cheerio from "cheerio";
import axios from "axios";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(408).json({
      error: "Only POST method is allowed",
    });
  }

  const body = req.body;
  let config = {
    coinType: "",
    blockReward: 0,
    minerId: "",
  };
  if (body) {
    const { coinType, blockReward, minerId } = JSON.parse(body);

    if (!coinType || !blockReward || !minerId) {
      return res.status(400).json({
        error: "Missing one of: coinType, blockReward, minerId in request",
      });
    }

    config.coinType = coinType;
    config.blockReward = blockReward;
    config.minerId = minerId;
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
  if (!miners[config.minerId]) {
    return res.status(404).json({
      error: `Miner '${config.minerId}' not found. Make sure you are using a ${config.coinType} wallet and DO NOT include your rig name!`,
    });
  }

  const myPercentage = miners[config.minerId] / totalShares;

  res.json({
    shares: miners[config.minerId],
    totalShares,
    userPercentage: (myPercentage * 100).toFixed(5) + "%",
    estimatedPayout: myPercentage * config.blockReward,
  });
};
