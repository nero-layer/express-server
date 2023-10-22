// Attached to 
const secretKey = process.env.RECAPTCHA_SECRET;
if (!secretKey) {
  throw new Error(`RECAPTCHA_SECRET required`);
}

export async function validate(token, ip) {
  const payload = {
    secret: secretKey,
    response: token,
    remoteip: ip,
  };
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(payload)
  })
  .then(resp => resp.json())
  .then(resp => {
    if (!resp.success) {
      console.error('recaptcha failed', resp);
    }
    return resp.success;
  })
  .catch(err => {
    console.error('Error recaptcha validate:', err);
    return Promise.reject(err);
  });
}
