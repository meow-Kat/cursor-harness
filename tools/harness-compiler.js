#!/usr/bin/env node

/**
 * Harness Engineering Compiler
 * 
 * Compiles unified harness configuration into IDE-specific implementations:
 * - Cursor: .cursor/rules, .cursor/agents, .cursor/skills, .cursor/hooks
 * - Kiro: .kiro/steering, .kiro/agents, .kiro/skills, .kiro/hooks
 * 
 * Usage:
 *   node tools/harness-compiler.js compile [--target cursor|kiro|all]
 *   node tools/harness-compiler.js validate
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// ============================================================================
// Configuration Schema
// ============================================================================

/**
 * Unified harness configuration format
 * 
 * harness.yaml:
 * 
 * rules:
 *   - name: core-protocol
 *     description: Core agent protocol
 *     inclusion: always
 *     content: |
 *       # Core Protocol
 *       ...
 * 
 * hooks:
 *   - name: check-forbidden-actions
 *     event: beforeShellExecution | preToolUse
 *     action:
 *       type: script | askAgent | runCommand
 *       script: |
 *         #!/bin/bash
 *         ...
 *       prompt: "Check against AGENTS.md"
 *       command: "vendor/bin/phpcs"
 * 
 * agents:
 *   - name: coder
 *     model: claude-4.6-sonnet
 *     description: Coding agent
 *     content: |
 *       You are the coder agent...
 * 
 * skills:
 *   - name: agents-md-template
 *     description: Generate AGENTS.md
 *     files:
 *       - path: SKILL.md
 *         content: |
 *           ...
 */

// ============================================================================
// Compiler Class
// ============================================================================

class HarnessCompiler {
  constructor(configPath = 'harness.yaml', sourceDir = 'src') {
    this.configPath = configPath;
    this.sourceDir = sourceDir;
    this.config = null;
    this.outputDir = process.cwd();
  }

  // Load configuration from source directory
  loadFromSource() {
    console.log(`\n=== Loading from ${this.sourceDir}/ ===`);
    
    this.config = {
      rules: [],
      hooks: [],
      agents: [],
      skills: []
    };

    // Load rules
    const rulesDir = path.join(this.sourceDir, 'rules');
    if (fs.existsSync(rulesDir)) {
      const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
      ruleFiles.forEach(file => {
        const content = fs.readFileSync(path.join(rulesDir, file), 'utf8');
        const rule = this.parseMarkdownWithFrontmatter(content);
        rule.name = path.basename(file, '.md');
        this.config.rules.push(rule);
        console.log(`  ✓ Loaded rule: ${file}`);
      });
    }

    // Load hooks
    const hooksDir = path.join(this.sourceDir, 'hooks');
    if (fs.existsSync(hooksDir)) {
      const hookFiles = fs.readdirSync(hooksDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      hookFiles.forEach(file => {
        const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
        const hook = yaml.load(content);
        this.config.hooks.push(hook);
        console.log(`  ✓ Loaded hook: ${file}`);
      });
    }

    // Load agents
    const agentsDir = path.join(this.sourceDir, 'agents');
    if (fs.existsSync(agentsDir)) {
      const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.md'));
      agentFiles.forEach(file => {
        const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
        const agent = this.parseMarkdownWithFrontmatter(content);
        agent.name = path.basename(file, '.md');
        this.config.agents.push(agent);
        console.log(`  ✓ Loaded agent: ${file}`);
      });
    }

    // Load skills
    const skillsDir = path.join(this.sourceDir, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skillDirs = fs.readdirSync(skillsDir).filter(f => {
        return fs.statSync(path.join(skillsDir, f)).isDirectory();
      });
      skillDirs.forEach(skillName => {
        const skillPath = path.join(skillsDir, skillName);
        const skill = {
          name: skillName,
          files: []
        };
        
        // Read all files in skill directory
        this.readSkillFiles(skillPath, '', skill.files);
        
        this.config.skills.push(skill);
        console.log(`  ✓ Loaded skill: ${skillName}/`);
      });
    }

    console.log(`\n✓ Loaded ${this.config.rules.length} rules, ${this.config.hooks.length} hooks, ${this.config.agents.length} agents, ${this.config.skills.length} skills`);
    return true;
  }

  // Parse markdown with frontmatter
  parseMarkdownWithFrontmatter(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      const frontmatter = yaml.load(match[1]);
      const body = match[2];
      return {
        ...frontmatter,
        content: body
      };
    }
    
    return { content };
  }

