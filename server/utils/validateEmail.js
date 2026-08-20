const dns = require('dns').promises;

const TRUSTED_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'icloud.com', 'protonmail.com', 'live.com', 'aol.com',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function isValidEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'format' };
  }

  const domain = email.split('@')[1].toLowerCase();

  if (TRUSTED_PROVIDERS.includes(domain)) {
    return { valid: true };
  }

  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000)),
    ]);
    if (records && records.length > 0) {
      return { valid: true };
    }
    return { valid: false, reason: 'no-mx' };
  } catch (err) {
    console.warn(`MX lookup failed for domain "${domain}":`, err.message);
    if (err.message === 'timeout') {
      return { valid: true, warning: 'mx-lookup-unavailable' };
    }
    return { valid: false, reason: 'no-mx' };
  }
}

module.exports = { isValidEmail };
