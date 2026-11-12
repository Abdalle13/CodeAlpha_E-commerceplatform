# HILAARA Store - Git and GitHub Workflow

## 1. Repository Overview and Setup

The repository is configured under the project name `hilaara-store` (cloned locally as `CodeAlpha_E-commerceplatform`):
- Default Branch: `main`
- Remote URL: `https://github.com/Abdalle13/CodeAlpha_E-commerceplatform.git`
- Remote Identifier: `origin`

The repository must remain clean, purposeful, and free of extraneous generated artifacts, local secrets, or temporary files.

---

## 2. Commit Strategy and Standards

Commits represent coherent, functional, and verifiable milestones. Rather than committing fragmented work, commits are made at structured milestones:
- After completing a full implementation phase.
- After a substantial and tested sub-milestone within a complex phase.
- After completing a foundational architectural or documentation milestone.
- After resolving and verifying important test fixes.

### 2.1 Commit Message Rules
- Natural, professional, and descriptive language written in the imperative mood.
- Strict Prohibition of Generic AI Prefixes: Do not use `feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `docs:`, or `test:`.
- Examples of Compliant Commit Messages:
  - `Establish project documentation and system architecture`
  - `Build storefront layout, navigation, and brand assets`
  - `Implement customer authentication and role access controls`
  - `Add product catalog browsing and faceted filtering`
  - `Complete persistent shopping cart and slide-over drawer`
  - `Implement checkout flow and atomic order creation`
  - `Integrate mobile money payment simulation gateway`
  - `Build real-time admin command center and product CRUD`
  - `Verify end-to-end test suite and Netlify deployment configuration`

### 2.2 Pre-Commit Verification Checklist
Before executing any commit:
1. Run `git status` to inspect all staged and unstaged modifications.
2. Review file diffs to ensure no unintended files or temporary scratch files are staged.
3. Confirm that no secret keys (`.env`, private keys, passwords) are present.
4. Confirm that build directories (`dist/`, `node_modules/`, `.netlify/`) are ignored.
5. Run linting and relevant tests to verify that code builds cleanly.

---

## 3. Remote Push and Milestone Reporting

### 3.1 Push Strategy
Completed milestones must be pushed directly to the `origin` remote on branch `main`:
- Do not perform force-pushes (`git push -f`) that could rewrite shared history.
- Ensure that local work is cleanly integrated with upstream changes before pushing.
- Only report a push as successful if Git returns an explicit confirmation code 0.

### 3.2 Phase Completion Reporting Format
At the conclusion of each implementation phase, the developer report must state:
1. Phase Summary: Concise summary of features built and integrated.
2. Modified and Created Files: Key files created or updated.
3. Tests Executed and Results: Test suite execution status and pass counts.
4. Commit Hash and Message: Exact short hash and descriptive message.
5. Push Status: Confirmation that changes were pushed to GitHub `origin/main`.
6. Known Limitations or Next Steps: Any operational dependencies for the upcoming phase.

---

## 4. Git Ignore Policy (`.gitignore`)

The project `.gitignore` file enforces exclusion of local and sensitive assets:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing and Coverage
coverage/
.nyc_output/

# Production Build Output
dist/
build/
.dist/

# Netlify Cache and Local Functions Output
.netlify/

# Local Environment Variables and Secrets
.env
.env.local
.env.*.local
*.pem

# Editor and OS Cache
.DS_Store
Thumbs.db
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```
