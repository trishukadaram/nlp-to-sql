import { useState } from "react";

const SCHEMA = {
  customers: {
    icon: "👤",
    color: "#818cf8",
    columns: ["id", "name", "email", "country", "signup_date", "tier"]
  },
  orders: {
    icon: "🛒",
    color: "#34d399",
    columns: ["id", "customer_id", "order_date", "total", "status", "shipping_days"]
  },
  products: {
    icon: "📦",
    color: "#f472b6",
    columns: ["id", "name", "category", "price", "stock", "rating"]
  },
  order_items: {
    icon: "🧾",
    color: "#fb923c",
    columns: ["id", "order_id", "product_id", "quantity", "unit_price"]
  }
};

const SAMPLE_QUESTIONS = [
  "Show me top 5 customers by total spending",
  "Which products have low stock under 10 units?",
  "What is the average order value by country?",
  "List all pending orders from last 30 days",
  "Which product category has the highest revenue?",
  "Find customers who haven't ordered in 90 days"
];

const MOCK_RESULTS = {
  customers: [
    { id: 1, name: "Alice Smith", email: "alice@email.com", country: "USA", signup_date: "2023-01-15", tier: "Gold" },
    { id: 2, name: "Bob Jones", email: "bob@email.com", country: "UK", signup_date: "2023-03-22", tier: "Silver" },
    { id: 3, name: "Carol White", email: "carol@email.com", country: "Canada", signup_date: "2023-05-10", tier: "Gold" },
    { id: 4, name: "Dave Brown", email: "dave@email.com", country: "USA", signup_date: "2023-07-01", tier: "Bronze" },
    { id: 5, name: "Eve Davis", email: "eve@email.com", country: "Australia", signup_date: "2023-09-18", tier: "Silver" }
  ],
  orders: [
    { id: 101, customer_id: 1, order_date: "2024-01-05", total: "$1,299.99", status: "Completed", shipping_days: 3 },
    { id: 102, customer_id: 2, order_date: "2024-01-08", total: "$89.99", status: "Pending", shipping_days: null },
    { id: 103, customer_id: 3, order_date: "2024-01-12", total: "$449.50", status: "Completed", shipping_days: 5 },
    { id: 104, customer_id: 1, order_date: "2024-01-15", total: "$199.99", status: "Shipped", shipping_days: null },
    { id: 105, customer_id: 4, order_date: "2024-01-18", total: "$59.99", status: "Completed", shipping_days: 2 }
  ],
  products: [
    { id: 1, name: "Laptop Pro", category: "Electronics", price: "$1,299.99", stock: 24, rating: 4.8 },
    { id: 2, name: "Wireless Mouse", category: "Accessories", price: "$29.99", stock: 150, rating: 4.5 },
    { id: 3, name: "Monitor 4K", category: "Electronics", price: "$449.99", stock: 8, rating: 4.7 },
    { id: 4, name: "USB Hub", category: "Accessories", price: "$49.99", stock: 200, rating: 4.3 },
    { id: 5, name: "Headphones", category: "Audio", price: "$299.99", stock: 45, rating: 4.9 }
  ]
};

