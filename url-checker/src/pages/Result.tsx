import { Link, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { CheckResult } from "../types";

// Turn the threat type from the backend into a title and a sentence people can read
function getThreatInfo(threatType: string): { title: string; text: string } {
  if (threatType === "MALWARE") {
    return { title: "Malware", text: "This page can install harmful software on your device." };
  }
  if (threatType === "SOCIAL_ENGINEERING") {
    return {
      title: "Social engineering",
      text: "This page may be a fake page that tricks you into giving away private information.",
    };
  }
  if (threatType === "UNWANTED_SOFTWARE") {
    return {
      title: "Unwanted software",
      text: "This page may try to install software that harms your browsing experience.",
    };
  }
  if (threatType === "POTENTIALLY_HARMFUL_APPLICATION") {
    return {
      title: "Potentially harmful application",
      text: "This page may offer an app that can harm your device.",
    };
  }
  return { title: threatType, text: "Google lists this as a threat." };
}

function Result() {
  const location = useLocation();

  // The result was sent here from the check page
  const state = location.state as { result?: CheckResult } | null;
  const result = state?.result;

  // If someone opens this page directly, there is no result to show
  if (!result) {
    return <Navigate to="/check" />;
  }

  return (
    <div>
      <Navbar />

      <div className="page">
        <div className="result-card">
          {result.isSafe ? (
            <div className="result-head safe">
              <div className="verdict-icon">✓</div>
              <h2 className="verdict-title">No threats found</h2>
              <p className="verdict-text">
                This link is not on Google's lists of unsafe sites.
              </p>
            </div>
          ) : (
            <div className="result-head unsafe">
              <div className="verdict-icon">✕</div>
              <h2 className="verdict-title">Unsafe link</h2>
              <p className="verdict-text">Do not open this link.</p>
            </div>
          )}

          <div className="result-body">
            <p className="result-label">Link checked</p>
            <div className="result-url">{result.url}</div>

            {result.isSafe ? (
              <p className="text-muted">
                No result is a full guarantee, so stay careful with links you do not trust.
              </p>
            ) : (
              <div>
                <p className="result-label">Why it is unsafe</p>
                {result.threats.map((threat, index) => {
                  const info = getThreatInfo(threat.threatType);
                  return (
                    <div className="threat-item" key={index}>
                      <span className="threat-name">{info.title}</span>
                      {info.text}
                    </div>
                  );
                })}
              </div>
            )}

            <Link to="/check" className="btn-main d-inline-block text-decoration-none mt-3">
              Check another link
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;