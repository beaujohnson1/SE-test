import { auth } from "@/lib/auth";
import { getUserCredits, getCreditHistory } from "@/lib/credits";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const credits = await getUserCredits(session.user.id);
    const history = await getCreditHistory(session.user.id, 10);

    return NextResponse.json({
      credits,
      history,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
