import type { Request, Response } from "express";
import chrome from "chrome-aws-lambda";
import puppeteer from "puppeteer";

export const payoutsFunction = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(408).json({
      error: "Request method must be POST",
    });
  }
  const isDev = process.env.NODE_ENV === "development";
  const { minerId, coinType } = req.body;
  if (!minerId) {
    return res.status(400).json({
      error: "Missing required minerId",
    });
  }

  // Everything good, perform check
  const browser = await puppeteer.launch(
    isDev
      ? { headless: true }
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
