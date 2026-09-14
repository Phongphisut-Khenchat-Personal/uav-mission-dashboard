import { NextResponse } from "next/server";
import { missions } from "@/data/missions";

const MOCK_DELAY_MS = 500;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function GET(request: Request) {
  await delay(MOCK_DELAY_MS);

  const url = new URL(request.url);
  const shouldFail = url.searchParams.get("error") === "true";

  if (shouldFail) {
    return NextResponse.json(
      { message: "Unable to load missions" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: missions,
    total: missions.length,
  });
}
