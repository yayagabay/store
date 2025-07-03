import React, { useEffect, useState } from 'react';
import { Route, Switch, Link, useHistory, useRouteMatch } from 'react-router-dom';
import Products from './products/Products';
import AllProducts from './products/AllProducts';
import Todos from './todos/Todos';
import Chat from './Chat';
import { jwtDecode } from 'jwt-decode';
import PaymentPage from './PaymentPage';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping, faCartShopping, faGlobe, faList, faMessage, faShop } from "@fortawesome/free-solid-svg-icons";
import CartPage from './CartPage';
import { CartProvider } from '../context/CartContext.jsx';

export default function Dashboard() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        history.push('/login');
        return;
      }

      const decoded = jwtDecode(token);
      if (!decoded || !decoded.username) {
        throw new Error('Invalid token');
      }

      setUsername(decoded.username);
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Invalid or expired token. Please log in again.');
      localStorage.removeItem('token');
      history.push('/login');
    }
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && (
        <>
          <p>Welcome, <span style={{fontWeight:'bold'}}>{username}!</span></p>
          <button className='logout' onClick={handleLogout}>Logout</button>

          <nav className='navFont' style={{ margin: '1rem 0' }}>
            <Link className='icon' to={`${url}/products`} style={{ marginRight: '1rem' }}>
            <FontAwesomeIcon icon={faBagShopping} />
            </Link>
            <Link className='icon' to={`${url}/all-products`} style={{ marginRight: '1rem' }}>
            <FontAwesomeIcon icon={faGlobe} />
            </Link>
            <Link className='icon' to={`${url}/chat`} style={{ marginRight: '1rem' }}>
            <FontAwesomeIcon icon={faMessage} />
            </Link>
            <Link className='icon' to={`${url}/cart`}>
            <FontAwesomeIcon icon={faShop} /> 
            </Link> | 
            <Link className='icon' to={`${url}/payment`}>
            <FontAwesomeIcon icon={faCartShopping} /> 
            </Link>
            <br/>   
            {username === 'admin' && (
              <Link className='icon' to={`${url}/todos`} style={{ marginRight: '1rem' }}> 
            <FontAwesomeIcon icon={faList} />
              </Link>
            )}
            
          </nav>

          <Switch>
            <Route path={`${path}/products`} component={Products} />
            <Route path={`${path}/all-products`} component={AllProducts} />
            <Route path={`${path}/chat`} component={Chat} />
            <Route path={`${path}/payment`} component={PaymentPage} />
            <Route path={`${path}/cart`} component={CartPage} />
            {username === 'admin' && (
              <Route path={`${path}/todos`} component={Todos} />
            )}
          </Switch>
        </>
      )}
    </div>
  );
}
