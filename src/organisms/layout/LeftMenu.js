import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import Hamburger from "hamburger-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../atoms"
import { Colors, icons } from "./Colors"
import { useAppContext } from "../../context/AppContext"
import { IconTheme } from "../iconTheme/IconTheme"
import { getImageByScreen } from "../../validators/api-requests"
import { DialogUserEdit } from "../userEdit/dialogEditUser"
import { api } from "../../api/api"

export const LeftMenu = ({ }) => {

   const { logout, user, colorPalette, theme, userPermissions } = useAppContext();
   const name = user?.nome?.split(' ');
   const firstName = name[0];
   const lastName = name[name.length - 1];
   const userName = `${firstName} ${lastName}`;
   let fotoPerfil = user?.getPhoto?.location || '';
   const router = useRouter();
   const pathname = router.pathname === '/' ? null : router.asPath
   const [showUserOptions, setShowUserOptions] = useState(false)
   const [imagesList, setImagesList] = useState('')
   const [showMenuMobile, setShowMenuMobile] = useState(false)
   const [showChangePassword, setShowChangePassword] = useState(false)
   const [showDialogEditUser, setShowDialogEditUser] = useState(false)

   const [menuItems, setMenuItems] = useState([]);

   useEffect(() => {
      const handleMenuItems = async () => {
         try {
            const response = await api.get(`/menuItems`)
            const { data } = response
            if (response.status === 200) {
               setMenuItems(data)
            }
         } catch (error) {
            console.log(error)
            return error
         }
      }
      handleMenuItems()
   }, [])


   const [groupStates, setGroupStates] = useState(menuItems.map(() => false));
   const handleImages = async () => {
      try {
         const response = await getImageByScreen('Menu Lateral')
         if (response.status === 200) {
            const { data } = response
            const [urlImage] = data.map((item) => item.location)
            setImagesList(urlImage)
         }
      } catch (error) {
         return error
      }
   }


   useEffect(() => {
      handleImages()
   }, [])

   const handleGroupClick = (index) => {
      const newGroupStates = [...groupStates];
      newGroupStates[index] = !newGroupStates[index];
      setGroupStates(newGroupStates);
   };

   const handleGroupMouseEnter = (index) => {
      setGroupStates((prevGroupStates) => {
         if (!prevGroupStates[index]) {
            const newGroupStates = [...prevGroupStates];
            newGroupStates[index] = true;
            return newGroupStates;
         }
         return prevGroupStates;
      });
   };

   // const handleGroupMouseLeave = (index) => {
   //    const newGroupStates = [...groupStates];
   //    newGroupStates[index] = false;
   //    setGroupStates(newGroupStates);
   // };

   const handleGroupMouseLeave = (index) => {
      setGroupStates((prevGroupStates) => {
         if (prevGroupStates[index]) {
            const newGroupStates = [...prevGroupStates];
            newGroupStates[index] = false;
            return newGroupStates;
         }
         return prevGroupStates;
      });
   };

   return (
      <>
         <Box sx={{
            ...styles.leftMenuMainContainer, backgroundColor: colorPalette.secondary, transition: 'background-color 1s', ...(showMenuMobile && { display: 'flex' }),
            width: { xs: '214px', sm: '214px', md: '180px', lg: '214px' },
         }}>
            <Box sx={{ position: 'fixed', height: '100%', width: { xs: '214px', sm: '214px', md: '180px', lg: '214px' }, padding: { xs: '10px 15px', sm: '10px 15px', md: '8px 10px', lg: '10px 15px' } }}>
               <Box sx={{
                  // backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  width: '100%',
                  height: { md: '180px', lg: '205px' },
                  position: 'absolute',
                  backgroundColor: colorPalette.secondary,
                  top: -40,
                  left: 0,
                  backgroundImage: `url(${imagesList})`,
                  borderRadius: '0px 0px 16px 16px'
               }} />
               <Box sx={{ ...styles.userBadgeContainer }}>
                  <Box sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     gap: 1,
                     borderRadius: 1.5,
                     boxSizing: 'border-box',
                     flexDirection: 'column',
                     padding: { md: '0px', lg: '8px 8px' },

                  }}>
                     <Avatar
                        sx={{ width: '65px', height: '65px', fontSize: 14, border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                        src={fotoPerfil || `https://mf-planejados.s3.us-east-1.amazonaws.com/melies/perfil-default.jpg`}
                        onClick={() => {
                           // router.push(`/administrative/users/${user?.id}`)
                           setShowUserOptions(!showUserOptions)
                           setShowDialogEditUser(true)
                        }} />
                     <Text style={{ color: colorPalette.textColor, transition: 'background-color 1s', color: '#fff', fontFamily: 'MetropolisSemiBold' }}>{userName}</Text>
                     {/* <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: !showUserOptions ? `url(${icons.gray_arrow_down})` : `url(${icons.gray_close})`,
                        width: 20,
                        height: 20,
                        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                        filter: 'brightness(0) invert(1)',
                        "&:hover": {
                           opacity: 0.8,
                           cursor: 'pointer'
                        }
                     }} onClick={() => setShowUserOptions(!showUserOptions)} /> */}
                     <Box sx={{
                        display: 'flex', gap: 1.5, alignItems: 'center',
                        justifyContent: 'center',
                     }}>
                        <Box sx={{
                           backgroundColor: colorPalette.buttonColor,
                           borderRadius: 2,
                           padding: '0px 6px 0px 6px',
                           transition: 'background-color 1s',
                           display: 'flex',
                           '&:hover': {
                              cursor: 'pointer',
                              backgroundColor: colorPalette.buttonColor + '88'
                           }
                        }}
                           onClick={logout}>
                           <Text bold small style={{ ...styles.text, textAlign: 'center', color: '#fff' }}>SAIR</Text>
                        </Box>
                        <Box sx={{
                           ...styles.menuIcon,
                           backgroundImage: `url('https://mf-planejados.s3.amazonaws.com/Icon_user_edit.png')`,
                           width: 20,
                           height: 15,
                           filter: 'brightness(0) invert(1)',
                           transition: 'background-color 1s',
                           "&:hover": {
                              opacity: 0.8,
                              cursor: 'pointer'
                           }
                        }} onClick={() => {
                           // router.push(`/administrative/users/${user?.id}`)
                           setShowUserOptions(!showUserOptions)
                           setShowDialogEditUser(true)
                        }} />
                     </Box>
                  </Box>
                  {/* {showUserOptions &&
                     <>
                        <Box sx={{ ...styles.containerUserOpitions, backgroundColor: colorPalette.buttonColor }}>
                           <Box onClick={() => {
                              router.push(`/administrative/employee/${user?.id}`)
                              setShowUserOptions(!showUserOptions)
                           }} sx={{ borderRadius: 1, padding: `4px 8px`, "&:hover": { backgroundColor: colorPalette.primary + '22', cursor: 'pointer' }, }}>
                              <Text bold style={{ ...styles.text, textAlign: 'center', color: '#fff' }}>Editar</Text>
                           </Box>
                           <Box sx={{ borderRadius: 1, padding: `4px 8px`, "&:hover": { backgroundColor: colorPalette.primary + '22', cursor: 'pointer' } }}
                              onClick={logout}>
                              <Text bold style={{ ...styles.text, textAlign: 'center', color: '#fff' }}>Sair</Text>
                           </Box>
                        </Box>
                     </>
                  } */}
               </Box>
               <Box sx={{ ...styles.boxMenu, ...(showMenuMobile && { overflowY: 'auto' }) }}>
                  {menuItems.map((group, index) => {
                     const visibleItems = group.items.filter(item =>
                        item.permissoes.some(permission => userPermissions.some(userPerm => userPerm.id_grupo_perm === permission.grupo_perm_id))
                     );
                     if (visibleItems.length > 0) {
                        return (
                           <Box key={`${group}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, color: '#f0f0f0' + '77', }}
                              onMouseEnter={() => !showMenuMobile && handleGroupMouseEnter(index)}
                              onMouseLeave={() => !showMenuMobile && handleGroupMouseLeave(index)}
                              onClick={() => showMenuMobile && handleGroupClick(index)}>
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
                              }} >
                                 <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5 }}>
                                    <Box sx={{ ...styles.icon, backgroundImage: `url(${group?.icon})`, width: group.text === 'Administrativo' ? 15 : 18, height: group.text === 'Administrativo' ? 24 : 18, filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)', transition: 'background-color 1s' }} />
                                    <Text bold style={{ color: colorPalette.textColor, transition: 'background-color 1s', }}>
                                       {group.text}
                                    </Text>
                                 </Box>
                                 <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_arrow_down})`,
                                    transform: showMenuMobile && groupStates[index] ? 'rotate(-0deg)' : 'rotate(-90deg)',
                                    transition: '.3s',
                                    marginLeft: !showMenuMobile && groupStates[index] ? 10 : 0,
                                    width: 17,
                                    height: 17,
                                    "&:hover": {
                                       opacity: 0.8,
                                       cursor: 'pointer'
                                    }
                                 }} />
                              </Box>
                              {!showMenuMobile ?
                                 <Box sx={{
                                    display: 'flex', flexDirection: 'column', position: 'absolute',
                                    marginLeft: { md: 16, lg: 20 }, padding: '8px'
                                 }}>
                                    <Box sx={{ marginLeft: 4, boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, backgroundColor: colorPalette.secondary }}>
                                       {groupStates[index] && (
                                          group.items.filter(item =>
                                             item.permissoes.some(permission => userPermissions.some(userPerm => userPerm.id_grupo_perm === permission.grupo_perm_id)))
                                             .map((item, index) => {
                                                return (
                                                   <MenuItem
                                                      currentPage={item.to === pathname}
                                                      key={`${index}_${item.to}`}
                                                      to={item.to}
                                                      text={item.text}
                                                      icon={item.icon}
                                                      onClick={() => setShowMenuMobile(false)}
                                                      slug={item.to}
                                                   />)
                                             }
                                             ))}
                                    </Box>
                                 </Box>
                                 : <>
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
                                                slug={item.to}
                                             />)
                                       }))}
                                 </>
                              }
                           </Box>
                        )
                     }
                  })}
               </Box>
               <Box sx={{
                  ...styles.icon,
                  backgroundImage: !theme ? `url('/icons/favicon_dark.png')` : `url('/favicon.png')`,
                  backgroundSize: 'contain',
                  width: '107px',
                  height: '51px',
                  bottom: 60,
                  position: 'absolute',
                  "&:hover": {
                     cursor: 'pointer', opacity: 0.8
                  }
               }} onClick={() => router.push('/')} />
            </Box>
         </Box >

         <Box sx={{ ...styles.menuResponsive, backgroundColor: theme ? '#fff' : colorPalette.primary + '88', gap: 2, }}>
            {/* <Box sx={{
               ...styles.menuIcon,
               backgroundImage: `url('/icons/notification_icon.png')`,
               width: 20,
               filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
               height: 17,
               "&:hover": {
                  opacity: 0.8,
                  cursor: 'pointer'
               }
            }} /> */}

            <IconTheme flex />

            <Box sx={{
               ...styles.icon,
               backgroundImage: !theme ? `url('/icons/favicon_dark.png')` : `url('/favicon.png')`,
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               width: 1,
               height: 35,
               display: 'flex',
               // flex: 1,
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
                  color={colorPalette.textColor}
               />
            </Box>
         </Box>
         {showDialogEditUser && (
            <DialogUserEdit
               onClick={(value) => setShowDialogEditUser(value)}
               value={showDialogEditUser}
            />
         )}
      </>
   )
}

