import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ME_URL, PASSWORD_URL } from "../config";
import { removeTokens, saveTokens, saveUserName } from "../auth";
import { authFetch } from "../authPost";
import "../profile.css";

function Profile() {
  // Page loading
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Personal details form
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [detailsSuccess, setDetailsSuccess] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const navigate = useNavigate();

  // Load the profile from the backend when the page opens
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await authFetch(ME_URL, "GET");

        if (response.status === 401) {
          removeTokens();
          navigate("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setPageError(data.message || "Could not load your profile.");
        } else {
          setFirstName(data.user.firstName);
          setSecondName(data.user.secondName);
          setEmail(data.user.email);
        }
      } catch {
        setPageError("Could not reach the server. Is the backend running?");
      }

      setPageLoading(false);
    }

    loadProfile();
  }, [navigate]);

  // ---------- Save the new name ----------
  async function handleDetailsSubmit(event: FormEvent) {
    event.preventDefault();
    setDetailsError("");
    setDetailsSuccess("");

    if (firstName.trim() === "" || secondName.trim() === "") {
      setDetailsError("Please fill in your first name and second name.");
      return;
    }

    setDetailsLoading(true);

    try {
      const response = await authFetch(ME_URL, "PATCH", {
        firstName: firstName.trim(),
        secondName: secondName.trim(),
      });

      if (response.status === 401) {
        removeTokens();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setDetailsError(data.message || "Could not update your details.");
        setDetailsLoading(false);
        return;
      }

      // Keep the welcome message on the check page up to date
      saveUserName(data.user.firstName);
      setFirstName(data.user.firstName);
      setSecondName(data.user.secondName);
      setDetailsSuccess("Your details were updated.");
    } catch {
      setDetailsError("Could not reach the server. Is the backend running?");
    }

    setDetailsLoading(false);
  }

  // ---------- Save the new password ----------
  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (currentPassword === "" || newPassword === "" || confirmNewPassword === "") {
      setPasswordError("Please fill in all the password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("The new password must have at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("The new password must be different from the current one.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await authFetch(PASSWORD_URL, "PATCH", {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      if (response.status === 401) {
        removeTokens();
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || "Could not change your password.");
        setPasswordLoading(false);
        return;
      }

      // The backend logs out all devices and sends new tokens for this one
      saveTokens(data.accessToken, data.refreshToken);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordSuccess("Your password was changed. Other devices were logged out.");
    } catch {
      setPasswordError("Could not reach the server. Is the backend running?");
    }

    setPasswordLoading(false);
  }

  return (
    <div>
      <Navbar />

      <div className="page">
        <h2 className="auth-title">Your profile</h2>
        <p className="auth-subtitle">Change your name or your password.</p>

        {pageLoading && <p className="text-muted">Loading your profile...</p>}

        {pageError !== "" && <div className="form-error">{pageError}</div>}

        {!pageLoading && pageError === "" && (
          <div>
            <div className="profile-card">
              <h3>Personal details</h3>

              {detailsError !== "" && <div className="form-error">{detailsError}</div>}
              {detailsSuccess !== "" && <div className="form-success">{detailsSuccess}</div>}

              <form onSubmit={handleDetailsSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="field-label">First name</label>
                    <input
                      type="text"
                      className="field"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="field-label">Second name</label>
                    <input
                      type="text"
                      className="field"
                      value={secondName}
                      onChange={(e) => setSecondName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="field-label">Gmail</label>
                  <input type="email" className="field field-readonly" value={email} disabled />
                  <p className="field-note">Your email cannot be changed.</p>
                </div>

                <button type="submit" className="btn-main" disabled={detailsLoading}>
                  {detailsLoading ? "Saving..." : "Save details"}
                </button>
              </form>
            </div>

            <div className="profile-card">
              <h3>Change password</h3>

              {passwordError !== "" && <div className="form-error">{passwordError}</div>}
              {passwordSuccess !== "" && <div className="form-success">{passwordSuccess}</div>}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="field-label">Current password</label>
                  <input
                    type="password"
                    className="field"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="field-label">New password</label>
                  <input
                    type="password"
                    className="field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="field-label">Confirm new password</label>
                  <input
                    type="password"
                    className="field"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-main" disabled={passwordLoading}>
                  {passwordLoading ? "Saving..." : "Change password"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;