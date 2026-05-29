import { auth } from "@/auth";
import { getDbOrNull } from "@/lib/api/firestore-query";
import { jsonError, jsonOk } from "@/lib/api/response";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session || (role !== "ADMIN" && role !== "MODERATOR")) {
    return jsonError("Unauthorized", 401);
  }

  const db = getDbOrNull();

  if (!db) {
    return jsonOk({
      jobs: [],
      summary: { queued: 0, running: 0, failed: 0, completed: 0, last24hCompleted: 0 },
    });
  }

  const snap = await db.collection("scrapeJobs").orderBy("updatedAt", "desc").limit(50).get();
  const jobs = snap.docs.map((doc) => {
    const data = doc.data() as { status?: string; completedAt?: string; updatedAt?: { toDate?: () => Date } | string };
    return {
      id: doc.id,
      ...data,
      updatedAt:
        typeof data.updatedAt === "object" && data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt,
    };
  });

  const summary = {
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "running").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    last24hCompleted: jobs.filter((j) => {
      if (j.status !== "completed" || !j.completedAt) return false;
      return Date.now() - new Date(j.completedAt).getTime() < 86_400_000;
    }).length,
  };

  return jsonOk({ jobs, summary }, 15);
}
