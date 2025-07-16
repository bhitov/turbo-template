import { createORPCClient } from '@orpc/client'
import type { ContractRouterClient } from '@orpc/contract'
import { RPCLink } from '@orpc/client/fetch'
import { contract } from '@repo/api-contract'

const link = new RPCLink({
  url: 'http://localhost:3001/api',
  headers: { Authorization: 'Bearer token' },
})

export const api: ContractRouterClient<typeof contract> = createORPCClient(link)
