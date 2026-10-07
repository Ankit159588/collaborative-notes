import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedNote } from "../api/share";

export default function SharedNote() {
  const { token } = useParams();

  const [note, setNote] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    async function fetchSharedNote() {
      try {
        const result = await getSharedNote(token);

        console.log("Shared note:", result.data);

        setNote(result.data.data.note);
        setRole(result.data.data.role);
      } catch (error) {
        console.error("Failed to fetch shared note:", error);
      }
    }

    fetchSharedNote();
  }, [token]);

  return (
    <div>
      <h1>Shared Note</h1>

      {note && (
        <>
          <h2>{note.title}</h2>

          <p>{note.content}</p>

          <p>Role: {role}</p>
        </>
      )}
    </div>
  );
}
