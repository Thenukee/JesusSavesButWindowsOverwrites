---
title: "Forensics Correlation Engine"
purpose: "Correlate events across multiple log sources for incident investigation"
description: "A Python-based tool that ingests logs from multiple sources (syslog, auth logs, firewall logs) and correlates events by timestamp, IP address, and user identity to help security analysts piece together attack timelines during incident response."
tech: [Python, Elasticsearch, Log Analysis, Security]
github: "https://github.com/yourusername/forensics-correlation-engine"
demo: ""
writeup: ""
---

## Overview

Security incidents rarely leave evidence in just one place. Attackers touch multiple systems, and the clues are scattered across different log files. This tool brings those clues together.

## The Problem

During incident response, analysts waste valuable time manually correlating events across different log sources. They need to match timestamps, identify common IP addresses, and trace user activity across systems — all under time pressure.

## How It Works

1. **Ingest** — Parse logs from multiple formats (syslog, JSON, CSV, Windows Event Log)
2. **Normalize** — Convert all events to a common schema with standardized timestamps
3. **Correlate** — Link events by shared attributes (IP, user, session ID)
4. **Visualize** — Generate timeline views showing the attack progression

## Key Features

- Multi-format log parser with auto-detection
- Time-window based correlation with configurable thresholds
- IP geolocation enrichment
- Timeline visualization output
- Export to JSON for integration with other tools

## Architecture

```
logs/ → Parser → Normalizer → Correlation Engine → Report Generator
                                    ↓
                              Elasticsearch
```

## Lessons Learned

Building this project deepened my understanding of:
- Log format standardization challenges
- Time synchronization issues across systems
- The importance of efficient indexing for large datasets
- How real-world incident response workflows operate
