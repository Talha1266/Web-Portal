export default async function handler(req, res) {
  // CORS Headers for local development, Vercel handles this in production usually but good to have
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, heading, targetIds } = req.body;
  const appId = '14080f6b-a747-488a-a947-0acfb6b61cd6';
  const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !restApiKey) {
    console.error('Missing OneSignal keys. Check Vercel Environment Variables.');
    return res.status(500).json({ error: 'OneSignal keys not configured' });
  }

  try {
    const payload = {
      app_id: appId,
      target_channel: "push",
      contents: { en: message },
      headings: heading ? { en: heading } : { en: "N.M.T Update" },
    };

    if (targetIds && targetIds.length > 0) {
      payload.include_external_user_ids = targetIds;
    } else {
      payload.included_segments = ['Subscribed Users', 'Total Subscriptions', 'All', 'Active Users'];
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors?.[0] || 'Unknown error from OneSignal');
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('OneSignal Push Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
