import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import Hamburger from "hamburger-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { Box, Text } from "../../atoms"
import { Colors, icons } from "./Colors"
import { useAppContext } from "../../context/AppContext"
import { IconTheme } from "../iconTheme/IconTheme"

export const LeftMenu = ({ menuItems = [] }) => {

   const { logout, user, colorPalette, theme } = useAppContext();
   const name = user?.nome?.split(' ');
   const firstName = name[0];
   const lastName = name[name.length - 1];
   const userName = `${firstName} ${lastName}`;
   const router = useRouter();
   let fotoPerfil = user?.foto;
   const pathname = router.pathname === '/' ? null : router.asPath

   const [showUserOptions, setShowUserOptions] = useState(false)

   const [showMenuMobile, setShowMenuMobile] = useState(false)
   const [showChangePassword, setShowChangePassword] = useState(false)
   const [showMenuUser, setShowMenuUser] = useState(false)
   const [groupStates, setGroupStates] = useState(menuItems.map(() => false));

   const handleGroupClick = (index) => {
      const newGroupStates = [...groupStates];
      newGroupStates[index] = !newGroupStates[index];
      setGroupStates(newGroupStates);
   };

   return (
      <>
         <Box sx={{ ...styles.leftMenuMainContainer, backgroundColor: colorPalette.secondary,  transition: 'background-color 1s', ...(showMenuMobile && { display: 'flex' }) }}>
            <Box sx={{ position: 'fixed', height: '100%', width: { xs: '50%', sm: 200, md: 200, lg: 200 }, padding: { xs: '10px 0px', sm: '10px 15px', md: '10px 15px', lg: '10px 15px' } }}>

               <Box sx={styles.userBadgeContainer}>
                  <Box sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     gap: 1,
                     borderRadius: 1.5,
                     boxSizing: 'border-box',
                     padding: '8px 8px',
                     "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer',
                        backgroundColor: '#f0f0f0' + '22'
                     }
                  }} onClick={() => setShowUserOptions(!showUserOptions)}>
                     <Avatar sx={{ width: 27, height: 27, fontSize: 14 }} src={fotoPerfil || `/icons/perfil-default.jpg`} />
                     <Text style={{ color: colorPalette.textColor,  transition: 'background-color 1s', }}>{userName}</Text>
                     <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: !showUserOptions ? `url(${icons.gray_arrow_down})` : `url(${icons.gray_close})`,
                        width: 17,
                        height: 17,
                        "&:hover": {
                           opacity: 0.8,
                           cursor: 'pointer'
                        }
                     }} />
                  </Box>
                  <Box sx={{ width: '100%', height: `1px`, backgroundColor: '#e4e4e4', margin: `16px 0px`, }} />
                  {showUserOptions &&
                     <>
                        <Box sx={styles.containerUserOpitions}>
                           <Box onClick={() => {
                              setShowUserOptions(!showUserOptions)
                           }} sx={{ borderRadius: 1, padding: `4px 8px`, "&:hover": { backgroundColor: Colors.backgroundPrimary + '22', cursor: 'pointer' }, }}>
                              <Text style={{ ...styles.text, textAlign: 'center', }}>Alterar Senha</Text>
                           </Box>
                           <Box sx={{ borderRadius: 1, padding: `4px 8px`, "&:hover": { backgroundColor: Colors.backgroundPrimary + '22', cursor: 'pointer' } }}
                              onClick={logout}>
                              <Text style={{ ...styles.text, textAlign: 'center' }}>Sair</Text>
                           </Box>
                        </Box>
                     </>
                  }
               </Box>

               <Box sx={styles.boxMenu}>
                  {menuItems.map((group, index) =>
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, color: '#f0f0f0' + '77', }}>
                        {/* {index !== 0 && <Box sx={{ width: '100%', height: `1px`, backgroundColor: '#e4e4e4', margin: `16px 0px`, }} />} */}
                        <Box sx={{
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'space-between',
                           gap: 0.5,
                           padding: `5px 5px`,
                           width: '100%',
                           borderRadius: 2,
                           opacity: 0.8,
                           "&:hover": {
                              opacity: 0.8,
                              cursor: 'pointer',
                              backgroundColor: '#f0f0f0' + '22'
                           }
                        }} onClick={() => handleGroupClick(index)}>
                           <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
                              <Box sx={{ ...styles.icon, backgroundImage: `url(/icons/${group?.icon_dark})`, width: 18, height: 18, filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)', transition: 'background-color 1s'}} />
                              <Text style={{ color: colorPalette.textColor,  transition: 'background-color 1s', }}>
                                 {group.text}
                              </Text>
                           </Box>
                           <Box sx={{
                              ...styles.menuIcon,
                              backgroundImage: `url(${icons.gray_arrow_down})`,
                              transform: groupStates[index] ? 'rotate(0deg)' : 'rotate(-90deg)',
                              transition: '.3s',
                              width: 17,
                              height: 17,
                              "&:hover": {
                                 opacity: 0.8,
                                 cursor: 'pointer'
                              }
                           }} />
                        </Box>
                        {groupStates[index] && (
                           group.items.map((item, index) => {
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
                           ))}
                     </Box>
                  )}
               </Box>
               <Box sx={{
                  ...styles.icon,
                  backgroundImage: `url('/favicon.svg')`,
                  backgroundSize: 'contain',
                  width: 140,
                  height: 40,
                  bottom: 60,
                  position: 'absolute',
                  "&:hover": {
                     cursor: 'pointer', opacity: 0.8
                  }
               }} onClick={() => router.push('/')} />
            </Box>
         </Box >

         <Box sx={styles.menuResponsive}>
            <Box sx={{
               ...styles.menuIcon,
               backgroundImage: `url('/icons/notification_icon.png')`,
               width: 20,
               height: 17,
               "&:hover": {
                  opacity: 0.8,
                  cursor: 'pointer'
               }
            }} />

            <Box sx={{
               ...styles.icon,
               backgroundImage: `url('/favicon.png')`,
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               width: 1,
               height: 35,
               display: 'flex',
               flex: 1,
               "&:hover": {
                  cursor: 'pointer', opacity: 0.8
               }
            }} onClick={() => router.push('/')} />
            <Box>
               <Hamburger
                  toggled={showMenuMobile}
                  toggle={setShowMenuMobile}
                  duration={0.5}
                  size={20}
               />
            </Box>
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

   const {colorPalette } = useAppContext()

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
               padding: `8px 30px`,
               width: '100%',
               borderRadius: 2,
               color: 'inherit',
               transition: '.2s',
               ...(currentPage ?
                  {
                     // border: `1px solid ${Colors.orange}`,
                     backgroundColor: Colors.orange,
                     color: Colors.textPrimary,
                  }
                  :
                  {
                     "&:hover": {
                        backgroundColor: Colors.orange + '22',


                     }
                  }),
            }}>
               <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit' }}>
                  {/* <Box sx={{ ...styles.icon, backgroundImage: `url(/icons/${icon})`, width: 18, height: 18, filter: 'brightness(0) invert(1)', }} /> */}
                  <Text small style={{ color: colorPalette.textColor,  transition: 'background-color 1s', }}>
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
      alignItems: 'center',
      display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex' },
      flexDirection: 'column',
      minHeight: '100vh',
      // backgroundColor: '#f9f9f9',
      borderRight: `1px solid #00000010`,
      padding: `40px 5px 40px 5px`,
      gap: 1,
      zIndex: 999999999,
      position: { xs: 'fixed', sm: 'absolute', md: 'relative', lg: 'relative' },
      width: { xs: '60%', sm: 200, md: 200, lg: 200 },
   },
   boxMenu: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      marginTop: 5,
      overflowY: 'auto',
      overflowStyle: 'marquee,panner',
      maxHeight: '58%',
      scrollbarWidth: 'thin',
      scrollbarColor: 'gray lightgray',
      '&::-webkit-scrollbar': {
         width: '5px',

      },
      '&::-webkit-scrollbar-thumb': {
         backgroundColor: 'gray',
         borderRadius: '5px'
      },
      '&::-webkit-scrollbar-thumb:hover': {
         backgroundColor: 'darkgray',

      },
      '&::-webkit-scrollbar-track': {
         backgroundColor: Colors.backgroundSecundary,

      },
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
      borderBottom: `2px solid #00000010`,
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
   menuIcon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,

   },
   containerUserOpitions: {
      backgroundColor: Colors.background,
      boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
      borderRadius: 2,
      padding: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      top: 48,
      width: '100%',
      boxSizing: 'border-box',
      zIndex: 9999999

   },
   userBadgeContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 130,
      gap: 1,
      position: 'relative',
      borderRadius: 1.5,
      zIndex: 9999999,
      marginTop: 5
   },
   menuIcon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,

   },
}