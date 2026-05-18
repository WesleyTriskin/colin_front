from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text, event
from sqlalchemy.pool import QueuePool
import uvicorn
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão com timeout agressivo para não travar quando a VPN cair
engine = create_engine(
    'postgresql+psycopg2://wesley.carnauba:%40Winover2024@172.21.0.119/warin',
    pool_size=3,
    max_overflow=0,
    pool_timeout=5,        # 5s para pegar conexão do pool
    pool_recycle=300,
    connect_args={
        "connect_timeout": 5,  # 5s para conectar
        "options": "-c statement_timeout=8000"  # 8s max por query
    }
)

@app.post("/api/update_status")
async def update_status(req: Request):
    data = await req.json()
    phone = data.get('phone')
    status = data.get('status')
    try:
        with engine.begin() as conn:
            result = conn.execute(text("SELECT notes FROM colin.farm_contacts WHERE phone_number = :phone LIMIT 1"), {"phone": phone}).first()
            if not result:
                return {"success": False, "error": "Phone not found"}
            current_notes = result[0] or ""
            current_notes = re.sub(r'\[STATUS:.*?\]\s*', '', current_notes).strip()
            new_notes = f"[STATUS:{status}] {current_notes}".strip()
            conn.execute(text("UPDATE colin.farm_contacts SET notes = :notes WHERE phone_number = :phone"), {"notes": new_notes, "phone": phone})
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/contacts")
def get_contacts(farm_key: str = Query(None)):
    try:
        with engine.connect() as conn:
            if farm_key:
                result = conn.execute(
                    text("SELECT phone_number, contact_name, report_type, notes FROM colin.farm_contacts WHERE farm_key = :fk ORDER BY contact_name"),
                    {"fk": farm_key}
                )
            else:
                result = conn.execute(
                    text("SELECT phone_number, contact_name, report_type, notes FROM colin.farm_contacts ORDER BY contact_name")
                )
            contacts = [{"phone_number": r[0], "contact_name": r[1], "report_type": r[2], "notes": r[3]} for r in result]
            return contacts
    except Exception as e:
        return {"error": str(e), "contacts": []}

# Mount static files
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)

