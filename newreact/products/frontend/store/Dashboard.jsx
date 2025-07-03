import React from 'react';
import { Switch, Route, Link, useRouteMatch, useHistory } from 'react-router-dom';
import Todos from './todos/Todos';
import { getCurrentUser } from '../utils/auth.js';

export default function Dashboard() {
  const { path, url } = useRouteMatch();
  const history = useHistory();
  const user = getCurrentUser();

  if (!user) {
    // no token at all
    history.push('/login');
    return null;
  }

  const isAdmin = user.username === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>

      <nav>
        {isAdmin && (
          <Link className="routes" to={`${url}/todos`}>Todos</Link>
        )}
      </nav>

      <Switch>
        <Route exact path={path}>
          <p>Welcome {user.username}! {isAdmin ? 'You have admin access.' : 'You are a regular user.'}</p>
        </Route>

        {isAdmin && (
          <Route path={`${path}/todos`} component={Todos} />
        )}
      </Switch>
    </div>
  );
}
