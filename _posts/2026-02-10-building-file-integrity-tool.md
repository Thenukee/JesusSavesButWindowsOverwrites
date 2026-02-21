---
layout: post
title: "Building a File Integrity Verification Tool"
date: 2026-02-10
tags: [Cybersecurity, Projects]
description: "A walk-through of how I built a file integrity checker using Python and cryptographic hashing."
---

File integrity monitoring is a crucial part of any security operation. In this post, I'll walk through how I built a simple but effective integrity verification tool.

## The Problem

How do you know if a file has been tampered with? Whether it's a system configuration file, evidence in a forensic investigation, or a software package you downloaded — you need a way to verify that files haven't been modified.

## The Solution

The core idea is simple: compute a cryptographic hash of a file, store it, and later compare it against a fresh hash of the same file.

```python
import hashlib
import os
import json
from datetime import datetime

def compute_hash(filepath, algorithm='sha256'):
    """Compute the hash of a file using the specified algorithm."""
    hasher = hashlib.new(algorithm)
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            hasher.update(chunk)
    return hasher.hexdigest()

def create_baseline(directory, output_file='baseline.json'):
    """Create a baseline of all file hashes in a directory."""
    baseline = {}
    for root, dirs, files in os.walk(directory):
        for filename in files:
            filepath = os.path.join(root, filename)
            baseline[filepath] = {
                'hash': compute_hash(filepath),
                'timestamp': datetime.now().isoformat()
            }
    
    with open(output_file, 'w') as f:
        json.dump(baseline, f, indent=2)
    
    return baseline
```

## How It Works

1. **Baseline creation**: Scan a directory and compute SHA-256 hashes for every file
2. **Storage**: Save the hash database as a JSON file
3. **Verification**: Re-scan and compare current hashes against the baseline
4. **Reporting**: Flag any files that have been added, removed, or modified

## Key Design Decisions

- **SHA-256** for hashing — collision-resistant and widely trusted
- **Chunked reading** — handles large files without loading everything into memory
- **JSON storage** — human-readable and easy to inspect
- **Recursive scanning** — covers all subdirectories

## What I Learned

Building this tool taught me a lot about:

- How cryptographic hash functions work in practice
- File system operations and edge cases (symlinks, permissions)
- The importance of baseline management in security operations

The full source code is available on my GitHub. Feel free to use it, fork it, and improve it.
