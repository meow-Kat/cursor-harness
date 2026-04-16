---
name: php-guardrails-template
description: Generate PHP architecture guardrail configs (deptrac, phparkitect, phpstan, phpcs) into a project. Use when setting up Harness Engineering guardrails for a PHP/Laravel project, or when the user asks for architecture enforcement in PHP.
---

# PHP Guardrails Template

## When to Use

- User asks to set up architecture guardrails / lint / static analysis for a PHP project.
- A PHP project has no `deptrac.yaml`, `phparkitect.php`, `phpstan.neon`, or `phpcs.xml`.
- Bootstrapping Harness Engineering in a PHP repository.

## Prerequisites

Before generating configs, check:
1. Is this a Laravel project? (look for `artisan`, `app/Http/Controllers/`)
2. What is the root namespace? (default: `App\\`)
3. What directories contain source code? (default: `src/` and `app/`)

## Customization Questions

Ask the user before generating:
1. "What is your project's namespace root?" (default: `App`)
2. "What layers does your architecture have?" (default: Model → Config → Repository → Service → Controller → Infrastructure)
3. "What PHPStan level do you want to start at?" (default: 6, range 0-9)
4. "Do you want to add any project-specific forbidden functions beyond var_dump/dd/dump/die/exit?"

## Installation Commands

After generating configs, remind the user to install dependencies:

```bash
composer require --dev qossmic/deptrac-shim phparkitect/arkitect phpstan/phpstan squizlabs/php_codesniffer
```

## File 1: deptrac.yaml

Create `deptrac.yaml` in the **project root** with layer definitions and ruleset.

## File 2: phparkitect.php

Create `phparkitect.php` in the **project root** with architecture rules.

## File 3: phpstan.neon

Create `phpstan.neon` in the **project root** with static analysis configuration.

## File 4: phpcs.xml

Create `phpcs.xml` in the **project root** with coding standard rules.

## Post-Generation Checklist

After generating all files, remind the user:

1. Run `composer require --dev qossmic/deptrac-shim phparkitect/arkitect phpstan/phpstan squizlabs/php_codesniffer`
2. Verify configs work: `vendor/bin/deptrac analyse && vendor/bin/phparkitect check && vendor/bin/phpstan analyse && vendor/bin/phpcs`
3. Add to CI pipeline (suggest creating a GitHub Actions workflow)
4. Update project's `AGENTS.md` to reference these configs under Architecture Principles and Code Style

## Recovery

If a guardrail config exists but is broken:

1. Rename to `<filename>.bak`.
2. Generate a fresh file from the template above.
3. Salvage custom rules from the `.bak` file.
4. Notify the user: `[PHP Guardrails Recovery] <filename> was corrupted and has been rebuilt.`
