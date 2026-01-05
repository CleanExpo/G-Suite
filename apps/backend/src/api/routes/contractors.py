"""
Contractor Availability API Routes.

Australian-first API for managing contractor schedules with:
- ABN validation
- Australian mobile number format
- Brisbane location focus
- AEST timezone handling
- DD/MM/YYYY date formatting
"""

from datetime import datetime
from typing import Annotated, Optional
from fastapi import APIRouter, HTTPException, Query, status
from uuid import uuid4

from src.models.contractor import (
    Contractor,
    ContractorCreate,
    ContractorUpdate,
    ContractorList,
    AvailabilitySlot,
    AvailabilitySlotCreate,
    AvailabilityStatus,
    Location,
    AustralianState,
    ErrorResponse,
)


router = APIRouter(
    prefix="/contractors",
    tags=["contractors"],
    responses={
        404: {
            "model": ErrorResponse,
            "description": "Contractor not found"
        },
        422: {
            "model": ErrorResponse,
            "description": "Validation error (invalid ABN, mobile, etc.)"
        },
    },
)

# In-memory storage for demo (replace with Supabase in production)
contractors_db: dict[str, Contractor] = {}


@router.get(
    "/",
    response_model=ContractorList,
    summary="List all contractors",
    description="Get paginated list of contractors with Australian formatting",
)
async def list_contractors(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    state: Optional[AustralianState] = Query(
        None,
        description="Filter by Australian state (e.g., QLD, NSW)"
    ),
    specialisation: Optional[str] = Query(
        None,
        description="Filter by specialisation"
    ),
) -> ContractorList:
    """
    List contractors with optional filtering.

    **Australian Context:**
    - Phone numbers formatted as 04XX XXX XXX
    - ABN formatted as XX XXX XXX XXX
    - Timestamps in AEST/AEDT timezone
    - Locations include Australian state (QLD, NSW, etc.)

    **Example:**
    ```
    GET /contractors?page=1&page_size=20&state=QLD
    ```
    """
    contractors = list(contractors_db.values())

    # Filter by state if provided
    if state:
        contractors = [
            c for c in contractors
            if any(
                slot.location.state == state
                for slot in c.availability_slots
            )
        ]

    # Filter by specialisation if provided
    if specialisation:
        contractors = [
            c for c in contractors
            if c.specialisation
            and specialisation.lower() in c.specialisation.lower()
        ]

    # Pagination
    total = len(contractors)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = contractors[start:end]

    return ContractorList(
        contractors=paginated,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{contractor_id}",
    response_model=Contractor,
    summary="Get contractor by ID",
    description="Retrieve contractor details with availability slots",
)
async def get_contractor(contractor_id: str) -> Contractor:
    """
    Get contractor by ID.

    **Australian Context:**
    - Mobile: 04XX XXX XXX format
    - ABN: XX XXX XXX XXX format
    - Locations: Suburb, STATE format
    - Times: AEST/AEDT timezone

    **Example:**
    ```
    GET /contractors/550e8400-e29b-41d4-a716-446655440000
    ```
    """
    contractor = contractors_db.get(contractor_id)
    if not contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with ID {contractor_id} not found",
        )
    return contractor


@router.post(
    "/",
    response_model=Contractor,
    status_code=status.HTTP_201_CREATED,
    summary="Create new contractor",
    description="Register a new contractor with Australian validation",
)
async def create_contractor(contractor: ContractorCreate) -> Contractor:
    """
    Create a new contractor.

    **Australian Validation:**
    - **Mobile:** Must be valid Australian mobile (04XX XXX XXX)
    - **ABN:** Must be 11 digits (XX XXX XXX XXX)
    - **Email:** Optional, standard email format

    **Example Request:**
    ```json
    {
        "name": "John Smith",
        "mobile": "0412 345 678",
        "abn": "12 345 678 901",
        "email": "john@example.com.au",
        "specialisation": "Water Damage Restoration"
    }
    ```

    **Example Response:**
    ```json
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Smith",
        "mobile": "0412 345 678",
        "abn": "12 345 678 901",
        "email": "john@example.com.au",
        "specialisation": "Water Damage Restoration",
        "created_at": "2026-01-06T09:00:00+10:00",
        "updated_at": "2026-01-06T09:00:00+10:00",
        "availability_slots": []
    }
    ```
    """
    contractor_id = str(uuid4())
    now = datetime.now()

    new_contractor = Contractor(
        id=contractor_id,
        name=contractor.name,
        mobile=contractor.mobile,
        abn=contractor.abn,
        email=contractor.email,
        specialisation=contractor.specialisation,
        created_at=now,
        updated_at=now,
        availability_slots=[],
    )

    contractors_db[contractor_id] = new_contractor
    return new_contractor


