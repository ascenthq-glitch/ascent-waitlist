# Topdraft Leads Skill

## What This Skill Does
Analyzes Twitter/X follower CSV exports to build TWO pipelines simultaneously:
1. **Founder Pipeline** — Indian startup founders who are hiring (Topdraft customers)
2. **Candidate Pipeline** — Early talent looking to join startups (Topdraft candidates)

## About Topdraft
Topdraft is a startup matchmaking platform that connects early-stage talent with Indian founders. We need two types of leads:
- Founders who are hiring → our customers
- Early talent who want startup roles → our candidates

## When To Trigger This Skill
- User uploads a CSV file from a Twitter follower export tool
- User says "find founders", "filter leads", "analyze followers"
- User says "find candidates", "find talent", "build pipeline"
- User mentions scraping VC or founder Twitter accounts

## How To Use
1. Export followers CSV from any Twitter scraping tool
2. Place CSV in this folder
3. Say: "Run Topdraft pipeline on [filename].csv"
4. Get two scored lists — founders AND candidates
5. Export both for outreach

## Input Format
CSV with columns: Name, Username, Bio, Location, Followers Count, Profile URL

## Output Format
Two separate scored tables:
- Founder leads (score 1-10, india signal, hiring signal)
- Candidate leads (score 1-10, skills, experience level)

## Best Accounts To Scrape For Founders
- @Blume_Ventures
- @Nithin0dha (Zerodha founder)
- @peakxv (Peak XV / Sequoia India)
- @ankurkapoor
- @prashanth_prakash

## Best Accounts To Scrape For Candidates
- @ETHIndiaa
- @hasgeek
- @IITBombay
- @iitdelhi
- @BITSPilani
- Indian hackathon and tech community accounts
