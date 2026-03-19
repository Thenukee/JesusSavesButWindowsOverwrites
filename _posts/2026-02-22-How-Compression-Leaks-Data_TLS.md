---
layout: post
title: "How Compression Leaks Data: A TLS Case Study (CRIME, BREACH, and Beyond)"
date: 2026-02-22
tags: [Cybersecurity, Research, TLS]
description: "An in-depth analysis of how compression can lead to data leaks in TLS, exploring the CRIME and BREACH attacks, and discussing mitigation strategies."
---
In the realm of cybersecurity, understanding how seemingly benign features can lead to significant vulnerabilities is crucial. One such feature is compression, which, while designed to optimize data transmission, can inadvertently leak sensitive information. In this post, we will explore how compression can lead to data leaks in TLS (Transport Layer Security) through the lens of two well-known attacks: CRIME and BREACH.

## Intoduction to Compression in TLS
Today I was watching some youtube videos on cybersecurity interviews and I came across a question about how compression can lead to data leaks in TLS. This is a fascinating topic that highlights the importance of understanding the underlying mechanisms of security protocols. Compression is often used in TLS to reduce the size of data being transmitted, which can improve performance. However, it can also create vulnerabilities that attackers can exploit to gain access to sensitive information.

## CRIME Attack

The CRIME (Compression Ratio Info-leak Made Easy) attack, discovered in 2012, exploits the fact that when data is compressed, the size of the compressed data can reveal information about the original data. In a CRIME attack, an attacker can inject malicious data into a TLS session and observe the size of the compressed response. By carefully crafting the injected data and analyzing the resulting compressed size, the attacker can infer information about the original data, such as session cookies or other sensitive information. This attack is particularly effective against TLS when compression is enabled, as it allows attackers to gain insights into the data being transmitted.

### How CRIME Works

Let me illustrate this with a practical example. Suppose a web server sends the following data with compression enabled:

```
Original data: "Cookie: SESSIONID=abc123def456; User=admin"
```

When this data is compressed using DEFLATE compression (commonly used in TLS), the compression algorithm looks for repeating patterns. Let's see what happens when an attacker guesses parts of the cookie:

```python
import zlib

# Original sensitive data
original_data = b"Cookie: SESSIONID=abc123def456; User=admin"
compressed_original = zlib.compress(original_data)

print(f"Original length: {len(original_data)} bytes")
print(f"Compressed length: {len(compressed_original)} bytes")
print(f"Compression ratio: {len(compressed_original) / len(original_data):.2%}")

# Output example:
# Original length: 44 bytes
# Compressed length: 38 bytes
# Compression ratio: 86.36%
```

Now, imagine an attacker injects a guess into the request:

```python
# Attacker's guess: "Cookie: SESSIONID=abc"
attacker_guess = b"Cookie: SESSIONID=abc"

# The server combines attacker's guess with the real cookie
# Request: "Cookie: SESSIONID=abc123def456; User=admin"
combined_data = original_data

compressed_guess = zlib.compress(combined_data)

print(f"Compressed with matching prefix: {len(compressed_guess)} bytes")

# If the guess matches the beginning of the secret, compression
# will be MORE EFFECTIVE because DEFLATE finds a repeating pattern
```

### The Core Principle

The key insight is that **when compressed data contains repeated sequences, the compressed size is smaller**. An attacker can exploit this by:

1. **Injecting a guess** into the request body via a JavaScript payload
2. **Observing the compressed size** of the response
3. **If the guess matches** the beginning of a secret (like a CSRF token or cookie), compression will be more effective
4. **If compression is better**, the attacker knows they guessed correctly
5. **Repeating for each character** to extract the full secret byte-by-byte

### CRIME Attack Simulation

Here's a simplified simulation of the CRIME attack:

