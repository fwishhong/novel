# Novel Writing Skills for Claude Code

Complete AI-assisted novel writing workflow built on Claude Code skills.

## 🎯 Quick Start (5 Minutes)

```bash
# 1. Copy example template to your novel directory
cp -r example-novel ~/novels/my-first-novel
cd ~/novels/my-first-novel

# 2. Edit CLAUDE.md - add your characters and world-building
# 3. Edit outline.md - plan your story structure

# 4. Generate first chapter
/novel-writer "Chapter 1: [Your chapter 1 outline]"

# 5. Review it
/novel-reviewer chapters/001.md

# 6. Generate summary
/novel-summarizer chapters/001.md

# Done! Repeat for subsequent chapters.
```

---

## 📦 What's Included

### Skills (in `~/.claude/skills/`)

1. **`novel-writer`** - Generates 3000-5000 word chapters from outlines
2. **`novel-reviewer`** - Checks consistency (characters, timeline, world-building, plot)
3. **`novel-summarizer`** - Creates summaries + updates events index
4. **`novel-workflow`** - Guide for using all three in sequence

### Templates (in `example-novel/`)

1. **`CLAUDE.md`** - Character profiles, world-building, style guide
2. **`outline.md`** - Story structure and chapter plans
3. **`events.md`** - Key events tracker (auto-updated)
4. **`README.md`** - Complete usage guide

---

## 🚀 Workflow

```
┌──────────────┐
│ 1. Write     │  /novel-writer "Ch.N: outline"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 2. Review    │  /novel-reviewer chapters/NNN.md
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 3. Summarize │  /novel-summarizer chapters/NNN.md
└──────────────┘
```

---

## 📁 File Structure

```
your-novel/
├── CLAUDE.md          ← Character profiles, world rules, style
├── outline.md         ← Story structure, chapter plans
├── events.md          ← Auto-updated event index
├── chapters/
│   ├── 001.md        ← Generated chapters
│   ├── 002.md
│   └── ...
└── summaries/
    ├── 001.md        ← Auto-generated summaries
    ├── 002.md
    └── ...
```

---

## 🎨 Design Philosophy

### Why Skills Instead of Web App?

**Old Web App (13k lines of code):**
- Complex API + database + UI
- Maintenance burden
- API costs every generation
- "Consistency checking" didn't really work at scale

**New Skill System (400 lines total):**
- Pure Markdown + Git
- Zero infrastructure
- Context management via files
- Better consistency through subagent review
- Version control built-in

### Core Principles

1. **Markdown as database** - `CLAUDE.md` = character DB, `events.md` = plot DB
2. **Git as version control** - Branch for alternate endings, commit each chapter
3. **Subagents for review** - Isolated reviewer catches issues without polluting context
4. **Rolling summaries** - Context window can't hold 500 chapters, summaries can
5. **Human-AI collaboration** - AI writes, human edits, AI learns from edits

---

## 🔥 Key Features

### 1. Character Consistency
- Define `speechPattern` in CLAUDE.md
- Reviewer checks every dialogue against it
- Example: "Formal + uses archaic terms" vs "Casual + modern slang"

### 2. Timeline Logic
- Auto-tracks time between chapters
- Catches "wound healed too fast" errors
- Verifies travel distances make sense

### 3. World-Building Enforcement
- Define power system rules in CLAUDE.md
- Reviewer catches "character too strong for their level"
- Prevents deus ex machina moments

### 4. Foreshadowing Management
- Tag setups in outline.md
- Track in events.md
- Reviewer reminds you when it's time for payoff

### 5. Long-Form Context
- Chapter summaries keep context manageable
- Events index provides quick reference
- Recent 5 chapters loaded in full for continuity

---

## 💡 Best Practices

### Before Writing

- [ ] Complete CLAUDE.md with detailed character profiles
- [ ] Outline at least 20-30 chapters ahead
- [ ] Define power system rules clearly
- [ ] Establish world geography and locations

### During Writing

