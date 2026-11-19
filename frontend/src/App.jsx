
import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/search";

function App() {
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [startYear, setStartYear] = useState("2020");
  const [endYear, setEndYear] = useState("2026");

  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (event) => {
    event.preventDefault();

    setError("");
    setErrors([]);
    setResults([]);
    setSearched(false);

    if (!title.trim()) {
      setError("Please enter your thesis or research title.");
      return;
    }

    if (!website.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    if (
      Number(startYear) > Number(endYear) ||
      !startYear ||
      !endYear
    ) {
      setError("Please enter a valid publication year range.");
      return;
    }

    try {
      new URL(website);
      if (!["http:", "https:"].includes(new URL(website).protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      setError("Please enter a valid website URL starting with https:// or http://.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          start_year: Number(startYear),
          end_year: Number(endYear),
          website_url: website.trim(),
          rows: 20,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to complete your search."
        );
      }

      setResults(data.results || []);
      setErrors(data.errors || []);
      setSearched(true);

      if (!data.results?.length) {
        setError("No results were found. Try another title or website.");
      }
    } catch (err) {
      setError(
        err.message || "Unable to connect to the RRL Finder backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTitle("");
    setWebsite("");
    setStartYear("2020");
    setEndYear("2026");
    setResults([]);
    setErrors([]);
    setError("");
    setSearched(false);
  };

  const cleanText = (text) => {
    if (!text) return "No abstract or description available.";

    return text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>RRL Finder</h1>
        <p>
          Find related literature and studies for your research.
        </p>
      </header>

      <main className="main-content">
        <section className="search-section">
          <h2>Research Search</h2>
          <p>
            Enter your research details to discover related sources.
          </p>

          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label>Thesis / Research Title</label>
              <input
                type="text"
                placeholder="Enter your research title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Website URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="year-inputs">
              <div className="form-group">
                <label>From Year</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>To Year</label>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="button-group">
              <button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {loading && (
          <div className="loading-message">
            Searching Crossref and website...
          </div>
        )}

        {errors.length > 0 && (
          <section className="search-warnings">
            <h3>Search warnings</h3>
            {errors.map((item, index) => (
              <p key={index}>{item}</p>
            ))}
          </section>
        )}

        {searched && (
          <section className="results-section">
            <h2>Search Results</h2>

            <p className="results-count">
              {results.length} result(s) found
            </p>

            {results.length === 0 ? (
              <p>No results found.</p>
            ) : (
              results.map((item, index) => (
                <article className="result-card" key={index}>
                <div className="result-meta">
                  <span className="source-badge">
                    {item.source || "Unknown source"}
                  </span>

                  {item.year && (
                    <span>{item.year}</span>
                  )}

                  <span className="relevance-badge">
                    {item.relevance_score ?? 0}% relevant
                  </span>
                </div>
                  <h3>{item.title || "Untitled source"}</h3>

                  {item.authors?.length > 0 && (
                    <p>
                      <strong>Authors:</strong>{" "}
                      {item.authors.join(", ")}
                    </p>
                  )}

                  {item.journal && (
                    <p>
                      <strong>Publication:</strong>{" "}
                      {item.journal}
                    </p>
                  )}

                  <p className="abstract">
                    {cleanText(item.abstract)}
                  </p>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Source
                    </a>
                  )}
                </article>
              ))
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>RRL Finder | Research Assistant</p>
      </footer>
    </div>
  );
}

export default App;
