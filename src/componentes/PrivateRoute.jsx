import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // o un spinner
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}