import { useNavigate } from "react-router-dom";
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
      <button className="topbar-btn" onClick={handleLogout}>
        Log out
      </button>
    </nav>
  );
}

export default Navbar;