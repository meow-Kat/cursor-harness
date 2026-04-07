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

Create `deptrac.yaml` in the **project root**:

```yaml
deptrac:
  paths:
    - ./src

  layers:
    - name: Model
      collectors:
        - type: classLike
          value: App\\Models\\.*

    - name: Config
      collectors:
        - type: classLike
          value: App\\Config\\.*

    - name: Repository
      collectors:
        - type: classLike
          value: App\\Repositories\\.*

    - name: Service
      collectors:
        - type: classLike
          value: App\\Services\\.*

    - name: Controller
      collectors:
        - type: classLike
          value: App\\Http\\Controllers\\.*

    - name: Infrastructure
      collectors:
        - type: classLike
          value: App\\Http\\Middleware\\.*
        - type: classLike
          value: App\\Providers\\.*

  ruleset:
    Model: ~
    Config:
      - Model
    Repository:
      - Model
      - Config
    Service:
      - Repository
      - Model
      - Config
    Controller:
      - Service
      - Model
    Infrastructure:
      - Controller
      - Service
      - Repository
      - Model
      - Config
```

**Customization**: Replace `App\\` with the user's namespace. Adjust layers to match their architecture. Add or remove layers as needed.

## File 2: phparkitect.php

Create `phparkitect.php` in the **project root**:

```php
<?php

declare(strict_types=1);

use Arkitect\ClassSet;
use Arkitect\CLI\Config;
use Arkitect\Expression\ForClasses\HaveNameMatching;
use Arkitect\Expression\ForClasses\NotDependsOnTheseNamespaces;
use Arkitect\Expression\ForClasses\ResideInOneOfTheseNamespaces;
use Arkitect\Rules\Rule;

return static function (Config $config): void {
    $classSet = ClassSet::fromDir(__DIR__ . '/src');

    $rules = [];

    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Http\Controllers'))
        ->should(new HaveNameMatching('*Controller'))
        ->because('Controller classes must end with Controller');

    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Services'))
        ->should(new NotDependsOnTheseNamespaces('App\Http\Controllers'))
        ->because('Service layer must not depend on Controller layer');

    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Models'))
        ->should(new NotDependsOnTheseNamespaces(
            'App\Services',
            'App\Http\Controllers',
            'App\Http\Middleware'
        ))
        ->because('Model is the bottom layer and must not depend on upper layers');

    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Repositories'))
        ->should(new NotDependsOnTheseNamespaces('App\Http\Controllers'))
        ->because('Repository layer must not depend on Controller layer');

    $config->add($classSet, ...$rules);
};
```

**Customization**: Replace `App\` with the user's namespace. Add project-specific rules (e.g., naming conventions for specific modules).

## File 3: phpstan.neon

Create `phpstan.neon` in the **project root**:

```neon
parameters:
    level: 6
    paths:
        - src
        - app
    excludePaths:
        - vendor
        - storage
        - bootstrap/cache
    reportUnmatchedIgnoredErrors: true
```

**Customization**: Adjust `level` (0-9) based on user preference. Add `scanDirectories` for Laravel IDE helper if needed. Add `ignoreErrors` sparingly with documented reasons.

## File 4: phpcs.xml

Create `phpcs.xml` in the **project root**:

```xml
<ruleset name="ProjectStandard">
    <description>Project PHP Coding Standard</description>

    <file>src</file>
    <file>app</file>
    <file>tests</file>

    <exclude-pattern>vendor/*</exclude-pattern>
    <exclude-pattern>storage/*</exclude-pattern>
    <exclude-pattern>bootstrap/cache/*</exclude-pattern>

    <rule ref="PSR12"/>

    <rule ref="Generic.PHP.ForbiddenFunctions">
        <properties>
            <property name="forbiddenFunctions" type="array">
                <element key="var_dump" value="null"/>
                <element key="dd" value="null"/>
                <element key="dump" value="null"/>
                <element key="print_r" value="null"/>
                <element key="die" value="null"/>
                <element key="exit" value="null"/>
            </property>
        </properties>
    </rule>

    <rule ref="Generic.Files.LineLength">
        <properties>
            <property name="lineLimit" value="120"/>
            <property name="absoluteLineLimit" value="150"/>
        </properties>
    </rule>

    <rule ref="Generic.Metrics.CyclomaticComplexity">
        <properties>
            <property name="complexity" value="10"/>
            <property name="absoluteComplexity" value="20"/>
        </properties>
    </rule>
</ruleset>
```

**Customization**: Add project-specific forbidden functions. Adjust line length and complexity limits.

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
