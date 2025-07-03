import React from "react";
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';

import Products from "./components/products/Products";
import Todos from "./components/todos/Todos";
import NotFound from "./components/NotFound";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
import alpacaimg from "./assets/alpaca.png";
import Register from "./components/Register";
import Chat from "./components/Chat";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentPage from "./components/PaymentPage.jsx";
import { CartProvider } from './context/CartContext.jsx';

// ✅ Font Awesome Imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faGauge } from "@fortawesome/free-solid-svg-icons";
import { faKey } from "@fortawesome/free-solid-svg-icons";
import { faCashRegister } from "@fortawesome/free-solid-svg-icons";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Home = () => (
  <div>
    <h2>Welcome to Yair's Store</h2>
    <p>Explore our products using the navigation bar above.</p>
  </div>
);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <CartProvider>
          <div className="app">
              <img
              src={alpacaimg}
              alt="alpaca"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                objectFit: "cover",
                marginBottom: "10px",
                border: '5px dashed black'
              }}
            />


            <nav>
              <Link className="routes" to="/">
                <FontAwesomeIcon icon={faHouse} />
              </Link>{" "}
              |
              <Link className="routes" to="/dashboard">
                <FontAwesomeIcon icon={faGauge} />
              </Link>{" "}
              |
              <Link className="routes" to="/login">
                <FontAwesomeIcon icon={faKey} />
              </Link>{" "}
              |
              <Link className="routes" to="/register">
                <FontAwesomeIcon icon={faCashRegister} />
              </Link>
            </nav>

            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <PrivateRoute path="/dashboard" component={Dashboard} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </CartProvider>
      </BrowserRouter>
    </Elements>
  );
}

export default App;
