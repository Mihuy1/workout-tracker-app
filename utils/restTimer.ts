export type RestTimerRun = {
  id: number;
  durationMs: number;
} & (
  | { status: "running"; endsAt: number }
  | { status: "paused"; remainingMs: number }
);

export type RestTimerAction =
  | { type: "start"; seconds: number; id: number }
  | { type: "clear" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "adjust"; deltaMs: number }
  | { type: "expire" };

export function remainingRestMs(run: RestTimerRun, now: number): number {
  return run.status === "paused"
    ? run.remainingMs
    : Math.max(0, run.endsAt - now);
}

export function transitionRestTimer(
  run: RestTimerRun | null,
  action: RestTimerAction,
  now: number,
): RestTimerRun | null {
  if (action.type === "clear") return null;
  if (action.type === "start") {
    const durationMs = action.seconds * 1000;
    if (!Number.isFinite(durationMs) || durationMs <= 0) return null;
    return {
      id: action.id,
      durationMs,
      status: "running",
      endsAt: now + durationMs,
    };
  }

  if (!run) return null;

  const remainingMs = remainingRestMs(run, now);

  if (remainingMs <= 0) return null;

  switch (action.type) {
    case "pause":
      return run.status === "paused"
        ? run
        : {
            id: run.id,
            durationMs: run.durationMs,
            status: "paused",
            remainingMs,
          };
    case "resume":
      return run.status === "running"
        ? run
        : {
            id: run.id,
            durationMs: run.durationMs,
            status: "running",
            endsAt: now + remainingMs,
          };
    case "adjust":
      if (run.status !== "running" || !Number.isFinite(action.deltaMs))
        return run;
      const nextRemaining = Math.max(0, remainingMs + action.deltaMs);
      if (nextRemaining === 0) return null;
      return {
        ...run,
        durationMs: Math.max(run.durationMs, nextRemaining),
        endsAt: now + nextRemaining,
      };
    case "expire":
      return run;
  }
}

export function timerSeconds(ms: number, countdown = false): number {
  return Math.max(0, countdown ? Math.ceil(ms / 1000) : Math.floor(ms / 1000));
}
