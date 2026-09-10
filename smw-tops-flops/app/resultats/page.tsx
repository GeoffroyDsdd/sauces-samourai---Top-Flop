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

      const matches =
        (matchesResponse.data || []) as PublicMatch[];

      setBlocked(
        matches.some((match) => match.status === "open")
      );

      setResults(
        (resultsResponse.data || []) as Result[]
      );

      setLoading(false);
    }

    loadResults();
  }, []);

  if (loading) {
    return (
      <div className="resultsMessage">
        <h2>Résultats</h2>
        <p>Chargement des résultats...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="resultsMessage">
        <h2>Résultats</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="resultsMessage">
        Les votes doivent être clôturés avant d’accéder aux
        résultats.
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
    .sort((a, b) =>
      a.player_name.localeCompare(b.player_name)
    );

  return (
    <div className="resultsPage">
      <h2 className="resultsTitle">
        Résultats du dernier match clôturé
      </h2>

      <div className="resultsGrid">
        <div className="resultsCategory topCategory">
          <h3>🏆 Tops</h3>

          {tops.length === 0 ? (
            <p className="emptyResult">
              Aucun Top pour ce match.
            </p>
          ) : (
            tops.map((result, index) => (
              <div
                className="resultPlayer"
                key={result.player_id}
              >
                <div className="resultMainLine">
                  <span className="resultPosition">
                    {index < 3
                      ? medals[index]
                      : `${index + 1}.`}
                  </span>

                  <span className="resultName">
                    {result.player_name}
                  </span>

                  <span className="resultTotal topTotal">
                    {result.top_points} pts
                  </span>
                </div>

                <div className="resultDetails">
                  Top 1 : {result.top1_count}
                  <span>•</span>
                  Top 2 : {result.top2_count}
                  <span>•</span>
                  Top 3 : {result.top3_count}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="resultsCategory flopCategory">
          <h3>🤡 Flops</h3>

          {flops.length === 0 ? (
            <p className="emptyResult">
              Aucun Flop pour ce match.
            </p>
          ) : (
            flops.map((result, index) => (
              <div
                className="resultPlayer"
                key={result.player_id}
              >
                <div className="resultMainLine">
                  <span className="resultPosition">
                    {index < 3
                      ? medals[index]
                      : `${index + 1}.`}
                  </span>

                  <span className="resultName">
                    {result.player_name}
                  </span>

                  <span className="resultTotal flopTotal">
                    {result.flop_count}{" "}
                    {Number(result.flop_count) > 1
                      ? "flops"
                      : "flop"}
                  </span>
                </div>

                <div className="resultDetails">
                  Total Flop : {result.flop_count}
                  <span>•</span>
                  Points Flop : -{result.flop_count}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="resultsCategory ghostCategory">
          <h3>👻 Fantômes</h3>

          {ghosts.length === 0 ? (
            <p className="emptyResult">
              Aucun fantôme pour ce match.
            </p>
          ) : (
            ghosts.map((result, index) => (
              <div
                className="resultPlayer"
                key={result.player_id}
              >
                <div className="resultMainLine">
                  <span className="resultPosition">
                    {index + 1}.
                  </span>

                  <span className="resultName">
                    {result.player_name}
                  </span>

                  <span className="resultTotal ghostTotal">
                    👻
                  </span>
                </div>

                <div className="resultDetails">
                  Aucune nomination comme Top ou Flop
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .resultsPage {
          width: 100%;
        }

        .resultsTitle {
          margin: 0 0 34px;
          color: #780b20;
          font-size: clamp(2rem, 3vw, 2.8rem);
        }

        .resultsGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr)
            minmax(0, 1fr);
          align-items: start;
          gap: 24px;
          width: 100%;
        }

        .resultsCategory {
          min-width: 0;
          padding: 28px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(200, 16, 46, 0.16);
          border-radius: 22px;
          box-shadow: 0 16px 38px rgba(120, 11, 32, 0.1);
        }

        .topCategory {
          border-top: 8px solid #e4b44c;
        }

        .flopCategory {
          border-top: 8px solid #c8102e;
        }

        .ghostCategory {
          border-top: 8px solid #777777;
        }

        .resultsCategory h3 {
          margin: 0 0 26px;
          color: #780b20;
          font-size: 1.9rem;
          text-align: center;
        }

        .resultPlayer {
          margin-bottom: 16px;
          padding: 18px 20px;
          background: #fff8ef;
          border: 1px solid rgba(120, 11, 32, 0.13);
          border-radius: 15px;
        }

        .resultPlayer:last-child {
          margin-bottom: 0;
        }

        .resultMainLine {
          display: grid;
          grid-template-columns: 55px minmax(0, 1fr) auto;
          align-items: center;
          column-gap: 18px;
          width: 100%;
        }

        .resultPosition {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 55px;
          color: #780b20;
          font-size: 1.65rem;
          font-weight: 900;
        }

        .resultName {
          min-width: 0;
          color: #20181a;
          font-size: 1.4rem;
          font-weight: 900;
          line-height: 1.25;
        }

        .resultTotal {
          margin-left: 18px;
          padding: 7px 12px;
          white-space: nowrap;
          font-size: 1.15rem;
          font-weight: 900;
          border-radius: 10px;
        }

        .topTotal {
          color: #6a4600;
          background: rgba(228, 180, 76, 0.27);
        }

        .flopTotal {
          color: #8b0d24;
          background: rgba(200, 16, 46, 0.13);
        }

        .ghostTotal {
          color: #555555;
          background: rgba(100, 100, 100, 0.13);
        }

        .resultDetails {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 13px;
          padding-left: 73px;
          color: rgba(32, 24, 26, 0.78);
          font-size: 1.07rem;
          font-weight: 650;
          line-height: 1.55;
        }

        .resultDetails span {
          color: #c8102e;
          font-weight: 900;
        }

        .emptyResult {
          color: rgba(32, 24, 26, 0.68);
          font-size: 1.1rem;
          text-align: center;
        }

        .resultsMessage {
          padding: 30px;
          color: #780b20;
          font-size: 1.15rem;
          font-weight: 800;
          background: white;
          border-top: 6px solid #c8102e;
          border-radius: 20px;
        }

        @media (max-width: 1050px) {
          .resultsGrid {
            grid-template-columns: repeat(3, minmax(320px, 1fr));
            overflow-x: auto;
            padding-bottom: 14px;
          }

          .resultsCategory {
            min-width: 320px;
          }
        }

        @media (max-width: 650px) {
          .resultsGrid {
            grid-template-columns: repeat(3, minmax(290px, 1fr));
          }

          .resultsCategory {
            min-width: 290px;
            padding: 20px;
          }

          .resultMainLine {
            grid-template-columns: 44px minmax(0, 1fr) auto;
            column-gap: 10px;
          }

          .resultPosition {
            min-width: 44px;
            font-size: 1.35rem;
          }

          .resultName {
            font-size: 1.18rem;
          }

          .resultTotal {
            margin-left: 8px;
            padding: 6px 8px;
            font-size: 0.98rem;
          }

          .resultDetails {
            padding-left: 54px;
            font-size: 0.96rem;
          }
        }
      `}</style>
    </div>
  );
}