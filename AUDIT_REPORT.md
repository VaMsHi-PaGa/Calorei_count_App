# FitTrack Data Audit Report
**Date**: 2026-04-29  
**Status**: 🟡 ISSUES FOUND - See critical and high-priority items below

---

## Executive Summary
- **Critical Issues**: 3
- **High Priority**: 4
- **Medium Priority**: 3
- **Low Priority**: 2

---

## 🔴 CRITICAL ISSUES

### 1. **Timezone Inconsistency** (Data Integrity Risk)
**Severity**: CRITICAL  
**Location**: Database models  
**Issue**: 
- `FoodLog.created_at`: `DateTime(timezone=True)` - **timezone-aware**
- `UserGoal.created_at`: `DateTime` - **naive (no timezone)**
- `User.created_at`: `DateTime` - **naive (no timezone)**

**Impact**: 
- Datetime comparisons will fail or give incorrect results across tables
- Food logs will be timezone-aware but goals will be naive
- SQLAlchemy queries mixing these will produce unexpected results

**Fix Required**:
```python
# In user_goals.py and user.py, change:
created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

# To:
created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
```

---

### 2. **Unrealistic Goal Detection Logic Bug** (UI Breaking)
**Severity**: CRITICAL  
**Location**: `frontend/app/goals/page.tsx:186`  
**Issue**:
```typescript
const isRealisticGoal = requiredWeeklyLoss ? requiredWeeklyLoss >= 0.5 && requiredWeeklyLoss <= 1.5 : true;
```

**Problem**:
- When gaining weight, `requiredWeeklyLoss` is **negative** (e.g., -0.49)
- The check `requiredWeeklyLoss >= 0.5` fails for negative values
- Shows "aggressive/unrealistic goal" warning even for safe +0.5 kg/week gains

**Expected Behavior**:
```typescript
const absRate = requiredWeeklyLoss ? Math.abs(requiredWeeklyLoss) : 0;
const isRealisticGoal = absRate >= 0.5 && absRate <= 1.5;
```

**Fix**: Change line 186 to use absolute value:
```typescript
const isRealisticGoal = requiredWeeklyLoss ? Math.abs(requiredWeeklyLoss) >= 0.5 && Math.abs(requiredWeeklyLoss) <= 1.5 : true;
```

---

### 3. **Calorie Target Calculation Hardcoded for Weight Loss**
**Severity**: CRITICAL  
**Location**: `app/services/fitness.py:32`  
**Issue**:
```python
def calculate_calorie_target(user: User, weight_kg: float | None) -> float | None:
    bmr = calculate_bmr(user, weight_kg)
    if bmr is None:
        return None
    return round(bmr - 500, 2)  # ← HARDCODED DEFICIT
```

**Problem**:
- Always subtracts 500 calories (weight loss deficit)
- For users with weight **gain** goals, this creates a deficit when surplus is needed
- No distinction between loss and gain goals

**Fix Required**: 
- Query user's goal to determine if loss or gain
- Apply appropriate surplus (+500) or deficit (-500) based on goal type

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **Height Validation Mismatch** (Security/Data Quality)
**Severity**: HIGH  
**Location**: `app/schemas.py`  

**Mismatch**:
```python
# UserCreate (used by POST /users)
height: float = Field(gt=0)  # ← NO UPPER BOUND

# SignupPayload (used by POST /auth/signup)
height: float = Field(gt=0, le=300)  # ← le=300 cm
```

**Issue**: Users can register with unrealistic heights (999+ cm) via `/users` endpoint  
**Fix**: Add `le=300` to UserCreate:
```python
height: float = Field(gt=0, le=300, description="Height in centimeters")
```

---

### 5. **Date vs DateTime Inconsistency** (Query Issues)
**Severity**: HIGH  
**Location**: Database models  

**Inconsistency**:
- `WeightLog.date`: `Date` (just date, no time)
- `FoodLog.created_at`: `DateTime(timezone=True)` (date + time)

**Problem**: 
- Can't reliably filter by date across both tables
- Weight logs only show date, but food logs show exact timestamp
- Aggregations mixing these types will have type mismatch issues

**Recommendation**: Use consistent `DateTime` for both or add `time` component to weight logs

---

### 6. **Daily Calorie Target Type Mismatch**
**Severity**: HIGH  
**Location**: Schema/Database  

**Mismatch**:
```python
# Schema (Python)
daily_calorie_target: int | None

# Database (SQLAlchemy)
daily_calorie_target = Column(Integer)

# Frontend (JavaScript/TypeScript)
daily_calorie_target?: number  # Could be float
```

**Issue**: 
- Frontend TypeScript accepts `number` (float)
- Backend expects `int`
- No validation that float is converted to int
- Example: 2000.5 kcal might be stored as 2000 or cause an error

**Fix**: Add explicit conversion in schema or validate in POST endpoint

---

### 7. **Goal Update Missing Validation**
**Severity**: HIGH  
**Location**: `app/routes/goals.py` (PATCH /api/goals)  

**Issue**: 
- Update allows all fields to be set to `None`
- No validation that at least `weight_target` or `target_date` remain set
- Could result in invalid goal state: `{weight_target: null, target_date: null}`

