<?php

declare(strict_types=1);

/**
 * PHPArkitect 架構測試
 * 對應 Harness Engineering 元件 ②：Architecture Guardrails
 *
 * 安裝: composer require --dev phparkitect/arkitect
 * 執行: vendor/bin/phparkitect check
 *
 * Deptrac 管「分層依賴方向」，PHPArkitect 管「命名規範 + 結構約束」。
 * 兩者互補，都在 CI 裡跑成 pass/fail。
 */

use Arkitect\ClassSet;
use Arkitect\CLI\Config;
use Arkitect\Expression\ForClasses\HaveNameMatching;
use Arkitect\Expression\ForClasses\Implement;
use Arkitect\Expression\ForClasses\NotDependsOnTheseNamespaces;
use Arkitect\Expression\ForClasses\ResideInOneOfTheseNamespaces;
use Arkitect\Rules\Rule;

return static function (Config $config): void {
    $classSet = ClassSet::fromDir(__DIR__ . '/src');

    $rules = [];

    // Controller 命名必須以 Controller 結尾
    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Http\Controllers'))
        ->should(new HaveNameMatching('*Controller'))
        ->because('Controller 類別必須以 Controller 結尾，方便 agent 辨識入口點');

    // Service 不可直接依賴 Controller（不可反向）
    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Services'))
        ->should(new NotDependsOnTheseNamespaces('App\Http\Controllers'))
        ->because('Service 層不可反向依賴 Controller 層；違反分層架構');

    // Model 不可依賴 Service 或 Controller
    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Models'))
        ->should(new NotDependsOnTheseNamespaces(
            'App\Services',
            'App\Http\Controllers',
            'App\Http\Middleware'
        ))
        ->because('Model 是最底層，不可依賴任何上層；違反會導致循環依賴');

    // Repository 不可依賴 Controller
    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Repositories'))
        ->should(new NotDependsOnTheseNamespaces('App\Http\Controllers'))
        ->because('Repository 層不可依賴 Controller 層');

    // Repository 實作必須實作對應 Interface
    $rules[] = Rule::allClasses()
        ->that(new ResideInOneOfTheseNamespaces('App\Repositories'))
        ->should(new Implement('App\Contracts\RepositoryInterface'))
        ->because('所有 Repository 必須實作 RepositoryInterface，確保可替換性');

    $config->add($classSet, ...$rules);
};