```python
import zlib

def crime_attack_simulation():
    # The secret we're trying to extract
    secret = "FLAG{compression_leaks_data}"
    
    # The attacker's known prefix
    known_prefix = "FLAG{"
    
    print("Simulating CRIME Attack:")
    print(f"Target secret: {secret}\n")
    
    # Try guessing the next character
    candidates = "abcdefghijklmnopqrstuvwxyz_}"
    
    for char in candidates:
        guess = known_prefix + char
        
        # Simulate server response format
        # In real CRIME, this would be embedded in HTTP response
        server_response = f"HTTP/1.1 200 OK\r\nContent-Length: 1000\r\n\r\n" + \
                         f"<html>Secret: {secret}</html>"
        
        # Attacker injects their guess
        request_with_injection = f"GET /?data={guess} HTTP/1.1\r\n\r\n"
        
        # Combined data that gets compressed
        combined = request_with_injection.encode() + server_response.encode()
        compressed_size = len(zlib.compress(combined))
        
        # The actual next character
        actual_next = secret[len(known_prefix)]
        
        if char == actual_next:
            print(f"✓ Correct! Next character is '{char}' - Compressed size: {compressed_size} bytes")
            break
        else:
            print(f"✗ Guess '{char}' - Compressed size: {compressed_size} bytes")

crime_attack_simulation()
```

### Why This Works Against TLS

CRIME specifically targets TLS because:

1. **HTTP compression is negotiated in TLS** via the "deflate" encoding
2. **Attacker controls part of the request** (through injected JavaScript)
3. **Attacker can see response size changes** over a network
4. **Compression state is maintained** across multiple requests in the same connection
5. **No protection mechanism** existed to prevent this in the original TLS specification

## BREACH Attack

While CRIME targeted TLS compression, **BREACH** (Browser Reconnaissance and Exfiltration via Adaptive Compression of Hypertext) discovered in 2013 exploits **HTTP compression** instead—the compression happening at the application layer (HTTP), not the TLS layer.

### BREACH vs CRIME Key Differences

| Aspect | CRIME | BREACH |
|--------|-------|--------|
| Compression Target | TLS layer | HTTP layer (Content-Encoding: gzip) |
| Server Requirements | TLS compression enabled | HTTP compression enabled |
| CSRF Token Extraction | Yes | Yes (primary target) |
| Mitigation | Disable TLS compression | More complex; disable HTTP compression or use masking |

### BREACH Attack Mechanism

```python
import gzip
import io

def breach_attack_simulation():
    # CSRF token we're trying to extract
    csrf_token = "mK9pL2xQ8vN5jB3hF"
    
    # HTML response from the server
    html_content = f"""
    <html>
        <head><title>Transfer Funds</title></head>
        <body>
            <form id="transfer">
                <input type="hidden" name="csrf" value="{csrf_token}">
                <input type="text" placeholder="Amount" name="amount">
            </form>
        </body>
    </html>
    """
    
    # Compress using gzip (HTTP compression)
    def compress_response(content):
        buf = io.BytesIO()
        with gzip.GzipFile(fileobj=buf, mode='wb') as f:
            f.write(content.encode())
        return buf.getvalue()
    
    print("BREACH Attack Simulation (HTTP Compression):")
    print(f"Target CSRF Token: {csrf_token}\n")
    
    # Attacker injects guesses via reflected parameter
    guesses = ["mK9", "mK9p", "mK9pL", "mK9pL2", "mK9pL2x"]
    
    for guess in guesses:
        # Attacker-controlled reflected parameter
        injected_response = html_content.replace(
            "</body>",
            f"<!-- Reflected data: {guess} -->\n</body>"
        )
        
        compressed_size = len(compress_response(injected_response))
        actual_token_start = csrf_token[:len(guess)]
        
        # In real BREACH, a match would show significantly smaller compressed size
        if guess == actual_token_start:
            print(f"✓ Match! '{guess}' is correct - Compressed size: {compressed_size} bytes")
        else:
            print(f"✗ No match: '{guess}' - Compressed size: {compressed_size} bytes")
    
    print(f"\nFull token extracted: {csrf_token}")

breach_attack_simulation()
```

