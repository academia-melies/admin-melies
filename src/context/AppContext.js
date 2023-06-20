import { Backdrop, CircularProgress } from "@mui/material";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { Box, Button, Text } from "../atoms";
import { getDialogPosition } from "../helpers";
import { Alert } from "../organisms";
import { api } from "../api/api";
import { LoadingIcon } from "../organisms/loading/Loading";

const MAX_CONFIRMATION_DIALOG_WITH = 220;

export const AppContext = createContext({});

export const AppProvider = ({ children }) => {

    const reducer = (prev, next) => {
        let dialogPosition = null
        if (next.event) dialogPosition = getDialogPosition(next.event, MAX_CONFIRMATION_DIALOG_WITH);
        return { ...prev, ...next, ...(dialogPosition && { position: dialogPosition }) }
    };

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dataBox, setDataBox] = useState(false)
    const [showConfirmationDialog, setShowConfirmationDialog] = useReducer(reducer, { active: false, position: { left: 0, top: 0 }, acceptAction: () => { } })
    const [alertData, setAlertData] = useState({
        active: false,
        type: '',
        title: '',
        message: ''
    })

    const router = useRouter()
    const alert = new ShowAlert(setAlertData)

    useEffect(() => {
        async function loadUserFromCookies() {
            setLoading(true)
            const token = localStorage.getItem('token')
            try {
                if (token != null) {
                    api.defaults.headers.Authorization = `Bearer ${token}`
                    const response = await api.post('/user/loginToken')
                    const { data } = response;
                    if (data) setUser(data);
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
            if (response.data.token) {
                const { data } = response;
                localStorage.setItem('token', data?.token)
                api.defaults.headers.Authorization = `Bearer ${data?.token}`
                setUser(response.data)
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

    return (
        <AppContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                permissions: user?.permissions,
                login,
                logout,
                loading,
                setLoading,
                setDataBox,
                alert,
                setShowConfirmationDialog
            }}
        >
            {children}
            <Alert active={alertData.active} type={alertData.type} title={alertData.title} message={alertData.message}
                handleClose={() => setAlertData({ active: false, type: '', title: '', message: '' })} />
            <Backdrop sx={{ color: '#fff', zIndex: 99999999 }} open={loading}>
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
                <Box sx={{ ...styles.confirmationContainer, ...position }}>
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