import { StrategyVerifyCallback } from 'remix-auth'
import {
  OAuth2Profile,
  OAuth2Strategy,
  OAuth2StrategyVerifyParams,
} from 'remix-auth-oauth2'
import { IDetailedAthlete, ISummaryAthlete } from './types'
import { validateInputs } from './validator'

// Options needed from developer
export interface StravaStrategyOptions {
  clientID: string
  clientSecret: string
  redirectURI: string
  approvalPrompt?: 'force' | 'auto'
  scope?: Array<Scope>
}

export type Scope =
  | 'read'
  | 'read_all'
  | 'profile:read_all'
  | 'profile:write'
  | 'activity:read'
  | 'activity:read_all'
  | 'activity:write'

export type StravaExtraParams = {
  token_type: 'Bearer'
  expires_at: number
  expires_in: number
  athlete: ISummaryAthlete
} & Record<string, string | number>

export type StravaProfile =
  | (IDetailedAthlete & OAuth2Profile)
  | (ISummaryAthlete & OAuth2Profile)

export class StravaStrategy<User> extends OAuth2Strategy<
  User,
  StravaProfile,
  StravaExtraParams
> {
  public name = 'strava'
  private readonly scope: string
  private readonly prompt: 'force' | 'auto'
  private readonly userInfoURL = 'https://www.strava.com/api/v3/athlete'

  constructor(
    {
      clientID,
      clientSecret,
      redirectURI,
      approvalPrompt,
      scope,
    }: StravaStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<StravaProfile, StravaExtraParams>
    >
  ) {
    const validatedInput = validateInputs({
      clientID,
      clientSecret,
      redirectURI,
      approvalPrompt,
      scope,
    })

    super(
      {
        clientID: validatedInput.clientID,
        clientSecret: validatedInput.clientSecret,
        callbackURL: validatedInput.redirectURI,
        authorizationURL: 'https://www.strava.com/oauth/authorize',
        tokenURL: 'https://www.strava.com/oauth/token',
      },
      verify
    )

    this.scope = validatedInput.scope
    this.prompt = validatedInput.approvalPrompt
  }

  protected authorizationParams(): URLSearchParams {
    const params = new URLSearchParams({
      scope: this.scope,
      approval_prompt: this.prompt,
      response_type: 'code',
    })
    return params
  }

  protected async userProfile(accessToken: string): Promise<StravaProfile> {
    const response = await fetch(this.userInfoURL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const data: StravaProfile = await response.json()
    data.provider = 'strava'
    return data
  }
}
