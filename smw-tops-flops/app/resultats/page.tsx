"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const medals = ["🥇", "🥈", "🥉"];

type PublicMatch = {
  id: string;
  status: string;
};

type Result = {
  player_id: string;
  player_name: string;
  top_points: number;
  top1_count: number;
  top2_count: number;
  top3_count: number;
  flop_count: number;
  is_ghost: boolean;
};

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      setErrorMessage("");

      const [matchesResponse, resultsResponse] = await Promise.all([
        supabase.rpc("get_public_matches"),
        supabase.rpc("get_latest_results"),
      ]);

      if (matchesResponse.error) {
        setErrorMessage(matchesResponse.error.message);
        setLoading(false);
        return;
      }

      if (resultsResponse.error) {
        setErrorMessage(resultsResponse.error.message);
        setLoading(false);
        return;
      }

      const matches = (matchesResponse.data || []) as PublicMatch[];
      const currentMatchIsOpen = matches.some(
        (match) => match.status === "open"
      );

      setBlocked(currentMatchIsOpen);
      setResults((resultsResponse.data || []) as Result[]);
      setLoading(false);
    }

    loadResults();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <h2>Résultats</h2>
        <p className="muted">Chargement des résultats...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="card">
        <h2>Résultats</h2>
        <div className="msg err">{errorMessage}</div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="gate">
        Les votes doivent être clôturés avant de pouvoir accéder aux résultats.
      </div>
    );
  }

  const tops = [...results]
    .filter((result) => Number(result.top_points) > 0)
    .sort(
      (a, b) =>
        Number(b.top_points) - Number(a.top_points) ||
        Number(b.top1_count) - Number(a.top1_count) ||
        a.player_name.localeCompare(b.player_name)
    );

  const flops = [...results]
    .filter((result) => Number(result.flop_count) > 0)
    .sort(
      (a, b) =>
        Number(b.flop_count) - Number(a.flop_count) ||
        a.player_name.localeCompare(b.player_name)
    );

  const ghosts = [...results]
    .filter((result) => result.is_ghost === true)
    .sort((a, b) => a.player_name.localeCompare(b.player_name));

  return (
    <>
      <h2>Résultats du dernier match clôturé</h2>

      <div className="resultsThreeColumns">
        <section className="resultColumn resultColumnTop">
          <h3>🏆 Tops</h3>
          {tops.length === 0 ? (
            <p className="muted">Aucun Top pour ce match.</p>
          ) : (
            tops.map((result, index) => (
              <div
                className={index < 3 ? "rankingRow podiumTop" : "rankingRow"}
                key={result.player_id}
              >
                <span className="rank">
                  {index < 3 ? medals[index] : `${index + 1}.`}
                </span>
                <div className="rankingContent">
                  <strong>{result.player_name}</strong>
                  <small>
                    <b>{result.top_points} pts</b>
                    <br />
                    Top 1 : {result.top1_count} • Top 2 : {result.top2_count} • Top 3 : {result.top3_count}
                  </small>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="resultColumn resultColumnFlop">
          <h3>🤡 Flops</h3>
          {flops.length === 0 ? (
            <p className="muted">Aucun Flop pour ce match.</p>
          ) : (
            flops.map((result, index) => (
              <div
                className={index < 3 ? "rankingRow podiumFlop" : "rankingRow"}
                key={result.player_id}
              >
                <span className="rank">
                  {index < 3 ? medals[index] : `${index + 1}.`}
                </span>
                <div className="rankingContent">
                  <strong>{result.player_name}</strong>
                  <small>
                    <b>{result.flop_count}</b>{" "}
                    {Number(result.flop_count) > 1 ? "flops" : "flop"}
                  </small>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="resultColumn resultColumnGhost">
          <h3>👻 Fantômes</h3>
          {ghosts.length === 0 ? (
            <p className="muted">Aucun fantôme pour ce match.</p>
          ) : (
            ghosts.map((result) => (
              <div className="rankingRow ghostRow" key={result.player_id}>
                <span className="rank">👻</span>
                <div className="rankingContent">
                  <strong>{result.player_name}</strong>
                  <small>Aucune nomination</small>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
