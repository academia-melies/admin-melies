import { useRouter } from "next/router";
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../../atoms";
import { TextLine } from "../../../../../organisms/contractStudent/contractStudent";
import { useAppContext } from "../../../../../context/AppContext";
import { api } from "../../../../../api/api";
import { useEffect, useRef, useState } from "react";
import { formatTimeStamp } from "../../../../../helpers";
import { CheckBoxComponent, DeclarationPayment, SectionHeader } from "../../../../../organisms";
import { icons } from "../../../../../organisms/layout/Colors";
import { Backdrop } from "@mui/material";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

export default function StuatusPayment() {
    const router = useRouter();
    const { id, enrollmentId } = router.query;
    const { setLoading, colorPalette, alert, theme } = useAppContext()
    const [userData, setUserData] = useState({})
    const [enrollmentData, setEnrollmentData] = useState({})
    const [responsiblePayerData, setResponsiblePayerData] = useState({})
    const [installmentsData, setInstallmentsData] = useState([])
    const [showDeclatation, setShowDeclaration] = useState({
        filterDate: false,
        paymentVoucher: false
    })
    const [filterDate, setfilterDate] = useState({
        firstDate: '',
        endDate: ''
    })
    const [groupStates, setGroupStates] = useState([]);

    useEffect(() => {
        const popUps = [
            { id: 1, generate: false },
            { id: 2, sendEmail: false },
        ];
        setGroupStates(popUps.map(() => ({ generate: false, sendEmail: false })));
    }, []);

    const handleGroupMouseEnter = (index, field) => {
        setTimeout(() => {
            setGroupStates((prevGroupStates) => {
                const newGroupStates = [...prevGroupStates];

                // Certifique-se de que newGroupStates[index] seja um objeto
                if (!newGroupStates[index]) {
                    newGroupStates[index] = {};
                }

                newGroupStates[index][field] = true;
                return newGroupStates;
            });
        }, 300);
    };

    const handleGroupMouseLeave = (index, field) => {
        setTimeout(() => {
            setGroupStates((prevGroupStates) => {
                const newGroupStates = [...prevGroupStates];

                // Certifique-se de que newGroupStates[index] seja um objeto
                if (!newGroupStates[index]) {
                    newGroupStates[index] = {};
                }

                newGroupStates[index][field] = false;
                return newGroupStates;
            });
        }, 300);
    };
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
        (data === 'Erro com o pagamento' && 'red') ||
        (data === 'Estornada' && '#f0f0f0'))


    let nameContract = ``;
    if (enrollmentData?.nome_curso) nameContract += `${enrollmentData?.nome_curso}_`;
    if (enrollmentData?.modalidade_curso) nameContract += `${enrollmentData?.modalidade_curso}`;
    if (enrollmentData?.nome_turma) nameContract += ` (${enrollmentData?.nome_turma}-1SEM)`;


    const emitirBoleto = async (item) => {
        try {
            setLoading(true)
            if (item?.link_pdf) {
                const response = await api.get(`/student/installment/generate/pdf?linkPdf=${item?.link_pdf}`)
                const { pdfData } = response.data;

                // Convertendo a string base64 de volta para um arraybuffer
                const pdfBlob = new Blob([Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);

                // Abra o link do boleto (PDF) em uma nova janela
                window.open(pdfUrl, '_blank');
            } else {
                alert.error('O arquivo não possui pdf.')
                return
            }

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const sendEmailBoleto = async (item) => {
        try {
            setLoading(true)
            if (item?.link_pdf) {
                const response = await api.post(`/student/installment/sendEmail/boleto?linkPdf=${item?.link_pdf}`)
                if (response.status === 200) {
                    alert.success('Email enviado com sucesso.')
                    return
                }
            } else {
                alert.error('O arquivo não possui pdf.')
                return
            }
            alert.error('Ocorreu um erro ao enviar email.')
            return
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }



    return (
        <>
            <SectionHeader
                perfil={userData?.nome || 'situacão'}
                title={'Situação de Pagamento'}
            />

            <Box sx={{ gap: 2, display: 'flex', flexDirection: 'column' }}>
                <ContentContainer style={{ maxWidth: '1200px', }}>
                    <Box>
                        <TextLine label="Aluno" data={userData?.nome} />
                        <TextLine label="Curso:" data={enrollmentData?.nome_curso} />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Turma:" data={enrollmentData?.nome_turma} />
                            <TextLine label="Periodo:" data={enrollmentData?.periodo} />
                            <TextLine label="Inicio:" data={formatTimeStamp(enrollmentData?.dt_inicio)} />
                            <TextLine label="Final:" data={formatTimeStamp(enrollmentData?.dt_final)} />
                        </Box>
                    </Box>
                </ContentContainer>
                <ContentContainer style={{ maxWidth: '1200px', }}>
                    <Box>
                        <TextLine label="Nome completo:" data={userData?.nome} />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Sexo:" data={userData?.genero} />
                            <TextLine label="Data do nascimento:" data={formatTimeStamp(userData?.nascimento)} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="RG:" data={userData?.rg} />
                            <TextLine label="CPF:" data={userData?.cpf} />
                            <TextLine label="Naturalidade:" data={userData?.naturalidade} />
                        </Box>
                        <TextLine label="Endereço:" data={userData?.rua} />
                        <Box sx={styles.containerValues}>
                            <TextLine label="Número:" data={userData?.numero} />
                            <TextLine label="Complemento:" data={userData?.complemento} />
                            <TextLine label="Bairro:" data={userData?.bairro} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="CEP:" data={userData?.cep} />
                            <TextLine label="Cidade:" data={userData?.cidade} />
                            <TextLine label="Estado:" data={userData?.uf} />
                        </Box>
                        <Box sx={styles.containerValues}>
                            <TextLine label="Tel. residencial:" data={''} />
                            <TextLine label="Celular:" data={userData?.telefone} />
                        </Box>
                        <TextLine label="E-mail:" data={userData?.email} />
                        <Box sx={{ flex: 1, marginTop: 5 }}>
                            <Box sx={{ backgroundColor: colorPalette.buttonColor, flex: 1 }}>
                                <TextLine label="Dados do(a) Responsável / Empresa / Pagante" style={{ title: { color: '#fff' } }} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextLine label="Empresa/Nome do Resp:" data={responsiblePayerData.nome_resp || ''} />
                                <TextLine label="Endereço:" data={responsiblePayerData.end_resp || userData?.rua} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextLine label="Número:" data={responsiblePayerData.numero_resp || userData?.numero} />
                                <TextLine label="CEP:" data={responsiblePayerData.cep_resp || userData?.cep} />
                                <TextLine label="Complemento:" data={responsiblePayerData.compl_resp || userData?.complemento} />
                            </Box>
                            <Box sx={styles.containerValues}>
                                <TextLine label="Bairro:" data={responsiblePayerData.bairro_resp || userData?.bairro} />
                                <TextLine label="Cidade:" data={responsiblePayerData.cidade_resp || userData?.cidade} />
                                <TextLine label="Estado:" data={responsiblePayerData.estado_resp || userData?.uf} />
                                <TextLine label="País:" data={responsiblePayerData.pais_resp || ''} />
                            </Box>
                            <TextLine label="E-mail:" data={responsiblePayerData.email_resp || userData?.email} />
                            <Box sx={styles.containerValues}>
                                <TextLine label="Telefone:" data={responsiblePayerData.telefone_resp || userData?.telefone} />
                                <TextLine label="CPF / CNPJ:" data={responsiblePayerData.cpf_resp || userData?.cpf} />
                                <TextLine label="RG:" data={responsiblePayerData.rg_resp || userData?.rg} />
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
                                            <th style={{ padding: '8px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Protestada?</th>
                                            <th style={{ padding: '8px 8px', fontSize: '14px', fontFamily: 'MetropolisBold' }}>PDF</th>
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
                                                    <td style={{ padding: '5px 5px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center', flex: 1, }}>
                                                            {item?.forma_pagamento === 'Boleto' ?
                                                                <>
                                                                    <Box sx={{ position: 'relative', display: 'flex' }}
                                                                        onMouseEnter={() => handleGroupMouseEnter(index, 'generate')}
                                                                        onMouseLeave={() => handleGroupMouseLeave(index, 'generate')}>
                                                                        <Box sx={{
                                                                            ...styles.menuIcon,
                                                                            backgroundImage: `url('/icons/boleto_icon.png')`,
                                                                            transition: '.3s',
                                                                            width: 30, height: 'auto', aspectRatio: '1/1',
                                                                            "&:hover": {
                                                                                opacity: 0.8,
                                                                                cursor: 'pointer'
                                                                            }
                                                                        }} onClick={() => emitirBoleto(item)} />
                                                                        {groupStates[index]?.generate &&
                                                                            <Box sx={{
                                                                                position: 'absolute',
                                                                                top: 10,
                                                                                width: 'auto',
                                                                                borderRadius: 2,
                                                                                right: 30,
                                                                                padding: '5px 10px',
                                                                                backgroundColor: colorPalette.secondary,
                                                                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                            }}>
                                                                                <Text xsmall bold>Emitir boleto</Text>
                                                                            </Box>
                                                                        }
                                                                    </Box>
                                                                    <Box sx={{ position: 'relative', display: 'flex' }}
                                                                        onMouseEnter={() => handleGroupMouseEnter(index, 'sendEmail')}
                                                                        onMouseLeave={() => handleGroupMouseLeave(index, 'sendEmail')}>
                                                                        <Box sx={{
                                                                            ...styles.menuIcon,
                                                                            width: 22,
                                                                            height: 22,
                                                                            backgroundImage: `url('${icons.send}')`,
                                                                            transition: '.3s',
                                                                            "&:hover": {
                                                                                opacity: 0.8,
                                                                                cursor: 'pointer'
                                                                            }
                                                                        }} onClick={() => sendEmailBoleto(item)}/>
                                                                        {groupStates[index]?.sendEmail &&
                                                                            <Box sx={{
                                                                                position: 'absolute',
                                                                                zIndex: 999,
                                                                                top: 10,
                                                                                minWidth: '120px',
                                                                                borderRadius: 2,
                                                                                right: 30,
                                                                                padding: '5px 10px',
                                                                                backgroundColor: colorPalette.secondary,
                                                                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                            }}>
                                                                                <Text xsmall bold>Enviar por e-mail</Text>
                                                                            </Box>
                                                                        }
                                                                    </Box>
                                                                </>
                                                                : <Text>-</Text>}
                                                        </Box>
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
                                }} onClick={() => setShowDeclaration({ ...showDeclatation, filterDate: true })} />
                                <Text bold>Declaração de pagamento</Text>
                            </Box>
                        </>
                        :
                        <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                            <Text bold>Não existem parcelas a receber</Text>
                        </Box>
                    }
                </ContentContainer>
            </Box >

            <Backdrop open={showDeclatation?.filterDate} sx={{ zIndex: 99999, overflow: 'auto', }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'start', width: '100%', position: 'relative' }}>
                        <Text bold>Filtre a data desejada</Text>
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
                        }} onClick={() => setShowDeclaration({ ...showDeclatation, filterDate: false })} />
                    </Box>
                    <Box sx={{ ...styles.inputSection, padding: '20px 0px' }}>
                        <Text>Periodo de</Text>
                        <TextInput name='firstDate' onChange={(e) => setfilterDate({ ...filterDate, firstDate: e.target.value })} type="date" value={(filterDate?.firstDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                        <Text>á</Text>
                        <TextInput name='endDate' onChange={(e) => setfilterDate({ ...filterDate, endDate: e.target.value })} type="date" value={(filterDate?.endDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1, gap: 1.75 }}>
                        <Button small secondary text="cancelar" onClick={() => setShowDeclaration({ ...showDeclatation, filterDate: false })} />
                        <Button style={{ opacity: (filterDate?.firstDate && filterDate?.endDate) ? 1 : 0.7 }} small text="continuar" onClick={() => {
                            if (filterDate?.firstDate && filterDate?.endDate) setShowDeclaration({ paymentVoucher: true, filterDate: false })
                        }} />
                    </Box>
                </ContentContainer>
            </Backdrop>

            <Backdrop open={showDeclatation?.paymentVoucher} sx={{ zIndex: 99999, overflow: 'auto', }}>
                <DeclarationDocument
                    contractEnrollment={nameContract}
                    userData={userData}
                    setShowDeclaration={setShowDeclaration}
                    installmentsData={installmentsData}
                    filterDate={filterDate}
                    showDeclatation={showDeclatation} />
            </Backdrop>
        </>
    )

}

const DeclarationDocument = ({ installmentsData, filterDate, contractEnrollment, userData, setShowDeclaration, showDeclatation }) => {

    const { setLoading, colorPalette, alert } = useAppContext()

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const componentPDF = useRef()

    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return date >= start && date <= end;
    }

    const installmentFiltered = installmentsData?.filter(item => (item?.status_parcela === 'Pago') || (item?.status_parcela === 'Aprovado') &&
        rangeDate(item.vencimento, filterDate?.firstDate, filterDate?.endDate))

    const totalValuePay = installmentFiltered?.map(item => item?.valor_parcela)?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);

    const handleGeneratePdf = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: `Declaração de pagamento - ${userData?.nome}`,
        onAfterPrint: () => alert.info('Comprovante exportado em PDF.')
    })


    return (
        <ContentContainer sx={{ maxWidth: { xs: 300, sm: 380, md: 650, lg: 800, xl: 1200 }, position: 'relative', overflow: 'auto', maxHeight: { xs: 300, sm: 380, md: 500, lg: 700, xl: 900 } }}>
            <Box sx={{
                ...styles.menuIcon,
                backgroundImage: `url(${icons.gray_close})`,
                transition: '.3s',
                zIndex: 999999999,
                position: 'absolute',
                top: 30, right: 30,
                "&:hover": {
                    opacity: 0.8,
                    cursor: 'pointer'
                }
            }} onClick={() => setShowDeclaration({ ...showDeclatation, paymentVoucher: false })} />
            <div ref={componentPDF}>
                <DeclarationPayment filterDate={filterDate} userData={userData} title={`Declaração de pagamento - ${userData?.nome}`} paymentValue={formatter.format(totalValuePay)} contractEnrollment={contractEnrollment}>
                    <div style={{ overflowX: 'auto', marginTop: '10px', border: `1px solid ${colorPalette.primary}` }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
                            <thead>
                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                    <th style={{ padding: '15px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Id parcela</th>
                                    <th style={{ padding: '15px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '55px' }}>Nº parc.</th>
                                    <th style={{ padding: '15px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Forma de Pagamento</th>
                                    <th style={{ padding: '15px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Vencimento</th>
                                    <th style={{ padding: '15px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Dt. Pagamento</th>
                                    <th style={{ padding: '15px 2px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1, }}>
                                {installmentFiltered?.map((item, index) => {
                                    return (
                                        <tr key={index} style={{ backgroundColor: colorPalette?.secondary }}>
                                            <td style={{ fontSize: '13px', padding: '15px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                {item?.id_parcela_matr || '-'}
                                            </td>
                                            <td style={{ fontSize: '13px', padding: '15px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                {item?.n_parcela || '(Entrada)'}
                                            </td>
                                            <td style={{ fontSize: '13px', padding: '15px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                {item?.forma_pagamento || '-'}
                                            </td>
                                            <td style={{ fontSize: '13px', padding: '15px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                {formatTimeStamp(item?.vencimento) || '-'}
                                            </td>
                                            <td style={{ fontSize: '13px', padding: '15px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                {formatTimeStamp(item?.dt_pagamento) || '-'}
                                            </td>
                                            <td style={{ fontSize: '13px', padding: '15px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                {formatter.format(item?.valor_parcela)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>
                </DeclarationPayment>
            </div>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.8, flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                <Text bold>Exportar:</Text>
                <Box sx={{
                    backgroundImage: `url('/icons/pdf_icon.png')`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    width: { xs: '30px', sm: 35, md: 35, lg: 35, xl: 35 },
                    aspectRatio: '1/1',
                    transition: '.3s',
                    "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    }
                }} onClick={handleGeneratePdf} />
            </Box>
        </ContentContainer>
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
    inputSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
}