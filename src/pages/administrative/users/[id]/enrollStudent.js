import { useRouter } from "next/router";
import { Box, Button, ContentContainer, PhoneInputField, Text, TextInput } from "../../../../atoms";
import { api } from "../../../../api/api";
import { useRef, useEffect, useState } from "react";
import { CheckBoxComponent, CreditCard, SectionHeader, SelectList } from "../../../../organisms";
import { Backdrop, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useAppContext } from "../../../../context/AppContext";
import { useReactToPrint } from "react-to-print";
import { calculationAge, emailValidator, findCEP, formatCEP, formatCPF, formatCreditCardNumber, formatDate, formatRg, formatTimeStamp } from "../../../../helpers";
import { ContractStudentComponent } from "../../../../organisms/contractStudent/contractStudent";
import { Forbidden } from "../../../../forbiddenPage/forbiddenPage";
import Cards from 'react-credit-cards'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function InterestEnroll() {
    const router = useRouter();
    const { setLoading, user, alert } = useAppContext()
    const userId = user?.id;
    const { id, interest } = router.query;
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [interestData, setInterestData] = useState({})
    const [responsiblePayerData, setResponsiblePayerData] = useState({
        nome_resp: '',
        usuario_id: id,
        end_resp: null,
        numero_resp: null,
        cep_resp: null,
        compl_resp: '',
        bairro_resp: '',
        cidade_resp: '',
        estado_resp: '',
        pais_resp: '',
        email_resp: '',
        telefone_resp: '',
        cpf_resp: '',
        rg_resp: '',
    })
    const [disciplines, setDisciplines] = useState([])
    const [userData, setUserData] = useState({})
    const [disciplinesSelected, setDisciplinesSelected] = useState()
    const [indiceTela, setIndiceTela] = useState(0);
    const [routeScreen, setRouteScreen] = useState('interesse >')
    const [quantityDisciplinesSelected, setQuantityDisciplinesSelected] = useState(0)
    const [quantityDisciplinesModule, setQuantityDisciplinesModule] = useState(0)
    const [valuesCourse, setValuesCourse] = useState({})
    const [courseData, setCourseData] = useState({})
    const [classData, setClassData] = useState({})
    const [valuesContract, setValuesContract] = useState([])
    const [paymentsProfile, setPaymentsProfile] = useState([])
    const [paymentForm, setPaymentForm] = useState({})
    const [newPaymentProfile, setNewPaymentProfile] = useState({})
    const [emailDigitalSignature, setEmailDigitalSignature] = useState({})
    const [updatedScreen, setUpdatedScreen] = useState(false)
    const [newResponsible, setNewResponsible] = useState(true)
    const [typeDiscountAdditional, setTypeDiscountAdditional] = useState({
        porcent: true,
        real: false
    })
    const [showPaymentPerfl, setShowPaymentPerfl] = useState({
        newProfile: true,
        registeredProfile: false
    })
    const [groupPayment, setGroupPayment] = useState([]);
    const [userIsOfLegalAge, setUserIsOfLegalAge] = useState(true)
    const [paying, setPaying] = useState({
        aluno: true,
        responsible: false
    })
    const [messageEnrollment, setMessageEnrollment] = useState('Conferindo os dados...');
    const [loadingEnrollment, setLoadingEnrollment] = useState(false);
    const [enrollmentCompleted, setEnrollmentCompleted] = useState({ active: false, status: '' });
    const [checkValidateScreen, setCheckValidateScreen] = useState([
        { screen: 'first', check: true, alert: '' },
        { screen: 'secondary', check: true, alert: '' },
        { screen: 'thirdy', check: true, alert: '' },
    ])


    useEffect(() => {
        let interval;

        if (loadingEnrollment) {
            const messages = [
                'Conferindo os dados...',
                'Validando cartão...',
                'Gerando o contrato...',
                'Efetivando a matrícula...',
                'Concluído'
            ];

            let indice = 0;

            interval = setInterval(() => {
                setMessageEnrollment(messages[indice]);
                indice++;

                if (indice === messages.length) {
                    clearInterval(interval);

                    if (enrollmentCompleted?.status) {
                        let message = enrollmentCompleted?.status === 201 ? 'Concluído' : 'Ocorreu um erro';
                        setMessageEnrollment(message)
                        setEnrollmentCompleted({ ...enrollmentCompleted, active: true });
                    }

                    setTimeout(() => {
                        setLoadingEnrollment(false); // Defina loadingEnrollment como falso após um tempo
                    }, 2000);
                }
            }, 3500);
        }

        return () => clearInterval(interval);
    }, [loadingEnrollment, enrollmentCompleted]);







    const pushRouteScreen = (indice, route) => {
        setIndiceTela(indice)
        setRouteScreen(route);
        setUpdatedScreen(!updatedScreen)
    }

    const handleUserData = async () => {
        setLoading(true)
        try {
            const userDetails = await api.get(`/user/${id}`)
            const { response } = userDetails.data
            setUserData(response)

            const isOfLegalAge = await calculationAge(response?.nascimento)
            setUserIsOfLegalAge(isOfLegalAge)
            if (!isOfLegalAge) {
                alert.info('Aluno menor de idade. Por favor, cadastrar responsável pagante para prosseguir com a matrícula.')
            }
            return response
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleInterest = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/user/interest/${interest}`)
            const { data } = response
            setInterestData(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleResponsible = async () => {
        try {
            const response = await api.get(`/responsible/${id}`)
            const { data } = response
            setResponsiblePayerData(data)
            if (data) {
                setPaying({
                    aluno: false,
                    responsible: true
                })
                setNewResponsible(false)
            }
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function handleSelectModule(turma_id) {
        setLoading(true)
        try {
            const response = await api.get(`/classSchedule/disciplines/${turma_id}/1`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina.toString()
            }));

            const disciplinesSelect = groupDisciplines.map(discipline => discipline.value);
            const flattenedDisciplinesSelected = disciplinesSelect.join(', ');
            setQuantityDisciplinesModule(groupDisciplines?.length)
            setDisciplinesSelected(flattenedDisciplinesSelected)
            setDisciplines(groupDisciplines);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleValuesCourse = async (courseId) => {
        setLoading(true)
        try {
            const response = await api.get(`/coursePrices/course/historic/${courseId}`)
            const { data } = response
            setValuesCourse(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleCourseData = async (id) => {
        try {
            const response = await api.get(`/course/${id}`)
            setCourseData(response?.data)
        } catch (error) {
            return error
        }
    }

    const handleClassData = async (id) => {
        try {
            const response = await api.get(`/class/${id}`)
            setClassData(response?.data)
        } catch (error) {
            return error
        }
    }

    const handlePaymentsProfile = async () => {
        try {
            const response = await api.get(`/user/paymentProfile/${id}`)
            const { data } = response
            if (data?.length > 0) {
                data?.sort((a, b) => new Date(b.dt_criacao) - new Date(a.dt_criacao));
                const groupPaymentsPerfil = [
                    ...data?.map(payment => ({
                        label: `final - ${payment?.numero_cartao.split(' ')[3]}`,
                        value: payment?.id_cartao_credito
                    }))
                ];
                setShowPaymentPerfl({ newProfile: false, registeredProfile: true })
                setGroupPayment(groupPaymentsPerfil)
                setPaymentsProfile(data)
            }
        } catch (error) {
            return error
        }
    }

    useEffect(() => {
        handleItems()
    }, [])

    const handleItems = async () => {
        try {
            await handleUserData()
            const interests = await handleInterest()
            if (interests) {
                await handleSelectModule(interests?.turma_id)
                await handleValuesCourse(interests?.curso_id)
                await handleCourseData(interests?.curso_id)
                await handleClassData(interests?.turma_id)
                await handleResponsible()
                await handlePaymentsProfile()
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        let disciplineParts = disciplinesSelected?.split(',')
        let disciplinesLength = disciplineParts?.length
        setQuantityDisciplinesSelected(disciplinesLength)
    }, [disciplinesSelected])

    const checkValues = (responsiblePayerData) => {
        const { nome_resp,
            telefone_resp,
            email_resp,
            cpf_resp,
            rg_resp,
            cep_resp,
            end_resp,
            numero_resp,
            cidade_resp,
            estado_resp,
            bairro_resp } = responsiblePayerData

        if (!nome_resp) {
            alert?.error('O campo nome do responsável é obrigatório')
            return false
        }
        if (!email_resp) {
            alert?.error('O campo email do responsável é obrigatório')
            return false
        }
        if (!emailValidator(email_resp)) {
            alert?.error('O e-mail do responsável inserido parece estar incorreto.')
            return false
        }

        if (!telefone_resp) {
            alert?.error('O campo telefone do responsável é obrigatório')
            return false
        }


        if (!cpf_resp) {
            alert?.error('O campo cpf do responsável é obrigatório')
            return false
        }

        if (!rg_resp) {
            alert?.error('O campo rg do responsável é obrigatório')
            return false
        }


        if (!cep_resp) {
            alert?.error('O campo cep do responsável é obrigatório')
            return false
        }

        if (!end_resp) {
            alert?.error('O campo endereço do responsável é obrigatório')
            return false
        }

        if (!numero_resp) {
            alert?.error('O campo numero do responsável é obrigatório')
            return false
        }

        if (!cidade_resp) {
            alert?.error('O campo cidade do responsável é obrigatório')
            return false
        }

        if (!estado_resp) {
            alert?.error('O campo estado do responsável é obrigatório')
            return false
        }

        if (!bairro_resp) {
            alert?.error('O campo bairro do responsável é obrigatório')
            return false
        }

        return true
    }



    const checkValuesPaymentProfile = (payment) => {
        const { numero_cartao, nome_cartao, dt_expiracao, cvc } = payment

        if (!numero_cartao) {
            alert?.error('O número do cartão é obrigatório')
            return false
        }

        if (!nome_cartao) {
            alert?.error('O nome do cartão é obrigatório')
            return false
        }

        if (!dt_expiracao) {
            alert?.error('O data de expiração é obrigatório')
            return false
        }

        if (!cvc) {
            alert?.error('O cvc é obrigatório')
            return false
        }

        return true
    }

    const handleCreateResponsible = async () => {
        if (checkValues(responsiblePayerData)) {
            setLoading(true)
            try {
                const response = await api.post(`/responsible/create`, { responsiblePayerData: { ...responsiblePayerData, usuario_id: id }, userId })
                if (response?.status === 201) {
                    alert.success('Resposável adicionado.')
                    handleResponsible()
                }
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
            }
        }
    }

    const handleUpdateResponsible = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/responsible/update/${responsiblePayerData?.id_resp_pag}`, { responsiblePayerData })
            if (response?.status === 200) {
                alert.success('Dados do responsável atualizados.')
                handleResponsible()
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleDeleteResponsible = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/responsible/delete/${responsiblePayerData?.id_resp_pag}`)
            if (response?.status === 200) {
                alert.success('Responsável removido.')
                handleResponsible()
                setNewResponsible(true)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePaymentProfile = async () => {
        if (checkValuesPaymentProfile(newPaymentProfile)) {
            setLoading(true)
            try {
                const response = await api.post(`/user/paymentProfile/create/${id}`, { newPaymentProfile })
                if (response?.status === 201) {
                    alert.success('Cartão de crédito adicionado.')
                    handlePaymentsProfile()
                }
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
            }
        }
    }

    const checkEnrollmentData = (enrollmentData) => {
        let paymentInvalid = enrollmentData?.filter(item => !item.pagamento)

        if (paymentInvalid.length > 0) {
            alert.info('A forma de pagamento precisa ser preenchida corretamente.')
            return error
        }

        return true
    }


    const handleCreateEnrollStudent = async (enrollmentData, valuesContract) => {
        if (checkEnrollmentData(enrollmentData)) {
            let enrollment = {
                usuario_id: id,
                pendencia_aluno: null,
                dt_inicio: formatDate(classData?.inicio),
                dt_final: formatDate(classData?.fim),
                status: 'Aguardando início',
                turma_id: classData?.id_turma,
                motivo_desistencia: null,
                dt_desistencia: null,
                certificado_emitido: 0,
                desc_disp_disc: valuesContract?.descontoDispensadas || 0,
                desc_adicional: valuesContract?.valorDescontoAdicional || 0,
                desc_adicional_porc: valuesContract?.descontoAdicional || 0,
                valor_tl_desc: (parseFloat(valuesContract?.valorDescontoAdicional) + parseFloat(valuesContract?.descontoDispensadas)),
                valor_matricula: valuesContract?.valueFinally || 0,
                qnt_disci_disp: valuesContract?.qntDispensadas || 0
            }

            let paymentInstallmentsEnrollment = enrollmentData?.map((payment) => ({
                pagante: responsiblePayerData ? responsiblePayerData?.nome_resp : userData?.nome,
                aluno: userData?.nome,
                vencimento: payment?.data_pagamento,
                dt_pagamento: null,
                valor_parcela: parseFloat(payment?.valor_parcela).toFixed(2),
                parcela: payment?.n_parcela,
                c_custo: `${classData?.nome_turma}-1SEM`,
                forma_pagamento: payment?.tipo,
                cartao_credito_id: payment?.pagamento,
                conta: 'Melies - Bradesco',
                obs_pagamento: null,
                status_gateway: null,
                status_parcela: 'Em aberto',
                parc_protestada: 0,
            }));

            setLoadingEnrollment(true);
            setTimeout(async () => {
                console.log('enrollment', enrollment)
                console.log('paymentInstallmentsEnrollment', paymentInstallmentsEnrollment)
                try {
                    // const response = await api.post(`/enrrolment/paymentProfile/create/${id}`, { enrollment, paymentInstallmentsEnrollment });
                    // if (response?.status === 201) {
                    //   alert.success('Matrícula efetivada.');
                    //   router.push(`/administrative/users/${userId}`);
                    // }
                    let status = 201;
                    if (status === 201) {
                        setEnrollmentCompleted({ ...enrollmentCompleted, status: 201 });
                        return
                    } else {
                        setEnrollmentCompleted({ ...enrollmentCompleted, status: 500 });
                    }
                } catch (error) {
                    console.log(error);
                    return error;
                }
            }, 4500);
        }
    }


    const telas = [
        (
            <>
                <EnrollStudentDetails
                    setDisciplinesSelected={setDisciplinesSelected}
                    disciplinesSelected={disciplinesSelected}
                    disciplines={disciplines}
                    userData={userData}
                    interestData={interestData}
                    setLoading={setLoading}
                    setCheckValidateScreen={setCheckValidateScreen}
                    pushRouteScreen={pushRouteScreen}
                />
            </>
        ),
        (
            <>
                <Payment
                    setCheckValidateScreen={setCheckValidateScreen}
                    quantityDisciplinesSelected={quantityDisciplinesSelected}
                    quantityDisciplinesModule={quantityDisciplinesModule}
                    valuesCourse={valuesCourse}
                    setValuesContract={setValuesContract}
                    setPaymentForm={setPaymentForm}
                    valuesContract={valuesContract}
                    paymentForm={paymentForm}
                    updatedScreen={updatedScreen}
                    responsiblePayerData={responsiblePayerData}
                    setResponsiblePayerData={setResponsiblePayerData}
                    handleAddResponsible={handleCreateResponsible}
                    handleUpdateResponsible={handleUpdateResponsible}
                    handleDeleteResponsible={handleDeleteResponsible}
                    paying={paying}
                    setPaying={setPaying}
                    userData={userData}
                    userIsOfLegalAge={userIsOfLegalAge}
                    newResponsible={newResponsible}
                    setNewResponsible={setNewResponsible}
                    typeDiscountAdditional={typeDiscountAdditional}
                    setTypeDiscountAdditional={setTypeDiscountAdditional}
                    newPaymentProfile={newPaymentProfile}
                    setNewPaymentProfile={setNewPaymentProfile}
                    paymentsProfile={paymentsProfile}
                    handleCreatePaymentProfile={handleCreatePaymentProfile}
                    groupPayment={groupPayment}
                    showPaymentPerfl={showPaymentPerfl}
                    setShowPaymentPerfl={setShowPaymentPerfl}
                    pushRouteScreen={pushRouteScreen}
                />
            </>
        ),
        (
            <>
                <ContractStudent
                    setCheckValidateScreen={setCheckValidateScreen}
                    paymentForm={paymentForm}
                    valuesContract={valuesContract}
                    courseData={courseData}
                    classData={classData}
                    userId={id}
                    responsiblePayerData={responsiblePayerData}
                    emailDigitalSignature={emailDigitalSignature}
                    setEmailDigitalSignature={setEmailDigitalSignature}
                    typeDiscountAdditional={typeDiscountAdditional}
                    setTypeDiscountAdditional={setTypeDiscountAdditional}
                    groupPayment={groupPayment}
                    handleCreateEnrollStudent={handleCreateEnrollStudent}
                    pushRouteScreen={pushRouteScreen}
                />
            </>
        )
    ];


    return (
        <> {interest ?
            <>
                <SectionHeader
                    perfil={routeScreen || 'Matricula'}
                    title={userData?.nome}
                />

                {telas[indiceTela]}
                <Backdrop sx={{ zIndex: 99999999, backgroundColor: '#0E0D15' }} open={loadingEnrollment}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                        {enrollmentCompleted?.active ? (
                            enrollmentCompleted.status === 201 ?
                                <CheckCircleIcon style={{ color: 'green', fontSize: 30 }} /> :
                                <CancelIcon style={{ color: 'red', fontSize: 30 }} />
                        ) : <CircularProgress />}
                        <Text bold style={{ color: '#fff' }}>{messageEnrollment}</Text>
                    </Box>
                </Backdrop>
            </>
            :
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Text bold title> Você precisa adicionar um interesse antes para prosseguir com a Matícula</Text>
            </Box>
        }

        </>
    )
}

export const EnrollStudentDetails = (props) => {

    const {
        disciplinesSelected,
        disciplines,
        setDisciplinesSelected,
        interestData,
        pushRouteScreen
    } = props

    return (
        <>
            <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                <ContentContainer fullWidth gap={4}>
                    <Text bold title>Interesse</Text>
                    <Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Curso:</Text>
                                <Text>{interestData?.nome_curso}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Turma:</Text>
                                <Text>{interestData?.nome_turma}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Periodo:</Text>
                                <Text>{interestData?.periodo_interesse}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Observação: </Text>
                                <Text>{interestData?.observacao_int}</Text>
                            </Box>
                        </Box>
                    </Box>
                </ContentContainer>

                <ContentContainer fullWidth gap={4}>
                    <Text bold title>Disciplinas</Text>
                    <CheckBoxComponent
                        padding={false}
                        valueChecked={disciplinesSelected}
                        boxGroup={disciplines}
                        title="Selecione as disciplinas*"
                        horizontal={false}
                        onSelect={(value) => setDisciplinesSelected(value)}
                        sx={{ flex: 1, }}
                    />
                </ContentContainer>
            </ContentContainer>
            <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button text="Continuar" onClick={() => pushRouteScreen(1, 'interesse > Forma de pagamento')} style={{ width: 120 }} />
            </Box>
        </>
    )
}

export const Payment = (props) => {
    const {
        quantityDisciplinesSelected,
        quantityDisciplinesModule,
        valuesCourse,
        setValuesContract,
        valuesContract,
        setPaymentForm,
        responsiblePayerData,
        updatedScreen,
        setResponsiblePayerData,
        handleAddResponsible,
        handleUpdateResponsible,
        paying,
        setPaying,
        userData,
        userIsOfLegalAge,
        newResponsible,
        setNewResponsible,
        handleDeleteResponsible,
        typeDiscountAdditional,
        setTypeDiscountAdditional,
        newPaymentProfile,
        setNewPaymentProfile,
        paymentsProfile,
        handleCreatePaymentProfile,
        groupPayment,
        showPaymentPerfl,
        setShowPaymentPerfl,
        pushRouteScreen
    } = props

    const [totalValueFinnaly, setTotalValueFinnaly] = useState()
    const [disciplineDispensedPorcent, setDisciplineDispensedPorcent] = useState()
    const [valueParcel, setValueParcel] = useState()
    const [groupDaysForPay, setGroupDaysForPay] = useState()
    const [totalParcel, setTotalParcel] = useState()
    const [dispensedDisciplines, setDispensedDisciplines] = useState()
    const [discountDispensed, setDiscountDispensed] = useState()
    const [numberOfInstallments, setNumberOfInstallments] = useState(6)
    const [dayForPayment, setDayForPayment] = useState(1)
    const initialTypePaymentsSelected = Array.from({ length: numberOfInstallments }, () => ({ tipo: '', valor_parcela: '', n_parcela: null, data_pagamento: '' }));
    const [typePaymentsSelected, setTypePaymentsSelected] = useState(initialTypePaymentsSelected);
    const [globalTypePaymentsSelected, setGlobalTypePaymentsSelected] = useState('');
    const [aditionalDiscount, setAditionalDiscount] = useState({ desconto_adicional: '', desconto_formatado: '' })
    const { colorPalette, alert } = useAppContext()
    const [focusedCreditCard, setFocusedCreditCard] = useState('');


    useEffect(() => {
        const disciplinesDispensed = quantityDisciplinesModule - quantityDisciplinesSelected;
        const porcentDisciplineDispensed = `${((disciplinesDispensed / quantityDisciplinesModule) * 100).toFixed(2)}%`;

        const valueModuleCourse = (valuesCourse?.valor_total_curso).toFixed(2);
        const costDiscipline = (valueModuleCourse / quantityDisciplinesModule).toFixed(2);
        const calculationDiscount = (costDiscipline * disciplinesDispensed).toFixed(2)
        const valueFinally = (valueModuleCourse - calculationDiscount).toFixed(2)

        setTotalValueFinnaly(valueFinally)
        setDisciplineDispensedPorcent(porcentDisciplineDispensed)
        setDispensedDisciplines(disciplinesDispensed)
        setDiscountDispensed(calculationDiscount)

        setValuesContract({
            valorSemestre: valuesCourse?.valor_total_curso,
            qntDispensadas: disciplinesDispensed,
            descontoDispensadas: calculationDiscount,
            descontoPorcentagemDisp: porcentDisciplineDispensed,
            descontoAdicional: aditionalDiscount?.desconto_adicional,
            valorDescontoAdicional: aditionalDiscount?.desconto_formatado,
            valorFinal: valueFinally
        })
    }, [])

    useEffect(() => {
        const parcelValue = (totalValueFinnaly / numberOfInstallments).toFixed(2)
        const totalParcelCourse = valuesCourse?.n_parcelas || 6;
        const updatedNumberParcel = Array.from({ length: totalParcelCourse }, (_, index) => ({
            label: index + 1,
            value: index + 1
        }))

        const updatedDayForPayment = Array.from({ length: 31 }, (_, index) => ({
            label: index + 1,
            value: index + 1
        }))

        setGroupDaysForPay(updatedDayForPayment)
        setValueParcel(parcelValue)
        setTotalParcel(updatedNumberParcel)

        setTypePaymentsSelected(prevTypePaymentsSelected => {
            const updatedArray = [];

            for (let i = 0; i < numberOfInstallments; i++) {
                const paymentDate = new Date();
                const selectedDay = dayForPayment;
                const typePayment = prevTypePaymentsSelected[i + 1]
                let month = paymentDate.getMonth() + i;
                let isSaturday = false; // Sabado
                let isSunday = false; // Domingo

                paymentDate.setMonth(month);

                const lastDayOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
                if (selectedDay > lastDayOfMonth) {
                    paymentDate.setDate(lastDayOfMonth);
                } else {
                    paymentDate.setDate(selectedDay);
                }

                if (paymentDate.getDay() === 6) {
                    isSaturday = true;
                    if (paymentDate.getDate() + 2 > lastDayOfMonth) {
                        paymentDate.setDate(paymentDate.getDate() - 1);
                    } else {
                        paymentDate.setDate(paymentDate.getDate() + 2);
                    }
                }

                if (paymentDate.getDay() === 0) {
                    isSunday = true;
                    if (paymentDate.getDate() + 1 > lastDayOfMonth) {
                        paymentDate.setDate(paymentDate.getDate() - 2);
                    } else {
                        paymentDate.setDate(paymentDate.getDate() + 1);
                    }
                }

                while (holidays.some(holiday => holiday.getDate() === paymentDate.getDate() && holiday.getMonth() === paymentDate.getMonth())) {
                    paymentDate.setDate(paymentDate.getDate() + 1); // Adicionar 1 dia
                }

                const formattedPaymentDate = paymentDate.toLocaleDateString('pt-BR');
                let payments = paymentsProfile?.map(item => item)[0]

                let paymentForm = (globalTypePaymentsSelected === 'Cartão' && payments?.id_cartao_credito) || (globalTypePaymentsSelected === 'pix' && 'Pix') || (globalTypePaymentsSelected === 'Boleto' && 'Boleto')
                if (globalTypePaymentsSelected === 'Cartão' && paymentsProfile?.length <= 0) { alert.info('Você não possui um cartão de crédito cadastrado. Por favor, primeiro cadastre um cartão.') }
                if (globalTypePaymentsSelected === 'Cartão' && paymentsProfile?.length > 0) { alert.info('Selecione o cartão que deseja efetuar o pagamento.') }
                updatedArray.push({
                    pagamento: paymentForm,
                    tipo: globalTypePaymentsSelected,
                    valor_parcela: parcelValue,
                    data_pagamento: formattedPaymentDate,
                    n_parcela: i + 1,
                });
            }

            return updatedArray;
        });

    }, [numberOfInstallments, totalValueFinnaly, globalTypePaymentsSelected, dayForPayment])


    const handleTypePayment = (index, value, installmentNumber, formattedPaymentDate, payment) => {
        setTypePaymentsSelected((prevTypePaymentsSelected) => {
            let paymentForm = (value === 'Cartão' && '') || (value === 'Pix' && 'Pix') || (value === 'boleto' && 'Boleto')
            const updatedTypePaymentsSelected = [...prevTypePaymentsSelected];
            updatedTypePaymentsSelected[index] = {
                pagamento: paymentForm,
                tipo: value,
                valor_parcela: valueParcel,
                data_pagamento: formattedPaymentDate,
                n_parcela: installmentNumber
            };
            return updatedTypePaymentsSelected;
        });
    };

    const handlePaymentProfile = (index, value) => {
        setTypePaymentsSelected((prevTypePaymentsSelected) => {
            const updatedTypePaymentsSelected = [...prevTypePaymentsSelected];
            updatedTypePaymentsSelected[index] = {
                ...updatedTypePaymentsSelected[index],
                pagamento: value,
            };
            return updatedTypePaymentsSelected;
        });
    };


    const handleChange = (event) => {

        if (typeDiscountAdditional.real) {

            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || 0; // Parte inteira
                const decimalValue = rawValue.slice(-2); // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${intValue}.${decimalValue}`;
                event.target.value = formattedValue;
            }

            setAditionalDiscount((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;

        } else if (typeDiscountAdditional.porcent) {
            let value = ''
            value = event.target.value.replace(',', '.');
            event.target.value = value

            setAditionalDiscount((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));
        }
    }



    const handleChangeResponsibleData = (event) => {

        if (event.target.name == 'cpf_resp') {
            let str = event.target.value;
            event.target.value = formatCPF(str)
        }

        if (event.target.name == 'rg_resp') {
            let str = event.target.value;
            event.target.value = formatRg(str)
        }

        if (event.target.name == 'cep_resp') {
            let str = event.target.value;
            event.target.value = formatCEP(str)
        }

        setResponsiblePayerData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));

    }

    const handleChangePerfilPayment = (event) => {
        if (event.target.name === 'numero_cartao') {
            const formattedNumber = formatCreditCardNumber(event.target.value);
            event.target.value = formattedNumber;
        }
        if (event.target.name === 'dt_expiracao') {
            let expiry = event.target.value;
            const cleanExpiry = expiry.replace(/\D/g, '');
            const formattedExpiry = cleanExpiry.replace(/(\d{2})(\d{2})/, '$1/$2');
            event.target.value = formattedExpiry;
        }

        setNewPaymentProfile((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    }

    const handleFocused = (event) => {
        setFocusedCreditCard(event.target.name);
    }

    const checkEnrollmentData = (index, route) => {
        let paymentInvalid = typePaymentsSelected?.filter(item => !item.pagamento)

        if (paymentInvalid.length > 0) {
            alert.info('A forma de pagamento precisa ser preenchida corretamente.')
            return
        }

        pushRouteScreen(index, route)
        return
    }



    const handleCalculationDiscount = (action) => {

        if (typeDiscountAdditional.real) {

            const discount = parseFloat(aditionalDiscount?.desconto_adicional);
            const totalValue = parseFloat(totalValueFinnaly);

            if (isNaN(discount) || isNaN(totalValue)) {
                alert.error("Desconto ou valor total inválido.");
            }

            if (action === 'remover') {
                const updatedTotal = (totalValue + discount).toFixed(2);
                setTotalValueFinnaly(updatedTotal);
                setAditionalDiscount({ desconto_adicional: 0, desconto_formatado: 0 })
                alert.success('Desconto removido.')
            } else if (action === 'adicionar') {
                setAditionalDiscount({ ...aditionalDiscount, desconto_formatado: discount })
                const updatedTotal = (totalValue - discount).toFixed(2);
                setTotalValueFinnaly(updatedTotal);
                alert.success('Desconto aplicado.')
            }
            return

        } else if (typeDiscountAdditional.porcent) {
            const discountPercentage = parseFloat(aditionalDiscount?.desconto_adicional);

            if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                alert.error("Porcentagem de desconto inválida.");
                return;
            }

            const totalValue = parseFloat(totalValueFinnaly);
            const discountValue = (totalValue * (discountPercentage / 100)).toFixed(2);

            if (action === 'remover') {
                const updatedTotal = (totalValue + parseFloat(discountValue)).toFixed(2);
                setTotalValueFinnaly(updatedTotal);
                setAditionalDiscount({ desconto_adicional: 0, desconto_formatado: 0 })
                alert.success('Desconto em porcentagem removido.')
            } else if (action === 'adicionar') {
                const updatedTotal = (totalValue - parseFloat(discountValue)).toFixed(2);
                setAditionalDiscount({ ...aditionalDiscount, desconto_formatado: discountValue })
                setTotalValueFinnaly(updatedTotal);
                alert.success('Desconto em porcentagem aplicado.')
            }
        }
    };

    const handleBlurCEP = async (event) => {
        try {
            const { value } = event.target;
            const data = await findCEP(value);

            setResponsiblePayerData((prevValues) => ({
                ...prevValues,
                end_resp: data.logradouro,
                cidade_resp: data.localidade,
                estado_resp: data.uf,
                bairro_resp: data.bairro,
            }))
        } catch (error) {
            return error
        }
    };

    useEffect(() => {
        setValuesContract({
            valorSemestre: valuesCourse?.valor_total_curso,
            qntDispensadas: dispensedDisciplines,
            descontoDispensadas: discountDispensed,
            descontoPorcentagemDisp: disciplineDispensedPorcent,
            descontoAdicional: aditionalDiscount?.desconto_adicional,
            valorDescontoAdicional: aditionalDiscount?.desconto_formatado,
            valorFinal: totalValueFinnaly
        });

        setPaymentForm(typePaymentsSelected);
    }, [updatedScreen, typePaymentsSelected, numberOfInstallments, totalValueFinnaly, dispensedDisciplines, discountDispensed, disciplineDispensedPorcent, aditionalDiscount, valuesCourse, setValuesContract, setPaymentForm]);



    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const listPaymentType = [
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Cartão', value: 'Cartão' },
        { label: 'Pix', value: 'Pix' },
    ]

    const holidays = [
        new Date(2023, 0, 1),  // Ano Novo
        new Date(2023, 1, 25), // Carnaval
        new Date(2023, 1, 26), // Carnaval
        new Date(2023, 3, 7),  // Sexta-feira Santa
        new Date(2023, 3, 21), // Tiradentes
        new Date(2023, 4, 1),  // Dia do Trabalhador
        new Date(2023, 5, 15), // Corpus Christi
        new Date(2023, 8, 7),  // Independência do Brasil
        new Date(2023, 9, 12), // Nossa Senhora Aparecida
        new Date(2023, 10, 2), // Dia de Finados
        new Date(2023, 10, 15),// Proclamação da República
        new Date(2023, 11, 25)  // Natal
    ];

    return (
        <>
            <ContentContainer style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                    <ContentContainer fullWidth gap={4} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 40px' }}>
                        <Text bold title>Resumo da contratação</Text>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Total:</Text>
                                <Text>{formatter.format(valuesCourse?.valor_total_curso)}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Disciplinas dispensadas:</Text>
                                <Text>{dispensedDisciplines}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Disciplinas dispensadas - Desconto (R$):</Text>
                                <Text>{formatter.format(discountDispensed)}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Disciplinas dispensadas - Desconto (%):</Text>
                                <Text>{disciplineDispensedPorcent}</Text>
                            </Box>
                            <ContentContainer sx={{ display: 'flex', gap: 2.5, flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex' }}>
                                    <Button small secondary={typeDiscountAdditional?.porcent ? false : true} text="porcentagem" onClick={() => setTypeDiscountAdditional({
                                        porcent: true,
                                        real: false
                                    })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                                    <Button secondary={typeDiscountAdditional?.real ? false : true} small text="dinheiro" onClick={() => setTypeDiscountAdditional({
                                        porcent: false,
                                        real: true
                                    })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <TextInput
                                        placeholder={typeDiscountAdditional?.real ? '0.00' : '20.5%'}
                                        name='desconto_adicional'
                                        type={typeDiscountAdditional?.real ? "coin" : ''}
                                        onChange={handleChange}
                                        value={(aditionalDiscount?.desconto_adicional) || ''}
                                        label='Desconto adicional' sx={{ flex: 1, }}
                                    />
                                    <Button small text="adicionar" onClick={() => handleCalculationDiscount('adicionar')} style={{ width: '90px', height: '30px' }} />
                                    <Button secondary small text="remover" onClick={() => handleCalculationDiscount('remover')} style={{ width: '90px', height: '30px' }} />
                                </Box>
                            </ContentContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Desconto adicional:</Text>
                                <Text>{(typeDiscountAdditional?.real && formatter.format(aditionalDiscount?.desconto_adicional || 0))
                                    || (typeDiscountAdditional?.porcent && parseFloat(aditionalDiscount?.desconto_adicional || 0).toFixed(2) + '%')
                                    || '0'}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column' }}>
                                <Text bold>Valor Total com desconto:</Text>
                                <Text>{formatter.format(totalValueFinnaly)}</Text>
                            </Box>
                            <SelectList fullWidth data={groupDaysForPay} valueSelection={dayForPayment || ''} onSelect={(value) => setDayForPayment(value)}
                                title="Selecione o dia do vencimento *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>
                    </ContentContainer>

                    <ContentContainer fullWidth gap={3} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 40px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text bold title>Dados do pagante</Text>
                            <Box sx={{ display: 'flex' }}>
                                <Button small secondary={paying?.aluno ? false : true} text="aluno" onClick={() => setPaying({
                                    aluno: true,
                                    responsible: false
                                })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                                <Button secondary={paying?.responsible ? false : true} small text="responsável" onClick={() => setPaying({
                                    aluno: false,
                                    responsible: true
                                })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                            </Box>
                        </Box>
                        {paying?.responsible ?
                            <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>

                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Nome' id="field-1" name='nome_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.nome_resp || ''} label='Nome *' sx={{ flex: 1, }} />
                                    <PhoneInputField
                                        label='Telefone *'
                                        name='telefone_resp'
                                        onChange={(phone) => setResponsiblePayerData({ ...responsiblePayerData, telefone_resp: phone })}
                                        value={responsiblePayerData?.telefone_resp}
                                        sx={{ flex: 1, }}
                                    />
                                </Box>
                                <TextInput placeholder='E-mail' name='email_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.email_resp || ''} label='E-mail *' sx={{ flex: 1, }} />
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='CPF' name='cpf_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cpf_resp || ''} label='CPF *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='RG' name='rg_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.rg_resp || ''} label='RG *' sx={{ flex: 1, }} />
                                </Box>
                                <TextInput placeholder='CEP' name='cep_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cep_resp || ''} onBlur={handleBlurCEP} label='CEP *' sx={{ flex: 1, }} />

                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Endereço' name='end_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.end_resp || ''} label='Endereço *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Nº' name='numero_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.numero_resp || ''} label='Nº *' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Cidade' name='cidade_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cidade_resp || ''} label='Cidade *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Estado' name='estado_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.estado_resp || ''} label='Estado *' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Bairro' name='bairro_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.bairro_resp || ''} label='Bairro *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Complemento' name='compl_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.compl_resp || ''} label='Complemento' sx={{ flex: 1, }} />
                                </Box>
                            </Box>
                            :
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-start', alignItems: 'start', flex: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>Nome:</Text>
                                    <Text>{userData?.nome}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>E-mail:</Text>
                                    <Text>{userData?.email}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>Telefone:</Text>
                                    <Text>{userData?.telefone}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>CPF: </Text>
                                    <Text>{userData?.cpf}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>RG: </Text>
                                    <Text>{userData?.rg}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>CEP: </Text>
                                    <Text>{userData?.cep}</Text>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 1.8, justifyContent: 'center' }}>
                                    <Text bold>Maior de 18 anos: </Text>
                                    <Text>{userIsOfLegalAge ? 'Sim' : 'Não'}</Text>
                                </Box>

                            </Box>
                        }
                        {paying?.responsible &&
                            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', gap: 2 }}>
                                {newResponsible ?
                                    <Button small text="adicionar" onClick={() => handleAddResponsible()} style={{ width: '90px', height: '30px' }} />
                                    :
                                    <>
                                        <Button small text="atualizar" onClick={() => handleUpdateResponsible()} style={{ width: '90px', height: '30px' }} />
                                        <Button secondary small text="excluir" onClick={() => handleDeleteResponsible()} style={{ width: '90px', height: '30px' }} />
                                    </>
                                }
                            </Box>}

                    </ContentContainer>

                </ContentContainer>

                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', xm: 'column', md: 'column', lg: `column`, xl: 'row' } }}>

                    <ContentContainer gap={4} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 30px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexDirection: 'column' }}>
                            <Text bold title>Perfil de pagamento</Text>
                            <Box sx={{ display: 'flex' }}>
                                <Button small secondary={showPaymentPerfl?.newProfile ? false : true} text="novo" onClick={() => setShowPaymentPerfl({
                                    newProfile: true,
                                    registeredProfile: false
                                })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                                <Button secondary={showPaymentPerfl?.registeredProfile ? false : true} small text="cadastrados" onClick={() => setShowPaymentPerfl({
                                    newProfile: false,
                                    registeredProfile: true
                                })} style={{ width: '90px', height: '30px', borderRadius: 0 }} />
                            </Box>
                        </Box>

                        {showPaymentPerfl?.newProfile ?
                            (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Cards
                                        cvc={newPaymentProfile?.cvc || ''}
                                        expiry={newPaymentProfile?.dt_expiracao || ''}
                                        focused={focusedCreditCard}
                                        name={newPaymentProfile?.nome_cartao || ''}
                                        number={newPaymentProfile?.numero_cartao || ''}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>
                                        <TextInput name='apelido_cartao' onChange={handleChangePerfilPayment} value={newPaymentProfile?.apelido_cartao || ''} label='Apelido' sx={{ flex: 1, }} />
                                        <TextInput name='numero_cartao' onChange={handleChangePerfilPayment} value={newPaymentProfile?.numero_cartao || ''} label='Número *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                        <TextInput name='nome_cartao' onChange={handleChangePerfilPayment} value={newPaymentProfile?.nome_cartao || ''} label='Nome *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                        <Box sx={{ ...styles.inputSection }}>
                                            <TextInput name='dt_expiracao' onChange={handleChangePerfilPayment} value={newPaymentProfile?.dt_expiracao || ''} label='Validade *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                            <TextInput name='cvc' onChange={handleChangePerfilPayment} value={newPaymentProfile?.cvc || ''} label='CVC *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'end', marginTop: 2 }}>
                                        <Button small style={{ width: 100, height: 30 }} text="cadastrar" onClick={() => handleCreatePaymentProfile()} />
                                    </Box>
                                </Box>

                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'row', xm: 'row', md: 'row', lg: `row`, xl: 'column' }, gap: 2, maxHeight: 400, overflow: 'auto' }}>

                                    {showPaymentPerfl?.registeredProfile && paymentsProfile.length > 0 ?
                                        paymentsProfile?.map((item, index) => {
                                            const createdAt = `Criado em ${formatTimeStamp(item?.dt_criacao, true)}`
                                            return (
                                                <Box key={index} sx={{
                                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1.8, padding: '30px 40px', borderRadius: 3,
                                                    transition: '0.3s',
                                                    "&:hover": {
                                                        backgroundColor: colorPalette.primary,
                                                        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                        transform: 'scale(0.9)',
                                                    }
                                                }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Text bold>{item?.apelido_cartao}</Text>
                                                        {index === 0 &&
                                                            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                                <CheckCircleIcon style={{ color: 'green', fontSize: 18 }} />
                                                                <Text small style={{}}>padrão</Text>
                                                            </Box>
                                                        }
                                                    </Box>
                                                    <Cards
                                                        cvc={item?.cvc || ''}
                                                        expiry={item?.dt_expiracao || ''}
                                                        name={item?.nome_cartao || ''}
                                                        number={item?.numero_cartao || ''}
                                                    />
                                                    <Text small light>{createdAt}</Text>
                                                </Box>
                                            )
                                        })
                                        :
                                        <Text light small>Não existem perfís de pagamento cadastrados</Text>
                                    }
                                </Box>
                            )}
                    </ContentContainer>

                    <ContentContainer fullWidth gap={4} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 40px' }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                            <Text bold title>Forma de pagamento</Text>
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                <SelectList fullWidth data={totalParcel} valueSelection={numberOfInstallments || ''} onSelect={(value) => setNumberOfInstallments(value)}
                                    title="Selecione o numero de parcelas *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                                <SelectList fullWidth data={listPaymentType} valueSelection={globalTypePaymentsSelected || ''} onSelect={(value) => setGlobalTypePaymentsSelected(value)}
                                    filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    title="Selecione a forma de pagamento *"
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    clean={false}
                                />
                            </Box>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}` }}>
                                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nº Parcela</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Forma</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Pagamento</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Valor da Parcela</th>
                                            <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Pagamento</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ flex: 1 }}>
                                        {Array.from({ length: numberOfInstallments }, (_, index) => {

                                            const installmentNumber = index + 1;
                                            const paymentDate = new Date();
                                            const selectedDay = dayForPayment;
                                            let month = paymentDate.getMonth() + index;
                                            let isSaturday = false; // Sabado
                                            let isSunday = false; // Domingo

                                            paymentDate.setMonth(month);

                                            // Verifique se a data é maior que o último dia do mês
                                            const lastDayOfMonth = new Date(paymentDate.getFullYear(), paymentDate.getMonth() + 1, 0).getDate();
                                            if (selectedDay > lastDayOfMonth) {
                                                paymentDate.setDate(lastDayOfMonth);
                                            } else {
                                                paymentDate.setDate(selectedDay);
                                            }

                                            if (paymentDate.getDay() === 6) {
                                                isSaturday = true;
                                                if (paymentDate.getDate() + 2 > lastDayOfMonth) {
                                                    paymentDate.setDate(paymentDate.getDate() - 1);
                                                } else {
                                                    paymentDate.setDate(paymentDate.getDate() + 2);
                                                }
                                            }

                                            if (paymentDate.getDay() === 0) {
                                                isSunday = true;
                                                if (paymentDate.getDate() + 1 > lastDayOfMonth) {
                                                    paymentDate.setDate(paymentDate.getDate() - 2);
                                                } else {
                                                    paymentDate.setDate(paymentDate.getDate() + 1);
                                                }
                                            }

                                            while (holidays.some(holiday => holiday.getDate() === paymentDate.getDate() && holiday.getMonth() === paymentDate.getMonth())) {
                                                paymentDate.setDate(paymentDate.getDate() + 1); // Adicionar 1 dia
                                            }

                                            const formattedPaymentDate = paymentDate.toLocaleDateString('pt-BR');

                                            return (
                                                <tr key={installmentNumber}>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {installmentNumber}</td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, border: '1px solid lightgray' }}>
                                                        <SelectList fullWidth data={listPaymentType} valueSelection={typePaymentsSelected[index]?.tipo || ''} onSelect={(value) => handleTypePayment(index, value, installmentNumber, formattedPaymentDate,)}
                                                            filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                            clean={false}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, border: '1px solid lightgray' }}>
                                                        {typePaymentsSelected[index]?.tipo === 'Cartão' ? <SelectList fullWidth data={groupPayment} valueSelection={typePaymentsSelected[index]?.pagamento || ''} onSelect={(value) => handlePaymentProfile(index, value)}
                                                            filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                            clean={false}
                                                        />
                                                            :
                                                            typePaymentsSelected[index]?.tipo}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {formatter.format(valueParcel)}</td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {formattedPaymentDate}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Box>
                    </ContentContainer>
                </Box>

            </ContentContainer>
            <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button secondary text="Voltar" onClick={() => pushRouteScreen(0, 'interesse >')} style={{ width: 120 }} />
                <Button text="Continuar" onClick={() => checkEnrollmentData(2, 'interesse > Forma de pagamento > Contrato')} style={{ width: 120 }} />
            </Box>
        </>
    )

}


export const ContractStudent = (props) => {
    const {
        paymentForm,
        valuesContract,
        courseData,
        classData,
        userId,
        responsiblePayerData,
        emailDigitalSignature,
        setEmailDigitalSignature,
        typeDiscountAdditional,
        setTypeDiscountAdditional,
        groupPayment,
        handleCreateEnrollStudent,
        pushRouteScreen
    } = props



    const { colorPalette, setLoading, alert } = useAppContext()
    const [paymentData, setPaymentData] = useState([])
    const [userData, setUserData] = useState({})
    const contractService = useRef()

    const handleUserData = async () => {
        setLoading(true)
        try {
            const user = await api.get(`/user/${userId}`)
            const { response } = user.data
            setUserData(response)
            setEmailDigitalSignature({ ...emailDigitalSignature, email_1: response?.email })
        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleUserData()
    }, [])

    const handleGeneratePdf = useReactToPrint({
        content: () => contractService.current,
        documentTitle: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS',
        onAfterPrint: () => alert.info('Tabela exportada em PDF.')
    })

    useEffect(() => {

        const updatedPaymentForm = paymentForm.map((payment) => ({
            ...payment,
            pagamento: payment?.pagamento || payment?.tipo,
            valor_parcela: parseFloat(payment?.valor_parcela).toFixed(2)
        }));

        setPaymentData(updatedPaymentForm)
    }, [])


    const className = classData?.nome_turma;
    const startDateClass = formatDate(classData?.inicio);
    const courseSigle = courseData?.sigla;
    const courseName = courseData?.nome_curso;
    const modalityCourse = courseData?.modalidade_curso;

    let query = `Curso: `;
    if (className) query += `${className}-1SEM - `;
    if (courseSigle) query += `${courseSigle}`;
    if (courseName) query += `${courseName} `;
    if (modalityCourse) query += `${modalityCourse} `;
    if (startDateClass) query += `- ${startDateClass}`;

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const handleChange = (event) => {

        setEmailDigitalSignature((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));

        return;
    }

    return (
        <>
            <Text bold title>Pré vizualização do Contrato</Text>

            <ContractStudentComponent
                onClick={handleGeneratePdf}
                userData={userData}
                responsiblePayerData={responsiblePayerData}>

                <ContentContainer style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    boxShadow: 'none',
                    alignItems: 'center',
                    marginTop: 25
                }}>
                    <Text bold>{query || 'Dados de pagamento'}</Text>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '8px',
                        alignItems: 'start',
                        width: '70%',
                    }}>

                        <Box sx={{ ...styles.containerValues, borderRadius: '8px 8px 0px 0px' }}>
                            <Text small style={styles.textDataPayments} bold>Nome completo:</Text>
                            <Text small style={styles.textDataPayments}>{userData?.nome}</Text>
                        </Box>

                        <Box sx={styles.containerValues}>
                            <Text small style={styles.textDataPayments} bold>Resp. pagante:</Text>
                            <Text small style={styles.textDataPayments}>{responsiblePayerData?.nome_resp || userData?.nome}</Text>
                        </Box>
                        <Box sx={styles.containerValues}>
                            <Text small style={styles.textDataPayments} bold>Valor total do semestre:</Text>
                            <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.valorSemestre)}</Text>
                        </Box>
                        <Box sx={styles.containerValues}>
                            <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas:</Text>
                            <Text small style={styles.textDataPayments}>{valuesContract.qntDispensadas}</Text>
                        </Box>
                        {valuesContract.descontoDispensadas > 0 &&
                            <Box sx={styles.containerValues}>
                                <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (R$):</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.descontoDispensadas)}</Text>
                            </Box>
                        }
                        {valuesContract.descontoPorcentagemDisp != '0.00%' &&
                            <Box sx={styles.containerValues}>
                                <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (%):</Text>
                                <Text small style={styles.textDataPayments}>{valuesContract.descontoPorcentagemDisp}</Text>
                            </Box>
                        }
                        {valuesContract.descontoAdicional &&
                            <Box sx={styles.containerValues}>
                                <Text small style={styles.textDataPayments} bold>DESCONTO (adicional):</Text>

                                <Text small style={styles.textDataPayments}>{(typeDiscountAdditional?.real && formatter.format(valuesContract?.descontoAdicional || 0))
                                    || (typeDiscountAdditional?.porcent && parseFloat(valuesContract?.descontoAdicional || 0).toFixed(2) + '%')
                                    || '0'}</Text>
                            </Box>
                        }
                        {valuesContract.descontoAdicional && valuesContract.descontoDispensadas > 0 &&
                            <Box sx={styles.containerValues}>
                                <Text small style={styles.textDataPayments} bold>DESCONTO TOTAL:</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(parseFloat(valuesContract?.valorDescontoAdicional) + parseFloat(valuesContract?.descontoDispensadas))}</Text>
                            </Box>
                        }
                        {valuesContract.valorFinal &&
                            <Box sx={{ ...styles.containerValues, borderRadius: '0px 0px 8px 8px' }}>
                                <Text small style={styles.textDataPayments} bold>VALOR A PAGAR:</Text>
                                <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.valorFinal)}</Text>
                            </Box>
                        }
                    </Box>
                </ContentContainer>


                <ContentContainer style={{ display: 'flex', flexDirection: 'column', gap: 3, boxShadow: 'none', alignItems: 'center', marginBottom: 25 }}>
                    <Text bold>Forma de pagamento escolhida:</Text>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '80%' }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <thead>
                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Nº Parcela</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Forma</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Pagamento</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Valor da Parcela</th>
                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Pagamento</th>
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1 }}>
                                {paymentData?.map((pay, index) => {
                                    const payment = pay?.pagamento > 0 ? groupPayment?.filter(item => item.value === pay?.pagamento).map(item => item.label) : pay?.pagamento
                                    return (
                                        <tr key={`${pay}-${index}`}>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {pay?.n_parcela}</td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {pay?.tipo}
                                            </td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {payment}
                                            </td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {formatter.format(pay?.valor_parcela)}</td>
                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                {pay?.data_pagamento}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ContentContainer>

            </ContractStudentComponent>

            <ContentContainer gap={2}>
                <Text bold>Assinatura Digital:</Text>
                <Box sx={{ ...styles.inputSection, marginTop: 2 }}>
                    <TextInput placeholder='E-mail 1º' name='email_1' onChange={handleChange} value={emailDigitalSignature?.email_1 || ''} label='E-mail 1º *' sx={{ flex: 1, }} />
                    <TextInput placeholder='E-mail 2º' name='email_2' onChange={handleChange} value={emailDigitalSignature?.email_2 || ''} label='E-mail 2º' sx={{ flex: 1, }} />
                </Box>

                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
                    <Button small text="enviar" onClick={() => alert.success('Contrato enviado por e-mail para assinatura digital.')} style={{ width: '90px', height: '30px' }} />
                </Box>
            </ContentContainer>
            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
                <Button text="efetivar matrícula" onClick={() => handleCreateEnrollStudent(paymentData, valuesContract)} style={{ width: '200px', height: '35px' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button secondary text="Voltar" onClick={() => pushRouteScreen(1, 'interesse > Forma de pagamento')} style={{ width: 120 }} />
            </Box>
        </>
    )

}

export const styles = {
    containerValues: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        border: '1px solid lightgray',
        padding: '8px 15px',
        width: '100%',
        gap: 2
    },
    textDataPayments: {
        // flex: 1
    },
    inputSection: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    },
}