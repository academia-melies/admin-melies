import { Backdrop, CircularProgress, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, createContext, useContext, useEffect, useReducer, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../atoms";
import { getDialogPosition } from "../helpers";
import { Alert, Colors } from "../organisms";
import { api } from "../api/api";
import { LoadingIcon } from "../organisms/loading/Loading";
import { versions } from "../config/config";
import { icons } from "../organisms/layout/Colors";

export interface ColorPalette {
    primary: string;
    secondary: string;
    third: string;
    buttonColor: string;
    inputColor: string;
    textColor: string;
}

interface AlertData {
    active: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
}

export interface AppContextType {
    isAuthenticated: boolean;
    user: any; // Ajuste o tipo conforme necessário
    setUser: React.Dispatch<React.SetStateAction<any>>; // Ajuste o tipo conforme necessário
    permissions: any; // Ajuste o tipo conforme necessário
    login: (credentials: { email: string; senha: string }) => Promise<any>; // Ajuste o tipo conforme necessário
    logout: () => void;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setDataBox: React.Dispatch<React.SetStateAction<boolean>>;
    alert: ShowAlert;
    setShowConfirmationDialog: React.Dispatch<React.SetStateAction<any>>; // Ajuste o tipo conforme necessário
    colorPalette: ColorPalette;
    setColorPalette: React.Dispatch<React.SetStateAction<ColorPalette>>;
    theme: boolean;
    setTheme: React.Dispatch<React.SetStateAction<boolean>>;
    directoryIcons: string;
    matches: boolean;
    userPermissions: any; // Ajuste o tipo conforme necessário
    notificationUser: any[]; // Ajuste o tipo conforme necessário
    setNotificationUser: React.Dispatch<React.SetStateAction<any[]>>; // Ajuste o tipo conforme necessário
    latestVersionNumber: string | undefined;
    latestVersion: any; // Ajuste o tipo conforme necessário
    menuItemsList: any[]; // Ajuste o tipo conforme necessário
    showVersion: boolean;
    setShowVersion: React.Dispatch<React.SetStateAction<boolean>>;
    permissionTop15: boolean;
}

interface AppProviderProps {
    children: ReactNode;
}

interface Login {
    email: string
    senha: string
}

const MAX_CONFIRMATION_DIALOG_WITH = 360;

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {

    let directoryIcons = 'https://mf-planejados.s3.us-east-1.amazonaws.com/melies/'

    const reducer = (prev: any, next: any) => {
        let dialogPosition = null
        if (next.event) dialogPosition = getDialogPosition(next.event, MAX_CONFIRMATION_DIALOG_WITH);
        return { ...prev, ...next, ...(dialogPosition && { position: dialogPosition }) }
    };

    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [notificationUser, setNotificationUser] = useState<any>([])
    const [menuItemsList, setMenuItemsList] = useState([])
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
    const [permissionTop15, setPermissionTop15] = useState(false)
    const [showConfirmationDialog, setShowConfirmationDialog] = useReducer(reducer, { active: false, position: { left: 0, top: 0 }, acceptAction: () => { } })
    const [alertData, setAlertData] = useState({
        active: false,
        type: '',
        title: '',
        message: ''
    })
    const [showVersion, setShowVersion] = useState(false)
    const router = useRouter()
    const alert = new ShowAlert(setAlertData)
    const filterVersions = versions?.filter(item => item.status === 'lançada');
    const latestVersion = filterVersions[filterVersions.length - 1];
    const latestVersionNumber = latestVersion?.version;

    const groupArea = [
        { label: 'Financeiro', value: 'Financeiro' },
        { label: 'TI - Suporte', value: 'TI - Suporte' },
        { label: 'Atendimento/Recepção', value: 'Atendimento/Recepção' },
        { label: 'Secretaria', value: 'Secretaria' },
        { label: 'Administrativo', value: 'Administrativo' },
        { label: 'Diretoria', value: 'Diretoria' },
    ]

    useEffect(() => {
        async function loadUserFromCookies() {
            setLoading(true)
            const token = localStorage.getItem('token')
            try {
                if (token != null) {
                    api.defaults.headers.Authorization = `Bearer ${token}`
                    const response = await api.post('/user/loginToken')
                    const { data } = response;
                    const { userData, getPhoto, notificationsData } = data;

                    if (userData) {
                        setUser({ ...userData, getPhoto })
                        setUserPermissions(userData?.permissoes)
                        setNotificationUser(notificationsData)
                        setPermissionTop15(groupArea?.filter(i => i.value === userData?.area)?.length > 0)
                    }
                    else logout();
                }
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
            }
        }
        loadUserFromCookies()
    }, [])

    const login = async ({ email, senha }: Login) => {
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
                const { userData, getPhoto, notificationsData } = data;
                localStorage.setItem('token', userData?.token);
                api.defaults.headers.Authorization = `Bearer ${userData?.token}`
                setUser({ ...userData, getPhoto });
                setNotificationUser(notificationsData)
                setPermissionTop15(groupArea?.filter(i => i.value === userData?.area)?.length > 0)
                return response
            }
            return response
        } catch (error) {
            console.log(error)
            return false
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        try {
            localStorage.removeItem('token')
            setUser(null)
            delete api.defaults.headers.Authorization
        } catch (error) {
            return error
        }
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


    const checkTokenExpiration = () => {
        const token = localStorage.getItem('token');

        if (token != null) {
            try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                const expirationTime = tokenPayload.exp * 1000; // em milissegundos
                const currentTime = new Date().getTime();
                const timeUntilExpiration = expirationTime - currentTime;
                const notificationThreshold = 5 * 60 * 1000;

                if (timeUntilExpiration < 0) {
                    logout();
                    alert.info('Sua sessão expirou. Faça login novamente.');
                } else if (timeUntilExpiration < notificationThreshold) {
                    alert.info('Seu token está prestes a expirar. Faça login novamente.');
                }
            } catch (error) {
                console.error('Erro ao decodificar o token:', error);
                return error
            }
        }
    };
    useEffect(() => {
        checkTokenExpiration();

        // Adicione um listener para mudanças de rota
        const handleRouteChange = () => {
            checkTokenExpiration();
        };

        // Adicione o listener
        router.events.on('routeChangeStart', handleRouteChange);

        // Remova o listener quando o componente for desmontado
        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        };
    }, []);



    useEffect(() => {
        colorsThem();
    }, [theme])


    useEffect(() => {
        const handleMenuItems = async () => {
            try {
                const response = await api.get(`/menuItems`)
                const { data } = response
                if (response.status === 200) {
                    setMenuItemsList(data)
                }
            } catch (error) {
                console.log(error)
                return error
            }
        }
        handleMenuItems()
    }, [])



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
                latestVersionNumber,
                latestVersion,
                menuItemsList,
                showVersion,
                setShowVersion,
                permissionTop15
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
                title={showConfirmationDialog.title}
                message={showConfirmationDialog.message}
                acceptAction={showConfirmationDialog.acceptAction}
                closeDialog={() => setShowConfirmationDialog({ active: false })}
                colorPalette={colorPalette}
                theme={theme}
            />
            <UpdateVersion
                user={user}
                showVersion={showVersion}
                setShowVersion={setShowVersion}
                latestVersion={latestVersion}
                colorPalette={colorPalette}
                theme={theme}
                setUser={setUser} />
        </AppContext.Provider>
    )
}

