from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão com a base de dados de produção
engine = create_engine(
    'postgresql+psycopg2://wesley.carnauba:%40Winover2024@172.21.0.119/warin',
    pool_size=5,
    max_overflow=10,
    pool_timeout=10,
    pool_recycle=300,
    connect_args={
        "connect_timeout": 5,
        "options": "-c statement_timeout=10000"
    }
)

@app.get("/farms/overview")
def get_farms_overview():
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT farm_key, display_name, link2go_wallet_id, phone_number, status, latitude, longitude, responsible_name, responsible_phone, machine_brand FROM colin.farms ORDER BY farm_key")
            )
            farms = [
                {
                    "farm_key": r[0],
                    "display_name": r[1],
                    "wallet_id": r[2],
                    "phone_number": r[3],
                    "status": r[4] or "ok",
                    "latitude": float(r[5]) if r[5] is not None else None,
                    "longitude": float(r[6]) if r[6] is not None else None,
                    "responsible_name": r[7],
                    "responsible_phone": r[8],
                    "machine_brand": r[9]
                }
                for r in result
            ]
            return {"farms": farms}
    except Exception as e:
        return {"error": str(e), "farms": []}

@app.post("/farms")
def save_farm(farm: dict):
    try:
        fk = farm.get("farm_key")
        name = farm.get("display_name")
        phone = farm.get("phone_number")
        wallet = farm.get("wallet_id")
        lat = farm.get("latitude")
        lon = farm.get("longitude")
        resp_name = farm.get("responsible_name")
        resp_phone = farm.get("responsible_phone")
        brand = farm.get("machine_brand")
        status = farm.get("status", "ok")
        
        if lat is None or lat == "":
            lat = 0.0
        if lon is None or lon == "":
            lon = 0.0

        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO colin.farms (
                        farm_key, display_name, source_db_name, source_schema, 
                        phone_number, link2go_wallet_id, latitude, longitude, 
                        responsible_name, responsible_phone, machine_brand, status, enabled
                    )
                    VALUES (
                        :fk, :name, 'agro_staging', :fk, 
                        :phone, :wallet, :lat, :lon, 
                        :resp_name, :resp_phone, :brand, :status, true
                    )
                    ON CONFLICT (farm_key) DO UPDATE SET
                        display_name = EXCLUDED.display_name,
                        phone_number = EXCLUDED.phone_number,
                        link2go_wallet_id = EXCLUDED.link2go_wallet_id,
                        latitude = EXCLUDED.latitude,
                        longitude = EXCLUDED.longitude,
                        responsible_name = EXCLUDED.responsible_name,
                        responsible_phone = EXCLUDED.responsible_phone,
                        machine_brand = EXCLUDED.machine_brand,
                        status = EXCLUDED.status,
                        updated_at = NOW()
                """),
                {
                    "fk": fk, "name": name, "phone": phone, "wallet": wallet,
                    "lat": float(lat), "lon": float(lon), "resp_name": resp_name,
                    "resp_phone": resp_phone, "brand": brand, "status": status
                }
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/farms/status")
def set_farm_status(payload: dict):
    try:
        fk = payload.get("farm_key")
        status = payload.get("status")
        with engine.begin() as conn:
            conn.execute(
                text("UPDATE colin.farms SET status = :status WHERE farm_key = :fk"),
                {"status": status, "fk": fk}
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.delete("/farms")
def delete_farm(payload: dict):
    try:
        fk = payload.get("farm_key")
        with engine.begin() as conn:
            conn.execute(
                text("DELETE FROM colin.farms WHERE farm_key = :fk"),
                {"fk": fk}
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Contacts Endpoints
@app.get("/farms/contacts")
def get_contacts():
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT phone_number, contact_name, report_type, notes, farm_key FROM colin.farm_contacts ORDER BY contact_name")
            )
            contacts = [
                {
                    "phone_number": r[0],
                    "contact_name": r[1],
                    "report_type": r[2],
                    "notes": r[3],
                    "farm_key": r[4]
                }
                for r in result
            ]
            return {"contacts": contacts}
    except Exception as e:
        return {"error": str(e), "contacts": []}

@app.post("/farms/contacts")
def save_contact(contact: dict):
    try:
        phone = contact.get("phone_number")
        name = contact.get("contact_name")
        rep = contact.get("report_type")
        notes = contact.get("notes")
        fk = contact.get("farm_key")
        with engine.begin() as conn:
            result = conn.execute(
                text("SELECT id FROM colin.farm_contacts WHERE phone_number = :phone AND farm_key = :fk AND report_type = :rep"),
                {"phone": phone, "fk": fk, "rep": rep}
            ).fetchone()
            if result:
                conn.execute(
                    text("UPDATE colin.farm_contacts SET contact_name = :name, notes = :notes, updated_at = NOW() WHERE id = :id"),
                    {"name": name, "notes": notes, "id": result[0]}
                )
            else:
                conn.execute(
                    text("INSERT INTO colin.farm_contacts (farm_key, report_type, phone_number, contact_name, notes, is_default_all_reports, active) VALUES (:fk, :rep, :phone, :name, :notes, false, true)"),
                    {"fk": fk, "rep": rep, "phone": phone, "name": name, "notes": notes}
                )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.put("/farms/contacts")
def update_contact(contact: dict):
    return save_contact(contact)

@app.delete("/farms/contacts")
def delete_contact(payload: dict):
    try:
        fk = payload.get("farm_key")
        phone = payload.get("phone_number")
        with engine.begin() as conn:
            conn.execute(
                text("DELETE FROM colin.farm_contacts WHERE phone_number = :phone AND farm_key = :fk"),
                {"phone": phone, "fk": fk}
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Mount static files
current_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
