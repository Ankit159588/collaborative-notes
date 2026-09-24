import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__topbar">
        <span className="dashboard__logo">Nimbus</span>

        <div className="dashboard__user">
          <span className="dashboard__avatar">JD</span>
          <span className="dashboard__username">Jane Doe</span>
          <Link className="btn btn--ghost dashboard__logout" to="/login">
            Log out
          </Link>
        </div>
      </header>

      <main className="dashboard__main">
        <section className="dashboard__welcome">
          <h1>Welcome back, Jane</h1>
          <p>Here's a quick look at your account today.</p>
        </section>

        <section className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Account status</span>
            <span className="stat-card__value">Verified</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Member since</span>
            <span className="stat-card__value">Sep 2026</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Active sessions</span>
            <span className="stat-card__value">1</span>
          </div>
        </section>

        <section className="dashboard__panel">
          <h2>Recent activity</h2>
          <ul className="activity-list">
            <li className="activity-item">
              <span className="activity-item__dot" />
              <div>
                <p className="activity-item__title">Signed in from a new device</p>
                <span className="activity-item__time">Today, 9:14 AM</span>
              </div>
            </li>
            <li className="activity-item">
              <span className="activity-item__dot" />
              <div>
                <p className="activity-item__title">Password changed</p>
                <span className="activity-item__time">Yesterday, 6:02 PM</span>
              </div>
            </li>
            <li className="activity-item">
              <span className="activity-item__dot" />
              <div>
                <p className="activity-item__title">Email verified</p>
                <span className="activity-item__time">Sep 14, 2026</span>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
