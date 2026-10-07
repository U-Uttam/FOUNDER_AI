from fastapi import APIRouter, HTTPException
from .. import schemas
from ..services.maps import compare_locations

router = APIRouter(prefix="/api/location", tags=["location"])

@router.post("/compare", response_model=schemas.LocationCompareResponse)
def compare_target_locations(payload: schemas.LocationCompareRequest):
    """
    Computes spatial metrics and POI coordinates for two locations and returns
    a relative scoring recommendation.
    """
    try:
        comparison_results = compare_locations(
            loc1=payload.location1,
            loc2=payload.location2,
            business_type=payload.business_type,
            budget=payload.budget
        )
        return comparison_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute comparison: {e}")
