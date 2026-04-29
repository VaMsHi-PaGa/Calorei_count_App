"""
Report generation and export routes.

Endpoints for generating fitness reports, accessing suggestions, and exporting data.
"""

from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, JSONResponse
import logging
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import User
from app.middleware.auth import get_current_user
from app.services.reports import generate_report, Report, MIN_LOGGING_DAYS
from app.services.suggestions import get_suggestions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/check-eligibility")
def check_report_eligibility(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Check if user has logged enough data to generate reports.

    Returns:
        {
            "eligible": bool,
            "days_logged": int,
            "min_required": int,
            "message": str
        }
    """
    from app.services.aggregation import get_logging_stats

    end_date = date.today()
    start_date = end_date - timedelta(days=30)

    stats = get_logging_stats(db, current_user.id, start_date, end_date)
    days_logged = stats.get("total_days_logged", 0)
    eligible = days_logged >= MIN_LOGGING_DAYS

    return {
        "eligible": eligible,
        "days_logged": days_logged,
        "min_required": MIN_LOGGING_DAYS,
        "message": "You have enough data to view reports." if eligible else f"Log at least {MIN_LOGGING_DAYS} days to unlock reports.",
    }


@router.get("", response_model=dict)
def get_report(
    days: int = Query(30, ge=7, le=365, description="Lookback period in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Generate comprehensive fitness report.

    Includes metrics, food analysis, goal progress, trends, and suggestions.
    Requires at least 7 days of logging data.

    Args:
        days: Lookback period (7-365 days, default 30)

    Returns:
        Report object as JSON
    """
    report = generate_report(db, current_user.id, days=days)

    if not report:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=f"Insufficient data. Please log activity for at least {MIN_LOGGING_DAYS} days to generate reports.",
        )

    return report.to_dict()


@router.get("/suggestions")
def get_report_suggestions(
    days: int = Query(7, ge=1, le=30, description="Lookback period in days"),
    use_ai: bool = Query(True, description="Enable AI-powered suggestions"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Get personalized suggestions for user.

    Analyzes recent activity to provide actionable tips for weight loss
    and habit improvement.

    Args:
        days: Lookback period (1-30 days, default 7)
        use_ai: Whether to include AI-generated suggestions (requires Ollama)

    Returns:
        {
            "suggestions": [
                {
                    "title": str,
                    "description": str,
                    "category": str,
                    "priority": str,
                    "action": str | null
                },
                ...
            ],
            "generated_at": datetime
        }
    """
    suggestions = get_suggestions(db, current_user.id, days=days, use_ai=use_ai)

    return {
        "suggestions": [s.to_dict() for s in suggestions],
        "generated_at": datetime.utcnow().isoformat(),
        "count": len(suggestions),
    }


@router.get("/export")
def export_report(
    format: str = Query("json", pattern="^(json|html|pdf)$", description="Export format"),
    days: int = Query(30, ge=7, le=365, description="Lookback period in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Export report in specified format.

    Supports JSON (raw data), HTML (formatted document), and PDF (printable).

    Args:
        format: Export format - "json", "html", or "pdf"
        days: Lookback period

    Returns:
        File response with appropriate content type
    """
    report = generate_report(db, current_user.id, days=days)

    if not report:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=f"Insufficient data. Please log at least {MIN_LOGGING_DAYS} days.",
        )

    # Format filename
    date_str = date.today().isoformat()
    filename = f"fittrack-report-{current_user.id}-{date_str}"

    if format == "json":
        # JSON export
        content = report.to_dict()
        return JSONResponse(
            content=content,
            media_type="application/json",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}.json"',
            },
        )

    elif format == "html":
        # HTML export
        html_content = report.to_html()
        return FileResponse(
            media_type="text/html",
            content=html_content.encode("utf-8"),
            headers={
                "Content-Disposition": f'attachment; filename="{filename}.html"',
            },
        )

    elif format == "pdf":
        # PDF export (requires weasyprint or reportlab)
        # For now, return HTML with note about PDF support
        logger.warning("PDF export requested but not yet implemented")
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="PDF export coming soon. Use HTML format for now.",
        )

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid format")


@router.post("/email")
def email_report(
    days: int = Query(30, ge=7, le=365, description="Lookback period in days"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Email report to user.

    Generates report and sends HTML version to user's email address.
    Requires email configuration in environment.

    Args:
        days: Lookback period

    Returns:
        {
            "status": "sent" | "error",
            "message": str,
            "recipient": str
        }
    """
    report = generate_report(db, current_user.id, days=days)

    if not report:
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail=f"Insufficient data. Please log at least {MIN_LOGGING_DAYS} days.",
        )

    # TODO: Implement email service integration
    # For now, return success response indicating feature is planned
    return {
        "status": "pending",
        "message": "Email report feature coming soon",
        "recipient": current_user.email,
    }


@router.get("/health")
def report_health(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    """
    Get report generation health status.

    Useful for debugging report generation issues.

    Returns:
        {
            "status": str,
            "services": dict of service status
        }
    """
    from app.services.aggregation import get_logging_stats

    end_date = date.today()
    start_date = end_date - timedelta(days=7)

    try:
        stats = get_logging_stats(db, current_user.id, start_date, end_date)
        aggregation_status = "ok"
    except Exception as e:
        aggregation_status = f"error: {str(e)}"

    try:
        suggestions = get_suggestions(db, current_user.id, days=7, use_ai=False)
        suggestions_status = "ok"
    except Exception as e:
        suggestions_status = f"error: {str(e)}"

    try:
        report = generate_report(db, current_user.id, days=30)
        reports_status = "ok" if report else "insufficient_data"
    except Exception as e:
        reports_status = f"error: {str(e)}"

    return {
        "status": "healthy" if all(s == "ok" for s in [aggregation_status, suggestions_status]) else "degraded",
        "services": {
            "aggregation": aggregation_status,
            "suggestions": suggestions_status,
            "reports": reports_status,
        },
    }


@router.get("/weekly-summary")
def get_weekly_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return this week vs last week averages for calories, protein, weight."""
    from datetime import date, timedelta
    from sqlalchemy import func
    from app.models.food_log import FoodLog as FoodLogModel
    from app.models.weight_log import WeightLog as WeightLogModel

    today = date.today()
    this_week_start = today - timedelta(days=today.weekday())
    last_week_start = this_week_start - timedelta(days=7)
    last_week_end = this_week_start - timedelta(days=1)

    def food_avg(start: date, end: date):
        rows = db.query(
            func.avg(FoodLogModel.calories).label("cal"),
            func.avg(FoodLogModel.protein).label("protein"),
        ).filter(
            FoodLogModel.user_id == current_user.id,
            func.date(FoodLogModel.created_at) >= start,
            func.date(FoodLogModel.created_at) <= end,
        ).first()
        return {
            "avg_calories": round(rows.cal or 0, 1),
            "avg_protein": round(rows.protein or 0, 1),
        }

    def weight_avg(start: date, end: date):
        row = db.query(func.avg(WeightLogModel.weight)).filter(
            WeightLogModel.user_id == current_user.id,
            WeightLogModel.date >= start,
            WeightLogModel.date <= end,
        ).scalar()
        return round(row or 0, 2)

    this_week = food_avg(this_week_start, today)
    last_week = food_avg(last_week_start, last_week_end)

    return {
        "this_week": {**this_week, "avg_weight": weight_avg(this_week_start, today)},
        "last_week": {**last_week, "avg_weight": weight_avg(last_week_start, last_week_end)},
        "week_start": str(this_week_start),
    }
