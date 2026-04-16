---
name: ci-workflows
description: GitHub Actions workflow awareness
inclusion: fileMatch
fileMatchPattern: "**/.github/**"
---

# CI Workflows Protocol

Ensure Harness Engineering CI workflows in place.

## 1. Detection

Check if workflows exist:
- `risk-contract.yml`
- `php-guardrails.yml` (PHP projects)
- `doc-freshness.yml`

## 2. Missing Workflows

If missing, ask to set up using `ci-workflows-template` skill.

## 3. Workflow-Aware Behavior

When harness workflows exist, respect their constraints:

- **risk-contract.yml**: When suggesting changes to `critical` paths (db/, infrastructure/, auth/, .github/workflows/), warn the user that these will trigger full CI + reviewer assignment.
- **php-guardrails.yml**: When writing PHP code, note that it will be checked by phpstan, phpcs, deptrac, and phparkitect.
- **doc-freshness.yml**: When updating docs/ or AGENTS.md, ensure links remain valid and content is current.
