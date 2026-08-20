const dns = require('dns').promises;

/**
 * Validation utility for strong passwords and email domain checks
 */

const MAJOR_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'proton.me',
  'live.com',
  'msn.com',
  'aol.com',
  'gmx.com',
  'zoho.com',
  'mail.com',
  'yandex.com',
  'example.com',
  'test.com',
  'localhost',
]);

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }

  const errors = [];
  if (password.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('at least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('at least one special character (!@#$%^&*)');
  }

  if (errors.length > 0) {
    let message = 'Password must contain ';
    if (errors.length === 1) {
      message += errors[0] + '.';
    } else if (errors.length === 2) {
      message += errors.join(' and ') + '.';
    } else {
      const last = errors.pop();
      message += errors.join(', ') + ', and ' + last + '.';
    }
    return { isValid: false, message, errors };
  }

  return { isValid: true, message: '' };
};

const validateEmailFormat = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const validateEmailDomainMx = async (email) => {
  if (!validateEmailFormat(email)) return false;

  const domain = email.trim().toLowerCase().split('@')[1];
  if (!domain) return false;

  // 1. Major Email Provider Allowlist (Instant pass)
  if (MAJOR_EMAIL_PROVIDERS.has(domain)) {
    console.log(`[Email Validation]: Domain '${domain}' matches allowlist -> PASSED`);
    return true;
  }

  console.log(`[Email Validation]: Verifying custom domain '${domain}'...`);

  // 2. OS-level DNS Lookup to check if domain exists
  try {
    await dns.lookup(domain);
  } catch (err) {
    console.warn(`[Email Validation]: Domain '${domain}' DNS lookup failed (${err.code}) -> REJECTED (Non-existent domain)`);
    return false;
  }

  // 3. DNS MX Lookup for Mail Server
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DNS_LOOKUP_TIMEOUT')), 3000)
    );

    const mxPromise = dns.resolveMx(domain);
    const addresses = await Promise.race([mxPromise, timeoutPromise]);

    if (Array.isArray(addresses) && addresses.length > 0) {
      console.log(`[Email Validation]: MX records found for '${domain}' -> PASSED`);
      return true;
    } else {
      console.warn(`[Email Validation]: Domain '${domain}' has 0 MX records -> REJECTED`);
      return false;
    }
  } catch (err) {
    const errCode = err.code || err.message;
    if (['ENOTFOUND', 'ENODATA', 'NXDOMAIN', 'ECONNREFUSED', 'EREFUSED'].includes(errCode)) {
      console.warn(`[Email Validation]: Domain '${domain}' MX query failed (${errCode}) -> REJECTED`);
      return false;
    }

    console.log(`[Email Validation]: DNS MX query network timeout (${errCode}). Bypassing MX check.`);
    return true;
  }
};

module.exports = { validatePassword, validateEmailFormat, validateEmailDomainMx };
