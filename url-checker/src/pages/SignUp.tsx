import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { SIGNUP_URL } from "../config";

function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    // Check the form before sending it
    if (
      firstName.trim() === "" ||
      secondName.trim() === "" ||
      email.trim() === "" ||
      password === "" ||
      confirmPassword === ""
    ) {
      setError("Please fill in all the fields.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("The password must have at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          secondName: secondName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sign up failed. Please try again.");
        setLoading(false);
        return;
      }

      // Sign up worked, so go to the log in page
      navigate("/login");
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }

    setLoading(false);
  }

  return (
    <AuthLayout title="Create your account" subtitle="It only takes a minute.">
      {error !== "" && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-6">
            <label className="field-label">First name</label>
            <input
              type="text"
              className="field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="field-label">Second name</label>
            <input
              type="text"
              className="field"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="field-label">Gmail</label>
          <input
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="field-label">Password</label>
          <input
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="field-label">Confirm password</label>
          <input
            type="password"
            className="field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-main w-100" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  );
}

export default SignUp;