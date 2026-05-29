import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Log = {
  id?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  actorEmail: string;
  createdAt: string;
};

export function ActivityFeed({ logs }: { logs: Log[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log, i) => (
              <li key={log.id ?? i} className="flex items-start justify-between gap-4 text-sm">
                <span>
                  <span className="font-medium">{log.actorEmail}</span>{" "}
                  <span className="text-muted-foreground">{log.action}</span>{" "}
                  {log.entityLabel ?? `${log.entityType} ${log.entityId}`}
                </span>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
