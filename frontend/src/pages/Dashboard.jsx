import { useNavigate } from "react-router-dom";
import { logOut } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import NoteGrid from "../components/notes/NoteGrid";

import "./Dashboard.css";

const notes = [
  {
    id: 1,
    title: "React Learning",
    content: "Today I learned about useState, useEffect and Context API.",
    updated: "Today",
  },
  {
    id: 2,
    title: "Collaborative Notes",
    content:
      "Build the frontend with React and connect it with the Express backend.",
    updated: "Yesterday",
  },
  {
    id: 3,
    title: "Backend Ideas",
    content: "Add Socket.IO and Yjs after completing the basic CRUD interface.",
    updated: "Sep 27",
  },
];

export default function Dashboard() {
  const { user, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await logOut();

      setAccessToken(null);
      navigate("/login");
    } catch (error) {
      console.log(error, "Error");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar onLogout={handleLogOut} />

      <div className="dashboard__content">
        <Topbar user={user} />

        <main className="notes-page">
          <div className="notes-page__header">
            <div>
              <h1>My Notes</h1>

              <p>Create, edit and share your notes.</p>
            </div>

            <button
              className="new-note-button"
              onClick={() => navigate("/notes/new")}
            >
              <span>+</span>
              New Note
            </button>
          </div>

          <NoteGrid notes={notes} />
        </main>
      </div>
    </div>
  );
}
