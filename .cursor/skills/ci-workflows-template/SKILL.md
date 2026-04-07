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

Create `.github/workflows/risk-contract.yml`:

```yaml
name: Risk Contract Enforcer
on: [pull_request]

jobs:
  evaluate-risk:
    runs-on: ubuntu-latest
    outputs:
      risk_level: ${{ steps.assess.outputs.level }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Assess risk level from changed files
        id: assess
        run: |
          set -e
          CHANGED=$(git diff --name-only origin/main...HEAD)
          LEVEL="low"

          if echo "$CHANGED" | grep -qE '^(db/|infrastructure/|auth/|\.github/workflows/)'; then
            LEVEL="critical"
          elif echo "$CHANGED" | grep -qE '^(api/|payments/|src/core/|\.cursor/rules/)'; then
            LEVEL="high"
          elif echo "$CHANGED" | grep -qE '^(src/|app/|lib/)'; then
            LEVEL="medium"
          fi

          echo "level=$LEVEL" >> "$GITHUB_OUTPUT"
          echo "### Risk Assessment" >> "$GITHUB_STEP_SUMMARY"
          echo "- **Level**: $LEVEL" >> "$GITHUB_STEP_SUMMARY"
          echo "- **Changed files**: $(echo "$CHANGED" | wc -l | tr -d ' ')" >> "$GITHUB_STEP_SUMMARY"

      - name: Label PR by risk level
        uses: actions/github-script@v7
        with:
          script: |
            const level = '${{ steps.assess.outputs.level }}';
            const labels = {
              critical: ['risk:critical', 'needs-staging', 'needs-rollback-plan'],
              high:     ['risk:high'],
              medium:   ['risk:medium'],
              low:      ['risk:low']
            };
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              labels: labels[level] || ['risk:low']
            });

      - name: Request reviewers for critical changes
        if: steps.assess.outputs.level == 'critical'
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.pulls.requestReviewers({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              reviewers: ['REPLACE_WITH_REVIEWER']
            });

  run-checks:
    needs: evaluate-risk
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run checks based on risk level
        run: |
          set -e
          LEVEL="${{ needs.evaluate-risk.outputs.risk_level }}"
          case "$LEVEL" in
            critical)
              echo "Running full suite + security scan"
              # Add your full test commands here
              ;;
            high)
              echo "Running full test suite"
              # Add your test commands here
              ;;
            medium)
              echo "Running lint + unit tests"
              # Add your lint + unit test commands here
              ;;
            low)
              echo "Running lint only"
              # Add your lint commands here
              ;;
          esac
```

**Customization**: Replace `REPLACE_WITH_REVIEWER` with actual GitHub usernames. Replace `origin/main` if default branch differs. Fill in the test commands for each risk level based on the project's stack.

## Workflow 2: php-guardrails.yml

**Purpose**: L2 Four-Layer Defense for PHP projects.

Create `.github/workflows/php-guardrails.yml`:

```yaml
name: PHP Guardrails
on:
  pull_request:
    paths:
      - '**.php'
      - 'composer.json'
      - 'composer.lock'
      - 'phpstan.neon'
      - 'phpcs.xml'
      - 'deptrac.yaml'
      - 'phparkitect.php'

jobs:
  lint-and-types:
    name: "L2: Lint + Type Check"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          tools: composer
      - run: composer install --no-interaction --prefer-dist
      - run: vendor/bin/phpcs --report=checkstyle
      - run: vendor/bin/phpstan analyse --error-format=github

  architecture:
    name: "L3: Architecture Constraints"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          tools: composer
      - run: composer install --no-interaction --prefer-dist
      - run: vendor/bin/deptrac analyse --report-uncovered --fail-on-uncovered
      - run: vendor/bin/phparkitect check

  tests:
    name: "L1: Tests"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          tools: composer
          coverage: xdebug
      - run: composer install --no-interaction --prefer-dist
      - run: vendor/bin/phpunit --coverage-text --colors=never
```

**Customization**: Adjust `php-version`. Add coverage threshold check if needed. Add additional test suites.

## Workflow 3: doc-freshness.yml

**Purpose**: Combat Context Rot — validate docs, links, and config integrity.

Create `.github/workflows/doc-freshness.yml`:

```yaml
name: Doc Freshness Check
on:
  pull_request:
    paths:
      - 'docs/**'
      - 'AGENTS.md'
      - 'risk-tiers.json'
  schedule:
    - cron: '0 9 * * 1'

jobs:
  check-freshness:
    name: "Check stale docs"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Find stale documents (>90 days)
        run: |
          set -e
          echo "### Stale Document Check" >> "$GITHUB_STEP_SUMMARY"
          STALE=$(find docs/ -name "*.md" -type f -exec sh -c '
            LAST_COMMIT=$(git log -1 --format="%ci" -- "$1" 2>/dev/null)
            if [ -n "$LAST_COMMIT" ]; then
              DAYS_AGO=$(( ($(date +%s) - $(date -d "$LAST_COMMIT" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M:%S %z" "$LAST_COMMIT" +%s 2>/dev/null)) / 86400 ))
              if [ "$DAYS_AGO" -gt 90 ]; then
                echo "$1 ($DAYS_AGO days)"
              fi
            fi
          ' _ {} \;)
          if [ -n "$STALE" ]; then
            echo "::warning::Stale documents found"
            echo "$STALE"
          else
            echo "✅ All documents are up to date." >> "$GITHUB_STEP_SUMMARY"
          fi

  check-links:
    name: "Validate AGENTS.md links"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check internal links
        run: |
          set -e
          if [ ! -f "AGENTS.md" ]; then exit 0; fi
          BROKEN=0
          grep -oP '\[.*?\]\((?!http)(.*?)\)' AGENTS.md | \
            grep -oP '\(([^)]+)\)' | tr -d '()' | \
            while read -r link; do
              if [ ! -e "$link" ]; then
                echo "❌ Broken link: $link"
                BROKEN=1
              fi
            done
          [ "$BROKEN" -eq 0 ] && echo "✅ All links valid"

  check-local-override:
    name: "Verify .agents.local.md is gitignored"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check .agents.local.md safety
        run: |
          set -e
          if [ -f ".agents.local.md" ]; then
            if ! grep -q '\.agents\.local\.md' .gitignore 2>/dev/null; then
              echo "::error::.agents.local.md exists but is NOT in .gitignore — personal overrides must not be committed"
              exit 1
            fi
            echo "✅ .agents.local.md is properly gitignored"
          else
            echo "ℹ️ No .agents.local.md found (optional)"
          fi

  check-risk-tiers:
    name: "Validate risk-tiers.json"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate JSON and structure
        run: |
          set -e
          if [ ! -f "risk-tiers.json" ]; then exit 0; fi
          python3 -c "
          import json, sys
          data = json.load(open('risk-tiers.json'))
          tiers = data.get('tiers', data)
          missing = [t for t in ['critical','high','medium','low'] if t not in tiers]
          if missing:
              print(f'Missing tiers: {missing}'); sys.exit(1)
          print('All required tiers present')
          "
```

**Customization**: Adjust staleness threshold (90 days). Add additional config validation if needed.

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