**Fix**: Add validation in `UserGoalUpdate` to prevent all required fields from being null

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. **Division by Zero Risk on Goal Page**
**Severity**: MEDIUM  
**Location**: `frontend/app/goals/page.tsx:183`  

**Code**:
```typescript
const weeksTillGoal = daysUntilGoal / 7;
const requiredWeeklyLoss = weightToLose && weeksTillGoal ? weightToLose / weeksTillGoal : null;
```

**Issue**: If `daysUntilGoal = 0` (goal expires today), then `weeksTillGoal = 0` and division by zero causes `Infinity`  
**Fix**: Add check: `weeksTillGoal > 0 ? ... : null`

---

### 9. **Missing Water Intake Display on Dashboard**
**Severity**: MEDIUM  
**Location**: Dashboard  

**Issue**: 
- Dashboard has WaterTracker component
- But no data integration with goal's `daily_water_target`
- Users see water tracker but no target reference

**Fix**: Display `goal.daily_water_target` on dashboard similar to calorie/protein targets

---

### 10. **Null Coalescing Could Hide Errors**
**Severity**: MEDIUM  
**Location**: `frontend/app/page.tsx:138`  

**Code**:
```typescript
const calorieTarget = dashboard.calorie_target ?? 0;
```

**Issue**: 
- If `calorie_target` is `null` (no weight logged), uses 0
- GoalCard then shows "0 of 0 kcal target" instead of "no goal set"
- User doesn't realize they need to log weight

**Better approach**: Show clear message that weight needs to be logged

---

## 🔵 LOW PRIORITY ISSUES

### 11. **Gender Enum Not Enforced**
**Severity**: LOW  
**Location**: `app/schemas.py`  

**Current**:
```python
gender: str = Field(min_length=1)  # Accepts ANY string
```

**Should be**:
```python
class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

gender: Gender
```

**Impact**: Allows invalid values like "xyz" or "attack"

---

### 12. **No Default Water Target**
**Severity**: LOW  
**Location**: Goal creation  

**Issue**: 
- `daily_water_target` is optional with no default
- Some users won't have water targets set
- No fallback to recommended intake (e.g., 2-3L)

**Recommendation**: 
- Add default: 2500 ml/day
- Or calculate based on weight: `weight_kg * 33 ml`

---

## Summary Table

| Issue | File | Line | Type | Fix Time |
|-------|------|------|------|----------|
| Timezone inconsistency | models/*.py | 21, 25, 37 | CRITICAL | 10 min |
| Unrealistic goal logic | goals/page.tsx | 186 | CRITICAL | 5 min |
| Calorie calc hardcoded | fitness.py | 32 | CRITICAL | 15 min |
| Height validation | schemas.py | 12 | HIGH | 2 min |
| Date/DateTime mix | models/*.py | N/A | HIGH | 20 min |
| Calorie type mismatch | schemas.py | 85 | HIGH | 5 min |
| Goal update validation | goals.py | 115 | HIGH | 10 min |
| Division by zero | goals/page.tsx | 183 | MEDIUM | 2 min |
| Water target display | page.tsx | 268 | MEDIUM | 10 min |
| Null coalescing | page.tsx | 138 | MEDIUM | 5 min |
| Gender enum | schemas.py | 14 | LOW | 10 min |
| Water default | goals.py | 80 | LOW | 5 min |

**Total Fix Time**: ~99 minutes (1.5-2 hours)

---

## Recommendations

### Immediate (Must Fix)
1. ✅ Fix timezone inconsistency (affects data integrity)
2. ✅ Fix unrealistic goal logic (shows wrong warning)
3. ✅ Fix calorie target calculation (breaks weight gain goals)

### Before Production
4. ✅ Fix height validation (security)
5. ✅ Add goal update validation (prevents invalid state)
6. ✅ Fix division by zero (crash risk)

### Nice to Have
7. Water target display on dashboard
8. Gender enum validation
9. Default water targets

---

## Testing Recommendations

After fixes, test these scenarios:

1. **Weight Gain Goal**: Create goal to gain 15 kg in 6 months
   - ✓ Should show "+15.0 kg"
   - ✓ Should show "Required gain/week: +0.58 kg"
   - ✓ Should NOT show "aggressive goal" warning
   - ✓ Calorie target should have surplus (+500), not deficit (-500)

2. **Weight Loss Goal**: Create goal to lose 15 kg in 6 months
   - ✓ Should show "-15.0 kg"
   - ✓ Should show "Required loss/week: -0.58 kg"
   - ✓ Should show realistic pace message
   - ✓ Calorie target should have deficit (-500)

3. **Goal Expiring Today**: Create goal with target date = today
   - ✓ Should show 0 days remaining
   - ✓ Should NOT show "Infinity" kg/week
   - ✓ Should handle gracefully

4. **No Weight Logged**: User with no weights
   - ✓ Dashboard should show "Log weight to set targets"
   - ✓ Should NOT show "0 of 0 kcal target"

5. **Water Targets**: User with water goal set
   - ✓ Dashboard should display water target
   - ✓ Food log should display water target
   - ✓ Goals page should show water insights

---

**Report Generated**: 2026-04-29  
**Next Action**: Review and implement fixes in priority order
