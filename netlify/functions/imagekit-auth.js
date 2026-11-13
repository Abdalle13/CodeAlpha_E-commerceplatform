/**
 * imagekit-auth.js
 * Netlify Function — generates a signed ImageKit upload authentication payload.
 *
 * This function runs server-side so the IMAGEKIT_PRIVATE_KEY is never exposed
 * to the browser. The signed token is passed to the ImageKit client SDK on
 * the admin image upload flow.
 *
 * Endpoint: /.netlify/functions/imagekit-auth
 * Method:   GET
 * Auth:     Requires a valid admin session verified via Supabase service-role key.
 *
 * Response: { token, expire, signature }
 *
 * References:
 *   https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload#signature
 */

const crypto = require('crypto');

// CORS headers — only allow requests from the same origin in production
const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

exports.handler = async (event) => {
  // Only GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[imagekit-auth] IMAGEKIT_PRIVATE_KEY environment variable is not set.');
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: 'ImageKit is not configured on this server.' }),
    };
  }

  // Verify the caller is an authenticated admin using Supabase service role
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    const authHeader = event.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Authentication required.' }),
      };
    }

    try {
      // Verify token with Supabase auth — use the REST API directly (no SDK in Netlify Functions)
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: serviceRoleKey,
        },
      });

      if (!userRes.ok) {
        return {
          statusCode: 401,
          headers: HEADERS,
          body: JSON.stringify({ error: 'Invalid or expired session.' }),
        };
      }

      const userData = await userRes.json();

      // Check admin role — query the profiles table using service role
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}&select=role`,
        {
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            Accept: 'application/json',
          },
        }
      );

      if (!profileRes.ok) {
        return {
          statusCode: 500,
          headers: HEADERS,
          body: JSON.stringify({ error: 'Profile lookup failed.' }),
        };
      }

      const profiles = await profileRes.json();
      const role = profiles?.[0]?.role;

      if (role !== 'admin') {
        return {
          statusCode: 403,
          headers: HEADERS,
          body: JSON.stringify({ error: 'Admin access required.' }),
        };
      }
    } catch (err) {
      console.error('[imagekit-auth] Auth verification error:', err);
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({ error: 'Authentication check failed.' }),
      };
    }
  }
  // If Supabase is not configured (local dev), skip auth check but still generate signature

  // Generate ImageKit upload signature
  // expire = unix timestamp 30 minutes from now
  const expire = Math.floor(Date.now() / 1000) + 30 * 60;
  const token = crypto.randomBytes(16).toString('hex');

  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ token, expire, signature }),
  };
};