export const UpdateVersion = ({ user, showVersion, setShowVersion, latestVersion, colorPalette, setUser, theme }: any) => {

    const handleAttMsgVersion = async () => {
        try {
            const response = await api.patch(`/user/notificationVersion/false/${user?.id}`)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    return (
        <Backdrop open={showVersion || user?.at_versao === 0} sx={{ zIndex: 999 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600, maxHeight: 800, overflow: 'auto' }}>
                <ContentContainer>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Text large bold>Atualização de Versão</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => {
                            setShowVersion(false)
                            if (user?.at_versao === 0) {
                                handleAttMsgVersion()
                                setUser({ ...user, at_versao: 1 })
                            }
                        }} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', marginTop: 2 }}>
                        <Text bold>Versão em produção - {latestVersion?.version} ({latestVersion?.build})</Text>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                            <Text bold>Alterações realizadas</Text>
                            <Text>{latestVersion?.msg}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                            <Text bold>Algumas mudanças:</Text>

                            {latestVersion?.listChanges?.map((item: any, index: number) => {
                                return (
                                    <Box key={index} sx={{
                                        display: 'flex', gap: 1, color: 'rgb(75 85 99)', "&:hover": {
                                            opacity: 0.8,
                                            transform: 'scale(1.1)',
                                            transition: '.5s',
                                            color: colorPalette.buttonColor,
                                            fontWeight: 'bold'
                                        },
                                        marginTop: 1
                                    }}>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            aspectRatio: '1/1',
                                            backgroundImage: `url('/icons/topic_icon.png')`,
                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                            transition: '.3s',
                                        }} />
                                        <Text small bold style={{ color: 'inherit', fontWeight: 'inherit' }}>{item?.change}</Text>
                                    </Box>
                                )
                            })}
                        </Box>
                    </Box>
                </ContentContainer>
            </Box>

        </Backdrop>
    )
}