function ResultTable({ data }) {
  if (!data || !data.length) return null;
  const headers = Object.keys(data[0]);
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr style={{ background: "#0f172a" }}>
            {headers.map(h => (
              <th key={h} style={{
                padding: "10px 14px", textAlign: "left",
                color: "#64748b", fontWeight: 500,
                borderBottom: "1px solid #1e293b",
                whiteSpace: "nowrap", letterSpacing: "0.05em",
                fontSize: "11px", textTransform: "uppercase"
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #1e293b", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {headers.map(h => (
                <td key={h} style={{ padding: "10px 14px", color: "#e2e8f0", whiteSpace: "nowrap" }}>
                  {typeof row[h] === "number" && h === "rating"
                    ? <span style={{ color: "#fbbf24" }}>{"★".repeat(Math.floor(row[h]))} {row[h]}</span>
                    : String(row[h])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function generateSQL() {
    if (!question.trim()) return;
    setLoading(true);

    const schemaDesc = Object.entries(SCHEMA).map(([table, info]) =>
      `${table}(${info.columns.join(", ")})`
    ).join("\n");

    const prompt = `You are an expert SQL generator for an e-commerce database. Convert the natural language question into a SQL query.

Database Schema:
${schemaDesc}

Question: "${question}"

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "sql": "<the SQL query>",
  "explanation": "<one sentence explaining what the query does>",
  "tables_used": ["<table1>", "<table2>"],
  "result_table": "<which table's data to show as preview: customers|orders|products>"
}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const mockData = MOCK_RESULTS[parsed.result_table] || MOCK_RESULTS.customers;
      const entry = { question, ...parsed, mockData, time: new Date().toLocaleTimeString() };
      setResult(entry);
      setHistory(h => [entry, ...h.slice(0, 4)]);
    } catch {
      setResult({ error: "Failed to generate SQL. Please try again." });
    }
    setLoading(false);
    setQuestion("");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#020817", fontFamily: "'Inter', sans-serif", color: "#e2e8f0", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: "260px", minWidth: "260px", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", background: "#0a0f1e" }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #818cf8, #34d399)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
            <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "0.02em" }}>NLP → SQL</span>
          </div>
          <div style={{ fontSize: "11px", color: "#475569", paddingLeft: "38px" }}>E-Commerce Query Engine</div>
        </div>

        {/* Schema */}
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.1em", marginBottom: "12px" }}>DATABASE SCHEMA</div>
          {Object.entries(SCHEMA).map(([table, info]) => (
            <div key={table} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px" }}>{info.icon}</span>
                <span style={{ fontSize: "12px", color: info.color, fontWeight: 500 }}>{table}</span>
              </div>
              <div style={{ paddingLeft: "22px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {info.columns.map(col => (
                  <span key={col} style={{
                    fontSize: "10px", color: "#475569",
                    background: "#0f172a", border: "1px solid #1e293b",
                    borderRadius: "3px", padding: "1px 6px"
                  }}>{col}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        <div style={{ padding: "16px 18px", flex: 1, overflowY: "auto" }}>
          <div style={{ fontSize: "10px", color: "#475569", letterSpacing: "0.1em", marginBottom: "10px" }}>RECENT QUERIES</div>
          {history.length === 0 && <div style={{ fontSize: "11px", color: "#1e293b" }}>No queries yet</div>}
          {history.map((h, i) => (
            <div key={i} onClick={() => setResult(h)} style={{
              padding: "8px 10px", marginBottom: "6px",
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: "6px", cursor: "pointer", fontSize: "11px",
              color: "#64748b", lineHeight: "1.5", transition: "all 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.color = "#94a3b8"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#64748b"; }}
            >
              <div style={{ marginBottom: "2px" }}>"{h.question.slice(0, 40)}{h.question.length > 40 ? "..." : ""}"</div>
              <div style={{ fontSize: "10px", color: "#334155" }}>{h.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "16px 28px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600 }}>Query Generator</div>
            <div style={{ fontSize: "11px", color: "#475569" }}>Ask anything about your e-commerce data</div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {["PostgreSQL", "BigQuery", "Snowflake"].map((db, i) => (
              <span key={db} style={{
                fontSize: "10px", padding: "3px 10px",
                background: i === 0 ? "#818cf822" : "transparent",
                border: `1px solid ${i === 0 ? "#818cf8" : "#1e293b"}`,
                borderRadius: "20px", color: i === 0 ? "#818cf8" : "#475569",
                cursor: "pointer"
              }}>{db}</span>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Input */}
          <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #1e293b", fontSize: "11px", color: "#475569", letterSpacing: "0.06em" }}>
              ASK IN PLAIN ENGLISH
            </div>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), generateSQL())}
              placeholder="e.g. Show me top 5 customers by total spending..."
              rows={3}
              style={{
                width: "100%", background: "transparent", border: "none",
                color: "#e2e8f0", fontFamily: "'Inter', sans-serif",
                fontSize: "14px", padding: "16px 18px", resize: "none",
                outline: "none", boxSizing: "border-box", lineHeight: "1.6"
              }}
            />
            <div style={{ padding: "10px 18px", borderTop: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {SAMPLE_QUESTIONS.slice(0, 3).map((q, i) => (
                  <button key={i} onClick={() => setQuestion(q)} style={{
                    background: "transparent", border: "1px solid #1e293b",
                    borderRadius: "20px", padding: "3px 10px",
                    color: "#475569", fontSize: "10px", cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", transition: "all 0.15s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#818cf8"; e.currentTarget.style.color = "#818cf8"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#475569"; }}
                  >{q.slice(0, 28)}...</button>
                ))}
              </div>
              <button onClick={generateSQL} disabled={!question.trim() || loading} style={{
                background: question.trim() && !loading ? "linear-gradient(135deg, #818cf8, #34d399)" : "#1e293b",
                border: "none", borderRadius: "8px", padding: "8px 20px",
                color: question.trim() && !loading ? "#020817" : "#475569",
                fontSize: "12px", fontWeight: 600, cursor: question.trim() && !loading ? "pointer" : "not-allowed",
                fontFamily: "'Inter', sans-serif", transition: "all 0.2s", whiteSpace: "nowrap"
              }}>
                {loading ? "Generating..." : "Generate SQL →"}
              </button>
            </div>
          </div>

          {/* Sample pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {SAMPLE_QUESTIONS.slice(3).map((q, i) => (
              <button key={i} onClick={() => setQuestion(q)} style={{
                background: "#0a0f1e", border: "1px solid #1e293b",
                borderRadius: "20px", padding: "5px 14px",
                color: "#475569", fontSize: "11px", cursor: "pointer",
                fontFamily: "'Inter', sans-serif", transition: "all 0.15s"
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#34d399"; e.currentTarget.style.color = "#34d399"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#475569"; }}
              >💡 {q}</button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px", background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: "12px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: "6px", height: "6px", background: "#818cf8", borderRadius: "50%", animation: "bounce 0.8s ease infinite", animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span style={{ fontSize: "13px", color: "#64748b" }}>Translating to SQL...</span>
            </div>
          )}

          {/* Result */}
          {result && !loading && !result.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", animation: "fadeIn 0.4s ease" }}>

              {/* Question */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #818cf8, #34d399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>?</div>
                <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#94a3b8" }}>
                  {result.question}
                </div>
              </div>

              {/* SQL */}
              <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#475569", letterSpacing: "0.06em" }}>GENERATED SQL</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {result.tables_used?.map(t => (
                        <span key={t} style={{ fontSize: "10px", background: SCHEMA[t]?.color + "22", color: SCHEMA[t]?.color, border: `1px solid ${SCHEMA[t]?.color}44`, borderRadius: "4px", padding: "1px 7px" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(result.sql)} style={{ background: "none", border: "none", color: "#475569", fontSize: "11px", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>copy</button>
                </div>
                <pre style={{ margin: 0, padding: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#a5f3fc", lineHeight: "1.7", overflowX: "auto", whiteSpace: "pre-wrap" }}>
                  {result.sql}
                </pre>
              </div>

              {/* Explanation */}
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0f172a", border: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>⚡</div>
                <div style={{ background: "#0f172a", border: "1px solid #34d39933", borderLeft: "3px solid #34d399", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" }}>
                  {result.explanation}
                </div>
              </div>

              {/* Preview */}
              <div style={{ background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e293b", fontSize: "11px", color: "#475569", letterSpacing: "0.06em" }}>
                  SAMPLE RESULTS PREVIEW · {result.mockData?.length} rows
                </div>
                <ResultTable data={result.mockData} />
              </div>
            </div>
          )}

          {result?.error && (
            <div style={{ padding: "16px", background: "#f4474722", border: "1px solid #f4474744", borderRadius: "10px", color: "#f44747", fontSize: "13px" }}>
              {result.error}
            </div>
          )}

          {!result && !loading && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#1e293b" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚡</div>
              <div style={{ fontSize: "13px", letterSpacing: "0.06em" }}>Ask a question to generate SQL</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        textarea::placeholder { color: #1e293b; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>
    </div>
  );
}
