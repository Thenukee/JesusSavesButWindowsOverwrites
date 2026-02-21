---
layout: page
title: Contact
description: Get in touch — I'd love to hear from you.
permalink: /contact/
---

## Let's Connect

Have a question, want to collaborate, or just want to say hello? Drop me a message below or reach out on social media.

<form class="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required placeholder="Your name">
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="_replyto" required placeholder="your.email@example.com">
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" required placeholder="What's on your mind?"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Send Message</button>
</form>

## Find Me Online

<div class="social-links">
  <a href="{{ site.author.github }}" target="_blank" class="social-link">
    🐙 GitHub
  </a>
  <a href="{{ site.author.linkedin }}" target="_blank" class="social-link">
    💼 LinkedIn
  </a>
  {% if site.author.scholar %}
  <a href="{{ site.author.scholar }}" target="_blank" class="social-link">
    🎓 Google Scholar
  </a>
  {% endif %}
  <a href="mailto:{{ site.author.email }}" class="social-link">
    ✉️ Email
  </a>
</div>
