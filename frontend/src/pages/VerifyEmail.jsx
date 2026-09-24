import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "../styles/forms.css";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  return (
    <AuthLayout
      eyebrow="Step 2 of 2"
      title="Verify your email"
      subtitle="We sent a 6-digit code to jane@example.com. Enter it below to confirm it's you."
    >
      <form>
        <div className="otp-row" role="group" aria-label="Enter verification code">
          <input className="otp-box" type="text" maxLength={1} inputMode="numeric" defaultValue="4" />
          <input className="otp-box" type="text" maxLength={1} inputMode="numeric" defaultValue="8" />
          <input className="otp-box" type="text" maxLength={1} inputMode="numeric" />
          <input className="otp-box" type="text" maxLength={1} inputMode="numeric" />
          <input className="otp-box" type="text" maxLength={1} inputMode="numeric" />
          <input className="otp-box" type="text" maxLength={1} inputMode="numeric" />
        </div>

        <p className="otp-timer">Code expires in 04:59</p>

        <button type="button" className="btn btn--primary" style={{ marginTop: "var(--space-5)" }}>
          Verify email
        </button>

        <button type="button" className="btn btn--ghost" style={{ marginTop: "var(--space-3)" }}>
          Resend OTP
        </button>
      </form>

      <p className="form-footer">
        Wrong email? <Link className="link" to="/register">Go back</Link>
      </p>
    </AuthLayout>
  );
}
