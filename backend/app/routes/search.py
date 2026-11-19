
import requests

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.crossref import search_crossref


router = APIRouter()


class SearchRequest(BaseModel):
    title: str = Field(min_length=3, max_length=500)

    start_year: int = Field(ge=1900, le=2100)

    end_year: int = Field(ge=1900, le=2100)

    rows: int = Field(default=20, ge=1, le=100)


@router.post("/search")
def search_rrl(data: SearchRequest):

    # Validate publication year range
    if data.start_year > data.end_year:
        raise HTTPException(
            status_code=400,
            detail="Starting year cannot exceed ending year."
        )

    try:
        results = search_crossref(
            title=data.title,
            start_year=data.start_year,
            end_year=data.end_year,
            rows=data.rows
        )

        return {
            "status": "success",
            "query": data.title,
            "year_range": {
                "start": data.start_year,
                "end": data.end_year
            },
            "total_results": len(results),
            "results": results
        }

    except requests.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Crossref request timed out. Please try again."
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=502,
            detail="Unable to connect to Crossref."
        )

    except ValueError:
        raise HTTPException(
            status_code=502,
            detail="Invalid response received from Crossref."
        )
