
import { useState } from "react";
import "./App.css";

const sampleResults = [
  {
    id: 1,
    title: "The Impact of Social Media on Students' Academic Performance",
    authors: "Maria Santos, John Dela Cruz",
    year: 2024,
    abstract:
      "This study examines the relationship between social media usage and academic performance among college students. Findings suggest that social media can influence study habits, learning engagement, and academic outcomes.",
    source: "Example Academic Journal",
    url: "https://example.com/research-1",
  },
  {
    id: 2,
    title: "Social Media Usage and Learning Behavior Among University Students",
    authors: "Robert Smith, Angela Brown",
    year: 2023,
    abstract:
      "This research investigates how social networking platforms affect the learning behavior, concentration, and educational experiences of university students.",
    source: "Example Research Database",
    url: "https://example.com/research-2",
  },
  {
    id: 3,
    title: "Digital Technology and Academic Achievement in Higher Education",
    authors: "James Wilson, Patricia Garcia",
    year: 2022,
    abstract:
      "The study explores the role of digital technologies in higher education and their relationship with student engagement, academic achievement, and learning outcomes.",
    source: "Example University Repository",
    url: "https://example.com/research-3",
  },
];

function App() {
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [startYear, setStartYear] = useState("2020");
  const [endYear, setEndYear] = useState("2026");

  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSearch(event) {
    event.preventDefault();

    setError("");
    setResults([]);
    setSearched(false);

    const from = Number(startYear);
    const to = Number(endYear);

    if (from > to) {
      setError("Starting year cannot be greater than ending year.");
      return;
    }

    try {
      const parsedUrl = new URL(website);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Please enter a valid HTTP or HTTPS website URL.");
        return;
      }
    } catch {
      setError("Please enter a valid website URL.");
      return;
    }

    setLoading(true);

    // Temporary sample search.
    // The real backend will replace this in Stage 2.
    setTimeout(() => {
      const filteredResults = sampleResults.filter(
        (item) => item.year >= from && item.year <= to
      );

      setResults(filteredResults);
      setSearched(true);
      setLoading(false);
    }, 1000);
  }

  function handleClear() {
    setTitle("");
    setWebsite("");
    setStartYear("2020");
    setEndYear("2026");
    setResults([]);
    setSearched(false);
    setError("");
  }

  return (
    <div className="app">
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

        <section className="search-card">
          <div className="card-heading">
            <div>
              <h2>Research Search</h2>
              <p>Enter your research information below.</p>
            </div>
            <div className="search-icon">⌕</div>
          </div>

          <form onSubmit={handleSearch}>
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

            <div className="form-group">
              <label>Publication Year Range</label>

              <div className="year-inputs">
                <div>
                  <span>From</span>
                  <input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(e.target.value)}
                    min="1900"
                    max="2100"
                    required
                  />
                </div>

                <div className="year-separator">—</div>

                <div>
                  <span>To</span>
                  <input
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(e.target.value)}
                    min="1900"
                    max="2100"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="clear-button"
                onClick={handleClear}
              >
                Clear
              </button>

              <button
                type="submit"
                className="search-button"
                disabled={loading}
              >
                {loading ? "Searching..." : "⌕  Find Related Literature"}
              </button>
            </div>
          </form>
        </section>

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

            {results.length > 0 ? (
              <div className="results-list">
                {results.map((item) => (
                  <article className="result-card" key={item.id}>
                    <div className="result-top">
                      <span className="result-year">
                        {item.year}
                      </span>
                      <span className="result-source">
                        {item.source}
                      </span>
                    </div>

                    <h3>{item.title}</h3>

                    <p className="authors">
                      {item.authors}
                    </p>

                    <p className="abstract">
                      {item.abstract}
                    </p>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      View Original Source ↗
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <h3>No results found</h3>
                <p>
                  Try changing your publication year range.
                </p>
              </div>
            )}
          </section>
        )}

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
