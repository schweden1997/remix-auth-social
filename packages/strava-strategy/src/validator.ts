import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import type { StravaStrategyOptions } from '.'

export const classInputSchema = z.object({
  clientID: z.string().min(1, { message: 'clientID cannot be empty' }),
  clientSecret: z.string().min(1, { message: 'clientSecret cannot be empty' }),
  redirectURI: z.string().min(1, { message: 'redirectURI cannot be empty' }),
  approvalPrompt: z.union([z.literal('force'), z.literal('auto')]).optional(),
  scope: z.set(
    z.union([
      z.literal('read'),
      z.literal('read_all'),
      z.literal('profile:read_all'),
      z.literal('profile:write'),
      z.literal('activity:read'),
      z.literal('activity:read_all'),
      z.literal('activity:write'),
    ])
  ),
})

export function validateInputs(input: StravaStrategyOptions) {
  const validatedInput = classInputSchema.safeParse({
    clientID: input.clientID,
    clientSecret: input.clientSecret,
    redirectURI: input.redirectURI,
    approvalPrompt: input.approvalPrompt,
    scope: new Set(input.scope),
  })

  if (!validatedInput.success) {
    const { message } = fromZodError(validatedInput.error)
    throw new Error(message)
  }

  // turn scope set into a sting or set to 'read' of empty
  const scopeAsString =
    [...validatedInput.data.scope].length === 0
      ? 'read'
      : [...validatedInput.data.scope].join()

  // set approvalPrompt to 'auto' if user didn't specify
  const approvalPromptDefault = validatedInput.data.approvalPrompt ?? 'auto'

  return {
    clientID: validatedInput.data.clientID,
    clientSecret: validatedInput.data.clientSecret,
    redirectURI: validatedInput.data.redirectURI,
    approvalPrompt: approvalPromptDefault,
    scope: scopeAsString,
  }
}
