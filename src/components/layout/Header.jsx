function Header({ session, isAuthenticated, onLogout, themePreference, onThemeChange }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href="#/">
          BlogApp
        </a>

        <nav className="nav">
          <a className="navlink" href="#/">
            Home
          </a>
          <a className="navlink" href="#/admin/posts">
            Admin
          </a>

          <label className="themePicker">
            <span className="themeLabel">Theme</span>
            <select
              className="themeSelect"
              value={themePreference}
              onChange={(event) => onThemeChange(event.target.value)}
              aria-label="Select theme"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          {isAuthenticated ? (
            <button className="btn" type="button" onClick={onLogout}>
              Logout ({session?.username || 'admin'})
            </button>
          ) : (
            <a className="btn" href="#/admin/login">
              Login
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
