import React, { useEffect, useState } from "react";

export default function BackendTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.status || data.message || "Connected"))
      .catch(() => setMessage("Error connecting to backend"));
  }, []);

  return <div>Backend says: {message}</div>;
}
