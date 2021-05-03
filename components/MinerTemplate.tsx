import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Reducer, useEffect, useReducer, useState } from "react";
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

interface MinerPayouts {
  immature: number;
  owed: number;
  paid: number;
}

enum MinerStateActions {
  SetMinerID,
  SetCoinStats,
  SetPayoutStats,

  // Intevals
  SetCoinInterval,
  SetPayoutInterval,

  // Error messages
  SetPayoutError,
  SetCoinStatError,

  // UI loaders
  SetLoadingStats,
  SetLoadingPayouts,
}

interface MinerState {
  // Data
  minerId: string;
  coinStats: PayoutAndShares;
  coinStatInterval: number;

  // Intervals
  payoutStats: MinerPayouts;
  payoutStatInterval: number;

  // Errors
  payoutError: string;
  coinStatError: string;

  // UI
  loadingStats: boolean;
  loadingPayouts: boolean;
}

interface MinerPayload<T = unknown> {
  type: MinerStateActions;
  payload: T;
}

const MinerTemplate: React.FC<MinerTemplateProps> = ({
  coinType,
  blockReward,
  displayName,
}) => {
  const [miner, setMiner] = useState("");
  const router = useRouter();

  const [state, dispatch] = useReducer<
    Reducer<Partial<MinerState>, MinerPayload>
  >((s, a) => {
    const MSA = MinerStateActions;
    switch (a.type) {
      // Data
      case MSA.SetMinerID:
        return { ...s, minerId: a.payload as string };
      case MSA.SetCoinStats:
        return { ...s, coinStats: a.payload as PayoutAndShares };
      case MSA.SetCoinStats:
        return { ...s, coinStats: a.payload as PayoutAndShares };
      case MSA.SetPayoutStats:
        return { ...s, payoutStats: a.payload as MinerPayouts };

      // UI
      case MSA.SetLoadingPayouts:
        return { ...s, loadingPayouts: a.payload as boolean };
      case MSA.SetLoadingStats:
        return { ...s, loadingStats: a.payload as boolean };

      // Intervals
      case MSA.SetCoinInterval:
        return { ...s, coinStatInterval: a.payload as number };
      case MSA.SetPayoutInterval:
        return { ...s, payoutStatInterval: a.payload as number };

      // Errors
      case MSA.SetPayoutError:
        return { ...s, payoutError: a.payload as string };
      case MSA.SetCoinStatError:
        return { ...s, coinStatError: a.payload as string };
    }
  }, {});

  const getMinerData = async () => {
    try {
      const data: PayoutAndShares & { error?: string } = await fetch(
        `/api/coins/stats`,
        {
          method: "POST",
          body: JSON.stringify({
            coinType,
            blockReward,
            minerId: state.minerId || router.query.miner,
          }),
        }
      ).then((r) => r.json());
      if (data.error) {
        throw new Error(data.error);
      }
      dispatch({
        type: MinerStateActions.SetCoinStatError,
        payload: "",
      });
      return data;
    } catch (e) {
      dispatch({
        type: MinerStateActions.SetCoinStatError,
        payload: e.message,
      });
    }

    return null;
  };

  const getMinerPayouts = async () => {
    try {
      const data: MinerPayouts & { error?: string } = await fetch(
        `/api/coins/payouts`,
        {
          method: "POST",
          body: JSON.stringify({
            minerId: state.minerId || router.query.miner,
            coinType,
          }),
        }
      ).then((r) => r.json());
      if (data.error) {
        throw new Error(data.error);
      }

      dispatch({
        type: MinerStateActions.SetPayoutError,
        payload: "",
      });
      return data;
    } catch (e) {
      dispatch({
        type: MinerStateActions.SetPayoutError,
        payload: e.message,
      });
    }

    return null;
  };

  useEffect(() => {
    const handler = async () => {
      if (router.query.miner) {
        // Coin stats
        if (!state.coinStats && !state.loadingStats && !state.coinStatError) {
          dispatch({
            type: MinerStateActions.SetLoadingStats,
            payload: true,
          });
          const stats = await getMinerData();
          dispatch({
            type: MinerStateActions.SetLoadingStats,
            payload: false,
          });
          dispatch({
            type: MinerStateActions.SetCoinStats,
            payload: stats,
          });
          if (stats) {
            const i = setInterval(async () => {
              dispatch({
                type: MinerStateActions.SetCoinStats,
                payload: await getMinerData(),
              });
            }, 1000 * 15);

            dispatch({
              type: MinerStateActions.SetCoinInterval,
              payload: i,
            });
          } else {
            if (state.coinStatInterval !== null) {
              clearInterval(state.coinStatInterval);
            }
          }
        }

        // Payment stats
        if (!state.payoutStats && !state.loadingPayouts && !state.payoutError) {
          dispatch({
            type: MinerStateActions.SetLoadingPayouts,
            payload: true,
          });
          const stats = await getMinerPayouts();
          dispatch({
            type: MinerStateActions.SetPayoutStats,
            payload: stats,
          });
          dispatch({
            type: MinerStateActions.SetLoadingPayouts,
            payload: false,
          });
          if (stats) {
            const i = setInterval(async () => {
              dispatch({
                type: MinerStateActions.SetPayoutStats,
                payload: await getMinerPayouts(),
              });
            }, 1000 * 60);

            dispatch({
              type: MinerStateActions.SetPayoutInterval,
              payload: i,
            });
          } else {
            if (state.payoutStatInterval !== null) {
              clearInterval(state.payoutStatInterval);
            }
          }
        }
      }
    };
    handler();

    return function cleanup() {
      clearInterval(state.payoutStatInterval);
      clearInterval(state.coinStatInterval);
    };
  }, [router, state]);

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
        {state.coinStatError !== "" && <h2>{state.coinStatError}</h2>}
        {state.payoutError !== "" && <h2>{state.payoutError}</h2>}
        {state.loadingStats ? (
          <p>loading...</p>
        ) : (
          <>
            {!state.coinStats ? (
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
                  {state.loadingStats ? "Loading..." : "Check"}
                </button>
                <p>
                  * This is only used to securely check your current stats, and
                  is NEVER stored -{" "}
                  <Link href="https://github.com/DukeFerdinand/aggro-gator/blob/master/pages/api/coins/stats.ts">
                    <a>source</a>
                  </Link>
                </p>
              </>
            ) : (
              <div>
                <h2>{displayName} payments (BETA)</h2>
                <table>
                  <colgroup>
                    <col />
                    <col />
                    <col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th colSpan={3}>Stats auto refresh every 60 seconds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Immature</th>
                      <td>{state.payoutStats?.immature}</td>
                      <td>Coins not yet confirmed</td>
                    </tr>
                    <tr>
                      <th>Owed</th>
                      <td>{state.payoutStats?.owed}</td>
                      <td>
                        The amount of coins Dark Fiber hasn't sent you yet
                      </td>
                    </tr>
                    <tr>
                      <th>Paid Out</th>
                      <td>{state.payoutStats?.paid}</td>
                      <td>The amount of coins already sent to your wallet</td>
                    </tr>
                  </tbody>
                </table>
                <h2>{displayName} stats</h2>
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
                      <td>{state.coinStats.totalShares.toFixed(5)}</td>
                      <td>The number of shares submitted by everyone</td>
                    </tr>
                    <tr>
                      <th>Your Shares</th>
                      <td>{state.coinStats.shares}</td>
                      <td>The number of shares you have submitted</td>
                    </tr>
                    <tr>
                      <th>Effort Percentage</th>
                      <td>{state.coinStats.userPercentage}</td>
                      <td>
                        The percentage of shares you have submitted relative to
                        total
                      </td>
                    </tr>
                    <tr>
                      <th>Payout (?)</th>
                      <td>
                        {state.coinStats.estimatedPayout.toFixed(6)}{" "}
                        {displayName}
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
