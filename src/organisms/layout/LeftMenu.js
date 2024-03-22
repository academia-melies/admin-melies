import { Avatar, Backdrop, useMediaQuery, useTheme } from "@mui/material"
import Hamburger from "hamburger-react"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Box, ContentContainer, Divider, Text } from "../../atoms"
import { Colors, icons } from "./Colors"
import { useAppContext } from "../../context/AppContext"
import { IconTheme } from "../iconTheme/IconTheme"
import { getImageByScreen } from "../../validators/api-requests"
import { DialogUserEdit } from "../userEdit/dialogEditUser"
import { api } from "../../api/api"

export const LeftMenu = ({ }) => {

   const { logout, user, colorPalette, theme, userPermissions, latestVersion, showVersion, setShowVersion } = useAppContext();
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
   const [showSubMenu, setShowSubMenu] = useState(false)
   const containerRef = useRef(null);
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


   useEffect(() => {
      if (!showUserOptions) {

         const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
               setShowUserOptions(false);
            }
         };

         document.addEventListener('mousedown', handleClickOutside);

         return () => {
            document.removeEventListener('mousedown', handleClickOutside);
         };
      }
   }, []);


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

   const handleAttMsgVersion = async () => {
      try {
         const response = await api.patch(`/user/notificationVersion/false/${user?.id}`)
      } catch (error) {
         console.log(error)
         return error
      }
   }

   return (
      <>
         {showSubMenu &&
            <Box sx={{
               position: 'fixed',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
               backgroundColor: '#0E0D15', 
               opacity: 0.7,
               zIndex: 9999999,
            }} />}
         <Box sx={{
            ...styles.leftMenuMainContainer, backgroundColor: colorPalette.secondary, border: `1px solid ${theme ? '#eaeaea' : '#404040'}`, transition: 'background-color 1s', ...(showMenuMobile && { display: 'flex' }),
            width: { xs: '214px', sm: '214px', md: '180px', lg: '180px', xl: '214px' },
         }}>
            <Box sx={{ position: 'fixed', height: '100%', width: { xs: '214px', sm: '214px', md: '180px', lg: '180px', xl: '214px' }, padding: { xs: '10px 15px', sm: '10px 15px', md: '8px 10px', lg: '8px 10px', xl: '10px 15px' } }}>
               <Box sx={{
                  // backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center center',
                  width: '100%',
                  height: { xs: '200px', md: '180px', lg: '180px', xl: '205px' },
                  position: 'absolute',
                  backgroundColor: colorPalette.secondary,
                  top: -40,
                  left: 0,
                  backgroundImage: `url(${imagesList})`,
                  borderRadius: '0px 0px 16px 16px'
               }} />
               {user?.professor === 1 &&
                  <Box sx={{ position: 'absolute', top: -20, left: 8, padding: '2px 5px 2px 5px', backgroundColor: colorPalette.buttonColor, justifyContent: 'center', alignItems: 'center' }}>
                     <Text bold xsmall>Professor</Text>
                  </Box>
               }
               <Box sx={{ ...styles.userBadgeContainer }}>
                  <Box sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     gap: 1,
                     borderRadius: 1.5,
                     boxSizing: 'border-box',
                     flexDirection: 'column',
                     padding: { md: '0px', lg: '0px', xl: '8px 8px' },

                  }}>
                     <Avatar
                        sx={{ width: '65px', height: '65px', fontSize: 14, border: `1px solid #fff`, cursor: 'pointer', '&hover': { opacity: 0.5 } }}
                        src={fotoPerfil || `https://mf-planejados.s3.us-east-1.amazonaws.com/melies/perfil-default.jpg`}
                        onClick={() => {
                           // router.push(`/administrative/users/${user?.id}`)
                           // setShowUserOptions(!showUserOptions)
                           setShowDialogEditUser(true)
                           setShowMenuMobile(false)
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
                           // setShowDialogEditUser(true)
                           setShowMenuMobile(false)
                        }} />
                     </Box>
                  </Box>
                  {showUserOptions &&
                     <Box sx={{ ...styles.containerUserOpitions, backgroundColor: colorPalette.secondary, border: `1px solid ${(theme ? '#eaeaea' : '#404040')}` }}>
                        <div ref={containerRef}>
                           <Box onClick={() => {
                              router.push(`/administrative/users/${user?.id}`)
                              setShowMenuMobile(false)
                              setShowUserOptions(!showUserOptions)
                           }} sx={{ borderRadius: 1, padding: `4px 8px`, "&:hover": { backgroundColor: colorPalette.primary + '88', cursor: 'pointer' }, }}>
                              <Text bold style={{ ...styles.text, textAlign: 'center', color: colorPalette?.textColor }}>Meus dados</Text>
                           </Box>
                           <Box sx={{ borderRadius: 1, padding: `4px 8px`, "&:hover": { backgroundColor: colorPalette.primary + '88', cursor: 'pointer' } }}
                              onClick={() => {
                                 setShowDialogEditUser(true)
                                 setShowMenuMobile(false)
                                 setShowUserOptions(!showUserOptions)
                              }}>
                              <Text bold style={{ ...styles.text, textAlign: 'center', color: colorPalette?.textColor }}>Alterar senha</Text>
                           </Box>
                        </div>
                     </Box>
                  }
               </Box>
               <Box sx={{ ...styles.boxMenu, ...(showMenuMobile && { overflowY: 'auto' }) }}>
                  {menuItems.map((group, index) => {
                     const visibleItems = group.items.filter(item =>
                        item.permissoes.some(permission => userPermissions.some(userPerm => userPerm.id_grupo_perm === permission.grupo_perm_id))
                     );
                     if (visibleItems.length > 0) {
                        return (
                           <Box key={`${group}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, color: '#f0f0f0' + '77', }}
                              onMouseEnter={() => {
                                 if (!showMenuMobile) {
                                    handleGroupMouseEnter(index)
                                    setShowSubMenu(true)
                                 }
                              }}
                              onMouseLeave={() => {
                                 if (!showMenuMobile) {
                                    handleGroupMouseLeave(index)
                                    setShowSubMenu(false)
                                 }
                              }}
                              onClick={() => showMenuMobile && handleGroupClick(index)}>
                              {/* {index !== 0 && <Box sx={{ width: '100%', height: `1px`, backgroundColor: '#e4e4e4', margin: `16px 0px`, }} />} */}
                              <Box sx={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'space-between',
                                 gap: 0.5,
                                 padding: `10px 5px`,
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
                              {(!showMenuMobile) ?
                                 <Box sx={{
                                    display: 'flex', flexDirection: 'column', position: 'absolute',
                                    justifyContent: 'center',
                                    top: -50,
                                    width: (!showMenuMobile && groupStates[index]) ? 300 : 0,
                                    padding: 0,
                                    transition: '.3s',
                                    height: '110%',
                                    zIndex: -10,
                                    gap: 2,
                                    marginLeft: { md: 16, lg: 16, xl: 21 },
                                    overflow: 'hidden'
                                 }}>
                                    <Box sx={{
                                       marginLeft: 4,
                                       boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                                       border: `1px solid ${theme ? '#eaeaea' : '#404040'}`, backgroundColor: colorPalette.secondary,
                                       height: '100%',
                                       padding: (!showMenuMobile && groupStates[index]) ? '30px 20px' : '0',
                                       justifyContent: 'center',
                                       alignItems: 'center',
                                    }}>
                                       <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, marginTop: 5 }}>
                                          <Box sx={{
                                             ...styles.icon, backgroundImage: `url(${group?.icon})`,
                                             width: (!showMenuMobile && groupStates[index]) ? 25 : 0,
                                             height: 'auto',
                                             filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                             transition: 'background-color 1s',
                                             aspectRatio: '1/1'
                                          }} />
                                          <Text bold large style={{ color: colorPalette.buttonColor, transition: 'background-color 1s', }}>
                                             {group.text}
                                          </Text>
                                       </Box>
                                       <Divider distance={3} />
                                       {
                                          group.items.filter(item =>
                                             item.permissoes.some(permission => userPermissions.some(userPerm => userPerm.id_grupo_perm === permission.grupo_perm_id)))
                                             .map((item, index) => {
                                                return (
                                                   <MenuItem
                                                      router={router}
                                                      setShowMenuMobile={setShowMenuMobile}
                                                      showMenuMobile={showMenuMobile}
                                                      currentPage={item.to === pathname}
                                                      key={`${index}_${item.to}`}
                                                      to={item.to}
                                                      text={item.text}
                                                      icon={item.icon}
                                                      onClick={() => setShowMenuMobile(false)}
                                                      slug={item.to}
                                                      subitem={item.subitems}
                                                      pathname={pathname}
                                                   />

                                                )
                                             }
                                             )
                                       }
                                    </Box>
                                 </Box>
                                 : <>
                                    {groupStates[index] && (
                                       group.items.filter(item =>
                                          item.permissoes.some(permission => userPermissions.some(userPerm => userPerm.id_grupo_perm === permission.grupo_perm_id)))
                                          .map((item, index) => {
                                             return (
                                                <MenuItem
                                                   setShowMenuMobile={setShowMenuMobile}
                                                   router={router}
                                                   showMenuMobile={showMenuMobile}
                                                   currentPage={item.to === pathname}
                                                   key={`${index}_${item.to}`}
                                                   to={item.to}
                                                   text={item.text}
                                                   icon={item.icon}
                                                   onClick={() => setShowMenuMobile(false)}
                                                   slug={item.to}
                                                   subitem={item.subitems}
                                                   pathname={pathname}
                                                />

                                             )
                                          }
                                          ))}
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
                  bottom: 70,
                  position: 'absolute',
                  "&:hover": {
                     cursor: 'pointer', opacity: 0.8
                  }
               }} onClick={() => router.push('/')} />
               <Box onClick={() => setShowVersion(true)} sx={{ cursor: 'pointer' }}>
                  <Text style={{ bottom: 45, left: 60, position: 'absolute', color: 'gray' }}> v{latestVersion?.version}</Text>
               </Box>
            </Box>
         </Box >

         <Box sx={{ ...styles.menuResponsive, backgroundColor: theme ? '#fff' : colorPalette.primary + '88', gap: 2, }}>

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
         {
            showDialogEditUser && (
               <DialogUserEdit
                  onClick={(value) => setShowDialogEditUser(value)}
                  value={showDialogEditUser}
               />
            )
         }

      </>
   )
}

const MenuItem = (props) => {

   const { colorPalette, theme } = useAppContext()
   const [showSubItems, setShowSubItems] = useState(false);
   const {
      to,
      text,
      icon,
      currentPage,
      onClick,
      slug,
      subitem,
      pathname,
      showMenuMobile,
      router,
      setShowMenuMobile
   } = props

   const isMobile = showMenuMobile;

   const handleClick = (event) => {
      event.preventDefault(); // Prevents the default link behavior
      event.stopPropagation()
      if (isMobile) {
         // Only toggle showSubItems if the clicked item has subitems
         setShowSubItems(subitem && subitem?.length > 0 ? !showSubItems : showSubItems);

         if (subitem && subitem?.length < 1) {
            router.push(to)
            onClick()
         }
      } else {
         if (onClick) {
         }
      }
   };

   return (
      <>
         {isMobile
            ?
            <Box
               onClick={(e) => handleClick(e)}
               style={{ display: 'flex', width: '100%', padding: `8px 8px 8px 16px`, minWidth: 110, position: 'relative' }}
            >
               {<Box sx={{ display: 'flex', position: 'absolute', height: '105%', width: 2, backgroundColor: colorPalette.primary, left: 1 }} />}
               <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  borderRadius: 2,
                  color: 'inherit',
                  transition: '.2s',
                  flexDirection: {
                     xs: 'column', md: 'column', lg: 'row', xl: 'row'
                  },
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

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit', justifyContent: 'space-between', width: '100%' }}>
                     {/* <Box sx={{ ...styles.icon, backgroundImage: `url(/icons/${icon})`, width: 18, height: 18, filter: 'brightness(0) invert(1)', }} /> */}
                     <Text
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
                     {subitem?.length > 0 &&
                        <Box sx={{
                           ...styles.menuIcon,
                           backgroundImage: `url(${icons.gray_arrow_down})`,
                           transform: showSubItems ? 'rotate(0deg)' : 'rotate(-90deg)',
                           transition: '.3s',
                           right: 12,
                           width: 15,
                           aspectRatio: '1/1',
                           height: 15,
                           // position: 'absolute',
                           "&:hover": {
                              opacity: 0.8,
                              cursor: 'pointer'
                           }
                        }} />}
                  </Box>
                  <Box sx={{
                     position: { xs: 'relative', md: 'absolute', lg: 'absolute', xl: 'absolute' }, marginLeft: { md: 11, lg: 10, xl: 11.5 },
                     boxShadow: { xs: 'none', md: 'none', lg: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, xl: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, },
                  }}>
                     <Box sx={{
                        position: { xs: 'relative', md: 'absolute', lg: 'absolute', xl: 'absolute' },
                        marginLeft: { md: 11, lg: 10, xl: 11.5 },
                        boxShadow: { xs: 'none', md: 'none', lg: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, xl: `rgba(149, 157, 165, 0.17) 0px 6px 24px` },
                        marginTop: (subitem?.length > 0 && showSubItems) ? '5px' : 0,
                        display: 'flex', flexDirection: 'column'
                     }}>
                        {subitem?.length > 0 && showSubItems &&
                           <Box sx={{ display: 'flex', position: 'absolute', height: '100%', width: 2, backgroundColor: colorPalette.primary }} />}
                        {showSubItems &&
                           [...new Set(subitem?.map(item => item.to))].map((to, index) => {
                              const item = subitem?.find(item => item.to === to);
                              const currentPage = item.to === pathname;
                              const key = `${index}_${item.id_subitem}`;

                              return (
                                 <Box key={key}
                                    style={{
                                       display: 'flex', width: '100%', backgroundColor: colorPalette.secondary,
                                       boxShadow: { xs: 'none', md: 'none', lg: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, xl: `rgba(149, 157, 165, 0.17) 0px 6px 24px` },
                                    }}
                                 >
                                    <Box sx={{
                                       display: 'flex',
                                       padding: `8px 18px`,
                                       width: '100%',
                                       borderRadius: 2,
                                       color: 'inherit',
                                       transition: '.2s',
                                       ...(currentPage && item.to != null ?
                                          { color: colorPalette.buttonColor } : {}),
                                    }} onClick={() => {
                                       router.push(item.to)
                                       setShowMenuMobile(false)
                                    }}>
                                       <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit' }}>
                                          <Text
                                             small
                                             sx={{
                                                color: colorPalette.textColor,
                                                transition: 'background-color 1s',
                                                "&:hover": {
                                                   color: colorPalette.buttonColor,
                                                },
                                                ...(currentPage && item.to != null && { color: colorPalette.buttonColor }
                                                ),
                                             }}>
                                             {item.text}
                                          </Text>
                                       </Box>
                                    </Box>
                                 </Box>
                              );
                           })}
                     </Box>
                  </Box>
               </Box>
            </Box >
            :
            <>
               <Link
                  href={to || '/#'}
                  onClick={onClick}
                  style={{ display: 'flex', width: 'auto', padding: `8px 8px 8px 16px`, minWidth: 110 }}
                  onMouseEnter={() => setShowSubItems(true)}
                  onMouseLeave={() => setShowSubItems(false)}
               >
                  <Box sx={{
                     display: 'flex',
                     width: '100%',
                     borderRadius: 2,
                     flexDirection: 'column', gap: 1,
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
                     {subitem?.length > 0 && <Divider />}
                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit', justifyContent: 'space-between' }}>
                        {/* <Box sx={{ ...styles.icon, backgroundImage: `url(/icons/${icon})`, width: 18, height: 18, filter: 'brightness(0) invert(1)', }} /> */}
                        <Text bold={subitem?.length > 0}
                           small={subitem?.length < 1}
                           sx={{
                              color: subitem?.length > 0 ? colorPalette?.buttonColor : 'rgb(107 114 128)',
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
                        {/* {subitem?.length > 0 &&
                           <Box sx={{
                              ...styles.menuIcon,
                              backgroundImage: `url(${icons.gray_arrow_down})`,
                              transform: 'rotate(-90deg)',
                              transition: '.3s',
                              right: 12,
                              width: 15,
                              aspectRatio: '1/1',
                              height: 15,
                              // position: 'absolute',
                              "&:hover": {
                                 opacity: 0.8,
                                 cursor: 'pointer'
                              }
                           }} />} */}
                     </Box>

                     {subitem?.length > 0 &&
                        <Box sx={{
                           position: 'relative',
                           width: '100%',
                        }}>
                           {
                              [...new Set(subitem?.map(item => item.to))].map((to, index) => {
                                 const item = subitem?.find(item => item.to === to);
                                 const currentPage = item.to === pathname;
                                 const key = `${index}_${item.id_subitem}`;

                                 return (
                                    <Link key={key}
                                       href={item.to || '/#'}
                                       style={{ display: 'flex', width: '100%' }}
                                    >
                                       <Box sx={{
                                          display: 'flex',
                                          padding: `8px 18px`,
                                          width: '100%',
                                          borderRadius: 2,
                                          color: 'inherit',
                                          transition: '.2s',
                                          ...(currentPage && item.to != null ?
                                             { color: colorPalette.buttonColor } : {}),
                                       }}>
                                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'inherit' }}>
                                             <Text
                                                small
                                                sx={{
                                                   color: 'rgb(107 114 128)',
                                                   transition: 'background-color 1s',
                                                   "&:hover": {
                                                      color: colorPalette.buttonColor,
                                                   },
                                                   ...(currentPage && item.to != null && { color: colorPalette.buttonColor }
                                                   ),
                                                }}>
                                                {item.text}
                                             </Text>
                                          </Box>
                                       </Box>
                                    </Link>
                                 );
                              })
                           }
                           < Divider />
                        </Box>
                     }

                  </Box>
               </Link>
            </>}

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
