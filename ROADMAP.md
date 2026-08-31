CODEX ROADMAP

Working codename: Codex

Goal: Build an immersive, AI-directed tabletop fantasy RPG platform where the AI acts as game master, world simulator, rules engine, story director, and presentation layer. The first release is optimized for two players on separate laptops/desktops, with shared world state and player-specific private information.

Product Principles

AI-directed, not chat-driven

Codex is not a chatbot wrapped around a character sheet. The AI operates through structured systems: world state, rules, factions, NPC goals, timelines, secrets, consequences, and presentation.

Emergent campaigns

Campaigns are generated from player preferences and creative boundaries rather than selected from prewritten adventures.

Guided complexity

The simulation can be deep while the interface remains approachable. Players see the mechanics, choices, and information that matter right now.

Player-specific reality

Every player receives a server-generated view of the game state. Shared information is synchronized, while private perceptions, memories, objectives, clues, and secrets are delivered only to the relevant player.

Learn while playing

Beginner guidance appears when a mechanic becomes relevant and can differ by player.

Structured canon

Campaign truth lives in structured data, not only in an AI transcript. Facts need visibility, certainty, provenance, and relationships.

Architecture Direction

Player Action
│
▼
Action Interpreter
│
▼
Rules Engine
│
▼
World Simulator
│
▼
Story Director
│
▼
Visibility Engine
│
▼
Presentation Director
│
▼
Player-Specific UI

Supporting systems will eventually include campaign memory, faction simulation, NPC goals, quest state, scene state, combat state, inventory, conditions, timeline events, audio direction, AI context assembly, and safety/preference boundaries.

Technology Foundation

Frontend / Server: Next.js App Router + TypeScript
Styling: SCSS Modules
Validation: Zod
Database: PostgreSQL via Supabase
Authentication: Supabase Auth
Realtime: Supabase Realtime
Deployment: TBD
AI Provider Layer: internal abstraction later

Repository convention:

codex/
├── src/
│ ├── app/ # routes, layouts, pages, route handlers
│ ├── components/ # reusable UI
│ ├── features/ # domain-oriented features
│ └── lib/
│ └── supabase/ # Supabase browser/server infrastructure
├── supabase/
│ └── migrations/ # database migrations ONLY
├── docs/ # project documentation
└── public/

Development Method: Vertical Chunks

Codex will be developed in complete vertical slices, not scattered micro-tasks.

A vertical chunk should normally include:

Database
→ server/domain logic
→ validation
→ authorization
→ UI
→ player flow
→ tests
→ verification
→ commit

A chunk is complete when a player-visible capability works end to end.

Phase 0 — Clean Foundation

Fresh Next.js project

TypeScript baseline

ESLint baseline

Production build verified

Supabase packages installed

Browser Supabase client

Server Supabase client

Local environment variables configured

Supabase connectivity health route verified

Clean Git checkpoint

Database foundation applied and verified

Exit condition: the application builds cleanly, connects to a clean Supabase project, and has a minimal secure database foundation ready for player-facing development.

Vertical Chunk 1 — Identity + Campaign Lobby

Player outcome

Two real users can authenticate, create profiles, create a campaign, receive an invite code, join the same campaign from separate devices, and see the same lobby.

This is the first real playable product slice.

Includes

Database entities:

profiles
campaigns
campaign_members

Security requirements:

users manage their own profile
campaign-private data is member-only
arbitrary UUID knowledge cannot grant membership
joining happens through a controlled invite-code operation
private campaign data is protected by RLS

Player flows:

Sign up / sign in
→ create profile
→ create campaign
→ campaign lobby

Sign up / sign in
→ enter invite code
→ join campaign
→ campaign lobby

Lobby displays campaign title, host, players, readiness/presence, and invite code for the host.

Exit condition: two players on two browser sessions can reliably enter the same secured campaign lobby.

Vertical Chunk 2 — Campaign Preferences + Session Zero

Players establish creative boundaries without choosing a prewritten story.

Preference areas can include tone, danger, mystery, combat frequency, roleplay emphasis, exploration, intrigue, horror intensity, humor, romance boundaries, themes to emphasize/avoid, expected campaign length, and rules guidance level.

The system distinguishes:

individual preferences
party-wide preferences
hard boundaries
soft preferences
AI-director configuration