interface ConfirmationModal {
    active: boolean
    title: string,
    message: string | null,
    acceptAction: any,
    closeDialog: any,
    colorPalette: ColorPalette | null,
    theme: boolean
}

export const ConfirmationModal = (props: ConfirmationModal) => {

    const {
        active,
        title = 'Deseja prosseguir?',
        message,
        acceptAction,
        closeDialog,
        colorPalette,
        theme
    } = props;

    const [position, setPosition] = useState({});

    useEffect(() => {
        const calculatePosition = () => {
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const modalWidth = 300;
            const modalHeight = 150;
            const left = (screenWidth - modalWidth) / 2;
            const top = (screenHeight - modalHeight) / 2;

            setPosition({ left, top });
        };

        if (active) {
            calculatePosition();
        }
    }, [active]);


    return (
        <Backdrop open={active} sx={{ zIndex: 9999999 }}>
            <Box sx={{
                ...styles.confirmationContainer,
                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                backgroundColor: colorPalette?.secondary, border: `1px solid ${theme ? '#eaeaea' : '#404040'}`, ...position, zIndex: 999999
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text large bold='true'>{title}</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_close})`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={closeDialog} />
                </Box>
                <Divider distance={0} />
                {message && (
                    <Box>
                        <Text>{message}</Text>
                    </Box>
                )}
                <Divider distance={0} />
                <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
                    <Button small='true' text='Prosseguir' style={{ height: 30, width: '100%' }} onClick={() => {
                        closeDialog();
                        acceptAction();
                    }} />
                    <Button small='true' secondary='true' style={{ height: 30, width: '100%' }} text='Cancelar' onClick={closeDialog} />
                </Box>
            </Box>
        </Backdrop>
    );
}

type SetAlertData = (alertData: AlertData) => void;

class ShowAlert {

    private setAlertData: SetAlertData

    constructor(setAlertData: SetAlertData) {
        this.setAlertData = setAlertData
    }

    success(message: string = '',) {
        this.setAlertData({
            active: true,
            type: 'success',
            title: 'Tudo certo',
            message
        })
    }

    error(message: string = '') {
        this.setAlertData({
            active: true,
            type: 'error',
            title: 'Houve um problema',
            message
        })
    }

    info(title: string = '', message: string = '') {
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
        padding: `25px`,
        gap: 2,
        maxWidth: MAX_CONFIRMATION_DIALOG_WITH,
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 14,
        height: 14,
    },
}

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};