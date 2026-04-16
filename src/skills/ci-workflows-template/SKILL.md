---
name: ci-workflows-template
description: Generate GitHub Actions CI/CD workflows for Harness Engineering (risk-contract enforcer, PHP guardrails pipeline, doc freshness check). Use when setting up CI for a project, or when .github/workflows/ is missing key harness workflows.
---

# CI Workflows Template

## When to Use

- User asks to set up CI/CD for a project with Harness Engineering.
- A project has `.github/` but is missing risk-contract, guardrails, or doc-freshness workflows.
- Bootstrapping Harness Engineering CI in a new repository.

## Prerequisites

Before generating workflows, check:
1. Does the project have a `risk-tiers.json`? (needed by risk-contract workflow)
2. Does the project have an `AGENTS.md`? (needed by doc-freshness workflow)
3. What language/stack? (determines which guardrails pipeline to generate)
4. What is the default branch name? (default: `main`)

## Customization Questions

Ask the user before generating:
1. "Which workflows do you need?" (offer all three, let them pick)
2. "What is your default branch?" (default: `main`)
3. "For risk-contract: who are the reviewers for critical changes?" (GitHub usernames or team slugs)
4. "For PHP guardrails: what PHP version?" (default: `8.2`)

## Workflow 1: risk-contract.yml

**Purpose**: L1 Risk Tiering — read changed paths, assess risk, adjust check intensity.

Create `.github/workflows/risk-contract.yml` with risk assessment logic.

## Workflow 2: php-guardrails.yml

**Purpose**: L2 Four-Layer Defense for PHP projects.

Create `.github/workflows/php-guardrails.yml` with lint, type check, architecture, and tests.

## Workflow 3: doc-freshness.yml

**Purpose**: Combat Context Rot — validate docs, links, and config integrity.

Create `.github/workflows/doc-freshness.yml` with staleness check, link validation, and config validation.

## Post-Generation Checklist

After generating workflows, remind the user:

1. Verify workflows are in `.github/workflows/` (not `examples/`)
2. Ensure `risk-tiers.json` and `AGENTS.md` exist in project root
3. Replace placeholder reviewer names in `risk-contract.yml`
4. Push a test PR to verify workflows trigger correctly
5. Set up branch protection rules to require these checks to pass

## Recovery

If a workflow file is broken:

1. Rename to `<filename>.bak`.
2. Generate a fresh file from the template above.
3. Salvage custom steps from the `.bak` file.
4. Notify the user: `[CI Workflow Recovery] <filename> was corrupted and has been rebuilt.`