const MenuItem = (props) => {

   const { colorPalette, theme } = useAppContext()

   const {
      to,
      text,
      icon,
      currentPage,
      onClick,
      slug
   } = props

   return (
      <>
         <Link
            href={to || '/#'}
            onClick={onClick}
            style={{ display: 'flex', width: '100%' }}
         >
            <Box sx={{
               display: 'flex',
               padding: `8px 30px`,
               width: '100%',
               borderRadius: 2,
               color: 'inherit',
               transition: '.2s',
               ...(currentPage && to != null ?
                  {
                     // border: `1px solid ${Colors.orange}`,
                     // backgroundColor: colorPalette.buttonColor,
                     color: colorPalette.buttonColor,
                  }
                  :
                  {
                     "&:hover": {
                        // backgroundColor: colorPalette.buttonColor + '22',


                     }
                  }),
            }}>
               <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit' }}>
                  {/* <Box sx={{ ...styles.icon, backgroundImage: `url(/icons/${icon})`, width: 18, height: 18, filter: 'brightness(0) invert(1)', }} /> */}
                  <Text
                     small
                     sx={{
                        color: colorPalette.textColor,
                        transition: 'background-color 1s',
                        "&:hover": {
                           color: colorPalette.buttonColor,
                        },
                        ...(currentPage && to != null &&
                        {
                           color: colorPalette.buttonColor,
                        }
                        ),
                     }}>
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
   },
   boxMenu: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      marginTop: 10,
      overflowStyle: 'marquee,panner',
      maxHeight: '50%',
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
         backgroundColor: 'gray',

      },
      '&::-webkit-scrollbar-track': {
         backgroundColor: Colors.primary,

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
      justifyContent: 'space-around',
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
      top: 135,
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
   },
   menuIcon: {
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: 20,
      height: 20,

   },
}
