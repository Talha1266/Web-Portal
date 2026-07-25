import re

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\UserDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Fix grid-auto-fit
code = code.replace("gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'", "gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'")

# Add .table-wrapper around all tables
code = re.sub(r'(<table[^>]*>.*?</table>)', r'<div className="table-wrapper">\n\1\n</div>', code, flags=re.DOTALL)

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\UserDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated Tables in UserDashboard')
