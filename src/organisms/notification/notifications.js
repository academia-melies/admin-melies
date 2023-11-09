import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Box, ContentContainer, Divider, Text } from "../../atoms";
import { Colors } from "../layout/Colors";
import { CircularProgress } from "@mui/material";
import { api } from "../../api/api";
import { formatTimeAgo } from "../../helpers";

export const Notifications = ({ showNotification = false, setShowNotification}) => {
    const { colorPalette, theme, logout, notificationUser, setNotificationUser } = useAppContext()
    const [loadingNotification, setLoadingNotification] = useState(false)
    const [groupStates, setGroupStates] = useState(notificationUser.map(() => false));
    const containerRef = useRef(null);

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

    const handleGoBack = () => {
        if (lastPage > 0) {
            routeParts[routeParts.length - 1] = 'list';
            const newRoute = routeParts.join('/');
            router.push(newRoute);
        } else {
            router.back();
        }
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
        <div ref={containerRef}>
            {showNotification &&

                <ContentContainer style={{ position: 'absolute', zIndex: 99999, left: -360, top: 45, width: 415, maxHeight: 350, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column' }}>
                    <Text bold>Notificações</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        width: 21,
                        height: 21,
                        backgroundImage: `url('/icons/config_icon.jpg')`,
                        transition: '.3s',
                        aspectRatio: '1/1',
                        position: 'absolute',
                        right: 15, top: 15,
                        zIndex: 999999999,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} />
                    <Divider distance={0} />
                    {notificationUser?.filter(n => n.ativo === 1)?.length > 0 ? notificationUser?.filter(n => n.ativo === 1)?.map((item, index) => {
                        return (
                            <Box key={index} sx={{
                                display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '8px 12px', width: 380,
                                "&:hover": {
                                    backgroundColor: colorPalette.primary + '99',
                                    cursor: 'pointer'
                                }
                            }} onMouseEnter={() => handleVizualizeded(item?.id_notificacao)}>
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
                                <Box sx={{ display: 'flex', gap: 1, }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1 }}>
                                        <Text small bold>{item?.titulo}</Text>
                                        <Text small>{item?.menssagem}</Text>
                                        <Text style={{ color: '#606060', marginTop: 2 }} xsmall>{formatTimeAgo(item?.dt_criacao, true)}</Text>
                                    </Box>
                                    <Box sx={{ postion: 'relative' }}>

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
                                        }} onClick={() => handleInativeNotification(item?.id_notificacao)}
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
                                    </Box>
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