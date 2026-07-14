import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHttp } from '../../http/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authHttp.login(username, password);
      localStorage.setItem('accessToken', res.data.accessToken);
      navigate('/dashboard/brands');
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    }
  };

  return (
    <main className="d-flex w-100">
      <div className="container d-flex flex-column">
        <div className="row vh-100">
          <div className="col-sm-10 col-md-8 col-lg-6 col-xl-5 mx-auto d-table h-100">
            <div className="d-table-cell align-middle">
              <div className="text-center mt-4">
                <h1 className="h2">Авторизация</h1>
              </div>
              <div className="card">
                <div className="card-body">
                  <div className="m-sm-3">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="input-login">Логин</label>
                        <input
                          className="form-control form-control-lg"
                          id="input-login"
                          placeholder=""
                          autoComplete="off"
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="input-password">Пароль</label>
                        <input
                          className="form-control form-control-lg"
                          id="input-password"
                          placeholder=""
                          autoComplete="off"
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="d-grid gap-2 mt-3">
                        <button className="btn btn-lg btn-primary" type="submit">Вход</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
