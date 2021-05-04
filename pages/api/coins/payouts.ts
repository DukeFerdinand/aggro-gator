import chrome from "chrome-aws-lambda";
import type { NextApiRequest, NextApiResponse } from "next";

import puppeteer from "puppeteer";

export interface PayoutResponse {
  immature: string;
  owed: string;
  paid: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(408).json({
      error: "Request method must be POST",
    });
  }
  const isDev = process.env.NODE_ENV === "development";
  const { minerId, coinType } = JSON.parse(req.body);
  if (!minerId) {
    return res.status(400).json({
      error: "Missing required minerId",
    });
  }

  // Everything good, perform check
  const browser = await puppeteer.launch(
    isDev
      ? undefined
      : {
          args: chrome.args,
          executablePath: await chrome.executablePath,
          headless: chrome.headless,
        }
  );
  const page = await browser.newPage();

  await page.goto(`https://${coinType}.darkfibermines.com/workers/${minerId}`);

  const data = await page.$$eval("#topCharts", async (e) => {
    return await new Promise<{}>((res, rej) => {
      let d = {
        immature: "0",
        owed: "0",
        paid: "0",
      };
      setTimeout(() => {
        const immature = document.querySelector<HTMLSpanElement>(
          "#statsTotalImmature"
        ).innerText;
        const owed = document.querySelector<HTMLSpanElement>("#statsTotalBal")
          .innerText;
        const paid = document.querySelector<HTMLSpanElement>("#statsTotalPaid")
          .innerText;

        res({
          immature,
          owed,
          paid,
        });
      }, 3000);
    });
  });

  res.json({
    ...data,
  });
};
