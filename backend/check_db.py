import sqlite3, json
conn = sqlite3.connect('founder_ai.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Tables:', [r[0] for r in cur.fetchall()])
cur.execute("SELECT id, idea, status, finance IS NOT NULL as has_finance, website IS NOT NULL as has_website, pitch_deck IS NOT NULL as has_pitch, branding IS NOT NULL as has_branding FROM startups ORDER BY created_at DESC LIMIT 5")
rows = cur.fetchall()
for r in rows:
    print(dict(r))
conn.close()
