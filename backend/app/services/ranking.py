
import re
from urllib.parse import urlparse


STOP_WORDS = {
    "the", "and", "for", "with", "from", "that",
    "this", "are", "was", "were", "into", "about",
    "using", "use", "based", "study", "studies",
    "research", "effect", "effects", "impact",
    "analysis", "assessment", "investigation"
}


def tokenize(text):
    """Convert text into useful lowercase keywords."""

    if not text:
        return set()

    words = re.findall(r"\b[a-zA-Z0-9]+\b", text.lower())

    return {
        word for word in words
        if len(word) > 2 and word not in STOP_WORDS
    }


def calculate_relevance(query, result):
    """Calculate a simple keyword-based relevance score."""

    query_words = tokenize(query)

    if not query_words:
        return 0

    title_words = tokenize(result.get("title", ""))
    abstract_words = tokenize(result.get("abstract", ""))

    title_matches = len(query_words & title_words)
    abstract_matches = len(query_words & abstract_words)

    title_score = title_matches / len(query_words)
    abstract_score = abstract_matches / len(query_words)

    score = (title_score * 70) + (abstract_score * 30)

    return round(min(score, 100), 2)


def get_duplicate_key(result):
    """Create a key to identify duplicate publications."""

    doi = result.get("doi", "").strip().lower()

    if doi:
        return "doi:" + doi

    url = result.get("url", "").strip().lower()

    if url:
        parsed = urlparse(url)
        normalized_url = (
            parsed.netloc + parsed.path
        ).rstrip("/")

        if normalized_url:
            return "url:" + normalized_url

    title = result.get("title", "").strip().lower()
    normalized_title = re.sub(r"[^a-z0-9]+", " ", title).strip()

    if normalized_title:
        return "title:" + normalized_title

    return None


def rank_and_deduplicate(query, results):
    """Remove duplicate results and rank by relevance."""

    unique_results = []
    seen = set()

    for result in results:
        key = get_duplicate_key(result)

        if key and key in seen:
            continue

        if key:
            seen.add(key)

        result["relevance_score"] = calculate_relevance(
            query,
            result
        )

        unique_results.append(result)

    unique_results.sort(
        key=lambda item: item["relevance_score"],
        reverse=True
    )

    return unique_results
