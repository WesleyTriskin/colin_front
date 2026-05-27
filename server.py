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

@app.get("/api/contacts")
def get_contacts(farm_key: str = Query(None)):
    try:
        with engine.connect() as conn:
            if farm_key:
                result = conn.execute(
                    text("SELECT phone_number, contact_name, report_type, notes, photo_url FROM colin.farm_contacts WHERE farm_key = :fk ORDER BY contact_name"),
                    {"fk": farm_key}
                )
            else:
                result = conn.execute(
                    text("SELECT phone_number, contact_name, report_type, notes, photo_url FROM colin.farm_contacts ORDER BY contact_name")
                )
            contacts = [{"phone_number": r[0], "contact_name": r[1], "report_type": r[2], "notes": r[3], "photo_url": r[4] if len(r) > 4 else None} for r in result]
            return contacts
    except Exception as e:
        return {"error": str(e), "contacts": []}

# Mount static files
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)

