---
title: "Building a File Integrity Monitor from Scratch"
date: 2026-01-28
tags: [Cybersecurity, Projects]
toc: true
excerpt: "A walkthrough of building a file integrity monitoring tool in Python — from hashing basics to real-time detection."
---

File integrity monitoring (FIM) is a critical security control that detects unauthorized changes to important files. In this post, I'll walk through building a basic FIM tool from scratch using Python.

## Why File Integrity Monitoring?

FIM is required by several compliance frameworks:
- **PCI DSS** (Requirement 11.5)
- **HIPAA** (for protected health information)
- **SOX** (for financial data)

More importantly, it's a practical defense against:
- Malware that modifies system files
- Insider threats
- Configuration drift
- Rootkits and backdoors

## The Approach

Our FIM tool will:
1. Create a baseline of file hashes
2. Periodically scan and compare against the baseline
3. Alert on any changes detected

## Implementation

```python
import hashlib
import os
import json
import time
from datetime import datetime

class FileIntegrityMonitor:
    def __init__(self, watch_paths, baseline_file='baseline.json'):
        self.watch_paths = watch_paths
        self.baseline_file = baseline_file
        self.baseline = {}
    
    def hash_file(self, filepath):
        """Calculate SHA-256 hash of a file."""
        sha256 = hashlib.sha256()
        try:
            with open(filepath, 'rb') as f:
                for chunk in iter(lambda: f.read(8192), b''):
                    sha256.update(chunk)
            return sha256.hexdigest()
        except (IOError, PermissionError):
            return None
    
    def create_baseline(self):
        """Scan all watched paths and create hash baseline."""
        for path in self.watch_paths:
            if os.path.isfile(path):
                self.baseline[path] = self.hash_file(path)
            elif os.path.isdir(path):
                for root, dirs, files in os.walk(path):
                    for fname in files:
                        fpath = os.path.join(root, fname)
                        self.baseline[fpath] = self.hash_file(fpath)
        
        with open(self.baseline_file, 'w') as f:
            json.dump(self.baseline, f, indent=2)
        
        print(f"[+] Baseline created: {len(self.baseline)} files")
    
    def check_integrity(self):
        """Compare current state against baseline."""
        alerts = []
        current = {}
        
        for path in self.watch_paths:
            if os.path.isfile(path):
                current[path] = self.hash_file(path)
            elif os.path.isdir(path):
                for root, dirs, files in os.walk(path):
                    for fname in files:
                        fpath = os.path.join(root, fname)
                        current[fpath] = self.hash_file(fpath)
        
        # Check for modifications and deletions
        for fpath, old_hash in self.baseline.items():
            if fpath not in current:
                alerts.append(('DELETED', fpath))
            elif current[fpath] != old_hash:
                alerts.append(('MODIFIED', fpath))
        
        # Check for new files
        for fpath in current:
            if fpath not in self.baseline:
                alerts.append(('NEW', fpath))
        
        return alerts

# Usage
fim = FileIntegrityMonitor(['/etc', '/var/www'])
fim.create_baseline()

while True:
    time.sleep(60)
    alerts = fim.check_integrity()
    for alert_type, filepath in alerts:
        print(f"[!] {alert_type}: {filepath}")
```

## Enhancements

To make this production-ready, consider adding:

- **Real-time monitoring** using `inotify` (Linux) or `ReadDirectoryChangesW` (Windows)
- **Email/Slack alerts** for immediate notification
- **Exclusion patterns** to ignore expected changes
- **Logging** with timestamps and detailed reports
- **Database storage** instead of JSON for better performance

## What I Learned

Building this tool taught me:
- The importance of cryptographic hashing for integrity verification
- How file system operations work at a low level
- The challenges of monitoring files in real-time without excessive resource usage
- Why commercial FIM tools exist (edge cases are numerous!)

---

*The full source code is available on [GitHub](#). Feel free to fork it and make it your own!*
