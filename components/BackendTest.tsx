import React, { useEffect, useState } from "react";

export default function BackendTest() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Error connecting to backend"));
  }, []);

  return <div>Backend says: {message}</div>;
}
