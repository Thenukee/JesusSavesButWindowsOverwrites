---
title: "File Integrity Verifier"
purpose: "Monitor and verify file integrity using cryptographic hashing"
description: "A command-line tool that creates cryptographic hash baselines of directories and monitors for unauthorized changes. Useful for system hardening, evidence preservation in forensic investigations, and compliance monitoring."
tech: [Python, SHA-256, CLI, Security]
github: "https://github.com/yourusername/integrity-verifier"
demo: ""
writeup: "/blog/2026/02/10/building-file-integrity-tool/"
---

## Overview

File integrity monitoring is a fundamental security control. This tool provides a lightweight, portable solution for creating hash baselines and detecting unauthorized modifications.

## Features

- **Baseline Creation** — Recursively scan directories and compute SHA-256 hashes
- **Integrity Checking** — Compare current file states against stored baselines
- **Change Detection** — Identify added, removed, and modified files
- **Reporting** — Generate human-readable and JSON reports
- **Exclusion Rules** — Skip specific files or patterns

## Usage

```bash
# Create a baseline
python verifier.py baseline /path/to/monitor -o baseline.json

# Check integrity
python verifier.py check /path/to/monitor -b baseline.json

# Generate a report
python verifier.py report -b baseline.json --format html
```

## Use Cases

1. **Forensic Evidence** — Verify that evidence files haven't been tampered with
2. **Server Hardening** — Monitor critical system files for unauthorized changes
3. **Compliance** — Meet requirements for file integrity monitoring (PCI-DSS, etc.)
4. **Software Verification** — Confirm that deployed code matches the build

## What I Learned

This project taught me about practical cryptography, file system edge cases, and the importance of baseline management in security operations.
