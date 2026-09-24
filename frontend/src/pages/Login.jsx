import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "../styles/forms.css";

export default function Login() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to Nimbus"
      subtitle="Enter your details to access your workspace."
    >
      <form>
        <div className="field">
          <label className="field__label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            className="field__input"
            type="email"
            placeholder="jane@example.com"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="field__input"
            type="password"
            placeholder="Enter your password"
          />
        </div>

        <div className="field__row">
          <label className="checkbox">
            <input type="checkbox" />
            Remember me
          </label>
          <Link className="link" to="/reset-password">
            Forgot password?
          </Link>
        </div>

        <button type="button" className="btn btn--primary">
          Sign in
        </button>
      </form>

      <p className="form-footer">
        New to Nimbus? <Link className="link" to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
