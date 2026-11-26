import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CHECK_URL, HISTORY_URL } from "../config";
import { removeTokens } from "../auth";
import { authFetch, authPost } from "../authPost";
import type { HistoryEntry } from "../types";
import "./history.css";

// Turns "SOCIAL_ENGINEERING" into "social engineering"
function threatName(threatType: string): string {
  return threatType.replace(/_/g, " ").toLowerCase();
}

function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // The id of the entry that is being re-checked or deleted right now
  const [busyId, setBusyId] = useState<number | null>(null);

  const navigate = useNavigate();

  // Load the first page when the page opens
  useEffect(() => {
    async function loadFirstPage() {
      try {
        const response = await authFetch(HISTORY_URL + "?page=1", "GET");

        if (response.status === 401) {
          removeTokens();
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Could not load your history.");
        } else {
          setEntries(data.checks);
          setHasMore(data.hasMore);
        }
      } catch {
        setError("Could not reach the server. Is the backend running?");
      }

      setPageLoading(false);
    }

    loadFirstPage();
  }, [navigate]);

  // ---------- Load more ----------
  async function handleLoadMore() {
    setActionError("");
    setLoadingMore(true);

    const nextPage = page + 1;

    try {
      const response = await authFetch(HISTORY_URL + "?page=" + nextPage, "GET");

      if (response.status === 401) {
        removeTokens();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setActionError(data.message || "Could not load more entries.");
      } else {
        // Do not add an entry that is already on the page
        const newEntries = data.checks.filter(
          (check: HistoryEntry) => !entries.some((entry) => entry.id === check.id),
        );
        setEntries([...entries, ...newEntries]);
        setPage(nextPage);
        setHasMore(data.hasMore);
      }
    } catch {
      setActionError("Could not reach the server. Is the backend running?");
    }

    setLoadingMore(false);
  }

  // ---------- View ----------
  function handleView(entry: HistoryEntry) {
    // The result page shows the saved result
    navigate("/result", {
      state: {
        result: {
          url: entry.url,
          isSafe: entry.isSafe,
          status: entry.status,
          threats: entry.threats,
        },
      },
    });
  }

  // ---------- Re-check (update) ----------
  async function handleRecheck(entry: HistoryEntry) {
    setActionError("");
    setBusyId(entry.id);

    try {
      // The check route updates the saved entry for this link
      const response = await authPost(CHECK_URL, { url: entry.url });

      if (response.status === 401) {
        removeTokens();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setActionError(data.message || "Could not check the link. Please try again.");
      } else {
        const updatedEntry: HistoryEntry = {
          id: entry.id,
          url: entry.url,
          isSafe: data.data.isSafe,
          status: data.data.status,
          threats: data.data.threats || [],
          checkedAt: new Date().toISOString(),
        };

        // Show the updated entry at the top, because it was checked most recently
        setEntries([updatedEntry, ...entries.filter((item) => item.id !== entry.id)]);
      }
    } catch {
      setActionError("Could not reach the server. Is the backend running?");
    }

    setBusyId(null);
  }

  // ---------- Delete ----------
  async function handleDelete(entry: HistoryEntry) {
    const sure = window.confirm("Delete this link from your history?");

    if (!sure) {
      return;
    }

    setActionError("");
    setBusyId(entry.id);

    try {
      const response = await authFetch(HISTORY_URL + "/" + entry.id, "DELETE");

      if (response.status === 401) {
        removeTokens();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setActionError(data.message || "Could not delete the entry.");
      } else {
        setEntries(entries.filter((item) => item.id !== entry.id));
      }
    } catch {
      setActionError("Could not reach the server. Is the backend running?");
    }

    setBusyId(null);
  }

  return (
    <div>
      <Navbar />

      <div className="page">
        <h2 className="auth-title">Your history</h2>
        <p className="auth-subtitle">The links you have checked before.</p>

        {pageLoading && <p className="text-muted">Loading your history...</p>}

        {error !== "" && <div className="form-error">{error}</div>}
        {actionError !== "" && <div className="form-error">{actionError}</div>}

        {!pageLoading && error === "" && entries.length === 0 && (
          <div className="history-empty">
            <p>You have not checked any links yet.</p>
            <Link to="/check" className="btn-main d-inline-block text-decoration-none">
              Check a link
            </Link>
          </div>
        )}

        {entries.map((entry) => (
          <div className="history-item" key={entry.id}>
            <div className="history-main">
              {entry.isSafe ? (
                <span className="history-badge safe">No threats found</span>
              ) : (
                <span className="history-badge unsafe">Potentially unsafe</span>
              )}

              <div className="history-url">{entry.url}</div>

              <div className="history-meta">
                Checked on {new Date(entry.checkedAt).toLocaleString()}
                {!entry.isSafe && entry.threats.length > 0 && (
                  <span>
                    {" "}
                    · {entry.threats.map((threat) => threatName(threat.threatType)).join(", ")}
                  </span>
                )}
              </div>
            </div>

            <div className="history-actions">
              <button
                className="history-btn"
                onClick={() => handleView(entry)}
                disabled={busyId === entry.id}
              >
                View
              </button>
              <button
                className="history-btn"
                onClick={() => handleRecheck(entry)}
                disabled={busyId === entry.id}
              >
                {busyId === entry.id ? "Working..." : "Re-check"}
              </button>
              <button
                className="history-btn danger"
                onClick={() => handleDelete(entry)}
                disabled={busyId === entry.id}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="history-more">
            <button className="btn-main" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;