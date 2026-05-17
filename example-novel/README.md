# Novel Writing with Claude Code

This directory contains a complete AI-assisted novel writing workflow powered by Claude Code skills.

## Quick Start

### 1. Set Up Your Novel

Copy this example-novel directory structure:

```bash
mkdir -p ~/novels/my-novel/{chapters,summaries}
cp example-novel/CLAUDE.md ~/novels/my-novel/
cp example-novel/outline.md ~/novels/my-novel/
cp example-novel/events.md ~/novels/my-novel/
cd ~/novels/my-novel
```

### 2. Configure Your Novel

Edit `CLAUDE.md` and fill in:
- Character profiles (name, personality, background, speech patterns)
- World-building (power system, geography, factions)
- Writing style preferences (tone, pacing, POV)

Edit `outline.md` with your story structure:
- Overall plot arcs
- Chapter-by-chapter outlines (at least the first 10-20)
- Key plot points and foreshadowing plans

### 3. Generate Your First Chapter

```bash
/novel-writer "Chapter 1: [Your chapter 1 outline]"
```

Example:
```bash
/novel-writer "Chapter 1: 林玄觉醒后发现自己穿越到修仙世界，灵根检测显示是最低级的五行杂灵根"
```

### 4. Review and Refine

After generation, review the chapter:

```bash
/novel-reviewer chapters/001.md
```

Check the consistency report and address any issues.

### 5. Generate Summary

Create a summary and update the events index:

```bash
/novel-summarizer chapters/001.md
```

### 6. Continue Writing

Repeat steps 3-5 for subsequent chapters!

---

## Available Skills

### `/novel-writer`
**Purpose:** Generate chapter content from outlines

**Input:** Chapter outline or description

**Output:** Full chapter saved to `chapters/XXX.md`

**Example:**
```bash
/novel-writer "Chapter 5: 主角在黑市购买神秘丹药，遇到伏笔人物"
```

---

### `/novel-reviewer`
**Purpose:** Check chapter consistency

**Input:** Path to chapter file

**Output:** Detailed consistency report covering:
- Character personality alignment
- Timeline logic
- World-building contradictions
- Plot holes

**Example:**
```bash
/novel-reviewer chapters/005.md
```

---

### `/novel-summarizer`
**Purpose:** Generate summary and update events index

**Input:** Path to chapter file

**Output:** 
- Chapter summary saved to `summaries/XXX.md`
- Updated `events.md` with plot developments

**Example:**
```bash
/novel-summarizer chapters/005.md
```

---

### `/novel-workflow` (Recommended)
**Purpose:** Complete workflow guide

**Input:** Chapter outline

**Output:** Reminder to run all three skills in sequence

**Example:**
```bash
/novel-workflow "Chapter 5: ..."
# Then manually run: novel-writer → novel-reviewer → novel-summarizer
```

---

## File Structure

```
my-novel/
├── CLAUDE.md          # Character profiles, world-building, writing guide
├── outline.md         # Story structure and chapter plans
├── events.md          # Key events index (auto-updated by novel-summarizer)
├── README.md          # This file
├── chapters/          # Generated chapters
│   ├── 001.md
│   ├── 002.md
│   └── ...
└── summaries/         # Chapter summaries (auto-generated)
    ├── 001.md
    ├── 002.md
    └── ...
```

---

## Workflow

### Standard Chapter Creation

```
┌─────────────────────┐
│ 1. Plan chapter     │  ← Update outline.md
│    in outline       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. Generate chapter │  ← /novel-writer "Ch.N: ..."
│    with AI          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. Review for       │  ← /novel-reviewer chapters/NNN.md
│    consistency      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. Generate summary │  ← /novel-summarizer chapters/NNN.md
│    & update index   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. Git commit       │  ← git add . && git commit
│    your progress    │
└─────────────────────┘
```

---

## Best Practices

### Before You Start

1. **Complete CLAUDE.md thoroughly**
   - Detailed character profiles prevent personality inconsistencies
   - Clear world-building rules prevent contradictions
   - Style guide ensures consistent tone

2. **Outline at least 20-30 chapters ahead**
   - Helps AI understand where the story is going
   - Prevents writing yourself into corners
   - Makes foreshadowing more natural

3. **Decide on your target length**
   - Short novel: 100-150 chapters (~300k words)
   - Medium novel: 200-300 chapters (~600-900k words)
   - Long novel: 500+ chapters (1.5M+ words)

### During Writing

1. **Review every chapter**
   - AI is excellent but not perfect
   - Consistency checks catch issues early
   - Easier to fix in chapter 5 than discover in chapter 50

2. **Update CLAUDE.md as you go**
   - Add new recurring characters
   - Update relationship statuses
   - Mark foreshadowing as paid off
   - Refine world-building details

