import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { Box, Button, ContentContainer, Divider, Text } from "../../atoms";
import { Colors, icons } from "../layout/Colors";
import { Avatar, CircularProgress } from "@mui/material";
import { api } from "../../api/api";
import { formatTimeAgo } from "../../helpers";
import { useRouter } from "next/router";

export const DialogNotifications = ({ notification, handleNotification = () => { } }) => {
    const { colorPalette, theme, setLoading, setNotificationUser, alert, setShowConfirmationDialog } = useAppContext()
    const [notificationData, setNotificationData] = useState(notification)
    const router = useRouter()

    useEffect(() => {
        let [data] = notification;
        setNotificationData(data)
    }, [notification])

    const handleInativeNotification = async (id) => {
        try {
            setLoading(true)
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
                handleNotification(false)
            }

        } catch (error) {
            return error;
        } finally {
            setLoading(false)
        }
    }


    const handleDeleteNotification = async () => {
        try {
            setLoading(true)
            const updateNotification = await api.delete(`/notification/delete/${notificationData?.id_notificacao}`);
            if (updateNotification?.status === 200) {

                setNotificationUser(prevValue => {
                    return prevValue.filter(item => item.id_notificacao !== notificationData?.id_notificacao);
                });

                handleNotification(false)
                alert.success('Notificação excluída.')
            }

        } catch (error) {
            return error;
        } finally {
            setLoading(false)
        }
    }



    const vizualized = notificationData?.vizualizado === 0 ? false : true;

    return (
        <ContentContainer style={{ position: 'relative', width: 415, maxHeight: 600, overflowY: 'auto', padding: 2, display: 'flex', flexDirection: 'column' }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'start', width: '100%', position: 'relative' }}>
                <Text bold>{notificationData?.titulo}</Text>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url(${icons.gray_close})`,
                    transition: '.3s',
                    zIndex: 999999999,
                    position: 'absolute',
                    right: 5,
                    top: 2,
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={() => handleNotification(false)} />
            </Box>

            <Box sx={{ width: '100%', height: '1px', backgroundColor: '#eaeaea' }} />
            {notificationData &&
                <>
                    <Box sx={{
                        display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '8px 12px', width: 380,
                        "&:hover": {
                            backgroundColor: colorPalette.primary + '99',
                            cursor: 'pointer'
                        }
                    }}>
                        {notificationData?.vizualizado === 0 &&
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
                            <Avatar src={notificationData?.imagem || notificationData?.location || ''} sx={{
                                height: { xs: '100%', sm: 45, md: 45, lg: 60 },
                                width: { xs: '100%', sm: 45, md: 45, lg: 60 },
                            }} variant="circular"
                            />
                            <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column', flex: 1 }}>
                                <Text small>{notificationData?.menssagem}</Text>
                                {notificationData?.id_path && <Text bold small>id: {notificationData?.id_path}</Text>}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Text style={{ color: '#606060', marginTop: 2 }} xsmall>{formatTimeAgo(notificationData?.dt_criacao, true)}</Text>
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

                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1, alignItems: 'center' }}>
                        <Box sx={{
                            postion: 'relative', display: 'flex', gap: 1, height: 40, borderRadius: `12px`,
                            boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, alignItems: 'center', justifyContent: 'flex-start', padding: '5px', maxWidth: 150,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => handleInativeNotification(notificationData?.id_notificacao)}>
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
                            }}>
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
                            <Text xsmall>Ocultar notificação</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {notificationData?.path && <Button small text="Visitar" style={{ height: 30, width: 80 }} onClick={() => {
                                router.push(notificationData?.path)
                                handleNotification(false)
                            }} />}
                            <Button secondary small text="Excluir" style={{ height: 30, width: 80 }} onClick={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteNotification })}/>
                        </Box>
                    </Box>
                </>
            }
        </ContentContainer>
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