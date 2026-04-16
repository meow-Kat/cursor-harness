---
name: mcp-setup
description: Setup MCP configuration for framework documentation access
---

# MCP Setup

## When to Use

- MCP config missing
- Framework detected with available MCP server
- User asks to configure MCP

## MCP Mapping

| Framework | MCP Server | Purpose |
|-----------|------------|---------|
| React | context7 | React docs |
| Next.js | context7 | Next.js docs |
| Vue | context7 | Vue docs |

## Creates

- Cursor: `.cursor/mcp.json`
- Kiro: `.kiro/settings/mcp.json`

## Configuration Template

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "disabled": false,
      "autoApprove": ["search_docs"]
    }
  }
}
```
