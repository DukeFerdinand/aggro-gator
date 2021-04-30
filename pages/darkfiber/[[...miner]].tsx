import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../../styles/DarkFiber.module.css";

enum SupportedCoins {
  BtcZ,
}

interface PayoutAndShares {
  estimatedPayout: number;
  shares: number;
  totalShares: number;
  userPercentage: string;
}

const DarkFiber: NextPage = () => {
  const [miner, setMiner] = useState("");
  const [coinStats, setCoinStats] = useState<PayoutAndShares | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [interval, setLocalInterval] = useState(null);

  const getMinerData = async () => {
    const data: PayoutAndShares = await fetch(
      `/api/btcz/${router.query.miner as string}`
    ).then((r) => r.json());
    return data;
  };

  useEffect(() => {
    const handler = async () => {
      if (router.query.miner && !coinStats) {
        setLoading(true);
        const stats = await getMinerData();
        setCoinStats(stats);

        setLoading(false);
        const i = setInterval(async () => {
          setCoinStats(await getMinerData());
        }, 1000 * 15);

        setLocalInterval(i);
      }
    };
    handler();

    return function cleanup() {
      clearInterval(interval);
    };
  }, [router, coinStats]);

  return (
    <main className={styles.wrapper}>
      <div className={styles.navbar}>
        <h1>DarkFiber BtcZ stat checker</h1>
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
        <h1>BtcZ stat checker</h1>
        {loading ? (
          <p>loading...</p>
        ) : (
          <>
            {!coinStats ? (
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
                  onClick={() => router.push(`/darkfiber/${miner}`)}
                  className={styles.checkButton}
                >
                  {loading ? "Loading..." : "Check"}
                </button>
                <p>
                  * This is only used to securely check your current stats, and
                  is NEVER stored -{" "}
                  <Link href="https://github.com/DukeFerdinand/aggro-gator/blob/master/pages/api/btcz/%5B...minerId%5D.ts">
                    <a>source</a>
                  </Link>
                </p>
              </>
            ) : (
              <div>
                <table>
                  <colgroup>
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th colSpan={3}>Stats refresh every 15 seconds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Group Shares</th>
                      <td>{coinStats.totalShares}</td>
                      <td>The number of shares submitted by everyone</td>
                    </tr>
                    <tr>
                      <th>Your Shares</th>
                      <td>{coinStats.shares}</td>
                      <td>The number of shares you have submitted</td>
                    </tr>
                    <tr>
                      <th>Effort Percentage</th>
                      <td>{coinStats.userPercentage}</td>
                      <td>
                        The percentage of shares you have submitted relative to
                        total
                      </td>
                    </tr>
                    <tr>
                      <th>Payout (?)</th>
                      <td>{coinStats.estimatedPayout.toFixed(6)} BtcZ</td>
                      <td>
                        The <i>estimated</i> payout. Assumes 12.5k block reward
                        and is relative to the amount of miners ONLINE. May not
                        be exact, may not be accurate. Should only be used for
                        reference
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default DarkFiber;