Exit condition: a campaign has a validated preference profile that safely constrains generation.

Vertical Chunk 3 — Guided Character Creation

Players create characters through an approachable guided flow instead of a dense static character sheet.

Initial areas:

identity
fantasy archetype
background
core attributes
skills/proficiencies
abilities
inventory
health/resources
personality hooks
goals
relationships
private character information
beginner guidance level

Visibility must support:

everyone
party
specific player
director only

Exit condition: both players have valid campaign characters and can receive player-specific information securely.

Vertical Chunk 4 — Campaign Genesis

Codex creates an original structured campaign foundation from party preferences and characters.

Generated state can include:

campaign premise
starting region
important locations
factions
initial NPCs
faction goals
NPC goals
hidden truths
threats
active tensions
timeline seeds
adventure opportunities
opening situation

Canon facts support visibility:

public
party
player_private
npc_private
director_secret

and certainty:

confirmed
rumor
belief
lie
theory
secret_truth

Exit condition: the campaign can be reconstructed from structured data without relying on a chat transcript.

Vertical Chunk 5 — Private Prologues

Each player receives a short character-specific opening sequence that can establish memories, relationships, stakes, secret knowledge, private objectives, and character-specific perceptions.

Exit condition: two players can simultaneously experience different private narrative content within the same campaign without leakage.

Vertical Chunk 6 — Shared Opening Scene

Both players enter the same generated scene and receive synchronized shared state.

A scene can track:

location
participants
environment
time
mood
immediate situation
known exits
interactive objects
active threats
scene objectives
presentation state

Exit condition: both clients stay synchronized while preserving player-specific private overlays.

Vertical Chunk 7 — Action Interpreter + Basic Resolution

Pipeline:

Player input
→ intent extraction
→ target identification
→ relevant rule identification
→ required roll/check
→ result
→ world-state mutation
→ consequence
→ presentation

The AI must not directly mutate canonical state without validated application logic.

Exit condition: a player action can move through the whole pipeline and produce a persisted world-state change.

Vertical Chunk 8 — Dice + Beginner Rules Guidance

Codex automatically handles relevant rolls and teaches mechanics in context.

Guidance should answer:

Why am I rolling?
What stat applies?
What can I do here?
What does this mechanic mean?
What happens if I fail?

Exit condition: a beginner can play supported mechanics without needing an external rulebook.

Vertical Chunk 9 — Campaign Memory + Canon Ledger

The world remembers events, facts, beliefs, rumors, secrets, relationships, promises, debts, discoveries, player choices, consequences, and unresolved threads.

AI context is assembled from relevant structured memory rather than dumping the whole transcript.

Exit condition: old decisions meaningfully affect later scenes without contradiction or transcript-scale prompts.

Vertical Chunk 10 — Living World Simulation

Factions and NPCs pursue goals and create consequences outside the immediate player scene.

Systems can include faction goals, resources, relationships, plans, NPC agendas, regional pressures, scheduled events, escalation, and opportunity windows.

Exit condition: ignoring a problem can produce coherent future consequences.

Vertical Chunk 11 — Story Director

The Story Director manages pacing, tension, revelations, foreshadowing, downtime, escalation, novelty, spotlight balance, unfinished threads, and scene transitions.

It should choose from plausible world events rather than force arbitrary drama.

Exit condition: sessions feel intentionally paced while preserving player agency and simulated causality.

Vertical Chunk 12 — Presentation Director

The UI changes according to context.

Examples:

exploration → scene, surroundings, actionable details
conversation → speaker focus, relationship/perception cues
combat → turns, targets, actions, resources, conditions
investigation → evidence, observations, tools, private deductions

Exit condition: Codex no longer feels like a static dashboard with a story textbox attached.

Vertical Chunk 13 — Combat v1

First combat systems:

initiative/turn order
health
movement abstraction
actions
targets
attacks
damage
conditions
victory/defeat
basic enemy behavior

Exit condition: a multiplayer combat encounter can begin, resolve, persist, and return to narrative play.

Vertical Chunk 14 — Inventory, Items + Character Resources

Support inventory, equipment, consumables, currency, resources, discovery, ownership, transfers, and private items.

Exit condition: items participate safely in action resolution and canonical state changes.

Vertical Chunk 15 — Quest + Objective System

