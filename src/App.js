import React, { useState, useRef, useEffect } from "react";


const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function ReactChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  // initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        role: "assistant",
        content: "Write a topic for research.",
      },
    ]);
  }, []);

  useEffect(() => {
    // auto-scroll to bottom when messages change
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function addMessage(role, content) {
    setMessages((m) => [
      ...m,
      { id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role, content },
    ]);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setError(null);

    // add user message locally
    addMessage("user", trimmed);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${API_URL}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Backend error: ${resp.status} ${text}`);
      }

      const data = await resp.json();

      // flexible handling depending on your FastAPI response shape
      if (data.reply && typeof data.reply === "string") {
        addMessage("assistant", data.reply);
      } else if (Array.isArray(data.messages)) {
        data.messages.forEach((msg) => {
          const role = msg.role === "user" ? "user" : msg.role === "system" ? "system" : "assistant";
          addMessage(role, String(msg.content ?? msg.text ?? ""));
        });
      } else if (typeof data === "string") {
        addMessage("assistant", data);
      } else {
        addMessage("assistant", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      setError(err?.message ?? "Unknown error");
      addMessage("assistant", "Sorry — I couldn't get a reply from the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // send on Enter (Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">FastAPI Chatbot UI</h1>
        <p className="text-sm text-gray-500">FastAPI + React</p>
      </header>

      <div className="flex-1 overflow-hidden rounded-lg border bg-white shadow-sm flex flex-col">
        {/* messages area */}
        <div ref={listRef} className="p-4 overflow-auto flex-1 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto text-right" : "mr-auto text-left"}`}>
              <div className={`inline-block px-4 py-2 rounded-2xl break-words ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">{m.role}</div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 bg-gray-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type the topic for search."
              rows={2}
              className="flex-1 resize-none rounded-md border p-3 focus:outline-none focus:ring"
            />

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md font-semibold ${loading ? "opacity-50 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>

          {error && <div className="mt-2 text-sm text-red-600">Error: {error}</div>}

        </div>
      </div>

    </div>
  );
}
