import { NextRequest, NextResponse } from "next/server";
import { getPassport, ApprovalResponse } from "@repo/kite";

/**
 * GET /api/subscription/passport
 * Return current agent passport state
 */
export async function GET(request: NextRequest) {
  try {
    const passport = getPassport();
    const passportData = passport.getPassport();

    return NextResponse.json({
      passport: passportData,
      session: passport.getActiveSessions()[0] ?? null,
    });
  } catch (error) {
    console.error("Error fetching passport:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/passport
 * Register new agent or approve session
 *
 * Register:
 * { action: "register", userId: string, email: string, agentName: string }
 *
 * Approve Session:
 * { action: "approve_session", sessionId: string, approved: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "register") {
      const { userId, email, agentName } = body;

      if (!userId || !email || !agentName) {
        return NextResponse.json(
          { error: "Missing required fields: userId, email, agentName" },
          { status: 400 }
        );
      }

      const passport = getPassport();
      const registered = await passport.register(userId, email, agentName);

      return NextResponse.json({
        success: true,
        message: "Agent registered. Verification email sent.",
        passport: {
          id: registered.id,
          walletAddress: registered.walletAddress,
          email: registered.email,
        },
      });
    } else if (action === "approve_session") {
      const { sessionId, approved, passkeySig } = body;

      if (!sessionId || approved === undefined) {
        return NextResponse.json(
          { error: "Missing required fields: sessionId, approved" },
          { status: 400 }
        );
      }

      const passport = getPassport();
      const approval: ApprovalResponse = {
        sessionId,
        approved,
        passkeySig: passkeySig ?? undefined,
        denialReason: approved ? undefined : "User denied",
      };

      const session = await passport.approveSession(approval);

      return NextResponse.json({
        success: true,
        message: approved ? "Session approved" : "Session denied",
        session: {
          id: session.id,
          status: session.status,
          spent: session.spent,
          totalBudget: session.totalBudget,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Unknown action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing passport request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
