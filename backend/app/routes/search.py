import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl, Field
from app.services.crossref import search_crossref
from app.services.scraper import scrape_website

router = APIRouter()

class SearchRequest(BaseModel):
    title: str = Field(min_length=3, max_length=500)
    website_url: HttpUrl
    start_year: int = Field(ge=1900, le=2100)
    end_year: int = Field(ge=1900, le=2100)

@router.post("/search")
def search_rrl(data: SearchRequest):

    if data.start_year > data.end_year:
        raise HTTPException(
            status_code=400,
            detail="Starting year cannot exceed ending year"
        )

    try:
        website_text = scrape_website(str(data.website_url))

        results = search_crossref(
            data.title,
            data.start_year,
            data.end_year
        )

        return {
            "query": data.title,
            "website": str(data.website_url),
            "website_text_length": len(website_text),
            "total_results": len(results),
            "results": results
        }

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve information from an external source"
        )