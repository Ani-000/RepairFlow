import { Link } from 'react-router-dom';
export default function NotFound() { return <div className="not-found"><div className="eyebrow">ERROR 404</div><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="primary-button" to="/login">Return to sign in</Link></div>; }
