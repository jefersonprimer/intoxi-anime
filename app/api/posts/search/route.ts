import {
  SEARCH_PAGE_SIZE,
  isSearchDateFilter,
  isSearchSortOption,
} from "@/lib/post-utils";
import { searchPosts } from "@/lib/posts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const rawDate = searchParams.get("date") ?? "all";
  const rawSort = searchParams.get("sort") ?? "newest";
  const rawOffset = Number(searchParams.get("offset") ?? "0");
  const rawLimit = Number(searchParams.get("limit") ?? String(SEARCH_PAGE_SIZE));

  const result = await searchPosts({
    query,
    category,
    date: isSearchDateFilter(rawDate) ? rawDate : "all",
    sort: isSearchSortOption(rawSort) ? rawSort : "newest",
    offset: Number.isFinite(rawOffset) ? rawOffset : 0,
    limit: Number.isFinite(rawLimit) ? rawLimit : SEARCH_PAGE_SIZE,
  });

  return Response.json(result);
}
