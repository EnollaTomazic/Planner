import { describe, expect, it, beforeEach } from 'vitest';

import { sanitizePrompt } from '@/ai/safety';

beforeEach(() => {
  delete process.env.AI_MAX_INPUT_LENGTH;
});

describe('sanitizePrompt', () => {
  it('strips control characters and escapes markup', () => {
    const raw = 'Hello\u0007<script>alert("x")</script>\nWorld';

    const sanitized = sanitizePrompt(raw);

    expect(sanitized).toBe('Hello&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;\nWorld');
  });

  it('collapses excessive whitespace and normalizes newlines', () => {
    const raw = '  Hello   world  \r\n\r\n\r\nThis\tis\tfine\r\n\r\nEnd  ';

    const sanitized = sanitizePrompt(raw);

    expect(sanitized).toBe('Hello world\n\nThis is fine\n\nEnd');
  });

  it('truncates input beyond the default maximum length', () => {
    const raw = 'a'.repeat(16_500);

    const sanitized = sanitizePrompt(raw);

    expect(sanitized).toBe('a'.repeat(16_000));
    expect(Array.from(sanitized)).toHaveLength(16_000);
  });
});
