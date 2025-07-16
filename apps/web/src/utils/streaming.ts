import { createORPCClient } from '@orpc/client'
import type { ContractRouterClient } from '@orpc/contract'
import type { ClientLink, ClientOptions } from '@orpc/client'
import { streamingContract } from '@repo/api-contract'
import { io } from 'socket.io-client'

// Create Socket.IO link for oRPC
function createSocketIOLink(): ClientLink<Record<never, never>> {
  const socket = io('http://localhost:3001', { 
    path: '/socket.io'
  });

  return {
    call: async (path: readonly string[], input: unknown, options: ClientOptions<Record<never, never>>) => {
      return new Promise((resolve, reject) => {
        if (options.signal?.aborted) {
          reject(new Error('Request aborted'));
          return;
        }

        // Create the oRPC payload
        const payload = JSON.stringify({
          method: path.join('.'),
          params: input,
          id: Math.random().toString(36)
        });

        socket.emit('orpc', payload, (response: string) => {
          resolve(response);
        });

        socket.once('error', reject);
        
        options.signal?.addEventListener('abort', () => {
          reject(new Error('Request aborted'));
        });
      });
    }
  };
}

export const streamingApi: ContractRouterClient<typeof streamingContract> = createORPCClient(createSocketIOLink())
