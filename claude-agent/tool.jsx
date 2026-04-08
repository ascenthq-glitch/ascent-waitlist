import { useState, useCallback } from "react";

const ANTHROPIC_PROMPT = `You are an expert startup ecosystem analyst specializing in the Indian startup scene.

You will be given a list of Twitter/X profiles (from a CSV export) including their bios, locations, and follower counts.

Your job is to identify which profiles are Indian startup founders or builders who are likely hiring.

For each profile, analyze:
1. Bio keywords: founder, co-founder, building, CEO, CTO, startup, entrepreneur, builder, launching, indie hacker
2. India signals: India, Indian, Bangalore, Bengaluru, Mumbai, Delhi, Hyderabad, Pune, Chennai, BLR, Bharat, IIT, IIM, BITS
3. Hiring signals: hiring, looking for, we're building, join us, join our team, open roles

Return a JSON array with ONLY the founder leads. Each object must have:
{
  "name": string,
  "username": string,
  "bio": string,
  "location": string,
  "followers": string,
  "india_related": boolean,
  "hiring_signal": boolean,
  "profile_url": string,
  "relevance_score": number (1-10, 10 being most relevant Indian founder actively hiring)
}

Sort by relevance_score descending. Only include profiles with relevance_score >= 4.
Return ONLY the JSON array, no other text.`;