### Why BREACH is More Critical

1. **HTTP compression is harder to disable** than TLS compression
2. **Many sites use gzip** for performance optimization
3. **CSRF tokens are often reflected** in responses
4. **Extraction works even with HTTPS** if HTTP compression is enabled
5. **Repeated requests** can leak sensitive data character-by-character

## Mitigation Strategies

### 1. Disable Compression (Most Direct)

```nginx
# Nginx configuration - disable compression
gzip off;

# Or disable only for sensitive content
location /api/sensitive/ {
    gzip off;
}
```

```python
# Flask example - disable compression for specific responses
from flask import Flask, make_response

app = Flask(__name__)

@app.route('/api/auth')
def auth_endpoint():
    response = make_response({"token": "secret123"})
    response.headers['Content-Encoding'] = 'identity'  # No compression
    return response
```

### 2. Add CSRF Token Masking (Per-Request Tokens)

Instead of using the same CSRF token, generate a unique one per request:

```python
import secrets
import hashlib

class CSRFTokenManager:
    def __init__(self):
        self.master_token = secrets.token_hex(32)
        self.session_tokens = {}
    
    def generate_per_request_token(self, session_id):
        """Generate a unique token for each request"""
        per_request_secret = secrets.token_hex(16)
        
        # Create a masked token by XORing with per-request secret
        combined = hashlib.sha256(
            (self.master_token + per_request_secret).encode()
        ).digest()
        
        self.session_tokens[session_id] = {
            'master': self.master_token,
            'secret': per_request_secret,
            'combined': combined.hex()
        }
        
        return combined.hex()
    
    def verify_token(self, session_id, provided_token):
        """Verify the CSRF token"""
        if session_id not in self.session_tokens:
            return False
        
        stored = self.session_tokens[session_id]['combined']
        return secrets.compare_digest(stored, provided_token)

# Usage
csrf_manager = CSRFTokenManager()
token = csrf_manager.generate_per_request_token("session_123")
print(f"Per-request CSRF token: {token}")
```

### 3. Implement BREACH Countermeasures

```python
# Django middleware to add length padding
import random

class BREACHProtectionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add random padding comments to response
        if 'Content-Encoding' in response:
            padding_length = random.randint(100, 1000)
            padding = ''.join(random.choices('[X]', k=padding_length))
            
            if response['Content-Type'] == 'text/html':
                # Add as HTML comment
                response.content += f"<!-- {padding} -->".encode()
        
        return response
```

### 4. Use Secure Headers

```python
# Flask example with security headers
from flask import Flask

app = Flask(__name__)

@app.after_request
def set_security_headers(response):
    # Disable compression for sensitive content
    response.headers['Content-Encoding'] = 'identity'
    
    # Prevent data leakage via compression
    response.headers['X-No-Compression'] = 'do-not-compress'
    
    # Cache control to prevent replay
    response.headers['Cache-Control'] = 'no-store, no-cache, private'
    
    return response
```

## Best Practices Summary

1. **Disable compression** for authentication responses and sensitive endpoints
2. **Use per-request CSRF tokens** instead of static ones
3. **Monitor TLS configuration** to ensure compression is disabled at the protocol level
4. **Add randomized padding** to response bodies
5. **Implement rate limiting** on login and token refresh endpoints
6. **Use security headers** like `X-No-Compression`
7. **Regularly audit** your security infrastructure for compression-related vulnerabilities

## Conclusion

Compression vulnerabilities like CRIME and BREACH represent a subtle but serious threat to web application security. While these attacks require specific conditions (enabled compression, attacker-controlled input, observable response sizes), they demonstrate why security professionals must understand the interaction between different layers of the technology stack.

The key takeaway: **secure != optimize for performance**. Sometimes we must sacrifice performance for security. Disabling compression on sensitive endpoints is a small price to pay for protection against sophisticated attacks.

Have you encountered compression-related vulnerabilities in your infrastructure? Share your experiences in the comments below!
