import mysql.connector
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import atexit

app = FastAPI()

# ------------------ CORS Setup ------------------
origins = ["*"]  # allow all for testing; restrict later in production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ MySQL Connection ------------------
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="sanjay19**",
    database="cropdata"
)
cursor = conn.cursor()

# ------------------ Pydantic models ------------------
class YieldQuery(BaseModel):
    district: str
    season: str
    next_crop: str
    irrigation_availability: int
    soil_type: str

class FertilizerQuery(BaseModel):
    district: str
    season: str
    next_crop: str
    irrigation_availability: int
    soil_type: str

class FeedbackQuery(BaseModel):
    district: str
    season: str
    next_crop: str
    irrigation_availability: int
    soil_type: str
    up_down: int   # 1 = Yes (yield increased), 0 = No (yield not increased)

# ------------------ Endpoints ------------------

# Yield Prediction
@app.post("/users/{userid}/yield")
def return_yield(query: YieldQuery, userid: int):
    try:
        sql = """
        SELECT MIN(expected_yield_t_ha), MAX(expected_yield_t_ha), AVG(expected_yield_t_ha)
        FROM crops
        WHERE district=%s AND season=%s AND next_crop=%s
              AND irrigation_availability=%s AND soil_type=%s
        """
        cursor.execute(sql, (
            query.district, query.season, query.next_crop,
            int(query.irrigation_availability), query.soil_type
        ))

        min_yield, max_yield, avg_yield = cursor.fetchone()
        if min_yield is None:
            min_yield = max_yield = avg_yield = 0

        return {
            "user_id": userid,
            "min_yield": min_yield,
            "max_yield": max_yield,
            "avg_yield": avg_yield
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Fertilizer Recommendation
@app.post("/users/{userid}/fertilizer")
def return_fertilizer(query: FertilizerQuery, userid: int):
    try:
        sql = """
        SELECT N_dose, P2O5_dose, K2O_dose, S_dose, Zn_dose, B_dose, expected_yield_t_ha
        FROM crops
        WHERE district=%s AND season=%s AND next_crop=%s
              AND irrigation_availability=%s AND soil_type=%s
              AND expected_yield_t_ha = (
                  SELECT MAX(expected_yield_t_ha)
                  FROM crops
                  WHERE district=%s AND season=%s AND next_crop=%s
                        AND irrigation_availability=%s AND soil_type=%s
              )
        """
        params = (
            query.district, query.season, query.next_crop,
            int(query.irrigation_availability), query.soil_type,
            query.district, query.season, query.next_crop,
            int(query.irrigation_availability), query.soil_type
        )
        cursor.execute(sql, params)
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(status_code=404, detail="No data found for given filters.")

        avg_doses = [sum(col)/len(rows) for col in zip(*rows)]

        return {
            "user_id": userid,
            "average_recommended_doses": {
                "N_dose": round(avg_doses[0], 2),
                "P2O5_dose": round(avg_doses[1], 2),
                "K2O_dose": round(avg_doses[2], 2),
                "S_dose": round(avg_doses[3], 2),
                "Zn_dose": round(avg_doses[4], 2),
                "B_dose": round(avg_doses[5], 2),
                "expected_yield_t_ha": round(avg_doses[6], 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Feedback Submission
@app.post("/users/{userid}/feedback")
def submit_feedback(query: FeedbackQuery, userid: int):
    try:
        print("=== Feedback request received ===")
        print("Payload:", query.dict())

        # 1) Ensure up_down column exists
        cursor.execute("SHOW COLUMNS FROM crops LIKE 'up_down'")
        col = cursor.fetchone()
        print("up_down column present?:", bool(col))
        if col is None:
            print("Creating up_down column...")
            cursor.execute("ALTER TABLE crops ADD COLUMN up_down INT DEFAULT 1")
            conn.commit()
            print("up_down column created.")

        # 2) Find the maximum expected_yield_t_ha for the provided filters
        sql_max = """
        SELECT MAX(expected_yield_t_ha) AS max_yield
        FROM crops
        WHERE district=%s AND season=%s AND next_crop=%s
              AND irrigation_availability=%s AND soil_type=%s
        """
        params_max = (
            query.district, query.season, query.next_crop,
            query.irrigation_availability, query.soil_type
        )
        cursor.execute(sql_max, params_max)
        max_row = cursor.fetchone()
        print("MAX query result:", max_row)
        if not max_row or max_row[0] is None:
            raise HTTPException(status_code=404, detail="No matching rows found for given filters.")

        max_yield = max_row[0]

        # 3) Update row(s) with that max yield
        sql_update = """
        UPDATE crops
        SET up_down = %s
        WHERE district=%s AND season=%s AND next_crop=%s
              AND irrigation_availability=%s AND soil_type=%s
              AND expected_yield_t_ha = %s
        """
        params_update = (
            query.up_down,
            query.district, query.season, query.next_crop,
            query.irrigation_availability, query.soil_type,
            max_yield
        )
        cursor.execute(sql_update, params_update)
        conn.commit()
        updated_count = cursor.rowcount
        print(f"Rows updated: {updated_count}")

        if updated_count == 0:
            raise HTTPException(
                status_code=500,
                detail=f"Repeated Entry"
            )

        return {
            "message": "Feedback submitted successfully",
            "userid": userid,
            "filters": query.dict(),
            "max_expected_yield": max_yield,
            "rows_updated": updated_count,
            "up_down_set_to": query.up_down
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Exception in submit_feedback:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# Root check
@app.get("/")
def root():
    return {"message": "FastAPI server is running!"}

# ------------------ Close DB connection on shutdown ------------------
@atexit.register
def shutdown():
    cursor.close()
    conn.close()
