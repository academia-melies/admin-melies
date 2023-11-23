import { useRouter } from "next/router";
import { Box, Button, ContentContainer, Divider, Text } from "../../../../../atoms";
import { TextInput } from "../../../../../organisms/contractStudent/contractStudent";
import { useAppContext } from "../../../../../context/AppContext";
import { api } from "../../../../../api/api";
import { useEffect, useState } from "react";
import { formatTimeStamp } from "../../../../../helpers";
import { CheckBoxComponent, SectionHeader } from "../../../../../organisms";
import { icons } from "../../../../../organisms/layout/Colors";

export default function StuatusPayment() {
    const router = useRouter();
    const { id, enrollmentId } = router.query;
    const { setLoading, colorPalette } = useAppContext()
    const [userData, setUserData] = useState({})
    const [enrollmentData, setEnrollmentData] = useState({})
    const [responsiblePayerData, setResponsiblePayerData] = useState({})
    const [installmentsData, setInstallmentsData] = useState([])

    const handleUser = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            if (response?.status === 200) {
                setUserData(data?.response)
                return data
            }
        } catch (error) {
            return error
        }
    }


    const handleEnrollment = async () => {
        try {
            const response = await api.get(`/student/enrrolment/${enrollmentId}`)
            const { data } = response
            if (response?.status === 200) {
                setEnrollmentData(data)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleReponsiblePayment = async () => {
        try {
            const response = await api.get(`/responsible/${id}`)
            const { data } = response
            if (response?.status === 200) {
                setResponsiblePayerData(data)
            }
        } catch (error) {
            return error
        }
    }

    const handleInstallmentEnrollment = async () => {
        try {
            const response = await api.get(`/student/installment/enrollment/${enrollmentId}`)
            const { data } = response
            if (response?.status === 200) {
                setInstallmentsData(data)
            }
        } catch (error) {
            return error
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const user = await handleUser()
            if (user) {
                await handleEnrollment()
                await handleReponsiblePayment()
                await handleInstallmentEnrollment()
            }
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleItems()
    }, [])


    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Estornada' && '#f0f0f0'))


    return (
        <>
            <SectionHeader
                perfil={userData?.nome || 'situacão'}
                title={'Situação de Pagamento'}
            />

            <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                <ContentContainer style={{ maxWidth: '1200px', }}>
                    <Box>
                        <TextInput label="Aluno" data={userData?.nome} />
                        <TextInput label="Curso:" data={enrollmentData?.nome_curso} />
                        <Box sx={styles.containerValues}>
                            <TextInput label="Turma:" data={enrollmentData?.nome_turma} />
                            <TextInput label="Periodo:" data={enrollmentData?.periodo} />
                            <TextInput label="Inicio:" data={formatTimeStamp(enrollmentData?.dt_inicio)} />
                            <TextInput label="Final:" data={formatTimeStamp(enrollmentData?.dt_final)} />
                        </Box>
                    </Box>
                </ContentContainer>
                <ContentContainer style={{ maxWidth: '1200px', }}>
                    <Box>
                        <TextInput label="Nome completo:" data={userData?.nome} />
                        <Box sx={styles.containerValues}>
                            <TextInput label="Sexo:" data={userData?.genero} />
                            <TextInput label="Data do nascimento:" data={formatTimeStamp(userData?.nascimento)} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextInput label="RG:" data={userData?.rg} />
                            <TextInput label="CPF:" data={userData?.cpf} />
                            <TextInput label="Naturalidade:" data={userData?.naturalidade} />
                        </Box>
                        <TextInput label="Endereço:" data={userData?.rua} />
                        <Box sx={styles.containerValues}>
                            <TextInput label="Número:" data={userData?.numero} />
                            <TextInput label="Complemento:" data={userData?.complemento} />
                            <TextInput label="Bairro:" data={userData?.bairro} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextInput label="CEP:" data={userData?.cep} />
                            <TextInput label="Cidade:" data={userData?.cidade} />
                            <TextInput label="Estado:" data={userData?.uf} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextInput label="Tel. residencial:" data={''} />
                            <TextInput label="Celular:" data={userData?.telefone} />
                        </Box>
                        <TextInput label="E-mail:" data={userData?.email} />
                        <Box sx={{ flex: 1, marginTop: 5 }}>
                            <Box sx={{ backgroundColor: colorPalette.buttonColor, flex: 1 }}>
                                <TextInput label="Dados do(a) Responsável / Empresa / Pagante" style={{ title: { color: '#fff' } }} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextInput label="Empresa/Nome do Resp:" data={responsiblePayerData.nome_resp || ''} />
                                <TextInput label="Endereço:" data={responsiblePayerData.end_resp || userData?.rua} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextInput label="Número:" data={responsiblePayerData.numero_resp || userData?.numero} />
                                <TextInput label="CEP:" data={responsiblePayerData.cep_resp || userData?.cep} />
                                <TextInput label="Complemento:" data={responsiblePayerData.compl_resp || userData?.complemento} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextInput label="Bairro:" data={responsiblePayerData.bairro_resp || userData?.bairro} />
                                <TextInput label="Cidade:" data={responsiblePayerData.cidade_resp || userData?.cidade} />
                                <TextInput label="Estado:" data={responsiblePayerData.estado_resp || userData?.uf} />
                                <TextInput label="País:" data={responsiblePayerData.pais_resp || ''} />
                            </Box>
                            <TextInput label="E-mail:" data={responsiblePayerData.email_resp || userData?.email} />
                            <Box sx={styles.containerValues}>
                                <TextInput label="Telefone:" data={responsiblePayerData.telefone_resp || userData?.telefone} />
                                <TextInput label="CPF / CNPJ:" data={responsiblePayerData.cpf_resp || userData?.cpf} />
                                <TextInput label="RG:" data={responsiblePayerData.rg_resp || userData?.rg} />
                            </Box>
                        </Box>
                    </Box>
                </ContentContainer>
                <ContentContainer style={{ maxWidth: '1200px', }}>
                    <Text large bold>Dados do pagamento</Text>
                    <Box sx={{ display: 'flex', gap: 1, height: 30 }}>
                        <Button small text="Lançar nova parcela" style={{ width: 180, height: '30px', borderRadius: '6px' }} />
                        <Button small secondary text="Crédito do aluno" style={{ width: 180, height: '30px', borderRadius: '6px' }} />
                        <Button small secondary text="Financiamento curso" style={{ width: 180, height: '30px', borderRadius: '6px' }} />
                    </Box>
                    {installmentsData?.length > 0 ?
                        <>

                            <div style={{ borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap', border: `1px solid ${colorPalette.textColor}` }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Id parcela</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '55px' }}>Nº parc.</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Forma de Pagamento</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Dt. Vencimento</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Dt. Pagamento</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Pagante</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Valor</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Obs</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Status parcela</th>
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '180px' }}>Protestada?</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ flex: 1, }}>
                                        {installmentsData?.map((item, index) => {
                                            return (
                                                <tr key={index} style={{ backgroundColor: colorPalette?.secondary }}>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.id_parcela_matr || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.n_parcela || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.forma_pagamento || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {formatTimeStamp(item?.vencimento)}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {formatTimeStamp(item?.dt_pagamento) || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.pagante || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {formatter.format(item?.valor_parcela)}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.obs_pagamento || '-'}
                                                    </td>
                                                    <td style={{ fontSize: '13px', flex: 1, padding: '5px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                height: 30,
                                                                backgroundColor: colorPalette.primary,
                                                                gap: 2,
                                                                alignItems: 'center',
                                                                width: 100,
                                                                borderRadius: 2,
                                                                justifyContent: 'start',

                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.status_parcela), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                            <Text small bold>{item?.status_parcela || ''}</Text>
                                                        </Box>
                                                    </td>
                                                    <td style={{ fontSize: '13px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        {item?.parc_protestada === 1 ? 'Sim' : 'Não'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                </table>
                            </div>

                            <Divider />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start', alignItems: 'end' }}>
                                <Text bold>Valor do contrato: </Text>
                                <Text large>{formatter.format(enrollmentData?.valor_matricula)}</Text>
                            </Box>
                            <Divider />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'start' }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url('${icons.file}')`,
                                    transition: '.3s',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} />
                                <Text bold>Declaração de pagamento</Text>
                            </Box>
                        </>
                        :
                        <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                            <Text bold>Não existem parcelas a receber</Text>
                        </Box>
                    }
                </ContentContainer>
            </Box>
        </>
    )

}

export const styles = {
    containerValues: {
        display: 'flex', flexDirection: 'row', flex: 1
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
}