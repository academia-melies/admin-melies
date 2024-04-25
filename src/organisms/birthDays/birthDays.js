import { Avatar, Backdrop } from "@mui/material"
import { Box, Text, Button, Divider, ContentContainer, TextInput } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { api } from "../../api/api"
import { useState } from "react"
import { icons } from "../layout/Colors"

export const BirthDaysMonth = (props) => {
    const { listBirthDay = [] } = props

    const { colorPalette, theme } = useAppContext()
    const [showMessageBirthDay, setShowMessageBirthDay] = useState(false)
    const [idSelected, setIdSelected] = useState()

    const nowMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
    const formattedMonth = nowMonth[0].toString().toLocaleUpperCase() + nowMonth.slice(1);

    return (
        <Box sx={{
            padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start',
            alignItems: 'start', gap: 1,
            height: 550,
            width: '100%',
            backgroundColor: colorPalette?.secondary,
            borderRadius: 2,
            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
        }}>
            <Text large bold style={{ textAlign: 'center' }}>Aniversariantes de {formattedMonth} 🎉🎉</Text>
            <Divider />
            <Box sx={{
                display: 'flex', justifyContent: 'center', width: '100%', overflowY: 'auto',
            }}>
                {listBirthDay.length > 0 ?
                    <Box sx={{ borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: 1, }}>
                        {listBirthDay?.map((item, index) => {
                            const date = item?.nascimento?.split('T')[0]
                            const day = date?.split('-')[2]
                            const month = date?.split('-')[1]
                            const functionFormatted = item?.funcao.split(' ')[0][0].toUpperCase()
                            const restoNome = item?.funcao.slice(1)
                            const totalName = `${functionFormatted}${restoNome}`
                            const partsName = item?.nome?.split(' ')
                            const firstName = partsName[0]
                            const lastName = partsName[partsName?.length - 1]
                            return (
                                <Box key={index} sx={{
                                    display: 'flex',
                                    backgroundColor: colorPalette?.primary,
                                    position: 'relative',
                                    boxShadow: 'none',
                                    alignItems: 'center', width: '100%', padding: '10px',
                                    borderRadius: 2,
                                    gap: 2
                                }}>
                                    <Box sx={{
                                        display: 'flex', borderRadius: 35, backgroundColor: colorPalette?.buttonColor,
                                        height: { xs: 30, sm: 35, md: 35, lg: 35 },
                                        width: { xs: 30, sm: 35, md: 35, lg: 35 },
                                        padding: '5px 5px', position: 'absolute', alignItems: 'center', justifyContent: 'center', top: -1, left: 2, zIndex: 999
                                    }}>
                                        <Text bold xsmall style={{ color: '#fff' }}>{day}/{month}</Text>
                                    </Box>
                                    <Avatar src={item?.location} sx={{
                                        height: { xs: 40, sm: 65, md: 65, lg: 65 },
                                        width: { xs: 40, sm: 65, md: 65, lg: 65 },
                                    }} variant="circular"
                                    />
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text light bold>{firstName} {lastName}</Text>
                                            <Text light small>{totalName || 'Nenhum(a)'}</Text>
                                        </Box>
                                    </Box>
                                    <Box key={index} sx={{ display: 'flex', position: 'absolute', right: 5, bottom: 10 }}>
                                        <Button small secondary text="Parabenizar" style={{ backgroundColor: colorPalette?.secondary }} onClick={() => {
                                            setIdSelected(item?.id)
                                            setShowMessageBirthDay(true)
                                        }} />
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                    :
                    <Box sx={{ backgroundColor: colorPalette.secondary, padding: '5px 10px' }}>
                        <Text >Não existem aniversáriantes nesse mês</Text>
                    </Box>
                }
            </Box>
            <Backdrop open={showMessageBirthDay} sx={{ zIndex: 9999 }}>
                <BirthDateDiaog idSelected={idSelected} setShowMessageBirthDay={setShowMessageBirthDay} userBirthDay={listBirthDay} />
            </Backdrop>
        </Box>
    )
}


const BirthDateDiaog = ({ idSelected, setShowMessageBirthDay, userBirthDay }) => {

    const { user, colorPalette, theme, setLoading, alert } = useAppContext()

    const [message, setMessage] = useState('')
    const nameBirthDay = userBirthDay?.filter(item => item.id === idSelected).map(item => item.nome)

    const handlePushNotification = async (id) => {
        setLoading(true)
        try {
            const notificationData = {
                titulo: `Parabéns!!`,
                menssagem: message,
                vizualizado: 0,
                usuario_env: user?.id
            }
            const response = await api.post(`/notification/create/${id}`, { notificationData })
            if (response.status === 201) {
                alert.success('Mensagem de parabéns enviada!')
                setShowMessageBirthDay(false)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    return (

        <ContentContainer style={{ position: 'relative', width: 415, maxHeight: 600, overflowY: 'auto', padding: 4, display: 'flex', flexDirection: 'column' }}>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'start', width: '100%', position: 'relative' }}>
                <Text bold>Escreva uma mensagem de aniversário</Text>
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
                }} onClick={() => setShowMessageBirthDay(false)} />
            </Box>

            <Box sx={{ width: '100%', height: '1px', backgroundColor: '#eaeaea', margin: '0px 0px 20px 0px' }} />

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'start', flex: 1 }}>
                <Text style={{ whiteSpace: 'nowrap' }}>Escreva sua mensagem de aniversário para</Text>
                <Text style={{ whiteSpace: 'nowrap' }} bold>{nameBirthDay},</Text>
                <Text style={{ whiteSpace: 'nowrap' }}>ou envie mensagens pré-montadas!</Text>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.75, }}>
                <TextInput
                    placeholder='Feliz aniversário!'
                    name='message'
                    onChange={(e) => setMessage(e.target.value)}
                    value={message || ''}
                    multiline
                    maxRows={6}
                    rows={3}
                    sx={{ flex: 1, }}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Text bold xsmall>Mensagens pré-montadas:</Text>
                <Box sx={{
                    display: 'flex', padding: '5px 15px', border: `1px solid ${colorPalette?.buttonColor}`, alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }}
                    onClick={() => setMessage(`Feliz aniversário, ${nameBirthDay}. Te desejo muitas felicidades no seu dia!`)}>
                    <Text xsmall>Feliz aniversário, {nameBirthDay}. Te desejo muitas felicidades no seu dia!</Text>
                </Box>
                <Box sx={{
                    display: 'flex', padding: '5px 15px', border: `1px solid ${colorPalette?.buttonColor}`, alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }}
                    onClick={() => setMessage(`Parabéns, ${nameBirthDay}!`)}>
                    <Text xsmall>Parabéns, {nameBirthDay}!</Text>
                </Box>
            </Box>
            <Divider distance={0} />
            <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 1, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button small text="Enviar" style={{ height: 30, width: 80 }} onClick={() => handlePushNotification(idSelected)} />
                    <Button secondary small text="Apagar" style={{ height: 30, width: 80 }} onClick={() => setMessage('')} />
                </Box>
            </Box>

        </ContentContainer>
    )
}


const styles = {
    icon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: '15px',
        height: '15px',
        marginRight: '0px',
        backgroundImage: `url('/favicon.svg')`,
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,

    },
}