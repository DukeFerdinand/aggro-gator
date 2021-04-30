import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "../styles/DarkFiber.module.css";

export enum SupportedCoins {
  BTCZ = "btcz",
  BZE = "bze",
}

interface PayoutAndShares {
  estimatedPayout: number;
  shares: number;
  totalShares: number;
  userPercentage: string;
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
  const [coinStats, setCoinStats] = useState<PayoutAndShares | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [interval, setLocalInterval] = useState(null);
  const [error, setError] = useState("");

  const getMinerData = async () => {
    setError("");
    try {
      const data: PayoutAndShares & { error?: string } = await fetch(
        `/api/coins/${router.query.miner as string}`,
        {
          method: "POST",
          body: JSON.stringify({
            coinType,
            blockReward,
          }),
        }
      ).then((r) => r.json());
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    const handler = async () => {
      if (router.query.miner && !coinStats) {
        setLoading(true);
        const stats = await getMinerData();
        setCoinStats(stats);

        setLoading(false);
        if (!error) {
          const i = setInterval(async () => {
            setCoinStats(await getMinerData());
          }, 1000 * 15);

          setLocalInterval(i);
        } else {
          if (interval !== null) {
            clearInterval(interval);
          }
        }
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
        <h1>DarkFiber coin stat checker</h1>
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
        <h1>{displayName} stats</h1>
        {error !== "" && <h2>{error}</h2>}
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
                  onClick={() => router.push(`/darkfiber/${coinType}/${miner}`)}
                  className={styles.checkButton}
                >
                  {loading ? "Loading..." : "Check"}
                </button>
                <p>
                  * This is only used to securely check your current stats, and
                  is NEVER stored -{" "}
                  <Link href="https://github.com/DukeFerdinand/aggro-gator/blob/master/pages/api/coins/%5B...minerId%5D.ts">
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
                      <th colSpan={3}>Stats auto refresh every 15 seconds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Group Shares</th>
                      <td>{coinStats.totalShares.toFixed(5)}</td>
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
                      <td>
                        {coinStats.estimatedPayout.toFixed(6)} {displayName}
                      </td>
                      <td>
                        The <i>estimated</i> payout. Assumes {blockReward} block
                        reward and is relative to the amount of miners ONLINE.
                        May not be exact, may not be accurate. Should only be
                        used for reference
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

export default MinerTemplate;
