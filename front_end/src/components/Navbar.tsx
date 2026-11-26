import { Link, useNavigate } from "react-router-dom";
import { getRefreshToken, removeTokens } from "../auth";
import { LOGOUT_URL } from "../config";

function Navbar() {
  const navigate = useNavigate();

  async function handleLogout() {
    // Tell the backend to cancel the refresh token
    try {
      await fetch(LOGOUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      });
    } catch {
      // If the server cannot be reached we still log out here
    }

    removeTokens();
    navigate("/login");
  }

  return (
    <nav className="topbar">
      <span className="topbar-brand">SafeURL</span>

      <div className="d-flex flex-wrap gap-2">
        <Link to="/check" className="topbar-btn text-decoration-none">
          Check links
        </Link>
        <Link to="/history" className="topbar-btn text-decoration-none">
          History
        </Link>
        <Link to="/profile" className="topbar-btn text-decoration-none">
          Profile
        </Link>
        <button className="topbar-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;