import { Box } from '../atoms'
import { AppProvider, useAppContext } from '../context/AppContext'
import { ProtectRoute } from '../context/ProtectRoute'
import { Colors, LeftMenu, UserHeader } from '../organisms'
import { menuItems } from '../permissions'
import '../styles/globals.css'
import 'react-credit-cards/es/styles-compiled.css';
import PagesRoute from './pagesRoute'


function App({ Component, pageProps }) {

   return (
      <AppProvider>
         <PagesRoute Component={Component} pageProps={pageProps} />
      </AppProvider>
   )
}

export default App;

const styles = {
   bodyContainer: {
      display: "flex",
      minHeight: "100vh",
      flexDirection: "row",
      width: '100%',
   },
   contentContainer: {
      display: "flex",
      width: '100%',
      flexDirection: 'column',
      flex: 1,
      gap: `35px`,
      // backgroundColor: Colors.background,
      // padding: { xs: `30px`, xm: `25px`, md: `120px 50px`, lg: `120px 50px` },
      paddingBottom: `60px`,
      overflowY: 'hidden',
      marginTop: { xs: `60px`, xm: `0px`, md: `0px`, lg: `0px` }
   },
}