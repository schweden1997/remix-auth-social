import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from '@jest/globals'
import { createCookieSessionStorage, installGlobals } from '@remix-run/node'
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { StravaStrategy } from '../src'

describe('Strava Strategy on Node', () => {
  const sessionStorage = createCookieSessionStorage({
    cookie: { secrets: ['secret'], name: '_session' },
  })

  beforeAll(() => {
    installGlobals()
    enableFetchMocks()
  })
  beforeEach(() => {
    jest.resetAllMocks()
    fetchMock.resetMocks()
  })

  test('should have scope:read, approval_prompt:auto as default', async () => {
    const strategy = new StravaStrategy(
      {
        clientID: 'clientID',
        clientSecret: 'clientSecret',
        redirectURI: 'https://example.app/callback',
      },
      async ({ profile }) => {
        return profile
      }
    )

    const request = new Request('https://example.app/auth/strava')

    try {
      await strategy.authenticate(request, sessionStorage, {
        name: 'strava',
        sessionErrorKey: 'auth:error',
        sessionStrategyKey: 'auth:strava',
        sessionKey: '_session',
      })
    } catch (error) {
      if (!(error instanceof Response)) throw error
      const location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      const redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('scope')).toBe('read')
      expect(redirectUrl.searchParams.get('approval_prompt')).toBe('auto')
    }
  })

  // create all possible scope options
  const scopeOptions = combinations([
    'read',
    'read_all',
    'profile:read_all',
    'profile:write',
    'activity:read',
    'activity:read_all',
    'activity:write',
  ])

  // test each scope combination
  test.each(scopeOptions)(
    'test [%p, %p, %p, %p, %p, %p, %p] as scope',
    async (
      args1,
      args2 = undefined,
      args3 = undefined,
      args4 = undefined,
      args5 = undefined,
      args6 = undefined,
      args7 = undefined
    ) => {
      const args = [args1, args2, args3, args4, args5, args6, args7]
      const argsFiltered = args.filter((arg) => arg !== undefined)
      const scopeParams = argsFiltered.join()

      const strategy = new StravaStrategy(
        {
          clientID: 'clientID',
          clientSecret: 'clientSecret',
          redirectURI: 'https://example.app/callback',
          scope: argsFiltered,
        },
        async ({ profile }) => {
          return profile
        }
      )

      const request = new Request('https://example.app/auth/strava')

      try {
        await strategy.authenticate(request, sessionStorage, {
          name: 'strava',
          sessionErrorKey: 'auth:error',
          sessionStrategyKey: 'auth:strava',
          sessionKey: '_session',
        })
      } catch (error) {
        if (!(error instanceof Response)) throw error
        const location = error.headers.get('Location')

        if (!location) throw new Error('No redirect header')

        const redirectUrl = new URL(location)

        expect(redirectUrl.searchParams.get('scope')).toBe(scopeParams)
      }
    }
  )

  // test approval_prompt options
  const promptOptions = ['auto', 'force']
  test.each(promptOptions)(
    'set propmt to %p and expect same prompt in params',
    async (args) => {
      const strategy = new StravaStrategy(
        {
          clientID: 'clientID',
          clientSecret: 'clientSecret',
          redirectURI: 'https://example.app/callback',
          approvalPrompt: args,
        },
        async ({ profile }) => {
          return profile
        }
      )

      const request = new Request('https://example.app/auth/strava')

      try {
        await strategy.authenticate(request, sessionStorage, {
          name: 'strava',
          sessionErrorKey: 'auth:error',
          sessionStrategyKey: 'auth:strava',
          sessionKey: '_session',
        })
      } catch (error) {
        if (!(error instanceof Response)) throw error
        const location = error.headers.get('Location')

        if (!location) throw new Error('No redirect header')

        const redirectUrl = new URL(location)

        expect(redirectUrl.searchParams.get('approval_prompt')).toBe(args)
      }
    }
  )

  const mockOptions = [
    [
      undefined,
      'clientSecret',
      'https://example.app/callback',
      'auto',
      ['read'],
    ],
    ['clientID', undefined, 'https://example.app/callback', 'auto', ['read']],
    ['clientId', 'clientSecret', undefined, 'auto', ['read']],
    [
      'clientId',
      'clientSecret',
      'https://example.app/callback',
      'sometingOtherThan`auto`or`force`',
      ['read'],
    ],
    [
      'clientID',
      'clientSecret',
      'https://example.app/callback',
      'auto',
      ['invalidScope'],
    ],
    ['clientID', 'clientSecret', 'https://example.app/callback', 'auto', ['']],
  ]
  // error if input is invalid
  test.each(mockOptions)(
    'test with {clientID: %p, clientSecret: %p, redirectURI: %p, approvalPrompt: %p, scope: %p}',
    async (clientID, clientSecret, redirectURI, approvalPrompt, scope) => {
      expect(() => {
        new StravaStrategy(
          {
            clientID,
            clientSecret,
            redirectURI,
            approvalPrompt,
            scope,
          },
          async ({ profile }) => {
            return profile
          }
        )
      }).toThrow()
    }
  )
})

// helper functions
function k_combinations(set, k) {
  let i, j, combs, head, tailcombs

  // There is no way to take e.g. sets of 5 elements from
  // a set of 4.
  if (k > set.length || k <= 0) {
    return []
  }

  // K-sized set has only one K-sized subset.
  if (k == set.length) {
    return [set]
  }

  // There is N 1-sized subsets in a N-sized set.
  if (k == 1) {
    combs = []
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]])
    }
    return combs
  }

  combs = []
  for (i = 0; i < set.length - k + 1; i++) {
    // head is a list that includes only our current element.
    head = set.slice(i, i + 1)
    // We take smaller combinations from the subsequent elements
    tailcombs = k_combinations(set.slice(i + 1), k - 1)
    // For each (k-1)-combination we join it with the current
    // and store it to the set of k-combinations.
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]))
    }
  }
  return combs
}

function combinations(set) {
  let k, i, k_combs
  const combs: any = []

  // Calculate all non-empty k-combinations
  for (k = 1; k <= set.length; k++) {
    k_combs = k_combinations(set, k)
    for (i = 0; i < k_combs.length; i++) {
      combs.push(k_combs[i])
    }
  }
  return combs
}
