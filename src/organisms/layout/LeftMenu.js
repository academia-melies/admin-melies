import { useMediaQuery, useTheme } from "@mui/material"
import Hamburger from "hamburger-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { Box, Text } from "../../atoms"
import { Colors } from "./Colors"

export const LeftMenu = ({ menuItems = [] }) => {

   const router = useRouter()

   let userName = 'Marcus Silva'
   const pathname = router.pathname === '/' ? null : router.asPath

   const [showMenuMobile, setShowMenuMobile] = useState(false)
   const [showChangePassword, setShowChangePassword] = useState(false)
   const [showMenuUser, setShowMenuUser] = useState(false)

   const theme = useTheme()
   const navBar = useMediaQuery(theme.breakpoints.down('md'))

   return (
      <>
         <Box sx={{ ...styles.leftMenuMainContainer, ...(showMenuMobile && { display: 'flex' }) }}>
            <Box sx={{position: 'fixed', height: '100%', width: '160px', }}>
               <Box sx={{
                  ...styles.icon,
                  backgroundImage: `url('/favicon.svg')`,
                  backgroundSize: 'contain',
                  width: 140,
                  height: 40,
                  marginTop: 1,
                  "&:hover": {
                     cursor: 'pointer', opacity: 0.8
                  }
               }} onClick={() => router.push('/')} />

               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 7 }}>
                  {menuItems.map((group, index) =>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, color: '#f0f0f0' + '77' }}>
                        {index !== 0 && <Box sx={{ width: '100%', height: `1px`, backgroundColor: '#e4e4e4', margin: `16px 0px`, }} />}
                        <Text small='true' style={{ paddingLeft: '16px', color: '#fff' + 'aa' }}>
                           {group.text}
                        </Text>
                        {group.items.map((item, index) => {
                           return (
                              <MenuItem
                                 currentPage={item.to === pathname}
                                 key={`${index}_${item.to}`}
                                 to={item.to}
                                 text={item.text}
                                 icon={item.icon}
                                 onClick={() => setShowMenuMobile(false)}
                              />)
                        }
                        )}
                     </Box>
                  )}
               </Box>
            </Box>
         </Box >
         <Box sx={styles.menuResponsive}>
            <Box sx={{
               ...styles.icon,
               backgroundImage: `url('/favicon.svg')`,
               backgroundSize: 'contain',
               backgroundPosition: 'left',
               width: 1,
               height: 20,
               marginTop: 1,
               display: 'flex',
               flex: 1,
               "&:hover": {
                  cursor: 'pointer', opacity: 0.8
               }
            }} onClick={() => router.push('/')} />
            <Hamburger
               toggled={showMenuMobile}
               toggle={setShowMenuMobile}
               duration={0.3}
            />
         </Box>
         {
            showChangePassword && <BoxData
               onClick={(value) => setShowChangePassword(value)}
               value={showChangePassword} />
         }
      </>
   )
}

const MenuItem = (props) => {

   const {
      to,
      text,
      icon,
      currentPage,
      onClick,
   } = props

   return (
      <>
         <Link
            href={to}
            onClick={onClick}
            style={{ width: '100%' }}
         >
            <Box sx={{
               display: 'flex',
               padding: `8px 16px`,
               width: '100%',
               borderRadius: 2,
               color: Colors.textPrimary,
               ...(currentPage ?
                  { backgroundColor: Colors.orange }
                  :
                  {
                     "&:hover": {
                        backgroundColor: Colors.orange + '22',
                     }
                  }),
            }}>
               <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit' }}>
                  <Box sx={{ ...styles.icon, backgroundImage: `url(/icons/${icon})`, width: 18, height: 18, filter: 'brightness(0) invert(1)', }} />
                  <Text style={{ color: 'inherit' }}>
                     {text}
                  </Text>
               </Box>
            </Box>
         </Link>
      </>
   )
}

const styles = {
   leftMenuMainContainer: {
      position: 'relative',
      display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex' },
      flexDirection: 'column',
      minHeight: '100vh',
      // backgroundColor: '#f9f9f9',
      backgroundColor: Colors.backgroundSecundary,
      borderRight: `1px solid #00000010`,
      padding: `40px 20px`,
      gap: 6,
      zIndex: 999999999,
      position: { xs: 'absolute', sm: 'absolute', md: 'relative', lg: 'relative' },
      width: { xs: '50%', sm: 200, md: 200, lg: 200 },
   },
   userBox: {
      backgroundColor: '#00000017',
      position: 'fixed',
      bottom: 0,
      padding: `10px 20px`,
      borderRadius: '10px 10px 0px 0px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      gap: 1,
      width: 150
   },
   userButtonContainer: {
      borderRadius: '5px',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: `5px 0px`,
      "&:hover": {
         backgroundColor: '#ddd',
         cursor: 'pointer'
      }
   },
   icon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      width: '15px',
      height: '15px',
      marginRight: '0px',
      backgroundImage: `url('/favicon.svg')`,
   },
   menuResponsive: {
      position: 'fixed',
      maxHeight: '40px',
      width: '100%',
      backgroundColor: '#f9f9f9',
      borderRight: `1px solid #00000010`,
      padding: `30px`,
      alignItems: 'center',
      justifyContent: 'right',
      display: 'flex',
      zIndex: 99999999,
      display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none' },
   },
   menuMobileContainer: {
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      borderRight: `1px solid #00000010`,
      padding: `40px 20px`,
      gap: 4,
      zIndex: 99999999,
   },
}