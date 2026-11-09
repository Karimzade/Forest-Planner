import { useLanguage } from "./Language";
import React, { useState, useCallback } from "react";
import { today, uid, balance, earned } from "./helpers";
import { usePlanner } from "./context";
import Stat from "./Stat";
import RewardCelebration from "./RewardCelebration";

export default function Rewards() {
  const { t, number, formatDate } = useLanguage();
  const { data, dispatch, notify } = usePlanner();
  const [title, setTitle] = useState("");
  const [changing, setChanging] = useState(false);
  const [cost, setCost] = useState(200);
  const [celebration, setCelebration] = useState(null);
  const closeCelebration = useCallback(() => setCelebration(null), []);
  const available = balance(data);
  const reward = data.reward;
  function save(e) {
    e.preventDefault();
    if (!title.trim()) return;
    dispatch({
      type: "reward",
      reward: { title: title.trim(), cost: Number(cost) },
    });
    setChanging(false);
    notify("Your next reward is saved.");
  }
  return (
    <>
      {celebration && (
        <RewardCelebration
          key={celebration.id}
          title={celebration.title}
          onClose={closeCelebration}
        />
      )}
      <div className="page-heading">
        <span className="eyebrow dark">{t("CELEBRATE YOUR EFFORT")}</span>
        <h1>{t("Give yourself something to look forward to.")}</h1>
        <p>
          {t("Every completed activity brings your reward a little closer.")}
        </p>
      </div>
      <section className="stats-grid">
        <Stat
          label={t("Spendable points")}
          value={number(available)}
          icon="✦"
          gold
        />
        <Stat
          label={t("Total points earned")}
          value={number(earned(data))}
          icon="↗"
        />
        <Stat
          label={t("Points spent")}
          value={number(earned(data) - available)}
          icon="♧"
        />
        <Stat
          label={t("Your rewards")}
          value={number(data.history.length)}
          icon="✓"
        />
      </section>
      <section className="panel reward-panel">
        {reward && !changing ? (
          <>
            <span className="reward-icon">♧</span>
            <span className="eyebrow dark">{t("YOUR NEXT REWARD")}</span>
            <h2>{reward.title}</h2>
            <p>
              {number(available)} {t("of")} {number(reward.cost)}{" "}
              {t("Points")}{" "}
            </p>
            <progress
              value={Math.min(available, reward.cost)}
              max={reward.cost}
            />
            <p>
              {available >= reward.cost
                ? t("Time to celebrate!")
                : t("pointsRemaining", { n: number(reward.cost - available) })}
            </p>
            <button
              className="gold"
              disabled={available < reward.cost}
              onClick={() => {
                if (!reward || available < reward.cost) return;
                const claimId = uid();
                setCelebration({ id: claimId, title: reward.title });
                dispatch({ type: "claim", id: claimId, date: today() });
                notify("Reward claimed! Set your next reward.");
              }}
            >
              {" "}
              {t("Claim reward")}{" "}
            </button>
            <button
              className="text-button"
              onClick={() => {
                setTitle(reward.title);
                setCost(reward.cost);
                setChanging(true);
              }}
            >
              {" "}
              {t("Change reward")}{" "}
            </button>
          </>
        ) : (
          <form onSubmit={save} className="reward-form">
            <span className="reward-icon">♧</span>
            <h2>{t("What is your next reward?")}</h2>
            <label>
              {" "}
              {t("Reward name")}{" "}
              <input
                required
                maxLength={100}
                placeholder={t("For example, a movie night")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              {" "}
              {t("Points required")}{" "}
              <input
                type="number"
                required
                min="1"
                max="1000000"
                step="1"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </label>
            <button className="primary" type="submit">
              {" "}
              {t("Save reward")}{" "}
            </button>
            {reward && (
              <button
                type="button"
                className="outline"
                onClick={() => setChanging(false)}
              >
                {" "}
                {t("Cancel")}{" "}
              </button>
            )}
          </form>
        )}
        <small>
          {" "}
          {t(
            "Claiming a reward deducts its cost. Any extra points stay in your balance.",
          )}{" "}
        </small>
      </section>
      <section className="panel spaced">
        <h2>{t("Reward history")}</h2>
        {data.history.length ? (
          data.history.map((r) => (
            <div className="history-row" key={r.id}>
              <span>♧ {r.title}</span>
              <small>
                {formatDate(r.date)} · {number(r.cost)} {t("Points")}{" "}
              </small>
            </div>
          ))
        ) : (
          <p className="muted">{t("Your first reward will appear here.")}</p>
        )}
      </section>
    </>
  );
}
