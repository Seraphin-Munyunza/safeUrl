import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CHECK_URL } from "../config";
import { getUserName, removeTokens } from "../auth";
import { authPost } from "../authPost";

function CheckUrl() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Make the first letter of the name a capital letter, so "sera" becomes "Sera"
  const savedName = getUserName();
  const firstName = savedName.charAt(0).toUpperCase() + savedName.slice(1);

  async function handleFindOut(event: FormEvent) {
    event.preventDefault();
    setError("");

    const cleanUrl = url.trim();

    if (cleanUrl === "") {
      setError("Please enter a link.");
      return;
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      setError("The link must start with http:// or https://");
      return;
    }

    setLoading(true);

    try {
      // authPost adds the access token, and refreshes it by itself if it has expired
      const response = await authPost(CHECK_URL, { url: cleanUrl });

      // 401 here means even the refresh did not work, so the user must log in again
      if (response.status === 401) {
        removeTokens();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Could not check the link. Please try again.");
        setLoading(false);
        return;
      }

      // Go to the result page and carry the result with us
      navigate("/result", { state: { result: data.data } });
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }

    setLoading(false);
  }

  return (
    <div>
      <Navbar />

      <div className="page">
        <div className="welcome">
          <h1 className="welcome-title">{firstName !== "" ? "Welcome, " + firstName : "Welcome"}</h1>
          <p className="welcome-sub">Which link would you like to check today?</p>

          <form className="search-card" onSubmit={handleFindOut}>
            <input
              type="text"
              className="search-input"
              placeholder="Paste a link here, for example https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button type="submit" className="btn-main" disabled={loading}>
              {loading ? "Checking..." : "Find out"}
            </button>
          </form>

          {error !== "" && <div className="search-error">{error}</div>}
        </div>

        <section className="tips">
          <p className="tips-label">Stay safe online</p>
          <h3 className="tips-title">How to protect yourself from bad links</h3>
          <p className="tips-text">
            Most online scams begin with a single click, so the best defence is a moment of
            patience before you open a link. <strong>Read the address carefully</strong>, because
            fake websites often copy a real name with a small change, such as a swapped letter or
            an extra word. Be careful with links that arrive in emails, text messages or chat
            apps without you asking for them, especially when they create pressure with words like
            "urgent" or "your account will be closed". Instead of clicking, <strong>type the
            website's address yourself</strong> or use the app you already trust. The padlock and
            "https" only mean the connection is private, they do not prove the website is honest.
            Never download files or install programs you did not expect, and keep your phone and
            computer up to date so known weaknesses are closed. Protect your accounts with strong,
            different passwords and <strong>two-step verification</strong>, so one stolen password
            cannot open everything. When you are still unsure, paste the link above and let us
            check it before you decide.
          </p>
        </section>
      </div>
    </div>
  );
}

export default CheckUrl;