# 🎯 Topdraft Leads Agent

An AI-powered tool that builds TWO pipelines from Twitter/X follower exports:
- 🚀 **Founder Pipeline** — Indian startup founders who are hiring (your customers)
- 🎯 **Candidate Pipeline** — Early talent who want startup roles (your candidates)

Built for **Topdraft** — internal use only.

---

## How It Works

1. **Scrape** followers of Indian VC/founder/college Twitter accounts
2. **Save** the CSV in this folder
3. **Open** Claude Code and type: `Run Topdraft pipeline on [filename].csv`
4. Get **two scored lead lists** instantly
5. **Export** both for outreach

---

## Best Accounts To Scrape

### For Founder Leads (customers)
| Account | Why |
|---------|-----|
| @Blume_Ventures | Early stage Indian VC |
| @Nithin0dha | Zerodha founder, massive Indian startup network |
| @peakxv | Sequoia India / Peak XV portfolio |
| @ankurkapoor | Active Indian angel investor |
| @prashanth_prakash | Accel India partner |

### For Candidate Leads (talent)
| Account | Why |
|---------|-----|
| @ETHIndiaa | Active builders, hackathon winners |
| @hasgeek | Indian dev community |
| @IITBombay | Top engineering talent |
| @iitdelhi | Top engineering talent |
| @BITSPilani | Top engineering talent |

---

## Setup

### First Time
```bash
git clone [your-private-repo-url]
cd founder-leads
```

### Every Time
1. Drop your CSV into this folder
2. Open terminal here
3. Type `claude`
4. Say: `Run Topdraft pipeline on [filename].csv`

---

## Prompts For Your Team

**Full dual pipeline:**
> "Run Topdraft pipeline on followers.csv"

**Founders only:**
> "Find Indian startup founders from followers.csv who are hiring"

**Candidates only:**
> "Find early talent from followers.csv for Indian startup roles"

**Specific role:**
> "Find engineers and designers from followers.csv who want to join early stage Indian startups"

---

## File Structure

```
founder-leads/
├── SKILL.md      ← Claude skill definition
├── agent.md      ← AI agent system prompt  
├── tool.jsx      ← React UI component
├── .gitignore    ← Keeps CSVs out of git
└── README.md     ← This file
```

---

## Important
- **Never push CSVs to GitHub** — keep lead data local only
- Request repo access from Saksham
- Do not share exported lead data outside the team
