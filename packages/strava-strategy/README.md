# StravaStrategy

The Strava strategy is used to authenticate users against a Strava account. It extends the [OAuth2Strategy](https://github.com/sergiodxa/remix-auth-oauth2).

## Supported runtimes

| Runtime    | Has Support   |
| ---------- | --------------|
| Node.js    | ✅            |
| Cloudflare | ✅            |

## Usage

This strategy is used with the [remix-auth](https://github.com/sergiodxa/remix-auth) package. Make sure to follow their instructions on how to use a strategy.

A minimal working example can be found in the [examples](https://github.com/schweden1997/remix-auth-social/tree/next/examples/node-server) folder.

### Create an OAuth application

Follow the steps on the [Strava documentation](https://developers.strava.com/docs/getting-started/) to create a new application and get a client ID and secret.

### Create the strategy instance

```ts
import { StravaStrategy } from 'remix-auth-strava-strategy'

let strategy = new StravaStrategy(
  {
    clientID: 'your-client-id', //required
    clientSecret: 'your-client-secret', //required
    redirectURI: 'your-url/auth/strava/callback', //required
    approvalPrompt: 'force', // optional, defaults to 'auto'
    scope: ['read', 'activity:read'], // optional, defaults to ['read']
  },
  async ({ accessToken, extraParams, profile, refreshToken, context }) => {
    // Get the user data from your DB or API using the tokens and profile
    return User.findOrCreate({ id: profile.id })
  }
)

authenticator.use(strategy)
```

- `scope` is an array of strings. The default scope is `['read']`. The available scopes are: `read` `read_all` `profile:read_all` `profile:write` `activity:read` `activity:read_all` `activity:write`.

- `approvalPrompt` is a string. The default value is `'auto'`. The available values are: `auto` `force`.

Refer to the [Strava documentation](https://developers.strava.com/docs/authentication/#details-about-requesting-access) for more information on the scopes and approval prompt.

### Setup your routes

```tsx
// app/routes/login.tsx
export default function Login() {
  return (
    <Form action='/auth/strava' method='post'>
      <button>Login with Strava</button>
    </Form>
  )
}
```

```tsx
// app/routes/auth/strava.tsx
import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader() {
  return redirect('/login')
}

export async function action({ request }: ActionArgs) {
  return authenticator.authenticate('strava', request)
}
```

```tsx
// app/routes/auth/strava/callback.tsx
import type { LoaderArgs } from '@remix-run/node'
import { authenticator } from '~/auth.server'

export async function loader({ request }: LoaderArgs) {
  return authenticator.authenticate('strava', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
}
```