export default function FounderLeadsAgent() {
  const [file, setFile] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("all");

  const parseCSV = (text) => {
    const lines = text.split("\n");
    const headers = lines[0].replace(/^\uFEFF/, "").split(",").map(h => h.replace(/"/g, "").trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const vals = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = (vals[idx] || "").replace(/"/g, "").trim();
      });
      if (row["Username"]) rows.push(row);
    }
    return rows;
  };

  const processFile = async (csvText) => {
    setLoading(true);
    setError("");
    setLeads([]);
    setStats(null);

    try {
      const profiles = parseCSV(csvText);
      setStats({ total: profiles.length, processing: true });

      // Batch profiles into chunks of 50
      const chunkSize = 50;
      const allLeads = [];

      for (let i = 0; i < profiles.length; i += chunkSize) {
        const chunk = profiles.slice(i, i + chunkSize);
        const profileText = chunk.map(p =>
          `Name: ${p["Name"] || ""} | Username: @${p["Username"] || ""} | Bio: ${p["Bio"] || ""} | Location: ${p["Location"] || ""} | Followers: ${p["Followers Count"] || "0"} | URL: ${p["Profile URL"] || ""}`
        ).join("\n");

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: ANTHROPIC_PROMPT,
            messages: [{ role: "user", content: `Analyze these ${chunk.length} Twitter profiles and identify Indian startup founders:\n\n${profileText}` }]
          })
        });

        const data = await response.json();
        const text = data.content?.[0]?.text || "[]";
        try {
          const clean = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          allLeads.push(...parsed);
        } catch (e) {}
      }

      allLeads.sort((a, b) => b.relevance_score - a.relevance_score);
      setLeads(allLeads);
      setStats({ total: profiles.length, found: allLeads.length, processing: false });
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleFile = (f) => {
    if (!f || !f.name.endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => processFile(e.target.result);
    reader.readAsText(f);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const exportCSV = () => {
    const headers = ["Name", "Username", "Bio", "Location", "Followers", "India Related", "Hiring Signal", "Score", "Profile URL"];
    const rows = filtered.map(l => [l.name, `@${l.username}`, `"${l.bio}"`, l.location, l.followers, l.india_related ? "Yes" : "No", l.hiring_signal ? "Yes" : "No", l.relevance_score, l.profile_url]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "indian_founder_leads.csv"; a.click();
  };

  const filtered = leads.filter(l => {
    if (filter === "india") return l.india_related;
    if (filter === "hiring") return l.hiring_signal;
    if (filter === "top") return l.relevance_score >= 7;
    return true;
  });

  const scoreColor = (s) => s >= 8 ? "#00ff88" : s >= 6 ? "#ffd700" : s >= 4 ? "#ff9500" : "#888";

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", fontFamily: "'DM Mono', monospace", color: "#e0e0e0", padding: "32px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .drop-zone { border: 1.5px dashed #333; border-radius: 12px; padding: 48px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .drop-zone:hover, .drop-zone.over { border-color: #00ff88; background: rgba(0,255,136,0.03); }
        .lead-card { background: #111; border: 1px solid #1e1e1e; border-radius: 10px; padding: 16px; margin-bottom: 10px; transition: border-color 0.15s; }
        .lead-card:hover { border-color: #333; }
        .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px; }
        .btn { background: #00ff88; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; cursor: pointer; transition: opacity 0.15s; }
        .btn:hover { opacity: 0.85; }
        .filter-btn { background: transparent; border: 1px solid #222; color: #888; padding: 6px 14px; border-radius: 6px; font-family: 'DM Mono', monospace; font-size: 12px; cursor: pointer; transition: all 0.15s; margin-right: 6px; }
        .filter-btn.active { border-color: #00ff88; color: #00ff88; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
          FOUNDER LEADS <span style={{ color: "#00ff88" }}>AGENT</span>
        </div>
        <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
          Drop your Twitter followers CSV → AI filters Indian founders → Export leads
        </div>
      </div>

      {/* Upload Zone */}
      {!loading && leads.length === 0 && (
        <div
          className={`drop-zone ${dragOver ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("csv-input").click()}
        >
          <input id="csv-input" type="file" accept=".csv" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 14, color: "#aaa" }}>Drop Twitter followers CSV here</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>or click to browse</div>
          <div style={{ fontSize: 11, color: "#333", marginTop: 16 }}>
            Export from: twitterexportdata.com · followersanalysis.com · your scraping tool
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div className="pulse" style={{ fontSize: 13, color: "#00ff88", marginBottom: 12 }}>
            ◆ AGENT RUNNING
          </div>
          <div style={{ fontSize: 12, color: "#444" }}>
            Analyzing {stats?.total} profiles with Claude AI...
          </div>
          <div style={{ marginTop: 24, background: "#111", borderRadius: 8, padding: "12px 24px", display: "inline-block" }}>
            <div style={{ fontSize: 11, color: "#555" }}>filtering bios · scoring relevance · ranking leads</div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #330000", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#ff4444", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Results */}
      {leads.length > 0 && (
        <>
          {/* Stats Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#fff" }}>{leads.length}</div>
                <div style={{ fontSize: 11, color: "#555" }}>founders found</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#00ff88" }}>{leads.filter(l => l.india_related).length}</div>
                <div style={{ fontSize: 11, color: "#555" }}>india-based</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#ffd700" }}>{leads.filter(l => l.hiring_signal).length}</div>
                <div style={{ fontSize: 11, color: "#555" }}>hiring signals</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#888" }}>{stats?.total}</div>
                <div style={{ fontSize: 11, color: "#555" }}>total scanned</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn" onClick={exportCSV}>↓ Export CSV</button>
              <button className="btn" style={{ background: "#1a1a1a", color: "#aaa" }} onClick={() => { setLeads([]); setFile(null); setStats(null); }}>New File</button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: 16 }}>
            {["all", "india", "hiring", "top"].map(f => (
              <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f === "all" ? `All (${leads.length})` : f === "india" ? `🇮🇳 India (${leads.filter(l => l.india_related).length})` : f === "hiring" ? `⚡ Hiring (${leads.filter(l => l.hiring_signal).length})` : `★ Top Picks (${leads.filter(l => l.relevance_score >= 7).length})`}
              </button>
            ))}
          </div>

          {/* Lead Cards */}
          <div>
            {filtered.map((lead, i) => (
              <div key={i} className="lead-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>{lead.name}</span>
                      <a href={lead.profile_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>@{lead.username} ↗</a>
                    </div>
                    <div style={{ fontSize: 12, color: "#888", marginBottom: 8, lineHeight: 1.5 }}>{lead.bio}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                      {lead.location && <span className="tag" style={{ background: "#1a1a1a", color: "#666" }}>📍 {lead.location}</span>}
                      {lead.india_related && <span className="tag" style={{ background: "rgba(0,255,136,0.08)", color: "#00ff88" }}>🇮🇳 India</span>}
                      {lead.hiring_signal && <span className="tag" style={{ background: "rgba(255,215,0,0.08)", color: "#ffd700" }}>⚡ Hiring</span>}
                      <span style={{ fontSize: 11, color: "#555" }}>{parseInt(lead.followers || 0).toLocaleString()} followers</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginLeft: 16, minWidth: 40 }}>
                    <div style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: scoreColor(lead.relevance_score) }}>{lead.relevance_score}</div>
                    <div style={{ fontSize: 9, color: "#444" }}>SCORE</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px", color: "#444", fontSize: 13 }}>
              No leads match this filter.
            </div>
          )}
        </>
      )}
    </div>
  );
}
