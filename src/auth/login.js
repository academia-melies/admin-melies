import { useEffect, useState } from "react"
import { useAppContext } from "../context/AppContext"
import { emailValidator } from "../helpers"
import { Colors } from "../organisms"
import { Box, Button, ContentContainer, TextInput, Text } from "../atoms"

export default function Login() {

    const { login, alert } = useAppContext()
    const [userData, setUserData] = useState([])
    const [theme, setTheme] = useState(false)
    const [themeName, setThemeName] = useState('')

    const [windowWidth, setWindowWidth] = useState(0)
    const smallWidthDevice = windowWidth < 1000

    useEffect(() => {
        const themeAltern = theme ? setThemeName('dark') : setThemeName('clear')
        return themeAltern
    }, [theme])

    const handleLogin = async () => {
        const { email, senha } = userData

        if (!email || !emailValidator(email)) { return alert.error("O email está inválido!") }
        if (!senha || senha.length < 4) { return alert.error('A senha deve conter no mínimo 4 digitos.') }

        const data = await login({ email, senha })
        console.log(data)

        if (!data) {
            return alert.error('Usuário não encontrado ou senha incorreta. Verifique os dados e tente novamente!')
        }
    }

    const handleChange = (value) => {
        setUserData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    useEffect(() => {
        setWindowWidth(window.innerWidth)
        window.addEventListener('resize', () => setWindowWidth(window.innerWidth))
        document.title = `Admin Meliés`
        return () => window.removeEventListener('resize', () => { });
    }, [])

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme ? '#fff' : Colors.backgroundPrimary,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', height: '100%'
        }}>
            <Box sx={{
                display: 'flex',
                ...(smallWidthDevice ? { height: '90%', width: '90%' } : { height: '70%', width: '55%' })
            }}>
                <ContentContainer row fullWidth style={{ padding: 0, zIndex: 999, backgroundColor: !theme ? Colors.backgroundSecundary : '#fff', boxShadow: !theme ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px` }} gap={0}>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        // alignItems: 'center',
                        flex: 1,
                        gap: 3,
                        backgroundColor: Colors.darkBlue,
                        position: 'relative'
                    }}>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', width: smallWidthDevice ? '80%' : '100%', }}>
                            {!smallWidthDevice ? <></> : <CompanyLogo theme={theme} size={40} />}
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', width: '60%', }}>
                                <Text style={{ color: !theme ? '#fff' : Colors.backgroundPrimary, fontSize: 40, fontWeight: 'bold' }}>Login</Text>
                                <Box sx={{ backgroundColor: Colors.orange, borderRadius: 2, padding: '2px 12px 2px 12px' }}>
                                    <Text small bold style={{ color: Colors.textPrimary }}>{'Admin'}</Text>
                                </Box>
                            </Box>
                            <Box sx={{
                                display: 'flex', flexDirection: 'column', gap: 1, width: '60%', justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <TextInput
                                    label='e-mail'
                                    placeholder='email@outlook.com.br'
                                    value={userData?.email || ''}
                                    onChange={handleChange}
                                    name='email'
                                    margin='none'
                                    fullWidth
                                    InputProps={{
                                        style: {
                                            backgroundColor: !theme ?  '#ffffff33' : Colors.background,
                                            border: "none",
                                            color: !theme ?  '#ffffffbb' : Colors.backgroundPrimary,
                                            outline: 'none'
                                        }
                                    }}
                                    InputLabelProps={{
                                        style: {
                                            color: !theme ? '#fff' : Colors.backgroundPrimary,
                                        }
                                    }}
                                />
                                <TextInput
                                    placeholder='******'
                                    label='senha'
                                    colorLabel={'#fff'}
                                    value={userData.senha || ''}
                                    onChange={handleChange}
                                    name='senha'
                                    type="password"
                                    margin='none'
                                    fullWidth
                                    InputProps={{
                                        style: {
                                            backgroundColor: !theme ?  '#ffffff33' : Colors.background,
                                            color: !theme ?  '#ffffffbb' : Colors.backgroundPrimary,
                                            outline: 'none',
                                            border: "none",
                                        }
                                    }}
                                    InputLabelProps={{
                                        style: {
                                            color: !theme ? '#fff' : Colors.backgroundPrimary,
                                        }
                                    }}
                                />
                            </Box>
                            <Button
                                style={{ width: '60%', padding: '12px 20px', marginBottom: 5 }}
                                text='Entrar'
                                onClick={handleLogin}
                            />
                        </Box>
                        {smallWidthDevice ? <></> : <Box sx={styles.favicon} />}
                    </Box>
                    {smallWidthDevice ? <></> : <CompanyLogo theme={theme} size={14} />}
                </ContentContainer>
            </Box>
            <Box sx={{
                display: 'flex',
                position: 'absolute',
                backgroundColor: !theme ? '#fff' : Colors.backgroundPrimary,
                top: 20,
                left: 20,
                padding: '5px 20px',
                borderRadius: '5px',
                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                "&:hover": {
                    opacity: 0.8,
                    cursor: 'pointer'
                }
            }} onClick={() => setTheme(!theme)}>
                <Text bold style={{ color: theme ? '#fff' : Colors.backgroundPrimary }}>{themeName}</Text>
            </Box>
        </Box>

    )
}

const CompanyLogo = ({ size = 14, style = {}, theme = {} }) => (

    < Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: theme ? Colors.backgroundPrimary : '#fff',
        flex: 1,
        gap: 1,
        ...style
    }}>
        <img src="/favicon.svg" alt="Admin-melies" style={{ height: `${size}%`, width: 'auto', objectFit: 'contain' }} />
    </Box >
);

const styles = {
    favicon: {
        backgroundSize: 'cover',
        display: 'flex',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundImage: `url('/favicon.svg')`,
        backgroundSize: 'contain',
        width: 100,
        height: 60,
        marginLeft: 12,
        // backgroundColor: 'pink'
    },
}