Support party objectives, personal objectives, hidden objectives, optional opportunities, failed objectives, and evolving objectives.

Exit condition: the system can reason about what players are trying to accomplish and what remains unresolved.

Vertical Chunk 16 — Save / Resume + Session Lifecycle

Lifecycle:

Campaign
→ Session
→ Scenes
→ Events/actions

Support session start/end, recaps, resume, reconnection, and state recovery.

Exit condition: closing the application does not threaten campaign continuity.

Vertical Chunk 17 — Adaptive Audio

Music and ambience respond to location, mood, danger, intensity, narrative phase, combat state, factions, characters, and villains.

Start with curated/adaptive playback before fully generated audio.

Exit condition: scene transitions can smoothly alter the soundscape without manual player control.

Vertical Chunk 18 — Narration + Voice

Potential later capabilities:

AI narrator voice
NPC voices
private narration
player-specific audio
accessibility narration

Vertical Chunk 19 — Visual Scene Direction

Potential systems:

generated scene art
location establishing images
NPC portraits
maps
combat visualization
dynamic scene composition

Visual generation must consume structured world state rather than independently invent canon.

Vertical Chunk 20 — Multiplayer Hardening

Before broader multiplayer:

reconnection
concurrency conflicts
host migration
presence
latency handling
idempotent actions
duplicate-request prevention
authorization audits
private-data leak tests
rate limiting
observability

Vertical Chunk 21 — Campaign Creation Expansion

Potential later features:

genre profiles
setting constraints
custom rule presets
campaign duration profiles
procedural cultures
religions/cosmology
regional generation
historical timelines
dynamic economies
world maps
homebrew inputs

Vertical Chunk 22 — AI Architecture Hardening

Production AI layer:

model abstraction
structured output schemas
prompt/version management
context assembly
tool permissions
retry strategy
validation
state-change proposals
cost tracking
latency tracking
fallback models
AI event logs
evaluation datasets
regression tests

Core rule:

AI proposes and interprets. Application logic validates and commits canonical state.

Vertical Chunk 23 — Evaluation + Simulation Testing

Test questions include:

Can private facts leak between players?
Can AI contradict confirmed canon?
Can a faction act with knowledge it does not possess?
Can an invalid action mutate state?
Does a campaign remain coherent after 50 scenes?
Can two players act nearly simultaneously?
Does the Story Director over-focus one character?
Does guidance adapt correctly?

Vertical Chunk 24 — Deployment + Closed Alpha

Closed-alpha requirements:

production deployment
secure environment configuration
database backups
error tracking
basic analytics
AI usage tracking
account recovery
privacy policy
terms
campaign deletion
data export strategy
feedback capture

First Playable Milestone

Two players can:

1. Create accounts.
2. Create or join the same campaign.
3. Set campaign preferences.
4. Create characters.
5. Receive private prologues.
6. Enter a shared generated opening scene.
7. Take independent actions.
8. Resolve basic checks automatically.
9. Receive shared/private information correctly.
10. See contextual UI relevant to the current moment.
11. Save and resume the campaign.

At that point Codex is a playable AI-directed tabletop RPG prototype.

Not Yet

Avoid prematurely building:

large content libraries
hundreds of spells
full ruleset parity
mobile-first UI
shared-TV dependency
generated video
complex map editors
marketplaces
modding APIs
public campaign discovery
monetization

Current Next Chunk

Vertical Chunk 1 — Identity + Campaign Lobby

The next implementation chunk should deliver:

Database foundation
→ authentication
→ profile creation
→ campaign creation
→ secure invite-code joining
→ campaign membership
→ synchronized lobby
→ RLS verification
→ two-user test
→ lint
→ production build
→ commit

Do not stop after merely creating the first migration.

The chunk is finished when two authenticated users can reach the same campaign lobby from separate sessions while unauthorized users cannot read or join that campaign.

Definition of Done for Every Vertical Chunk

✓ schema/state model established
✓ authorization defined
✓ server logic implemented
✓ client experience works
✓ invalid paths handled
✓ persistence works
✓ privacy boundaries tested
✓ lint passes
✓ TypeScript/build passes
✓ end-to-end behavior manually verified
✓ changes committed

Guiding Vision

Codex should eventually feel less like:

“An AI tells us a D&D story.”

and more like:

“We entered a living fantasy world, and the game itself understands what is happening.”
