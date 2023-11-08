import { useState } from "react";
import { Box, Button, ContentContainer, Text } from "../../atoms";
import { Colors, icons } from "../layout/Colors";
import { Avatar } from "@mui/material";
import { IconTheme } from "../iconTheme/IconTheme";
import { useAppContext } from "../../context/AppContext";
import { useRouter } from "next/router";

export const UserHeader = (props) => {
    const {
        title = '',
    } = props;

    const { colorPalette, theme, logout, notificationUser, setNotificationUser } = useAppContext()
    const router = useRouter()
    const routeParts = router.asPath.split('/');
    const lastPage = routeParts[routeParts.length - 1];
    const [showNotification, setShowNotification] = useState(false)

    const handleGoBack = () => {
        if (lastPage > 0) {
            routeParts[routeParts.length - 1] = 'list';
            const newRoute = routeParts.join('/');
            router.push(newRoute);
        } else {
            router.back(); // Caso geral, voltar apenas uma vez
        }
    };

    const handleVizualizeded = (id) => {
        setNotificationUser(prevValue => {
            return prevValue.map(item => {
                if (item.id === id) {
                    return { ...item, vizualized: false };
                }
                return item;
            })
        })
    }

    return (
        <>
            <Box sx={{ ...styles.header, backgroundColor: colorPalette.secondary + '88', gap: 2 }}>
                <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.home})`,
                        width: 17,
                        height: 17,
                        position: 'absolute',
                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                        transition: 'background-color 1s',
                        left: 250,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => router.push('/')} />
                    <Box sx={{
                        position: 'absolute',
                        left: 290,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => handleGoBack()}>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.goback})`,
                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                            transition: '.3s',
                            aspectRatio: '1/1'
                        }} />
                        <Text small sx={{}}>Voltar</Text>
                    </Box>
                </Box>
                <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', transition: '.3s', backgroundColor: colorPalette.primary, padding: '5px 8px', borderRadius: 2, cursor: 'pointer', "&:hover": { opacity: 0.6 } }} onClick={() => router.push('/ourTeam')}>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url('/icons/org_icon.png')`,
                        width: 15,
                        height: 15,
                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                        transition: 'background-color 1s'
                    }} />
                    <Text bold small style={{ color: colorPalette.textColor, transition: 'background-color 1s' }}>Equipe Méliès</Text>
                </Box>
                <Box sx={{ gap: 1, display: 'flex', alignItems: 'center', transition: '.3s', backgroundColor: colorPalette.primary, padding: '5px 8px', borderRadius: 2, cursor: 'pointer', "&:hover": { opacity: 0.6 } }}
                    onClick={() => router.push('/suport/tasks/list')}>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url('/icons/support-icon.png')`,
                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                        transition: '.3s',
                        aspectRatio: '1/1'
                    }} />
                    <Text bold small>Suporte</Text>
                </Box>
                <IconTheme flex />
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'space-around', position: 'relative', }}>
                    <Box sx={{
                        position: 'relative', "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => setShowNotification(!showNotification)}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'space-around', backgroundColor: colorPalette.primary, padding: '5px 8px', borderRadius: 2, cursor: 'pointer', "&:hover": { opacity: 0.6 } }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('/icons/notification_icon-png.png')`,
                                width: 18,
                                height: 18,
                                filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                transition: 'background-color 1s',
                            }} />
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url('${icons.gray_arrow_down}')`,
                                width: 13,
                                height: 13,
                                aspectRatio: '1/1',
                                // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                transition: 'background-color 1s',
                            }} />
                        </Box>
                        {notificationUser?.filter(item => item.vizualized === true)?.length > 0 &&
                            <Box sx={{
                                position: 'absolute',
                                width: 11,
                                height: 11,
                                borderRadius: 5,
                                backgroundColor: 'red',
                                alignItems: 'center',
                                justifyContent: 'center',
                                top: 3,
                                left: 5
                            }}>
                                <Text bold style={{ color: '#fff', fontSize: '8px', textAlign: 'center' }}>{notificationUser?.filter(item => item.vizualized === true)?.length}</Text>
                            </Box>
                        }
                    </Box>

                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.logout})`,
                        width: 20,
                        height: 17,
                        transition: 'background-color 1s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => logout()} />
                    {showNotification &&
                        <ContentContainer style={{ position: 'absolute', zIndex: 99999, left: -120, top: 28, width: 220, padding: 2, display: 'flex' }}>

                            {notificationUser?.filter(item => item.vizualized === true)?.length > 0 ? notificationUser?.map((item, index) => {
                                if (item.vizualized) {
                                    return (
                                        <ContentContainer  key={index} style={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', padding: '8px 12px' }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Text xsmall>{item?.msg}</Text>
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    width: 12,
                                                    height: 12,
                                                    backgroundImage: `url(${icons.gray_close})`,
                                                    transition: '.3s',
                                                    aspectRatio: '1/1',
                                                    zIndex: 999999999,
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    }
                                                }} onClick={() => {
                                                    setShowNotification(false)
                                                    handleVizualizeded(item.id)
                                                }} />
                                            </Box>
                                        </ContentContainer>
                                    )
                                }
                            })
                                :
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative'}}>
                                    <Text xsmall>Você não possui novas notificações.</Text>
                                </Box>
                            }
                        </ContentContainer>
                    }
                </Box>
            </Box>
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
