import re

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Import Menu
code = code.replace("Crown, CloudUpload } from 'lucide-react';", "Crown, CloudUpload, Menu } from 'lucide-react';")

# 2. Add isMobileMenuOpen state
code = code.replace("  const navigate = useNavigate();", "  const navigate = useNavigate();\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);")

# 3. Add handleNav to close menu
nav_func = '''
  const handleNav = (action) => {
    setIsMobileMenuOpen(false);
    action();
  };
'''
code = code.replace("const handleLogout = async () => {", nav_func.strip() + "\\n\\n  const handleLogout = async () => {")

# 4. App Layout Wrapper
code = code.replace('<div style={{ display: \'flex\', height: \'100vh\', width: \'100%\', overflow: \'hidden\' }}>', '<div className="app-layout">')

# 5. Sidebar
aside_pattern = r'<aside className="glass-panel" style={{ width: \'280px\', height: \'100vh\', overflowY: \'auto\', borderRadius: \'0\', borderLeft: \'none\', borderTop: \'none\', borderBottom: \'none\', padding: \'2rem 1.5rem\', display: \'flex\', flexDirection: \'column\' }}>'
aside_repl = '<aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>\n        <button onClick={() => setIsMobileMenuOpen(false)} style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", color: "var(--text-secondary)" }} className="hide-on-desktop"><X size={20}/></button>'
code = code.replace(aside_pattern, aside_repl)

# 6. Update Sidebar Links to use handleNav
code = code.replace("onClick={() => setActiveTab('overview')}", "onClick={() => handleNav(() => setActiveTab('overview'))}")
code = code.replace("onClick={() => setActiveTab('users')}", "onClick={() => handleNav(() => setActiveTab('users'))}")
code = code.replace("onClick={() => setActiveTab('settings')}", "onClick={() => handleNav(() => setActiveTab('settings'))}")
code = code.replace("onClick={handleLogout}", "onClick={() => handleNav(handleLogout)}")

# 7. Main Content & Mobile Header
main_pattern = r'<main style={{ flex: 1, padding: \'3rem\', height: \'100vh\', overflowY: \'auto\' }}>'
main_repl = '''
      <div className={`sidebar-overlay ${isMobileMenuOpen ? "open" : ""}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <main className="main-content">
        <div className="mobile-header">
          <h2 className="heading-3 text-gradient" style={{ margin: 0 }}>ConstManage Admin</h2>
          <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
        </div>
'''
code = code.replace(main_pattern, main_repl.strip())

# 8. Tables wrapper
code = re.sub(r'(<table[^>]*>.*?</table>)', r'<div className="table-wrapper">\n\1\n</div>', code, flags=re.DOTALL)

with open('C:\\Users\\Talha\\OneDrive\\Desktop\\Web App\\src\\pages\\AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated AdminDashboard')
