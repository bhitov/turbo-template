import { createORPCClient } from '@orpc/client'
import type { ContractRouterClient } from '@orpc/contract'
import { RPCLink } from '@orpc/client/websocket'
import { streamingContract } from '@repo/api-contract'

const websocket = new WebSocket('ws://localhost:3001')

const streamingLink = new RPCLink({
  websocket
})

export const streamingApi: ContractRouterClient<typeof streamingContract> = createORPCClient(streamingLink)
