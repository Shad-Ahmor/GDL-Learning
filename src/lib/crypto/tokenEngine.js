/**
 * GDLSofts License Token Engine
 * AES-256-GCM + PBKDF2 + HMAC-SHA256
 * Key material is assembled from split obfuscated modules at runtime.
 * Never stored in DB or logged.
 */

import { _a } from './ka.js';
import { _b } from './kb.js';
import { _c2 } from './kc.js';
import { _pp } from './pepper.js';

// ─── Internal helpers ────────────────────────────────────────────────────────

function _enc(str) {
  return new TextEncoder().encode(str);
}

function _dec(buf) {
  return new TextDecoder().decode(buf);
}

function _toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function _fromB64(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

function _assembleMaster() {
  // Assembled at call time — never cached in a variable at module scope
  return _a() + _b() + _c2();
}

// ─── Web Crypto primitives ───────────────────────────────────────────────────

async function _sha256(str) {
  const hash = await crypto.subtle.digest('SHA-256', _enc(str));
  return new Uint8Array(hash);
}

async function _hmacSign(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw', _enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, _enc(message));
  return _toB64(sig);
}

async function _hmacVerify(message, secret, sigB64) {
  const expected = await _hmacSign(message, secret);
  return expected === sigB64;
}

async function _deriveKey(masterSecret, emailSaltBytes) {
  const baseKey = await crypto.subtle.importKey(
    'raw', _enc(masterSecret), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: emailSaltBytes, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a license token for an admin email + permissions list.
 * Only callable from Super Admin context.
 *
 * @param {string} adminEmail - The school admin's email (binds the token)
 * @param {string[]} permissions - Array of permission keys to grant
 * @returns {Promise<string>} - Base64-encoded encrypted token
 */
export async function generateLicenseToken(adminEmail, permissions, schoolName = 'Unknown School') {
  const email = adminEmail.trim().toLowerCase();
  const master = _assembleMaster();
  const pepper = _pp();

  // Derive key: email as PBKDF2 salt (non-transferable)
  const emailSalt = await _sha256(email);
  const cryptoKey = await _deriveKey(master, emailSalt);

  // Build payload
  const issuedAt = Date.now();
  const sortedPerms = [...permissions].sort();
  const emailSig = await _hmacSign(email, pepper);
  const payloadSig = await _hmacSign(
    `${email}|${schoolName}|${sortedPerms.join(',')}|${issuedAt}`,
    pepper
  );

  const payload = JSON.stringify({
    v: 3,                          // schema version 3
    email,
    schoolName,
    role: 'Admin',
    emailSig,
    permissions: sortedPerms,
    issuedAt,
    sig: payloadSig,
  });

  // Encrypt with AES-256-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    _enc(payload)
  );

  // Combine: [12 bytes IV] + [encrypted data] → base64
  const combined = new Uint8Array(12 + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), 12);

  // Format: split into 4-char groups for readability
  const raw = _toB64(combined);
  return raw.match(/.{1,4}/g)?.join('-') ?? raw;
}

/**
 * Validate and redeem a license token.
 * Returns granted permissions if valid, throws on any failure.
 *
 * @param {string} adminEmail - Email entered by the admin (must match token)
 * @param {string} rawToken - The token string (with or without dashes)
 * @returns {Promise<string[]>} - Array of granted permission keys
 */
export async function redeemLicenseToken(adminEmail, rawToken) {
  const email = adminEmail.trim().toLowerCase();
  const master = _assembleMaster();
  const pepper = _pp();

  // Normalise token (remove dashes/spaces)
  const cleanToken = rawToken.replace(/[-\s]/g, '');

  let combined;
  try {
    combined = _fromB64(cleanToken);
  } catch {
    throw new Error('INVALID_FORMAT');
  }

  if (combined.length < 13) throw new Error('INVALID_FORMAT');

  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  // Derive key from the entered email
  const emailSalt = await _sha256(email);
  const cryptoKey = await _deriveKey(master, emailSalt);

  // Decrypt — will throw if key is wrong (email mismatch)
  let payload;
  try {
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );
    payload = JSON.parse(_dec(decryptedBuf));
  } catch {
    throw new Error('WRONG_EMAIL'); // Decryption failed = email mismatch
  }

  // Schema version check
  if (payload.v !== 2 && payload.v !== 3) throw new Error('INVALID_VERSION');

  // Email field verification
  if (payload.email !== email) throw new Error('WRONG_EMAIL');

  // HMAC verification — emailSig
  const emailSigValid = await _hmacVerify(email, pepper, payload.emailSig);
  if (!emailSigValid) throw new Error('TAMPERED');

  // HMAC verification — payload sig
  const sortedPerms = [...payload.permissions].sort();
  
  if (payload.v === 3) {
    const sigValid = await _hmacVerify(
      `${email}|${payload.schoolName}|${sortedPerms.join(',')}|${payload.issuedAt}`,
      pepper,
      payload.sig
    );
    if (!sigValid) throw new Error('TAMPERED');
    return { permissions: payload.permissions, schoolName: payload.schoolName, role: payload.role || 'Admin' };
  } else {
    const sigValid = await _hmacVerify(
      `${email}|${sortedPerms.join(',')}|${payload.issuedAt}`,
      pepper,
      payload.sig
    );
    if (!sigValid) throw new Error('TAMPERED');
    return { permissions: payload.permissions, schoolName: null, role: 'Admin' };
  }
}

/**
 * Get permissions currently stored for a user (from localStorage).
 * @param {string} userEmail
 */
export function getStoredPermissions(userEmail) {
  try {
    const email = userEmail.trim().toLowerCase();
    const raw = localStorage.getItem(`gdl_lic_${btoa(email)}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.permissions || !Array.isArray(parsed.permissions)) return null;
    return parsed.permissions;
  } catch {
    return null;
  }
}

/**
 * Store granted permissions for a user in localStorage.
 * @param {string} userEmail
 * @param {string[]} permissions
 */
export function storePermissions(userEmail, permissions) {
  const email = userEmail.trim().toLowerCase();
  const data = { permissions, activatedAt: Date.now() };
  localStorage.setItem(`gdl_lic_${btoa(email)}`, JSON.stringify(data));
}

/**
 * Clear stored license for a user.
 */
export function clearPermissions(userEmail) {
  const email = userEmail.trim().toLowerCase();
  localStorage.removeItem(`gdl_lic_${btoa(email)}`);
}
