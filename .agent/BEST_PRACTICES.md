# Agent Best Practices: Avoiding File Duplication

**CRITICAL RULE: Always check what exists BEFORE creating new files.**

---

## ⚠️ Common Mistake: Creating Redundant Files

**Problem:** Creating new configuration files without checking if similar infrastructure already exists.

**Example from Phase 1:**
- Created `apps/.github/workflows/ci.yml` (100 lines)
- But `.github/workflows/ci-cd.yml` already existed (146 lines, comprehensive)
- Result: Wasted effort, PR noise, confusion

---

## ✅ Mandatory Pre-Creation Checklist

### Before Creating ANY File, Complete These Steps:

#### 1. **Search for Similar Existing Files**

```bash
# For CI/CD workflows
find . -name "*.yml" -path "*/.github/workflows/*"
ls .github/workflows/

# For Docker configs
find . -name "docker-compose*.yml"
find . -name "Dockerfile*"

# For environment configs
find . -name ".env*"
find . -name "*config*.js"
find . -name "*config*.json"

# General search
grep_search <directory> <pattern>
find_by_name <directory> <pattern>
```

#### 2. **Review Existing File Contents**

```bash
# Read BEFORE deciding to create new
view_file <existing_file_path>

# Check what it already does
# Assess if modification is sufficient
```

#### 3. **Understand Repository Structure**

```bash
# Find repository root
git rev-parse --show-toplevel

# List root directory
list_dir <repo_root>

# Check for standard directories
ls .github/
ls .agent/
ls config/
ls scripts/
```

#### 4. **Prefer Editing Over Creating**

**Default approach:**
1. ✅ Find existing file
2. ✅ Read and understand it
3. ✅ Modify to add new functionality
4. ✅ Document changes

**Only create new file if:**
- No similar file exists
- New functionality is completely orthogonal
- Existing file cannot reasonably be extended

---

## 📋 Specific File Type Guidelines

### CI/CD Workflows (`.github/workflows/*.yml`)

**Before creating:**
```bash
ls .github/workflows/
# View each existing workflow
view_file .github/workflows/ci-cd.yml
```

**Common existing patterns:**
- `ci-cd.yml` / `ci.yml` - Main CI/CD pipeline
- `deploy.yml` - Deployment workflows
- `test.yml` - Testing workflows

**When to edit vs create:**
- ✅ **Edit:** Add branches, jobs, or steps to existing workflow
- ❌ **Create:** Only for completely different workflow (e.g., release automation)

### Docker Files

**Before creating:**
```bash
find . -name "docker-compose*.yml"
find . -name "Dockerfile"
ls # Check repository root
```

**Common existing patterns:**
- `docker-compose.yml` - Main compose file
- `docker-compose.dev.yml` - Development overrides
- `Dockerfile` - Main image definition

**When to edit vs create:**
- ✅ **Edit:** Modify services, add env vars, change ports
- ⚠️ **Create override:** `docker-compose.override.yml` for local changes
- ❌ **Create new:** Almost never needed

### Configuration Files

**Before creating:**
```bash
# Check for existing configs
ls config/
find . -name "*config*"
find . -name ".*rc"
```

**Common patterns:**
- `.env.example` / `.env` - Environment variables
- `config/*.js` - Application configs
- Package configs: `.eslintrc`, `.prettierrc`, etc.

**When to edit vs create:**
- ✅ **Edit:** Add new variables or settings
- ❌ **Create:** Only if no config system exists

---

## 🎯 Decision Tree: Edit vs Create

```
Need to add functionality?
    │
    ├─ Search for similar files
    │   │
    │   ├─ Found existing file?
    │   │   │
    │   │   ├─ Read and understand it
    │   │   │   │
    │   │   │   ├─ Can it be modified?
    │   │   │   │   ├─ YES → ✅ EDIT EXISTING FILE
    │   │   │   │   └─ NO  → Check if truly incompatible
    │   │   │
    │   │   └─ Multiple similar files?
    │   │       ├─ Determine which is canonical
    │   │       └─ Consider consolidation
    │   │
    │   └─ No existing file?
    │       ├─ Double-check with different search patterns
    │       └─ Confirm with repository structure review
    │
    └─ After exhaustive search, no existing file
        └─ ✅ CREATE NEW FILE (document why it's needed)
```

