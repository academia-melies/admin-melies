import { Box } from "../atoms";
import Login from "../auth/login";
import { useAppContext } from "./AppContext";

export const ProtectRoute = ({ children }) => {
   const { isAuthenticated, loading } = useAppContext()

   // let isAuthenticated = true;
   // let loading = true;


   if (isAuthenticated) return children;
   if (loading) return <Loading />
   if (!isAuthenticated && !loading) return <Login />;
}

const Loading = () => <Box sx={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#fff', width: '100%', height: '100%' }} />