  // Recursively read skill files
  readSkillFiles(dir, relativePath, files) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const itemRelativePath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        this.readSkillFiles(fullPath, itemRelativePath, files);
      } else {
        const content = fs.readFileSync(fullPath, 'utf8');
        files.push({
          path: itemRelativePath,
          content: content
        });
      }
    });
  }

  // Load and parse configuration
  loadConfig() {
    try {
      const content = fs.readFileSync(this.configPath, 'utf8');
      this.config = yaml.load(content);
      console.log(`✓ Loaded config from ${this.configPath}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to load config: ${error.message}`);
      return false;
    }
  }

  // Validate configuration
  validate() {
    if (!this.config) {
      console.error('✗ No configuration loaded');
      return false;
    }

    let valid = true;

    // Validate rules
    if (this.config.rules) {
      this.config.rules.forEach((rule, i) => {
        if (!rule.name || !rule.content) {
          console.error(`✗ Rule ${i}: missing name or content`);
          valid = false;
        }
      });
    }

    // Validate hooks
    if (this.config.hooks) {
      this.config.hooks.forEach((hook, i) => {
        if (!hook.name || !hook.event || !hook.action) {
          console.error(`✗ Hook ${i}: missing name, event, or action`);
          valid = false;
        }
      });
    }

    // Validate agents
    if (this.config.agents) {
      this.config.agents.forEach((agent, i) => {
        if (!agent.name || !agent.content) {
          console.error(`✗ Agent ${i}: missing name or content`);
          valid = false;
        }
      });
    }

    if (valid) {
      console.log('✓ Configuration is valid');
    }

    return valid;
  }

  // Compile to Cursor format
  compileCursor() {
    console.log('\n=== Compiling for Cursor ===');

    const cursorDir = path.join(this.outputDir, '.cursor');
    
    // Create directories
    this.ensureDir(path.join(cursorDir, 'rules'));
    this.ensureDir(path.join(cursorDir, 'agents'));
    this.ensureDir(path.join(cursorDir, 'skills'));
    this.ensureDir(path.join(cursorDir, 'hooks'));

    // Compile rules
    if (this.config.rules) {
      this.config.rules.forEach(rule => {
        this.compileCursorRule(rule, cursorDir);
      });
    }

    // Compile hooks
    if (this.config.hooks) {
      this.compileCursorHooks(this.config.hooks, cursorDir);
    }

    // Compile agents
    if (this.config.agents) {
      this.config.agents.forEach(agent => {
        this.compileCursorAgent(agent, cursorDir);
      });
    }

    // Compile skills
    if (this.config.skills) {
      this.config.skills.forEach(skill => {
        this.compileCursorSkill(skill, cursorDir);
      });
    }

    console.log('✓ Cursor compilation complete');
  }

  // Compile to Kiro format
  compileKiro() {
    console.log('\n=== Compiling for Kiro ===');

    const kiroDir = path.join(this.outputDir, '.kiro');
    
    // Create directories
    this.ensureDir(path.join(kiroDir, 'steering'));
    this.ensureDir(path.join(kiroDir, 'agents'));
    this.ensureDir(path.join(kiroDir, 'skills'));
    this.ensureDir(path.join(kiroDir, 'hooks'));

    // Compile rules -> steering
    if (this.config.rules) {
      this.config.rules.forEach(rule => {
        this.compileKiroSteering(rule, kiroDir);
      });
    }

    // Compile hooks
    if (this.config.hooks) {
      this.config.hooks.forEach(hook => {
        this.compileKiroHook(hook, kiroDir);
      });
    }

    // Compile agents
    if (this.config.agents) {
      this.config.agents.forEach(agent => {
        this.compileKiroAgent(agent, kiroDir);
      });
    }

    // Compile skills
    if (this.config.skills) {
      this.config.skills.forEach(skill => {
        this.compileKiroSkill(skill, kiroDir);
      });
    }

    console.log('✓ Kiro compilation complete');
  }

  // ============================================================================
  // Cursor Compilation Methods
  // ============================================================================

  compileCursorRule(rule, cursorDir) {
    const frontmatter = this.buildCursorRuleFrontmatter(rule);
    const content = `---\n${frontmatter}---\n\n${rule.content}`;
    
    const filename = `${rule.name}.mdc`;
    const filepath = path.join(cursorDir, 'rules', filename);
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ✓ Rule: ${filename}`);
  }

  buildCursorRuleFrontmatter(rule) {
    let fm = `description: ${rule.description || rule.name}\n`;
    
    if (rule.inclusion === 'always') {
      fm += 'alwaysApply: true\n';
    } else if (rule.fileMatchPattern) {
      fm += `globs: "${rule.fileMatchPattern}"\n`;
      fm += 'alwaysApply: false\n';
    }
    
    return fm;
  }

  compileCursorHooks(hooks, cursorDir) {
    const hooksConfig = {
      version: 1,
      hooks: {}
    };

    const scriptDir = path.join(cursorDir, 'hooks');

    hooks.forEach(hook => {
      const cursorEvent = this.mapEventToCursor(hook.event);
      
      if (!hooksConfig.hooks[cursorEvent]) {
        hooksConfig.hooks[cursorEvent] = [];
      }

      if (hook.action.type === 'script') {
        // Write script file
        const scriptFile = `${hook.name}.sh`;
        const scriptPath = path.join(scriptDir, scriptFile);
        fs.writeFileSync(scriptPath, hook.action.script, 'utf8');
        fs.chmodSync(scriptPath, '755');

        hooksConfig.hooks[cursorEvent].push({
          command: `.cursor/hooks/${scriptFile}`
        });

        console.log(`  ✓ Hook script: ${scriptFile}`);
      }
    });

    // Write hooks.json
    const hooksJsonPath = path.join(cursorDir, 'hooks.json');
    fs.writeFileSync(hooksJsonPath, JSON.stringify(hooksConfig, null, 2), 'utf8');
    console.log(`  ✓ Hooks config: hooks.json`);
  }

  mapEventToCursor(event) {
    const mapping = {
      'beforeShellExecution': 'beforeShellExecution',
      'preToolUse': 'beforeShellExecution',
      'afterFileEdit': 'afterFileEdit',
      'fileEdited': 'afterFileEdit',
      'stop': 'stop',
      'postTaskExecution': 'stop',
      'beforeReadFile': 'beforeReadFile',
      'beforeSubmitPrompt': 'beforeSubmitPrompt',
      'beforeMCPExecution': 'beforeMCPExecution'
    };

    return mapping[event] || 'stop';
  }

  compileCursorAgent(agent, cursorDir) {
    const frontmatter = agent.model ? `---\nmodel: ${agent.model}\n---\n\n` : '';
    const content = `${frontmatter}${agent.content}`;
    
    const filename = `${agent.name}.md`;
    const filepath = path.join(cursorDir, 'agents', filename);
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ✓ Agent: ${filename}`);
  }

  compileCursorSkill(skill, cursorDir) {
    const skillDir = path.join(cursorDir, 'skills', skill.name);
    this.ensureDir(skillDir);

    skill.files.forEach(file => {
      const filepath = path.join(skillDir, file.path);
      this.ensureDir(path.dirname(filepath));
      fs.writeFileSync(filepath, file.content, 'utf8');
    });

    console.log(`  ✓ Skill: ${skill.name}/`);
  }

  // ============================================================================
  // Kiro Compilation Methods
  // ============================================================================

  compileKiroSteering(rule, kiroDir) {
    const frontmatter = this.buildKiroSteeringFrontmatter(rule);
    const content = `---\n${frontmatter}---\n\n${rule.content}`;
    
    const filename = `${rule.name}.md`;
    const filepath = path.join(kiroDir, 'steering', filename);
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ✓ Steering: ${filename}`);
  }

  buildKiroSteeringFrontmatter(rule) {
    let fm = `description: ${rule.description || rule.name}\n`;
    
    if (rule.inclusion === 'always') {
      fm += 'inclusion: always\n';
    } else if (rule.inclusion === 'manual') {
      fm += 'inclusion: manual\n';
    } else if (rule.fileMatchPattern) {
      fm += 'inclusion: fileMatch\n';
      fm += `fileMatchPattern: '${rule.fileMatchPattern}'\n`;
    }
    
    return fm;
  }

  compileKiroHook(hook, kiroDir) {
    const kiroHook = {
      name: hook.name,
      version: '1.0.0',
      description: hook.description || hook.name,
      when: {
        type: this.mapEventToKiro(hook.event)
      },
      then: {}
    };

    // Add event-specific fields
    if (hook.toolTypes) {
      kiroHook.when.toolTypes = hook.toolTypes;
    }
    if (hook.patterns) {
      kiroHook.when.patterns = hook.patterns;
    }

    // Map action
    if (hook.action.type === 'askAgent') {
      kiroHook.then.type = 'askAgent';
      kiroHook.then.prompt = hook.action.prompt;
    } else if (hook.action.type === 'runCommand') {
      kiroHook.then.type = 'runCommand';
      kiroHook.then.command = hook.action.command;
      if (hook.action.timeout) {
        kiroHook.then.timeout = hook.action.timeout;
      }
    }

    const filename = `${hook.name}.json`;
    const filepath = path.join(kiroDir, 'hooks', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(kiroHook, null, 2), 'utf8');
    console.log(`  ✓ Hook: ${filename}`);
  }

  mapEventToKiro(event) {
    const mapping = {
      'beforeShellExecution': 'preToolUse',
      'preToolUse': 'preToolUse',
      'afterFileEdit': 'fileEdited',
      'fileEdited': 'fileEdited',
      'stop': 'postTaskExecution',
      'postTaskExecution': 'postTaskExecution',
      'beforeReadFile': 'preToolUse',
      'beforeSubmitPrompt': 'promptSubmit'
    };

    return mapping[event] || 'postTaskExecution';
  }

  compileKiroAgent(agent, kiroDir) {
    const content = agent.content;
    
    const filename = `${agent.name}.md`;
    const filepath = path.join(kiroDir, 'agents', filename);
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`  ✓ Agent: ${filename}`);
  }

  compileKiroSkill(skill, kiroDir) {
    const skillDir = path.join(kiroDir, 'skills', skill.name);
    this.ensureDir(skillDir);

    skill.files.forEach(file => {
      const filepath = path.join(skillDir, file.path);
      this.ensureDir(path.dirname(filepath));
      
      // Update path references in content
      let content = file.content;
      content = content.replace(/\.cursor\/rules\//g, '.kiro/steering/');
      content = content.replace(/\.cursor\/agents\//g, '.kiro/agents/');
      content = content.replace(/\.mdc/g, '.md');
      
      fs.writeFileSync(filepath, content, 'utf8');
    });

    console.log(`  ✓ Skill: ${skill.name}/`);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Main compile method
  compile(target = 'all', useSource = false) {
    if (useSource) {
      if (!this.loadFromSource()) {
        return false;
      }
    } else {
      if (!this.loadConfig()) {
        return false;
      }
    }

    if (!this.validate()) {
      return false;
    }

    if (target === 'cursor' || target === 'all') {
      this.compileCursor();
    }

    if (target === 'kiro' || target === 'all') {
      this.compileKiro();
    }

    console.log('\n✓ Compilation complete!');
    return true;
  }
}

// ============================================================================
// CLI
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'compile';
  const target = args.find(arg => arg.startsWith('--target='))?.split('=')[1] || 'all';
  const useSource = args.includes('--source');

  const compiler = new HarnessCompiler();

  switch (command) {
    case 'compile':
      compiler.compile(target, useSource);
      break;
    
    case 'validate':
      if (useSource) {
        compiler.loadFromSource();
      } else {
        compiler.loadConfig();
      }
      compiler.validate();
      break;
    
    case 'help':
      console.log(`
Harness Engineering Compiler

Usage:
  node harness-compiler.js compile [--target=cursor|kiro|all] [--source]
  node harness-compiler.js validate [--source]
  node harness-compiler.js help

Commands:
  compile   Compile harness.yaml or src/ to IDE-specific formats
  validate  Validate configuration
  help      Show this help message

Options:
  --target=cursor   Compile only for Cursor
  --target=kiro     Compile only for Kiro
  --target=all      Compile for both (default)
  --source          Use src/ directory instead of harness.yaml

Examples:
  node harness-compiler.js compile --source
  node harness-compiler.js compile --source --target=cursor
  node harness-compiler.js validate --source
      `);
      break;
    
    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "node harness-compiler.js help" for usage');
      process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HarnessCompiler };
