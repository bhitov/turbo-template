import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/utils/api";
import type { User } from "@repo/api-contract";

export function ORPCDemo(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // 🎯 LOOK: Contract-enforced type safety!
      const result = await api.users.list();
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // No create/delete for now - just focus on understanding oRPC with list!

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users with oRPC...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            🚀 oRPC Demo - Simple Contract Example
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            This simplified demo shows <strong>one oRPC endpoint</strong>: `users.list`. 
            The contract is defined once and enforced everywhere!
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={fetchUsers}>
              🔄 Refresh Users (oRPC Call)
            </Button>
            <Button variant="secondary" asChild>
              <a href="/">← Back to REST Demo</a>
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                oRPC Error: {error}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length}) - Single oRPC Endpoint</CardTitle>
            <CardDescription>
              🎯 <strong>Simple oRPC Demo:</strong> Just `api.users.list()` - one contract, one implementation!
              <br />
              • Contract: `packages/api-contract/src/index.ts` 
              • Server: `apps/api/src/routes/orpc.ts`
              • Client: `apps/web/src/utils/api.ts`
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">
                No users found. Check the backend logs and database!
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(user.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {user.id}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🔍 How oRPC Works (Simplified)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">📝 <strong>Contract:</strong> `listUsers = os.handler(() =&gt; User[])`</p>
            <p className="text-sm">🖥️ <strong>Server:</strong> Implements the handler with database logic</p>
            <p className="text-sm">🌐 <strong>Client:</strong> `api.users.list()` calls the endpoint</p>
            <p className="text-sm">⚡ <strong>Network:</strong> HTTP request to `/api/orpc`</p>
            <p className="text-sm">🔒 <strong>Type Safety:</strong> TypeScript ensures contract compliance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
