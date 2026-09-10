cd /workspaces/sauces-samourai---Top-Flop/smw-tops-flops

python3 - <<'PY'
from pathlib import Path
import re

# 1. Préremplir le nom d'utilisateur Admin
admin_file = Path("app/admin/page.tsx")
admin_code = admin_file.read_text(encoding="utf-8")

admin_code, admin_changes = re.subn(
    r'(\[\s*u\s*,\s*setU\s*\]\s*=\s*useState)\(\s*["\'][^"\']*["\']\s*\)',
    r'\1("samourai")',
    admin_code,
    count=1,
)

admin_file.write_text(admin_code, encoding="utf-8")

# 2. Afficher le bouton Supprimer pour tous les matchs
page_file = Path("app/page.tsx")
page_code = page_file.read_text(encoding="utf-8")

old_button = '''{m.status==="scheduled"&&<button className="btn danger" onClick={()=>removeScheduled(m.id,m.label)}>Supprimer</button>}'''
new_button = '''<button className="btn danger" onClick={()=>removeScheduled(m.id,m.label)}>Supprimer</button>'''

if old_button in page_code:
    page_code = page_code.replace(old_button, new_button)
    delete_changes = 1
else:
    page_code, delete_changes = re.subn(
        r'\{m\.status\s*===\s*["\']scheduled["\']\s*&&\s*(<button[^>]*onClick=\{\(\)=>removeScheduled\(m\.id,m\.label\)\}[^>]*>Supprimer</button>)\}',
        r'\1',
        page_code,
        count=1,
    )

page_file.write_text(page_code, encoding="utf-8")

# 3. Corriger définitivement le nom du cookie Admin
for file_name in [
    "lib/auth.ts",
    "app/api/admin/login/route.ts",
    "app/api/admin/logout/route.ts",
]:
    file_path = Path(file_name)

    if file_path.exists():
        content = file_path.read_text(encoding="utf-8")
        content = content.replace(
            "Sauces Samourai_admin",
            "sauces_samourai_admin",
        )
        file_path.write_text(content, encoding="utf-8")

print("Username Admin modifie :", admin_changes)
print("Bouton Supprimer modifie :", delete_changes)
print("Correction terminee.")
PY