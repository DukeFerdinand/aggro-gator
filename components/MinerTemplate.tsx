import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Reducer, useEffect, useReducer, useState } from "react";
import styles from "../styles/DarkFiber.module.css";
import { MinerPaymentTable } from "./MinerPayments";
import { MinerStatTable } from "./MinerStats";

export enum SupportedCoins {
  BTCZ = "btcz",
  BZE = "bze",
}

interface MinerTemplateProps {
  coinType: SupportedCoins;
  blockReward: number;
  displayName: string;
}

const MinerTemplate: React.FC<MinerTemplateProps> = ({
  coinType,
  blockReward,
  displayName,
}) => {
  const [miner, setMiner] = useState("");
  const router = useRouter();

  return (
    <main className={styles.wrapper}>
      <div className={styles.navbar}>
        <h1>DarkFiber {displayName} stat checker</h1>
        <Link href="/">
          <a>Home</a>
        </Link>
      </div>
      <div className={styles.upper}>
        <h2>We all love DarkFiber (unless you're a crow)</h2>
        <p>
          But some of the coins need a little touch of data or UX to get the
          most from our mining experience. These tool(s) aim to fix that!
        </p>
      </div>
      <div className={styles.container}>
        <h1>{displayName} payment stats</h1>
        {!router.query.miner ? (
          <>
            <label>Miner Id (NO .RigName or similar)</label>
            <input
              name="miner-id"
              value={miner}
              onInput={(e) => setMiner(e.currentTarget.value)}
              onPaste={(e) => setMiner(e.currentTarget.value)}
              placeholder="Your miner id/wallet"
            />
            <button
              onClick={() => router.push(`/darkfiber/${coinType}/${miner}`)}
              className={styles.checkButton}
            >
              Check Stats
            </button>
            <p>
              * This is only used to securely check your current stats, and is
              NEVER stored -{" "}
              <Link href="https://github.com/DukeFerdinand/aggro-gator/blob/master/pages/api/coins/stats.ts">
                <a>source</a>
              </Link>
            </p>
          </>
        ) : (
          <div>
            <MinerPaymentTable
              refetchAt={60}
              minerId={router.query.miner as string}
              coinDisplay={displayName}
              coinType={coinType}
            />
            <MinerStatTable
              refetchAt={15}
              blockReward={blockReward}
              minerId={router.query.miner as string}
              coinDisplay={displayName}
              coinType={coinType}
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default MinerTemplate;