@router.patch(
    "/{contractor_id}",
    response_model=Contractor,
    summary="Update contractor",
    description="Update contractor details (partial update)",
)
async def update_contractor(
    contractor_id: str,
    updates: ContractorUpdate,
) -> Contractor:
    """
    Update contractor details.

    **Partial Update:** Only provided fields will be updated.

    **Australian Validation:**
    - Mobile numbers validated and formatted
    - ABN validated and formatted
    - All updates maintain Australian standards

    **Example Request:**
    ```json
    {
        "mobile": "0423 456 789",
        "specialisation": "Fire Damage Repair"
    }
    ```
    """
    contractor = contractors_db.get(contractor_id)
    if not contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with ID {contractor_id} not found",
        )

    # Update only provided fields
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(contractor, field, value)

    contractor.updated_at = datetime.now()
    contractors_db[contractor_id] = contractor

    return contractor


@router.delete(
    "/{contractor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete contractor",
    description="Remove contractor from system",
)
async def delete_contractor(contractor_id: str):
    """
    Delete contractor by ID.

    **Warning:** This will permanently remove the contractor and all
    their availability slots.

    **Example:**
    ```
    DELETE /contractors/550e8400-e29b-41d4-a716-446655440000
    ```
    """
    if contractor_id not in contractors_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with ID {contractor_id} not found",
        )

    del contractors_db[contractor_id]
    return None


@router.post(
    "/{contractor_id}/availability",
    response_model=AvailabilitySlot,
    status_code=status.HTTP_201_CREATED,
    summary="Add availability slot",
    description="Add availability slot for contractor (Brisbane focus)",
)
async def add_availability_slot(
    contractor_id: str,
    slot: AvailabilitySlotCreate,
) -> AvailabilitySlot:
    """
    Add availability slot to contractor's schedule.

    **Australian Context:**
    - **Location:** Brisbane suburbs (Indooroopilly, Toowong, West End, etc.)
    - **State:** QLD (Queensland) default
    - **Timezone:** AEST/AEDT
    - **Time Format:** 24-hour (will be displayed as 12-hour with am/pm in frontend)

    **Example Request:**
    ```json
    {
        "contractor_id": "550e8400-e29b-41d4-a716-446655440000",
        "date": "2026-01-06T00:00:00+10:00",
        "start_time": "09:00:00",
        "end_time": "12:00:00",
        "location": {
            "suburb": "Indooroopilly",
            "state": "QLD",
            "postcode": "4068"
        },
        "status": "available",
        "notes": "Available for water damage inspection"
    }
    ```
    """
    contractor = contractors_db.get(contractor_id)
    if not contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with ID {contractor_id} not found",
        )

    slot_id = str(uuid4())
    new_slot = AvailabilitySlot(
        id=slot_id,
        date=slot.date,
        start_time=slot.start_time,
        end_time=slot.end_time,
        location=slot.location,
        status=slot.status,
        notes=slot.notes,
    )

    contractor.availability_slots.append(new_slot)
    contractor.updated_at = datetime.now()
    contractors_db[contractor_id] = contractor

    return new_slot


@router.get(
    "/{contractor_id}/availability",
    response_model=list[AvailabilitySlot],
    summary="Get contractor availability",
    description="List all availability slots for contractor",
)
async def get_contractor_availability(
    contractor_id: str,
    status_filter: Optional[AvailabilityStatus] = Query(
        None,
        alias="status",
        description="Filter by status (available, booked, tentative)"
    ),
) -> list[AvailabilitySlot]:
    """
    Get contractor's availability slots.

    **Filtering:**
    - Filter by status: `?status=available`
    - Results sorted by date (earliest first)

    **Australian Context:**
    - Locations formatted as "Suburb, STATE"
    - Timestamps in AEST/AEDT
    - Brisbane focus (QLD suburbs)

    **Example:**
    ```
    GET /contractors/{id}/availability?status=available
    ```
    """
    contractor = contractors_db.get(contractor_id)
    if not contractor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contractor with ID {contractor_id} not found",
        )

    slots = contractor.availability_slots

    # Filter by status if provided
    if status_filter:
        slots = [s for s in slots if s.status == status_filter]

    # Sort by date (earliest first)
    slots.sort(key=lambda s: s.date)

    return slots


@router.get(
    "/search/by-location",
    response_model=ContractorList,
    summary="Search contractors by location",
    description="Find contractors available in specific Brisbane suburbs",
)
async def search_by_location(
    suburb: Annotated[str, Query(description="Brisbane suburb (e.g., Indooroopilly)")],
    state: AustralianState = Query(
        AustralianState.QLD,
        description="Australian state (default: QLD)"
    ),
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> ContractorList:
    """
    Search contractors by location.

    **Australian Context:**
    - Default state: QLD (Queensland)
    - Brisbane suburbs: Indooroopilly, Toowong, West End, etc.
    - Case-insensitive search

    **Example:**
    ```
    GET /contractors/search/by-location?suburb=Indooroopilly&state=QLD
    ```
    """
    contractors = [
        c for c in contractors_db.values()
        if any(
            slot.location.suburb.lower() == suburb.lower()
            and slot.location.state == state
            for slot in c.availability_slots
        )
    ]

    # Pagination
    total = len(contractors)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = contractors[start:end]

    return ContractorList(
        contractors=paginated,
        total=total,
        page=page,
        page_size=page_size,
    )
