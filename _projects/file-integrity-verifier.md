---
title: "File Integrity Verifier"
tagline: "Cryptographic file integrity monitoring tool"
description: "Monitors critical system files for unauthorized changes using cryptographic hashing, with alerting and reporting capabilities."
tech: [Python, SHA-256, File Systems, JSON]
github: "https://github.com/yourusername/file-integrity-verifier"
date: 2025-11-01
---

## The Problem

Unauthorized file modifications — whether from malware, insider threats, or misconfigurations — can compromise system security. Organizations need a reliable way to detect when critical files have been changed.

## What This Tool Does

The File Integrity Verifier creates cryptographic baselines of monitored files and directories, then continuously checks for:

- **Modified files** — Content changes detected via SHA-256 hash comparison
- **Deleted files** — Files that existed in the baseline but are now missing
- **New files** — Unexpected files that appear in monitored directories
- **Permission changes** — Alterations to file ownership and access rights

## Features

- Configurable watch paths and exclusion patterns
- SHA-256 cryptographic hashing for tamper detection
- JSON-based baseline storage
- Scheduled and on-demand scanning
- Detailed change reports with timestamps
- Email notification support

## Architecture

```
┌─────────────────┐
│  Configuration   │
│  (watch paths,   │
│   exclusions)    │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Scanner  │──── Creates/loads baseline
    └────┬────┘
         │
    ┌────▼────┐
    │ Hasher   │──── SHA-256 per file
    └────┬────┘
         │
    ┌────▼────────┐
    │ Comparator   │──── Diff against baseline
    └────┬────────┘
         │
    ┌────▼────┐
    │ Alerter  │──── Report & notify
    └─────────┘
```

## Compliance

This tool helps satisfy requirements from:
- PCI DSS Requirement 11.5
- HIPAA Security Rule
- NIST SP 800-53 SI-7
