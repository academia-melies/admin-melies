import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../../../../atoms"
import { useAppContext } from "../../../../../context/AppContext"
import { icons } from "../../../../../organisms/layout/Colors"
import Cards from 'react-credit-cards'
import { api } from "../../../../../api/api"
import { CircularProgress } from "@mui/material"

interface PaymentsPreferenceProps {
    id: string | number
}

interface CreditCard {
    dt_expiracao: string | null
    numero_cartao: string | null,
    nome_cartao: string | null,
}

interface ApiCreditCard {
    primeiros_numeros: string;
    ultimos_numeros: string;
    nome_cartao: string;
    dt_expiracao: string;
}

interface ResponsiblePayerData {
    id_resp_pag: string | null,
    usuario_id: string | null,
    uf_resp: string | null,
    nome_resp: string | null,
    end_resp: string | null,
    numero_resp: string | null,
    cep_resp: string | null,
    compl_resp: string | null,
    bairro_resp: string | null,
    cidade_resp: string | null,
    estado_resp: string | null,
    pais_resp: string | null,
    email_resp: string | null,
    telefone_resp: string | null,
    cpf_resp: string | null,
    rg_resp: string | null,
    usuario_resp: string | null
}

const PaymentsPreference = ({ id }: PaymentsPreferenceProps) => {
    const [responsiblePayerData, setResponsiblePayerData] = useState<ResponsiblePayerData>({
        id_resp_pag: null,
        usuario_id: null,
        uf_resp: null,
        nome_resp: null,
        end_resp: null,
        numero_resp: null,
        cep_resp: null,
        compl_resp: null,
        bairro_resp: null,
        cidade_resp: null,
        estado_resp: null,
        pais_resp: null,
        email_resp: null,
        telefone_resp: null,
        cpf_resp: null,
        rg_resp: null,
        usuario_resp: null
    })
    const [creditCards, setCreditCards] = useState<CreditCard[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const { colorPalette, theme } = useAppContext()


    const handleResponsible = async () => {
        try {
            const response = await api.get(`/responsible/${id}`)
            const { data } = response
            if (data) {
                setResponsiblePayerData(data)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const handlePaymentsProfile = async () => {
        try {
            const response = await api.get<{ success: boolean; crediCards: ApiCreditCard[] }>(`/order/paymentProfile/list/${id}`)
            const { success } = response?.data
            if (success) {
                const { crediCards } = response?.data
                const groupPaymentsPerfil = crediCards?.map(item => ({
                    numero_cartao: `${item?.primeiros_numeros} XXXX XXXX ${item?.ultimos_numeros}`,
                    nome_cartao: item?.nome_cartao,
                    dt_expiracao: item?.dt_expiracao,
                }))

                const removeDuplicateCards = (cards: CreditCard[]) => {
                    const seen = new Set();
                    return cards.filter(card => {
                        const duplicate = seen.has(card.numero_cartao);
                        seen.add(card.numero_cartao);
                        return !duplicate;
                    });
                };

                const uniqueCreditCards = removeDuplicateCards(groupPaymentsPerfil);
                setCreditCards(uniqueCreditCards);
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        handleResponsible()
        handlePaymentsProfile()
    }, [id])

    return (
        <Box>
            {loadingData &&
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', heigth: '100%', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                    <CircularProgress />
                </Box>}
            <Box sx={{
                display: 'flex', opacity: loadingData ? .6 : 1, gap: 2, backgroundColor: colorPalette?.secondary, flexDirection: 'column',
                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
            }}>
                <Box style={{ ...styles.containerContract, padding: '40px' }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', padding: '0px 0px 20px 0px', gap: 1,
                        justifyContent: 'space-between'
                    }}>
                        <Text title bold style={{ color: colorPalette?.buttonColor }}>Responsável Financeiro</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_arrow_down})`,
                            transition: '.3s'
                        }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', }}>
                        <Box sx={{
                            display: 'flex', gap: 3, flexDirection: 'column', padding: '20px', backgroundColor: colorPalette?.primary + '77',
                            border: `1px solid ${colorPalette?.primary}`, borderRadius: 2
                        }}>
                            <Text bold large>Dados do Responsável:</Text>
                            <Box sx={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Nome/Razão Social:</Text>
                                    <Text>{responsiblePayerData?.nome_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Telefone:</Text>
                                    <Text>{responsiblePayerData?.telefone_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />

                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>E-mail:</Text>
                                    <Text>{responsiblePayerData?.email_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />

                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>CPF/CNPJ:</Text>
                                    <Text>{responsiblePayerData?.cpf_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />

                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>RG:</Text>
                                    <Text>{responsiblePayerData?.rg_resp}</Text>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'flex', gap: 3, flexDirection: 'column', padding: '20px', backgroundColor: colorPalette?.primary + '77',
                            border: `1px solid ${colorPalette?.primary}`, borderRadius: 2
                        }}>
                            <Text bold large>Dados do Endereço:</Text>
                            <Box sx={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>CEP:</Text>
                                    <Text>{responsiblePayerData?.cep_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Endereço:</Text>
                                    <Text>{responsiblePayerData?.end_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Nº:</Text>
                                    <Text>{responsiblePayerData?.numero_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Cidade:</Text>
                                    <Text>{responsiblePayerData?.cidade_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Estado:</Text>
                                    <Text>{responsiblePayerData?.estado_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>UF:</Text>
                                    <Text>{responsiblePayerData?.uf_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Bairro:</Text>
                                    <Text>{responsiblePayerData?.bairro_resp}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', width: '1px', backgroundColor: 'lightgray', margin: '0px 5px', height: '100%' }} />
                                <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
                                    <Text bold>Complemento:</Text>
                                    <Text>{responsiblePayerData?.compl_resp}</Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {creditCards?.length > 0 &&
                    <Box style={{ ...styles.containerContract, padding: '40px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', padding: '0px 0px 20px 0px', gap: 1,
                            justifyContent: 'space-between'
                        }}>
                            <Text title bold style={{ color: colorPalette?.buttonColor }}>Métodos de Pagamento Cadastrados</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transition: '.3s'
                            }} />
                        </Box>

                        <Box sx={{
                            display: 'flex', gap: 3, padding: '20px', justifyContent: 'flex-start'
                        }}>
                            {creditCards?.map((item, index) => (
                                <Box key={index}>
                                    <Cards
                                        cvc={''}
                                        expiry={item?.dt_expiracao || ''}
                                        name={item?.nome_cartao || ''}
                                        number={item?.numero_cartao || ''}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>}
            </Box>
        </Box>
    )
}

const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    containerContract: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
    containerFile: {
        scrollbarWidth: 'thin',
        scrollbarColor: 'gray lightgray',
        '&::-webkit-scrollbar': {
            width: '5px',

        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'darkgray',
            borderRadius: '5px'
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'gray',

        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: 'gray',

        },
    }
}

export default PaymentsPreference