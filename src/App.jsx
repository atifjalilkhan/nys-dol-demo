import { useState, useRef, useEffect } from "react";

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#003087", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0 }}>
          <span style={{ color: "white", fontSize: 14 }}>🏛️</span>
        </div>
      )}
      <div style={{
        maxWidth: "78%", padding: "12px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "#003087" : "white",
        color: isUser ? "white" : "#1a1a2e",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        fontSize: 14, lineHeight: 1.6,
        border: isUser ? "none" : "1px solid #e8ecf0",
        whiteSpace: "pre-wrap"
      }}>
        {msg.content}
        {msg.claimId && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#e6f4ea", borderRadius: 8, border: "1px solid #a8d5b5" }}>
            <div style={{ color: "#1a7f37", fontWeight: 700, fontSize: 13 }}>✅ Claim Submitted Successfully</div>
            <div style={{ color: "#333", fontSize: 12, marginTop: 4 }}>Claim ID: <strong>{msg.claimId}</strong></div>
            <div style={{ color: "#333", fontSize: 12 }}>Status: <strong>{msg.claimStatus}</strong></div>
          </div>
        )}
      </div>
      {isUser && (
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#c8102e", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 10, flexShrink: 0 }}>
          <span style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>YOU</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [started, setStarted]     = useState(false);
  const [claimDone, setClaimDone] = useState(false);
  const bottomRef                 = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const startSession = async () => {
    setLoading(true);
    setStarted(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "session" })
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (e) {
      setMessages([{ role: "assistant", content: "❌ Connection error. Please check the system is running." }]);
    }
    setLoading(false);
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading || !sessionId || claimDone) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "message", sessionId, message: msg })
      });
      const data = await res.json();
      const newMsg = { role: "assistant", content: data.message || data.error || "Error" };
      if (data.claimSubmitted && data.claimResult) {
        newMsg.claimId     = data.claimResult.claimId;
        newMsg.claimStatus = data.claimResult.claimStatus;
        setClaimDone(true);
      }
      setMessages(prev => [...prev, newMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `❌ Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const HEADER_H = 120;
  const INPUT_H  = 90;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f0f2f5" }}>

      {/* Header */}
      <div style={{ background: "#003087", padding: "14px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 26 }}>🏛️</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 17 }}>NYS Unemployment Insurance Claims</div>
              <div style={{ color: "#7EC8E3", fontSize: 11 }}>New York State Department of Labor — AI-Powered Claims Filing</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00a651" }}></div>
            <span style={{ color: "#7EC8E3", fontSize: 11 }}>Live DB2 Connected</span>
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div style={{ background: "#001f5b", padding: "8px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 24, justifyContent: "center" }}>
          {[["💬 < 2 min", "To file a claim"], ["🤖 Claude AI", "Powered chatbot"], ["🗄️ IBM DB2", "Live database"], ["🔒 Secure", "Encrypted session"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{val}</div>
              <div style={{ color: "#7EC8E3", fontSize: 10 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages — scrollable middle section */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {!started ? (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
              <h2 style={{ color: "#003087", fontSize: 22, marginBottom: 12 }}>NYS Unemployment Insurance Claims</h2>
              <p style={{ color: "#555", fontSize: 14, marginBottom: 8, maxWidth: 480, margin: "0 auto 8px" }}>
                File your unemployment insurance claim through our AI-powered assistant. The process takes less than 2 minutes.
              </p>
              <p style={{ color: "#888", fontSize: 12, marginBottom: 32 }}>Powered by Claude AI · Connected to live IBM DB2 database</p>
              <button onClick={startSession} style={{
                background: "#003087", color: "white", border: "none",
                padding: "14px 44px", borderRadius: 8, fontSize: 15,
                fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,48,135,0.3)"
              }}>Start New Claim</button>
              <p style={{ color: "#888", fontSize: 11, marginTop: 14 }}>You will need: SSN, Date of Birth, Employer Information, Separation Reason</p>
            </div>
          ) : (
            <>
              {messages.map((m, i) => <Message key={i} msg={m} />)}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "white" }}>🏛️</span>
                  </div>
                  <div style={{ background: "white", padding: "12px 16px", borderRadius: "18px 18px 18px 4px", border: "1px solid #e8ecf0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#003087", animation: `bounce 1s infinite ${i*0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {claimDone && (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <button onClick={() => { setMessages([]); setSessionId(null); setStarted(false); setClaimDone(false); }}
                    style={{ background: "#003087", color: "white", border: "none", padding: "12px 32px", borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
                    File Another Claim
                  </button>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input — fixed at bottom */}
      {started && !claimDone && (
        <div style={{ background: "white", borderTop: "1px solid #e8ecf0", padding: "12px 24px", boxShadow: "0 -2px 8px rgba(0,0,0,0.08)", flexShrink: 0 }}>
          <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 12 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Type your response..."
              disabled={loading || !sessionId}
              style={{ flex: 1, padding: "11px 16px", borderRadius: 24, border: "2px solid #e8ecf0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
            <button onClick={send} disabled={loading || !input.trim() || !sessionId}
              style={{ background: loading || !input.trim() ? "#ccc" : "#003087", color: "white", border: "none", borderRadius: 24, padding: "11px 22px", fontSize: 14, fontWeight: 600, cursor: loading || !input.trim() ? "not-allowed" : "pointer" }}>
              Send
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: "#999" }}>
            Bilqees Technology Solutions Inc. | NYC & NYS MBE Certified | Powered by Claude AI
          </div>
        </div>
      )}

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} } * { box-sizing: border-box; }`}</style>
    </div>
  );
}
