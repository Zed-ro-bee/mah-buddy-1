import { NextResponse } from 'next/server'

type SignupPayload = {
  type?: string
  table?: string
  schema?: string
  record?: {
    id?: string
    email?: string
    raw_user_meta_data?: Record<string, unknown> | null
    raw_app_meta_data?: Record<string, unknown> | null
    created_at?: string
  }
  email?: string
  name?: string
  provider?: string
}

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email notification service is not configured.' }, { status: 503 })
  }

  try {
    const body = (await request.json()) as SignupPayload
    const record = body.record
    const metadata = record?.raw_user_meta_data ?? {}
    const appMetadata = record?.raw_app_meta_data ?? {}

    const email = record?.email || body.email || ''
    const name = typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : typeof body.name === 'string'
          ? body.name
          : ''

    const providers = Array.isArray(appMetadata.providers) ? appMetadata.providers : []
    const provider = providers.length > 0
      ? providers.join(', ')
      : typeof body.provider === 'string'
        ? body.provider
        : 'Email / password'

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
        subject: 'New Mah Buddy signup',
        html: `
          <h2>New Mah Buddy user</h2>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Name:</strong> ${escapeHtml(name || 'Not provided')}</p>
          <p><strong>Sign-up method:</strong> ${escapeHtml(provider)}</p>
          <p><strong>User ID:</strong> ${escapeHtml(record?.id || 'Not provided')}</p>
          <p><strong>Time:</strong> ${escapeHtml(record?.created_at || new Date().toISOString())}</p>
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
