// src/pages/Login.jsx

import { useNavigate } from "react-router-dom";
import { useState } from "react";


export default function Login() {

  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform login logic here
    if(username && password) {
      navigate("/dashboard");
    }
    else {
      alert("Completeaza username si parola");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9F6]">
      <div className="bg-white border border-[#E1E6E0] rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-[#1F2937] mb-6 text-center">
          SmartTag • Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-[#E1E6E0] rounded-xl px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4B7353]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-[#E1E6E0] rounded-xl px-3 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#4B7353]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-[#4B7353] hover:bg-[#537E54] text-white rounded-xl py-2 font-medium transition"
          >
            Conectează-te
          </button>
        </form>

        <div className="mt-6 text-center">
          <button className="w-full border border-[#4B7353] text-[#4B7353] hover:bg-[#4B7353] hover:text-white rounded-xl py-2 font-medium transition">
            🔗 ESP Connect
          </button>
        </div>
      </div>
    </div>
  );
}
