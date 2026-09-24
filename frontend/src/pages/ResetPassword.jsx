import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "../styles/forms.css";

export default function ResetPassword() {
  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Make it something you'll remember, but that others can't guess."
    >
      <form>
        <div className="field">
          <label className="field__label" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            className="field__input"
            type="password"
            placeholder="Enter new password"
          />
          <span className="field__hint">Use at least 8 characters, with a number and a symbol.</span>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            className="field__input"
            type="password"
            placeholder="Re-enter new password"
          />
        </div>

        <button type="button" className="btn btn--primary">
          Reset password
        </button>
      </form>

      <p className="form-footer">
        Remembered it after all? <Link className="link" to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
