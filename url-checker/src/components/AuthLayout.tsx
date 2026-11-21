import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// The page layout shared by the log in and sign up pages
function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div>
          <p className="auth-brand">SafeURL</p>
          <h1 className="auth-slogan">Know a link is safe before you open it.</h1>
          <p className="auth-text">
            Every link is checked against Google's lists of dangerous websites, so you can
            browse with confidence.
          </p>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-box">
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;