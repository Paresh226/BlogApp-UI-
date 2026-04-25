import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { navigate } from '../lib/hashRoute.js'
import { loginAdmin, selectAuthError, selectAuthLoading } from '../store/authSlice.js'

function AdminLoginPage() {
  const dispatch = useDispatch()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [showPassword, setShowPassword] = useState(false)
  const error = useSelector(selectAuthError)
  const busy = useSelector(selectAuthLoading)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const result = await dispatch(loginAdmin({ username, password }))

    if (loginAdmin.fulfilled.match(result)) {
      navigate('/admin/posts')
    }
  }

  return (
    <div className="authWrap">
      <section className="authCard">
        <div className="authHeader">
          <h1 className="authTitle">Admin login</h1>
          <p className="muted">
            Uses API endpoint <code>/api/admin/login</code>
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Username</span>
            <input
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <div className="inputGroup">
              <input
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
              <button
                className="btn inputButton"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error ? <div className="error">{error}</div> : null}

          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
            <a className="btn" href="#/">
              Cancel
            </a>
          </div>
        </form>

        <div className="hint">
          Tip for learning: the login request is handled by Redux, and axios sends it to the API.
        </div>
      </section>
    </div>
  )
}

export default AdminLoginPage
