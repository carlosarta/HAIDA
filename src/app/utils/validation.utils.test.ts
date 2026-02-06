import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidPassword,
  isNotEmpty,
  isInRange,
  hasValidLength,
  isValidDateFormat,
} from './validation.utils';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('no-at-sign')).toBe(false);
    expect(isValidEmail('@missing-local.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('accepts valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
  });

  it('rejects invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid phone numbers', () => {
    expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
    expect(isValidPhone('5551234567')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abc')).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('accepts strong passwords', () => {
    const result = isValidPassword('SecurePass1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects weak passwords with specific errors', () => {
    const result = isValidPassword('short');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('isNotEmpty', () => {
  it('returns true for non-empty strings', () => {
    expect(isNotEmpty('hello')).toBe(true);
  });

  it('returns false for empty/null/undefined', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
  });
});

describe('isInRange', () => {
  it('validates numeric ranges correctly', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
    expect(isInRange(1, 1, 10)).toBe(true);
    expect(isInRange(10, 1, 10)).toBe(true);
  });
});

describe('hasValidLength', () => {
  it('validates min length', () => {
    expect(hasValidLength('hi', 3).isValid).toBe(false);
    expect(hasValidLength('hello', 3).isValid).toBe(true);
  });

  it('validates max length', () => {
    expect(hasValidLength('hello world', 1, 5).isValid).toBe(false);
    expect(hasValidLength('hi', 1, 5).isValid).toBe(true);
  });
});

describe('isValidDateFormat', () => {
  it('accepts valid YYYY-MM-DD dates', () => {
    expect(isValidDateFormat('2024-01-15')).toBe(true);
    expect(isValidDateFormat('2023-12-31')).toBe(true);
  });

  it('rejects invalid date formats', () => {
    expect(isValidDateFormat('01-15-2024')).toBe(false);
    expect(isValidDateFormat('2024/01/15')).toBe(false);
    expect(isValidDateFormat('not-a-date')).toBe(false);
  });
});