- [ ] Review every chapter (don't skip novel-reviewer!)
- [ ] Update CLAUDE.md as characters evolve
- [ ] Check events.md for open plot threads
- [ ] Git commit after each chapter

### Quality Checklist

- [ ] Character dialogue matches established speech patterns
- [ ] Power levels consistent with defined system
- [ ] Timeline makes logical sense
- [ ] Foreshadowing planted and tracked
- [ ] No contradictions with world-building

---

## 🎯 Use Cases

### Suitable For:

✅ Web novels (修仙, 玄幻, 都市, 科幻)  
✅ Long-form fiction (100-1000+ chapters)  
✅ Authors comfortable with Markdown + Git  
✅ Writers who want AI collaboration, not replacement  
✅ Stories with complex world-building and large casts

### Not Ideal For:

❌ Short stories (<10 chapters) - overhead not worth it  
❌ Non-technical writers who need GUI  
❌ Pure AI generation without human editing  
❌ Stories without planning (seat-of-pants writing)

---

## 📊 Comparison: Old App vs New Skills

| Feature | Web App (2025) | Skills (2026) |
|---------|----------------|---------------|
| **Setup** | npm install, DB config, API key | Copy template, edit CLAUDE.md |
| **Maintenance** | 13k LOC, dependencies, server | 400 lines, pure Markdown |
| **Context** | Hand-selected characters/memories | Auto-loaded based on relevance |
| **Consistency** | Single prompt check (ineffective) | Dedicated reviewer subagent |
| **Version Control** | Not built-in | Git native |
| **Cost** | API call per action | Only generation + review |
| **Scalability** | Struggles after ~50 chapters | Works for 1000+ chapters |
| **Collaboration** | Single user | Git branches for co-authors |

---

## 🚧 Limitations & Future Improvements

### Current Limitations

1. **Manual workflow** - Must run writer → reviewer → summarizer separately
   - *Future:* Skills could auto-chain when Claude Code supports it

2. **No visual UI** - Terminal/editor only
   - *Acceptable:* Target audience is technical writers

3. **No auto-save backups** - Rely on git
   - *Mitigation:* Use git + commit hooks

4. **Limited to Claude context window** - Even with summaries
   - *Mitigation:* Rolling summaries + events index manages this

### Potential Enhancements

- **Batch generation**: Generate outline → chapters 1-10 automatically
- **Character relationship graph**: Visual map of relationships
- **Pacing analysis**: Plot tension curve across all chapters
- **Multi-language**: Templates for different languages
- **Export tools**: Convert to epub, pdf, web format

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No CLAUDE.md found" | `cd` to your novel directory first |
| Character acting out of character | Add more detail to personality in CLAUDE.md |
| Reviewer finds many issues | Good! Fix them before proceeding |
| Generated content doesn't match style | Add style examples to CLAUDE.md |
| Lost track of plot | Check events.md and summaries/ |
| Too many open plot threads | Review outline.md, resolve some threads |

---

## 📚 Learn More

- **Complete Guide**: `example-novel/README.md`
- **Character Template**: `example-novel/CLAUDE.md`
- **Outline Template**: `example-novel/outline.md`
- **Skill Source**: `~/.claude/skills/novel-*/SKILL.md`

---

## 🎓 Examples

### Example 1: 修仙小说 (Cultivation Novel)

```bash
cd ~/novels/immortal-ascension

# CLAUDE.md includes:
# - Cultivation stages: 炼气 → 筑基 → 金丹 → 元婴 → ...
# - Power system rules
# - Protagonist: 林玄 (cautious, resourceful)

/novel-writer "Ch.1: 林玄穿越到修仙世界，发现自己是五行杂灵根"
/novel-reviewer chapters/001.md
/novel-summarizer chapters/001.md
```

### Example 2: Urban Fantasy

```bash
cd ~/novels/hidden-world

# CLAUDE.md includes:
# - Modern setting with hidden supernatural world
# - Power system: Awakened abilities
# - Protagonist: Alex (skeptical, analytical)

/novel-writer "Ch.1: Alex witnesses impossible event, discovers hidden world"
/novel-reviewer chapters/001.md
/novel-summarizer chapters/001.md
```

---

## 📜 Version History

- **v1.0 (2026-05-17)**: Initial release
  - 4 core skills
  - Complete template system
  - Rolling summary + events tracking

---

## 🙏 Credits

Built on:
- **Claude Code** - Anthropic's CLI for Claude
- **Claude 4.x** - Opus 4.7 for writing, Sonnet 4.6 for reviewing
- **Agent SDK concepts** - Subagent pattern for review

Inspired by the original Web App (2025-11-18) but redesigned from scratch for Claude Code.

---

## 📄 License

MIT - Use freely, modify as needed, share improvements!

---

**Ready to write your novel? 开始创作吧！**

```bash
cp -r example-novel ~/novels/my-epic-novel
cd ~/novels/my-epic-novel
# Edit CLAUDE.md and outline.md
/novel-writer "Chapter 1: ..."
```
