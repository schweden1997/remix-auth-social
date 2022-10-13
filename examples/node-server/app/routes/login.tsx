import { Form } from '@remix-run/react'

export default function Login() {
  return (
    <Form action='/auth/strava' method='post'>
      <button>Login with Strava</button>
    </Form>
  )
}
