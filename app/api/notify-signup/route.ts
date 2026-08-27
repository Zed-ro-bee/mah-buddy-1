import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email notification service is not configured.' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    const name = typeof body.name === 'string' ? body.name : ''
    const provider = typeof body.provider === 'string' ? body.provider : 'Unknown'

    if (!email) {
      return NextResponse.json({ error: 'Missing email.' }, { status: 400 })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mah Buddy <onboarding@resend.dev>',
        to: ['zee.asa.co@gmail.com'],
        subject: '🎓 New Mah Buddy signup',
        html: `
          <h2>New Mah Buddy user</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Name:</strong> ${escapeHtml(name || 'Not provided')}</p>
          <p><strong>Sign-up method:</strong> ${escapeHtml(provider)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        `,
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('Resend signup notification failed:', details)
      return NextResponse.json({ error: 'Notification could not be sent.' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Signup notification error:', error)
    return NextResponse.json({ error: 'Invalid notification request.' }, { status: 400 })
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
