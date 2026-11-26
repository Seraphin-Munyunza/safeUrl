import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { LOGIN_URL } from "../config";
import { saveTokens, saveUserName } from "../auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (email.trim() === "" || password === "") {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Log in failed. Please try again.");
        setLoading(false);
        return;
      }

      if (!data.accessToken || !data.refreshToken) {
        setError("The server did not send the tokens.");
        setLoading(false);
        return;
      }

      // Save the tokens and the first name (used for the welcome message)
      saveTokens(data.accessToken, data.refreshToken);
      if (data.user && data.user.firstName) {
        saveUserName(data.user.firstName);
      }

      navigate("/check");
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }

    setLoading(false);
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to check your links.">
      {error !== "" && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="field-label">Gmail</label>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="field-label">Password</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-main w-100" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;