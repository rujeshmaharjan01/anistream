import { getSearchResults } from "@/lib/data";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json({ results: [] });
  }

  const results = await getSearchResults(query.slice(0, 80));

  return Response.json(
    { results },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    },
  );
}
