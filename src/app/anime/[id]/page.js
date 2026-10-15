import Link from "next/link";
import AnimeCard from "@/components/AnimeCard";
import { FORMATS, SORTS, browseAnime, getGenres } from "@/lib/anilist";

const SCORES = [60, 70, 80];

function pick(value) {
  return typeof value === "string" ? value : "";
}

function buildHref(params, overrides = {}) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) qs.set(key, String(value));
  }
  const str = qs.toString();
  return str ? `/?${str}` : "/";
}

export default async function Home({ searchParams }) {
  const sp = await searchParams;

  const params = {
    q: pick(sp.q).trim(),
    genre: pick(sp.genre),
    format: pick(sp.format),
    year: pick(sp.year),
    score: pick(sp.score),
    sort: pick(sp.sort) || "TRENDING_DESC",
  };
  const page = Math.max(1, parseInt(pick(sp.page), 10) || 1);

  let genres = [];
  let result = null;
  let error = null;

  try {
    [genres, result] = await Promise.all([
      getGenres(),
      browseAnime({
        search: params.q,
        genre: params.genre,
        format: params.format,
        year: params.year,
        minScore: params.score,
        sort: params.sort,
        page,
      }),
    ]);
  } catch (err) {
    error = err.message;
  }

  const lastYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: lastYear - 1989 }, (_, i) => lastYear - i);

  return (
    <>
      <section className="intro">
        <h1>Find your next anime</h1>
        <p>Browse series and movies, then narrow them down by genre, year and score.</p>
      </section>

      <nav className="formats" aria-label="Format">
        <Link
          href={buildHref(params, { format: "" })}
          className="pill"
          aria-current={!params.format ? "true" : undefined}
        >
          All
        </Link>
        {FORMATS.map((f) => (
          <Link
            key={f.value}
            href={buildHref(params, { format: f.value })}
            className="pill"
            aria-current={params.format === f.value ? "true" : undefined}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <form action="/" method="get" className="filters">
        <input type="hidden" name="format" value={params.format} />

        <label className="field">
          <span>Search</span>
          <input type="search" name="q" defaultValue={params.q} placeholder="Title" />
        </label>

        <label className="field">
          <span>Genre</span>
          <select name="genre" defaultValue={params.genre}>
            <option value="">Any genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Year</span>
          <select name="year" defaultValue={params.year}>
            <option value="">Any year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Minimum score</span>
          <select name="score" defaultValue={params.score}>
            <option value="">Any score</option>
            {SCORES.map((s) => (
              <option key={s} value={s}>
                {s / 10}+ out of 10
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort by</span>
          <select name="sort" defaultValue={params.sort}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="actions">
          <button type="submit" className="btn">
            Apply filters
          </button>
          <Link href="/" className="link-quiet">
            Clear
          </Link>
        </div>
      </form>

      {error ? (
        <div className="notice" role="alert">
          <strong>Couldn&apos;t load anime.</strong> {error} Reload the page to try again.
        </div>
      ) : result.media.length === 0 ? (
        <div className="empty">
          <h2>Nothing matches these filters</h2>
          <p>Remove a filter or change the search to widen the results.</p>
          <Link href="/" className="btn">
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid">
            {result.media.map((anime) => (
              <li key={anime.id}>
                <AnimeCard anime={anime} />
              </li>
            ))}
          </ul>

          <div className="pager">
            {page > 1 ? (
              <Link className="btn btn-quiet" href={buildHref(params, { page: page - 1 })}>
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span>Page {page}</span>
            {result.pageInfo.hasNextPage ? (
              <Link className="btn btn-quiet" href={buildHref(params, { page: page + 1 })}>
                Next
              </Link>
            ) : (
              <span />
            )}
          </div>
        </>
      )}
    </>
  );
}
