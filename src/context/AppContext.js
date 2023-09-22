import { Backdrop, CircularProgress, useMediaQuery } from "@mui/material";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { Box, Button, Text } from "../atoms";
import { getDialogPosition } from "../helpers";
import { Alert, Colors } from "../organisms";
import { api } from "../api/api";
import { LoadingIcon } from "../organisms/loading/Loading";
import { versions } from "../config/config";

const MAX_CONFIRMATION_DIALOG_WITH = 220;

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {

    let directoryIcons = 'https://mf-planejados.s3.us-east-1.amazonaws.com/melies/'

    const reducer = (prev, next) => {
        let dialogPosition = null
        if (next.event) dialogPosition = getDialogPosition(next.event, MAX_CONFIRMATION_DIALOG_WITH);
        return { ...prev, ...next, ...(dialogPosition && { position: dialogPosition }) }
    };

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notificationUser, setNotificationUser] = useState({
        msg: '',
        vizualized: false
    })
    const [dataBox, setDataBox] = useState(false)
    const [userPermissions, setUserPermissions] = useState()
    const matches = useMediaQuery('(min-width: 1080px) and (max-width: 1320px)');
    const [colorPalette, setColorPalette] = useState({
        primary: '',
        secondary: '',
        third: '',
        buttonColor: '',
        inputColor: '',
        textColor: ''
    })
    const [theme, setTheme] = useState(true)
    const [showConfirmationDialog, setShowConfirmationDialog] = useReducer(reducer, { active: false, position: { left: 0, top: 0 }, acceptAction: () => { } })
    const [alertData, setAlertData] = useState({
        active: false,
        type: '',
        title: '',
        message: ''
    })

    const router = useRouter()
    const alert = new ShowAlert(setAlertData)
    const calculateExpiration = (hours) => {
        const now = new Date();
        return now.getTime() + hours * 60 * 60 * 1000;
    };

    const latestVersion  = versions[versions.length - 1];
    const latestVersionNumber = latestVersion .version;
    const latestVersionBuildDate = latestVersion .build;

    useEffect(() => {
        async function loadUserFromCookies() {
            setLoading(true)
            const token = localStorage.getItem('token')
            try {
                if (token != null) {
                    api.defaults.headers.Authorization = `Bearer ${token}`
                    const response = await api.post('/user/loginToken')
                    const { data } = response;
                    const { userData, getPhoto } = data;

                    if (userData) {
                        setUser({ ...userData, getPhoto })
                        setUserPermissions(userData?.permissoes)
                    }
                    else setUser(null);
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        loadUserFromCookies()
    }, [])

    const login = async ({ email, senha }) => {
        try {
            setLoading(true)
            const response = await api.post('/user/login', { email, senha })
            const { userData } = response.data
            setUserPermissions(userData?.permissoes)
            if (userData.admin_melies < 1) {
                return 0
            }
            if (userData.token) {
                const { data } = response;
                const { userData, getPhoto } = data;
                localStorage.setItem('token', userData?.token);
                api.defaults.headers.Authorization = `Bearer ${userData?.token}`
                setUser({ ...userData, getPhoto });
                setNotificationUser({vizualized: true, msg: `Bem-vindo ${userData?.nome} ao novo portal administrativo da Méliès. 🎉` })
                router.push('/');
                return response
            }
            return response
        } catch (error) {
            return false
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        delete api.defaults.headers.Authorization
    }

    const colorsThem = () => {
        setColorPalette({
            primary: theme ? Colors.clearPrimary : Colors.darkPrimary,
            secondary: theme ? Colors.clearSecondary : Colors.darkSecondary,
            third: theme ? Colors.clearThird : Colors.darkThird,
            buttonColor: theme ? Colors.clearButton : Colors.darkButton,
            inputColor: theme ? Colors.clearInput : Colors.darkInput,
            textColor: theme ? Colors.clearText : Colors.darkText,
        })
    }

    useEffect(() => {
        colorsThem();
    }, [theme])

    return (
        <AppContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                setUser,
                permissions: user?.permissions,
                login,
                logout,
                loading,
                setLoading,
                setDataBox,
                alert,
                setShowConfirmationDialog,
                colorPalette,
                setColorPalette,
                theme,
                setTheme,
                directoryIcons,
                matches,
                userPermissions,
                notificationUser, setNotificationUser,
                latestVersionNumber
            }}
        >
            {children}
            <Alert active={alertData.active} type={alertData.type} title={alertData.title} message={alertData.message}
                handleClose={() => setAlertData({ active: false, type: '', title: '', message: '' })} />
            <Backdrop sx={{ color: '#fff', zIndex: 99999999, backgroundColor: '#0E0D15' }} open={loading}>
                <LoadingIcon />
            </Backdrop>
            <ConfirmationModal
                active={showConfirmationDialog.active}
                position={showConfirmationDialog.position}
                title={showConfirmationDialog.title}
                message={showConfirmationDialog.message}
                acceptAction={showConfirmationDialog.acceptAction}
                closeDialog={() => setShowConfirmationDialog({ active: false })}
            />
        </AppContext.Provider>
    )
}

export const ConfirmationModal = (props) => {

    const {
        active,
        position,
        title = 'Deseja prosseguir?',
        message,
        acceptAction,
        closeDialog
    } = props;

    return (
        <>
            {active &&
                <Box sx={{ ...styles.confirmationContainer, ...position, zIndex: 999999 }}>
                    <Box>
                        <Text bold='true'>{title}</Text>
                    </Box>
                    {message &&
                        <Box>
                            <Text>{message}</Text>
                        </Box>
                    }
                    <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button small='true' text='Sim' onClick={() => {
                            closeDialog()
                            acceptAction()
                        }} />
                        <Button small='true' secondary='true' text='Não' onClick={closeDialog} />
                    </Box>
                </Box>
            }
        </>
    )
}


class ShowAlert {
    constructor(setAlertData) {
        this.setAlertData = setAlertData
    }

    success(message = '') {
        this.setAlertData({
            active: true,
            type: 'success',
            title: 'Tudo certo',
            message
        })
    }

    error(message = '') {
        this.setAlertData({
            active: true,
            type: 'error',
            title: 'Houve um problema',
            message
        })
    }

    info(title = '', message = '') {
        this.setAlertData({
            active: true,
            type: 'info',
            title,
            message
        })
    }
}

const styles = {
    confirmationContainer: {
        zIndex: 999,
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: `12px`,
        padding: 2,
        gap: 2,
        backgroundColor: '#fff',
        boxShadow: `rgba(149, 157, 165, 0.27) 0px 6px 24px`,
        maxWidth: MAX_CONFIRMATION_DIALOG_WITH,
    }
}

export const useAppContext = () => useContext(AppContext)