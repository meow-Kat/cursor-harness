---
name: php-guardrails
description: PHP project guardrails awareness
inclusion: fileMatch
fileMatchPattern: "**/*.php"
---

# PHP Guardrails Protocol

When working in PHP project, ensure architecture guardrails in place.

## 1. Detection

Check if guardrail configs exist:
- `deptrac.yaml`
- `phparkitect.php`
- `phpstan.neon`
- `phpcs.xml`

## 2. Missing Guardrails

If missing, ask to set up using `php-guardrails-template` skill.

## 3. Guardrail-Aware Coding

- Follow deptrac layers
- Pass PHPStan level
- Follow PHPCS standard
- No forbidden functions (var_dump, dd, dump, die, exit)
