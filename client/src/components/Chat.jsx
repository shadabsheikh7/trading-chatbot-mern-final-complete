import { useState } from "react";
import { sendChat } from "../services/api";
export default function Chat() {
  const [msgs, setMsgs] = useState([
    {
      r: "bot",
      t: "Hi! Try “price btc”, “rsi btc”, “portfolio”, or “buy 0.001 btc”.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if (!text.trim() || loading) return;
    const q = text;
    setText("");
    setMsgs((m) => [...m, { r: "me", t: q }]);
    setLoading(true);
    try {
      const { data } = await sendChat(q);
      setMsgs((m) => [...m, { r: "bot", t: data.reply }]);
    } catch (e) {
      setMsgs((m) => [
        ...m,
        { r: "bot", t: e.response?.data?.message || "Server error" },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="chat-card">
      <div className="chat-head">
        Trading Assistant <span className="badge text-bg-success">PAPER</span>
      </div>
      <div className="chat-body">
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.r}`}>
            {m.t}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask: price btc / buy 0.001 btc..."
        />
        <button onClick={send} disabled={loading}>
          <i className="bi bi-send" />
        </button>
      </div>
    </div>
  );
}