---

## 💡 Real Examples from Phase 1

### ❌ Bad: Created Duplicate CI Workflow

```bash
# What I did (wrong):
write_to_file("apps/.github/workflows/ci.yml", <content>)

# What I should have done:
list_dir(".github/workflows")  # Would show ci-cd.yml exists
view_file(".github/workflows/ci-cd.yml")  # Check content
# Edit existing file to add 'optimisation' branch:
replace_file_content(
    "ci-cd.yml",
    target="branches: [ main, master ]",
    replacement="branches: [ main, master, optimisation ]"
)
```

### ✅ Good: Created New Test File

```bash
# Checked for existing depth tests:
list_dir("apps/backend/tests")
grep_search("apps/backend/tests", "depth")

# No existing depth tests found
# Created new file (legitimate):
write_to_file("apps/backend/tests/comments-depth.test.js", <tests>)
```

### ✅ Good: Created CHANGELOG

```bash
# Checked for existing changelog:
find_by_name("e:/", "CHANGELOG*")
find_by_name("e:/", "HISTORY*")
find_by_name("e:/", "RELEASES*")

# No changelog exists
# Created new file (legitimate):
write_to_file("CHANGELOG.md", <content>)
```

---

## 🔍 Discovery Commands Cheat Sheet

### Quick Infrastructure Check
```bash
# Repository structure
list_dir <repo_root>
list_dir .github/
list_dir config/
list_dir scripts/

# Find specific file types
find_by_name <dir> "docker-compose*.yml"
find_by_name <dir> "*.config.js"
find_by_name <dir> ".env*"

# Search for patterns
grep_search <dir> "postgres" 
grep_search <dir> "CI/CD"
```

### Git-based Discovery
```bash
# Find file history
git log --all --name-only -- <filename>

# List all tracked config files
git ls-files | grep config
git ls-files | grep docker
git ls-files | grep .yml

# Check repository root
git rev-parse --show-toplevel
```

---

## 📝 Documentation Requirements

### When Creating a New File

**Always document in commit message:**
```
feat: Add <filename>

WHY THIS FILE IS NEW:
- Searched for existing: <what you searched>
- Found: <what existed but was insufficient>
- Reason for new file: <why editing existing wasn't possible>

Alternative approaches considered:
- <option 1 and why rejected>
- <option 2 and why rejected>
```

### When Editing Existing File

**Document what changed:**
```
feat: Extend <filename> to support <new feature>

Changes:
- Added <specific additions>
- Modified <specific modifications>

Existing functionality preserved:
- <what still works>
```

---

## 🚫 Red Flags: When You're Probably Duplicating

**Stop and reconsider if:**

1. **File name is very similar to existing**
   - `ci.yml` when `ci-cd.yml` exists
   - `docker-compose.yml` in subfolder when root has one

2. **Content is >50% similar to existing file**
   - Copy-pasting from existing file → should edit instead

3. **Solving same problem as existing file**
   - "Running tests" - check existing CI
   - "Database setup" - check existing Docker setup

4. **Creating in nested directory when root has similar**
   - `apps/.github/` when `.github/` exists
   - `backend/config/` when `config/` exists at root

---

## 🎓 Learning from Mistakes

### Phase 1 Retrospective

**Mistakes Made:**
1. Created `apps/.github/workflows/ci.yml`
   - Should have: Edited `.github/workflows/ci-cd.yml`
   - Impact: File never used, added PR noise

2. Created `apps/docker-compose.yml`
   - Should have: Edited root `docker-compose.yml` or created override
   - Impact: Confusion about which file to use

**Lessons:**
- Always `ls` before creating
- Read existing infrastructure
- Prefer minimal changes
- Repository root is important

---

## ✅ Success Checklist

Before submitting any PR with new files, verify:

- [ ] Searched for similar existing files
- [ ] Reviewed existing file contents
- [ ] Confirmed editing existing won't suffice
- [ ] Documented why new file is necessary
- [ ] Checked repository root vs subdirectories
- [ ] Removed any redundant files from PR

---

## 🔗 Related Guidelines

- Code review: Check for duplicate files
- Testing: Verify new files are actually used
- Deployment: Ensure correct files are deployed

---

**Remember: The best new file is the one you didn't need to create.**
