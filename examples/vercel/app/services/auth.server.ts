import { Authenticator } from 'remix-auth'
import type { StravaProfile } from 'remix-auth-strava-strategy'
import { StravaStrategy } from 'remix-auth-strava-strategy'
import { sessionStorage } from './session.server'

export const authenticator = new Authenticator<StravaProfile>(sessionStorage)

if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
  throw new Error('You must set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET')
}

authenticator.use(
  new StravaStrategy(
    {
      clientID: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      redirectURI: 'localhost:3000/auth/strava/callback',
      approvalPrompt: 'force',
      scope: ['read'],
    },
    async ({ accessToken, extraParams, profile, refreshToken, context }) => {
      // console.log(accessToken)
      // console.log(extraParams)
      // console.log(profile)
      // console.log(refreshToken)
      // console.log(context)
      return profile
    }
  )
)
