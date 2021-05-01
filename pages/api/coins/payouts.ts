import type { NextApiRequest, NextApiResponse } from "next";

import puppeteer from "puppeteer";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(408).json({
      error: "Request method must be POST",
    });
  }
  const { minerId } = JSON.parse(req.body);
  if (!minerId) {
    return res.status(400).json({
      error: "Missing required minerId",
    });
  }

  // Everything good, perform check
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`https://bze.darkfibermines.com/workers/${minerId}`);

  const data = await page.$$eval("#topCharts", async (e) => {
    let d = {
      immature: "0",
      owed: "0",
      paid: "0",
    };
    await new Promise<void>((res, rej) => {
      setTimeout(() => {
        const immature = document.querySelector("#statsTotalImmature")
          .textContent;
        const owed = document.querySelector("#statsTotalBal").textContent;
        const paid = document.querySelector("#statsTotalPaid").textContent;
        d.immature = immature;
        d.owed = owed;
        d.paid = paid;

        res();
      }, 1000);
    });

    return d;
  });

  res.json({
    ...data,
  });
};
