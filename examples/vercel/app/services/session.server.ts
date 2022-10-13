import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: ['replace-this-with-a-secret-string'],
    secure: process.env.NODE_ENV === 'production',
  },
})

export const { commitSession, destroySession, getSession } = sessionStorage
