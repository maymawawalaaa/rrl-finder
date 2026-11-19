
import requests

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, HttpUrl
from app.services.ranking import rank_and_deduplicate
from app.services.crossref import search_crossref
from app.services.scraper import scrape_website

router = APIRouter()


class SearchRequest(BaseModel):
    title: str = Field(min_length=3, max_length=500)
    start_year: int = Field(ge=1900, le=2100)
    end_year: int = Field(ge=1900, le=2100)
    website_url: HttpUrl | None = None
    rows: int = Field(default=20, ge=1, le=100)


@router.post("/search")
def search_rrl(data: SearchRequest):

    if data.start_year > data.end_year:
        raise HTTPException(
            status_code=400,
            detail="Starting year cannot exceed ending year."
        )

    combined_results = []
    errors = []

    # 1. Search Crossref
    try:
        crossref_results = search_crossref(
            title=data.title,
            start_year=data.start_year,
            end_year=data.end_year,
            rows=data.rows
        )

        combined_results.extend(crossref_results)

    except requests.Timeout:
        errors.append("Crossref request timed out.")

    except requests.RequestException:
        errors.append("Unable to connect to Crossref.")

    except ValueError:
        errors.append("Invalid response received from Crossref.")

    # 2. Scrape the supplied website, if provided
    if data.website_url:
        try:
            website_result = scrape_website(
                url=str(data.website_url),
                keyword=data.title,
                max_results=10
            )

            # Convert the scraped page into the same
            # result structure used by Crossref.
            combined_results.append({
                "title": website_result["title"],
                "authors": [],
                "year": None,
                "abstract": " ".join(
                    website_result["content"]
                ),
                "journal": website_result["description"],
                "doi": "",
                "url": website_result["url"],
                "type": "website",
                "source": "Website"
            })

        except ValueError as error:
            errors.append(f"Website: {error}")

        except requests.Timeout:
            errors.append("Website request timed out.")

        except requests.RequestException:
            errors.append("Unable to retrieve the supplied website.")

    # 3. Remove duplicates and rank results
    ranked_results = rank_and_deduplicate(
        data.title,
        combined_results
    )

    # 4. Return ranked results
    return {
        "status": "success" if ranked_results else "error",
        "query": data.title,
        "year_range": {
            "start": data.start_year,
            "end": data.end_year
        },
        "total_results": len(ranked_results),
        "results": ranked_results,
        "errors": errors
    }
