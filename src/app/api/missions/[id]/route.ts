import { NextResponse } from "next/server";
import { missions } from "@/data/missions";

const MOCK_DELAY_MS = 500;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await delay(MOCK_DELAY_MS);

  const { id } = await context.params;
  const mission = missions.find((item) => item.id === id);

  if (!mission) {
    return NextResponse.json(
      { message: "Mission not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: mission });
}
