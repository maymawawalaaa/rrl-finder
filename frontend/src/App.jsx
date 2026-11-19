
import { useState } from "react";
import "./App.css";

function App() {
  // Form states
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [startYear, setStartYear] = useState("2020");
  const [endYear, setEndYear] = useState("2026");

  // Search states
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search literature through FastAPI
  async function handleSearch(event) {
    event.preventDefault();

    // Reset previous search
    setError("");
    setResults([]);
    setSearched(false);

    // Convert years into numbers
    const from = Number(startYear);
    const to = Number(endYear);

    // Validate research title
    if (!title.trim()) {
      setError("Please enter your research title.");
      return;
    }

    // Validate year range
    if (!startYear || !endYear || from < 1900 || to > 2100) {
      setError("Please enter a valid publication year range.");
      return;
    }

    if (from > to) {
      setError(
        "Starting year cannot be greater than ending year."
      );
      return;
    }

    // Validate website URL
    try {
      const parsedUrl = new URL(website);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError(
          "Please enter a valid HTTP or HTTPS website URL."
        );
        return;
      }
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    // Start loading
    setLoading(true);

    try {
      // Send search request to FastAPI
      const response = await fetch(
        "http://127.0.0.1:8000/api/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            start_year: from,
            end_year: to,
            rows: 20,
          }),
        }
      );

      // Read backend response
      const data = await response.json();

      // Handle backend errors
      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to retrieve research results."
        );
      }

      // Store research results
      setResults(
        Array.isArray(data.results) ? data.results : []
      );

      setSearched(true);

    } catch (err) {
      console.error("Search error:", err);

      setError(
        err.message ||
        "Unable to connect to the backend. Please check if FastAPI is running."
      );

    } finally {
      setLoading(false);
    }
  }

  // Clear form
  function handleClear() {
    setTitle("");
    setWebsite("");
    setStartYear("2020");
    setEndYear("2026");
    setResults([]);
    setSearched(false);
    setError("");
    setLoading(false);
  }

  return (
    <div className="app">

      {/* Navigation */}
      <header className="navbar">
        <a href="/" className="brand">
          <div className="brand-icon">R</div>
          <span>RRL Finder</span>
        </a>

        <span className="navbar-label">
          Research Literature Assistant
        </span>
      </header>

      <main className="main-container">

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-badge">
            <span className="status-dot"></span>
            Academic Research Assistant
          </div>

          <h1>
            Find the right literature
            <br />
            for your <span>research.</span>
          </h1>

          <p>
            Discover related literature and studies using your
            research title, preferred website, and publication
            year range.
          </p>
        </section>

        {/* Search Form */}
        <section className="search-card">

          <div className="card-heading">
            <div>
              <h2>Research Search</h2>
              <p>Enter your research information below.</p>
            </div>

            <div className="search-icon">⌕</div>
          </div>

          <form onSubmit={handleSearch}>

            {/* Research Title */}
            <div className="form-group">
              <label htmlFor="title">
                Thesis / Research Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="Enter your thesis or research title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={500}
              />

              <small>
                Enter the complete title or topic of your research.
              </small>
            </div>

            {/* Website URL */}
            <div className="form-group">
              <label htmlFor="website">
                Website URL
              </label>

              <input
                id="website"
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                required
              />

              <small>
                Enter the website where you want to find related
                research.
              </small>
            </div>

            {/* Publication Year Range */}
            <div className="form-group">
              <label>
                Publication Year Range
              </label>

              <div className="year-inputs">

                <div>
                  <span>From</span>

                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) =>
                      setStartYear(e.target.value)
                    }
                    min="1900"
                    max="2100"
                    required
                  />
                </div>

                <div className="year-separator">
                  —
                </div>

                <div>
                  <span>To</span>

                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) =>
                      setEndYear(e.target.value)
                    }
                    min="1900"
                    max="2100"
                    required
                  />
                </div>

              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Form Buttons */}
            <div className="form-actions">

              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>

              <button
                type="submit"
                className="search-button"
                disabled={loading}
              >
                {loading
                  ? "Searching..."
                  : "⌕ Find Related Literature"}
              </button>

            </div>

          </form>
        </section>

        {/* Search Results */}
        {searched && (

          <section className="results-section">

            <div className="results-heading">

              <div>
                <h2>Search Results</h2>

                <p>
                  Research publications within your selected
                  year range.
                </p>
              </div>

              <span className="result-count">
                {results.length} results
              </span>

            </div>

            {/* Display Results */}
            {results.length > 0 ? (

              <div className="results-list">

                {results.map((item, index) => (

                  <article
                    className="result-card"
                    key={item.doi || item.id || index}
                  >

                    {/* Publication Information */}
                    <div className="result-top">

                      <span className="result-year">
                        {item.year || "Year unavailable"}
                      </span>

                      <span className="result-source">
                        {item.journal || "Unknown Journal"}
                      </span>

                    </div>

                    {/* Research Title */}
                    <h3>
                      {item.title || "Untitled Research"}
                    </h3>

                    {/* Authors */}
                    <p className="authors">
                      {Array.isArray(item.authors)
                        ? item.authors.join(", ")
                        : item.authors || "Authors not available"}
                    </p>

                    {/* Abstract */}
                    <p className="abstract">
                      {item.abstract ||
                        "No abstract available for this publication."}
                    </p>

                    {/* DOI */}
                    {item.doi && (
                      <p className="authors">
                        DOI: {item.doi}
                      </p>
                    )}

                    {/* Original Research Link */}
                    {item.url && (

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link"
                      >
                        View Original Source ↗
                      </a>

                    )}

                  </article>

                ))}

              </div>

            ) : (

              /* No Results */
              <div className="empty-results">

                <h3>No results found</h3>

                <p>
                  Try changing your research title or publication
                  year range.
                </p>

              </div>

            )}

          </section>

        )}

        {/* Footer */}
        <footer className="footer">
          <p>
            RRL Finder © 2026 | Academic Research Assistance Tool
          </p>
        </footer>

      </main>
    </div>
  );
}

export default App;
