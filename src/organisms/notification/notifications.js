import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Box, ContentContainer, Divider, Text } from "../../atoms";
import { Colors } from "../layout/Colors";
import { Avatar, Backdrop, CircularProgress } from "@mui/material";
import { api } from "../../api/api";
import { formatTimeAgo } from "../../helpers";
import { DialogNotifications } from "./dialogNotification";

export const Notifications = ({ showNotification = false, setShowNotification }) => {
    const { colorPalette, theme, logout, notificationUser, setNotificationUser } = useAppContext()
    const [loadingNotification, setLoadingNotification] = useState(false)
    const [groupStates, setGroupStates] = useState(notificationUser.map(() => false));
    const containerRef = useRef(null);
    const [showMenu, setShowMenu] = useState({
        inbox: true,
        archive: false
    })
    const [notificationData, setNotificationData] = useState([])
    const [notificationSelect, setNotificationSelect] = useState()
    const [showDialog, setShowDialog] = useState(false)

    useEffect(() => {
        if (!showNotification) {

            const handleClickOutside = (event) => {
                if (containerRef.current && !containerRef.current.contains(event.target)) {
                    setShowNotification(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, []);

    useEffect(() => {
        if (showMenu?.inbox) {
            setNotificationData(notificationUser?.filter(item => item.ativo === 1))
        } else if (showMenu?.archive) {
            setNotificationData(notificationUser?.filter(item => item.ativo === 0))
        }
    }, [showMenu, notificationUser])


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


    const handleVizualizeded = async (id) => {

        let notificationToPatch = notificationUser.find(item => item.id_notificacao === id);

        if (notificationToPatch.vizualizado === 0) {
            const updateNotification = await api.patch(`/notification/update/${id}`, { vizualizado: 1 });
            setNotificationUser(prevValue => {
                return prevValue.map(item => {
                    if (item.id_notificacao === id) {
                        return { ...item, vizualizado: 1 };
                    }
                    return item;
                });
            });
        }
        setNotificationSelect(id)
    }

    const handleInativeNotification = async (id) => {
        try {
            setLoadingNotification(true)
            const updateNotification = await api.patch(`/notification/inative/${id}`);
            if (updateNotification?.status === 200) {

                setNotificationUser(prevValue => {
                    return prevValue.map(item => {
                        if (item.id_notificacao === id) {
                            return { ...item, ativo: 0 };
                        }
                        return item;
                    });
                });
            }

        } catch (error) {
            return error;

        } finally {
            setLoadingNotification(false)
        }
    }

    return (
        <>
            <div ref={containerRef}>
                {showNotification &&

                    <ContentContainer style={{ position: 'absolute', zIndex: 99999, left: -360, top: 45, width: 415, maxHeight: 600, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column' }}>

                        <Box>
                            <Text bold>Notificações</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 21,
                                height: 21,
                                backgroundImage: `url('/icons/setting_icon.png')`,
                                transition: '.3s',
                                filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                transition: 'background-color 1s',
                                aspectRatio: '1/1',
                                position: 'absolute',
                                right: 15, top: 15,
                                zIndex: 999999999,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, position: 'absolute', top: 45 }}>
                            <Box sx={{
                                borderBottom: `2px solid ${showMenu?.inbox ? 'black' : 'transparent'}`, padding: '10px 0px', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => setShowMenu({ inbox: true, archive: false })}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 14,
                                    height: 14,
                                    backgroundImage: `url('/icons/inbox_icon.png')`,
                                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                    transition: 'background-color 1s',
                                    transition: '.3s',
                                    aspectRatio: '1/1',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} />
                                <Text>Inbox</Text>
                            </Box>
                            <Box sx={{
                                borderBottom: `2px solid ${showMenu?.archive ? 'black' : 'transparent'}`, padding: '10px 0px', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => setShowMenu({ inbox: false, archive: true })}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 14,
                                    height: 14,
                                    backgroundImage: `url('/icons/archive_icon.png')`,
                                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                    transition: 'background-color 1s',
                                    transition: '.3s',
                                    aspectRatio: '1/1',
                                    zIndex: 999999999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} />
                                <Text>Aquivadas</Text>
                            </Box>
                        </Box>
                        <Box sx={{ width: '100%', height: '1px', backgroundColor: '#eaeaea', marginTop: '35px' }} />
                        {notificationData?.length > 0 ? notificationData
                            ?.sort((a, b) => b.dt_criacao.localeCompare(a.dt_criacao))
                            ?.map((item, index) => {
                                const vizualized = item?.vizualizado === 0 ? false : true
                                return (
                                    <Box key={index} sx={{
                                        display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '8px 12px', width: 380,
                                        "&:hover": {
                                            backgroundColor: colorPalette.primary + '99',
                                            cursor: 'pointer'
                                        }
                                    }} onMouseEnter={() => handleVizualizeded(item?.id_notificacao)}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowDialog(true)
                                            setShowNotification(false);
                                        }}>
                                        {item?.vizualizado === 0 &&
                                            <Box sx={{
                                                position: 'absolute',
                                                width: 7,
                                                height: 7,
                                                borderRadius: 7,
                                                backgroundColor: 'red',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                top: 25,
                                                left: -5
                                            }} />}
                                        <Box sx={{ display: 'flex', gap: 1.75, }}>
                                            <Avatar src={item?.imagem || item?.location|| ''} sx={{
                                                height: { xs: '100%', sm: 45, md: 45, lg: 60 },
                                                width: { xs: '100%', sm: 45, md: 45, lg: 60 },
                                            }} variant="circular"
                                            />
                                            <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1 }}>
                                                <Text small bold>{item?.titulo}</Text>
                                                <Text small>{item?.menssagem}</Text>
                                               {item?.id_path && <Text bold small>id: {item?.id_path}</Text>}
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Text style={{ color: '#606060', marginTop: 2 }} xsmall>{formatTimeAgo(item?.dt_criacao, true)}</Text>
                                                    {vizualized ?
                                                        <>
                                                            <Text style={{ color: '#606060', marginTop: 2 }} xsmall>-</Text>
                                                            <Text style={{ color: '#606060', marginTop: 2 }} xsmall>vista</Text>
                                                        </>
                                                        :
                                                        <Box sx={{ padding: '0px 8px', backgroundColor: colorPalette.buttonColor, borderRadius: 8 }}>
                                                            <Text xsmall style={{ color: '#fff' }}>new</Text>
                                                        </Box>
                                                    }
                                                </Box>
                                            </Box>
                                            {showMenu?.inbox && <Box sx={{ postion: 'relative' }}>

                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    zIndex: 9999,
                                                    backgroundImage: `url('/icons/notification_icon-png.png')`,
                                                    width: 13,
                                                    position: 'relative',
                                                    height: 13,
                                                    borderRadius: 13,
                                                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                                    transition: 'background-color 1s',
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    }
                                                }} onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleInativeNotification(item?.id_notificacao)
                                                }}
                                                    onMouseEnter={() => handleGroupMouseEnter(index)}
                                                    onMouseLeave={() => handleGroupMouseLeave(index)}
                                                >
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 'calc(50% - 0.5px)',
                                                            width: 17,
                                                            right: -2,
                                                            height: '1px',
                                                            transform: 'rotate(45deg)',
                                                            backgroundColor: 'lightgray',
                                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                                        }}
                                                    />
                                                </Box>
                                                {groupStates[index] &&
                                                    <ContentContainer style={{
                                                        position: 'absolute',
                                                        top: 25,
                                                        right: 10,
                                                        transition: '1s',
                                                        padding: 1
                                                    }}>
                                                        <Text xsmall>Ocultar notificação</Text>
                                                    </ContentContainer>}
                                            </Box>}
                                        </Box>
                                    </Box>
                                )
                            })
                            :
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
                                <Text small>Você não possui novas notificações.</Text>
                            </Box>
                        }

                        {loadingNotification &&
                            <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                                <CircularProgress />
                            </Box>}

                    </ContentContainer>
                }
            </div>
            <Backdrop open={showDialog} sx={{ zIndex: 99999 }}>
                <DialogNotifications handleNotification={(value) => setShowDialog(value)} notification={notificationData?.filter(item => item.id_notificacao === notificationSelect)} />
            </Backdrop>
        </>
    )
}

const styles = {
    header: {
        display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex' },
        width: '100%',
        padding: `3px 32px 3px 32px`,
        alignItems: 'center',
        justifyContent: 'flex-end',
        boxSizing: 'border-box',
        gap: 1,
        position: 'absolute',
        borderBottom: `1px solid ${Colors.backgroundPrimary + '11'}`,
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,

    },
    containerUserOpitions: {
        backgroundColor: '#fff',
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
        zIndex: 9999999
    }
}