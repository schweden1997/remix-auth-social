import { Form, Link, useLoaderData } from '@remix-run/react'
import { authenticator } from '~/services/auth.server'

import type { ActionArgs, LoaderArgs } from '@remix-run/node'

export default function Index() {
  const user = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>Demo of remix-auth-strava-strategy</h1>
      {!user && (
        <div>
          <h3>You are currently not logged in</h3>
          <Link to='login'>Go to login page</Link>
        </div>
      )}
      {user && (
        <div>
          <h3>
            Hello {user.firstname} {user.lastname}
          </h3>
          <p>You are logged in</p>
          {user.profile && <img src={user.profile} alt='profile' />}
          <Form method='post' action='/?index'>
            <button>Log out</button>
          </Form>
        </div>
      )}
    </div>
  )
}

export async function action({ request }: ActionArgs) {
  await authenticator.logout(request, { redirectTo: '/' })
}

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request)
  return user
}