3. **Check events.md regularly**
   - Review open plot threads
   - Track foreshadowing payoff opportunities
   - Ensure character arcs are progressing

4. **Git commit after each chapter**
   ```bash
   git add chapters/NNN.md summaries/NNN.md events.md
   git commit -m "Add chapter NNN: [brief description]"
   ```

5. **Take breaks to plan**
   - After every 20-30 chapters, review your outline
   - Adjust future chapters based on story evolution
   - Check pacing and arc progression

### Quality Tips

1. **Leverage character speech patterns**
   - Define unique voices in CLAUDE.md
   - Review helps ensure dialogue consistency

2. **Plant foreshadowing intentionally**
   - Add to outline.md when planning
   - Track in events.md when writing
   - novel-reviewer will remind you to pay off setups

3. **Vary pacing**
   - Alternate action chapters with character development
   - Use outline.md to plan pacing rhythms
   - Readability analysis helps spot pacing issues

4. **Maintain power scaling**
   - Document power levels in CLAUDE.md
   - Consistency check catches power jumps
   - Update character abilities as they grow

---

## Advanced Usage

### Batch Processing Existing Chapters

If you wrote chapters without skills:

```bash
# Generate summaries for chapters 1-10
for i in {001..010}; do
  /novel-summarizer chapters/$i.md
done
```

### Re-reviewing After Edits

After manually editing a chapter:

```bash
/novel-reviewer chapters/005.md  # Check updated chapter
/novel-summarizer chapters/005.md  # Regenerate summary
```

### Branching Storylines

Try different plot directions:

```bash
git checkout -b alternate-ending
/novel-writer "Chapter 50: [Different direction]..."
# Compare both versions before deciding
```

---

## Troubleshooting

### "No CLAUDE.md found"
**Solution:** You're not in your novel directory. Run `cd ~/novels/my-novel` first.

### Generated chapter doesn't match my style
**Solution:** 
1. Add more detail to "Writing Style Guide" section in CLAUDE.md
2. Provide example paragraphs of your preferred style
3. Regenerate with more specific outline

### Character acting out of character
**Solution:**
1. Check character profile in CLAUDE.md - is it detailed enough?
2. Review says "personality inconsistent" - add more behavioral examples
3. Manual edit the chapter, then re-run summarizer

### Forgot what happened 50 chapters ago
**Solution:**
1. Check `events.md` for plot summary
2. Read `summaries/050.md` for chapter summary
3. Search chapters: `grep -r "keyword" chapters/`

### AI suggests contradicting my established rules
**Solution:**
1. Update CLAUDE.md with clearer world-building rules
2. Add to "Things to Remember" section
3. Re-review will catch future violations

---

## Tips for Long Novels (500+ chapters)

1. **Use arc structure**
   - Group chapters into arcs (every 50-100 chapters)
   - Each arc has setup → development → climax → resolution
   - Prevents endless middle syndrome

2. **Maintain context files carefully**
   - CLAUDE.md should stay under 10k words
   - Move resolved plot threads from events.md to archive
   - Keep only active information in context

3. **Regular outline reviews**
   - Every 50 chapters, review and revise outline.md
   - Adjust based on character development
   - Some best plots emerge during writing, not planning

4. **Character growth tracking**
   - Update power levels in CLAUDE.md
   - Track relationship changes
   - Note personality evolution (if intentional)

5. **Avoid power creep**
   - Define clear power ceiling in world-building
   - Track protagonist's growth rate
   - Escalate stakes through complexity, not just power

---

## FAQ

**Q: Can I edit the generated chapters?**  
A: Yes! AI is a co-writer, not a replacement. Edit freely, then re-run novel-summarizer to update the summary.

**Q: How much does this cost?**  
A: Depends on your Claude Code plan. Each chapter generation uses ~3000-4000 tokens, review ~2000, summary ~1000. A complete workflow is ~6000-7000 tokens per chapter.

**Q: Can I use this for non-Chinese novels?**  
A: Absolutely! Edit CLAUDE.md to specify your language and dialogue format.

**Q: What if I want to write collaboratively?**  
A: Git enables this! Each author works on a branch, merge via pull requests.

**Q: Can I export to epub/pdf?**  
A: Yes. Markdown chapters can be converted using tools like Pandoc:
```bash
pandoc chapters/*.md -o my-novel.epub
```

---

## Support

For issues with the skills themselves, check the skill files:
- `~/.claude/skills/novel-writer/SKILL.md`
- `~/.claude/skills/novel-reviewer/SKILL.md`
- `~/.claude/skills/novel-summarizer/SKILL.md`

For Claude Code usage, run `/help`

---

## License

This skill system is open source. Use it, modify it, share it!

---

**Happy Writing! 写作愉快！**
