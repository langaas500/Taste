import { NextRequest, NextResponse } from "next/server";

type LogLevel = "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

function generateRequestId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 12);
}

interface LogPayload {
  requestId: string;
  route: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  userId?: string;
  duration?: number;
  error?: { message: string; stack?: string };
  [key: string]: unknown;
}

function emit(payload: LogPayload) {
  const str = JSON.stringify(payload);
  if (isProd) {
    if (payload.level === "error") console.error(str);
    else console.log(str);
  } else {
    const rid = payload.requestId.slice(0, 8);
    const dur = payload.duration != null ? ` ${payload.duration}ms` : "";
    const uid = payload.userId ? ` uid=${payload.userId.slice(0, 8)}` : "";
    const err = payload.error ? ` err="${payload.error.message}"` : "";
    console.log(
      `[${payload.level}] ${payload.message}${uid} (${rid}${dur}${err})`,
    );
  }
}

export class Logger {
  private userId?: string;

  constructor(
    private readonly requestId: string,
    private readonly route: string,
    private readonly startTime: number,
  ) {}

  setUserId(id: string) {
    this.userId = id;
  }

  info(message: string, extra?: Record<string, unknown>) {
    this.log("info", message, undefined, extra);
  }

  warn(message: string, extra?: Record<string, unknown>) {
    this.log("warn", message, undefined, extra);
  }

  error(message: string, err?: unknown, extra?: Record<string, unknown>) {
    this.log("error", message, err, extra);
  }

  elapsed(): number {
    return Math.round(performance.now() - this.startTime);
  }

  private log(
    level: LogLevel,
    message: string,
    err?: unknown,
    extra?: Record<string, unknown>,
  ) {
    const payload: LogPayload = {
      requestId: this.requestId,
      route: this.route,
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(this.userId ? { userId: this.userId } : {}),
      ...(extra || {}),
    };
    if (err) {
      payload.error = {
        message: err instanceof Error ? err.message : String(err),
        ...(err instanceof Error && err.stack ? { stack: err.stack } : {}),
      };
    }
    emit(payload);
  }
}

type WithLoggerHandler = (
  req: NextRequest,
  ctx: { logger: Logger; params?: Promise<Record<string, string>> },
) => Promise<NextResponse>;

export function withLogger(route: string, handler: WithLoggerHandler) {
  return async function (
    req: NextRequest,
    routeCtx?: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> {
    const requestId = generateRequestId();
    const start = performance.now();
    const logger = new Logger(requestId, route, start);

    logger.info(`${req.method} ${route}`);

    try {
      const res = await handler(req, { logger, params: routeCtx?.params });
      logger.info(`${req.method} ${route} → ${res.status}`, {
        duration: logger.elapsed(),
      });
      return res;
    } catch (e: unknown) {
      logger.error(`${req.method} ${route} unhandled`, e, {
        duration: logger.elapsed(),
      });
      const msg = e instanceof Error ? e.message : "Error";
      if (msg === "Unauthorized")
        return NextResponse.json({ error: msg }, { status: 401 });
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  };
}
