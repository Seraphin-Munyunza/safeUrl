import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getRefreshToken } from "../auth";

type Props = {
  children: ReactNode;
};

// A user is logged in while they have a refresh token.
// If there is none, send the user to the log in page.
function ProtectedRoute({ children }: Props) {
  const refreshToken = getRefreshToken();

  if (refreshToken === "") {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;