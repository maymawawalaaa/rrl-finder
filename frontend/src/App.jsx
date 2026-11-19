import { useState } from "react";

function App() {
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2026);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            website_url: website,
            start_year: Number(startYear),
            end_year: Number(endYear),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Search failed");
      }

      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">

        <h1 className="text-3xl font-bold text-blue-700">
          RRL Finder
        </h1>

        <p className="mb-6 mt-2 text-gray-600">
          Find related literature for your thesis.
        </p>

        <form onSubmit={handleSearch} className="space-y-4">

          <div>
            <label className="block font-semibold">
              Thesis Title
            </label>

            <input
              className="w-full rounded border p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your thesis title"
              required
            />
          </div>

          <div>
            <label className="block font-semibold">
              Website URL
            </label>

            <input
              type="url"
              className="w-full rounded border p-3"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">
                Starting Year
              </label>

              <input
                type="number"
                className="w-full rounded border p-3"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-semibold">
                Ending Year
              </label>

              <input
                type="number"
                className="w-full rounded border p-3"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Related Literature"}
          </button>

        </form>

        {error && (
          <p className="mt-4 text-red-600">{error}</p>
        )}

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">
            Search Results ({results.length})
          </h2>

          {results.map((item, index) => (
            <article
              key={item.doi || index}
              className="rounded-lg border p-4"
            >
              <h3 className="font-bold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Authors: {item.authors.join(", ") || "Not available"}
              </p>

              <p className="text-sm text-gray-600">
                Year: {item.year || "Not available"}
              </p>

              <p className="mt-2 text-sm">
                {item.abstract
                  ? item.abstract.replace(/<[^>]*>/g, "")
                  : "Abstract not available"}
              </p>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-blue-700 underline"
              >
                View Original Research
              </a>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}

export default App;