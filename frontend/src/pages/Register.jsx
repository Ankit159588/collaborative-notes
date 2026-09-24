import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import "../styles/forms.css";
import { useState } from "react";
import { registerUser } from "../api/auth.api.js";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  return (
    <AuthLayout
      eyebrow="Step 1 of 2"
      title="Create your account"
      subtitle="Join Nimbus in a couple of minutes — no credit card required."
    >
      <form>
        <div className="field">
          <label className="field__label" htmlFor="username">
            Username
          </label>
          <input
            name="username"
            id="username"
            className="field__input"
            type="text"
            placeholder="jane_doe"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="email">
            Email address
          </label>
          <input
            name="email"
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
            name="password"
            id="password"
            className="field__input"
            type="password"
            placeholder="Create a password"
          />
          <span className="field__hint">
            Use at least 8 characters, with a number and a symbol.
          </span>
        </div>

        <label className="checkbox" style={{ marginBottom: "var(--space-5)" }}>
          <input type="checkbox" />I agree to the Terms of Service and Privacy
          Policy
        </label>

        <button type="button" className="btn btn--primary">
          Create account
        </button>
      </form>

      <p className="form-footer">
        Already have an account?{" "}
        <Link className="link" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
