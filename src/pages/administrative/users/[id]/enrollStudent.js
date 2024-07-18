import { useRouter } from "next/router";
import { Box, Button, ContentContainer, Divider, PhoneInputField, Text, TextInput } from "../../../../atoms";
import { api } from "../../../../api/api";
import { useRef, useEffect, useState } from "react";
import { CheckBoxComponent, SectionHeader, SelectList } from "../../../../organisms";
import { Backdrop, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useAppContext } from "../../../../context/AppContext";
import { calculationAge, emailValidator, findCEP, formatCEP, formatCPF, formatCreditCardNumber, formatDate, formatRg, formatTimeStamp, formattedStringInDate } from "../../../../helpers";
import { ContractStudentComponent } from "../../../../organisms/contractStudent/contractStudent";
import { Forbidden } from "../../../../forbiddenPage/forbiddenPage";
import Cards from 'react-credit-cards'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { bodyContractEnrollment, responsiblePayerDataTable, userDataTable } from "../../../../helpers/bodyContract";
import { icons } from "../../../../organisms/layout/Colors";



export default function InterestEnroll() {
    const router = useRouter();
    const { setLoading, user, alert, colorPalette } = useAppContext()
    const userId = user?.id;
    const { id, interest, reenrollment, classId, courseId } = router.query;
    let isReenrollment = reenrollment ? true : false
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [interestData, setInterestData] = useState({})
    const [statusStudentData, setStatusStudentData] = useState({})
    const [enrollmentsList, setEnrollmentsList] = useState([])
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
        uf_resp: ''
    })
    const [disciplines, setDisciplines] = useState([])
    const [userData, setUserData] = useState({})
    const [disciplinesSelected, setDisciplinesSelected] = useState()
    const [disciplinesSelectedForCalculation, setDisciplinesSelectedForCalculation] = useState()
    const [disciplinesDpSelected, setDisciplinesDpSelected] = useState()
    const [indiceTela, setIndiceTela] = useState(0);
    const [routeScreen, setRouteScreen] = useState('interesse >')
    const [quantityDisciplinesSelected, setQuantityDisciplinesSelected] = useState(0)
    const [quantityDisciplinesModule, setQuantityDisciplinesModule] = useState(0)
    const [disciplinesDp, setDisciplinesDp] = useState([])
    const [classesDisciplinesDpSelected, setClassesDisciplinesDpSelected] = useState([])
    const [quantityDisciplinesDp, setQuantityDisciplinesDp] = useState(0)
    const [valuesDisciplinesDp, setValuesDisciplinesDp] = useState()
    const [valuesCourse, setValuesCourse] = useState({})
    const [courseData, setCourseData] = useState({})
    const [classData, setClassData] = useState({})
    const [classScheduleData, setClassScheduleData] = useState({})
    const [valuesContract, setValuesContract] = useState([])
    const [paymentsProfile, setPaymentsProfile] = useState([])
    const [groupResponsible, setGroupResponsible] = useState([])
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
    const [formData, setFormData] = useState()
    const [paymentsInfoData, setPaymentsInfoData] = useState()
    const [currentModule, setCurrentModule] = useState(1)
    const [showScreenDp, setShowScreenDp] = useState(false)
    const [reenrollmentDp, setReenrollmentDp] = useState([])
    const [subscriptionData, setSubscriptionData] = useState({})
    const [forma_pagamento, setPagamento] = useState()
    const [numParc, setNumParce] = useState(6)
    const [enrollmentDataSelected, setEnrollmentDataSelected] = useState({ turma_id: null })
    const [openSelectClassReprovved, setOpenSelectClassReprovved] = useState(false)
    const [isReprovved, setIsReprovved] = useState(false)
    const [listClasses, setListClasses] = useState([])

    // useEffect(() => {
    //     let interval;

    //     if (loadingEnrollment) {
    //         const messages = [
    //             'Conferindo os dados...',
    //             'Efetivando a matrícula...',
    //             'Concluído'
    //         ];

    //         let indice = 0;

    //         interval = setInterval(() => {
    //             setMessageEnrollment(messages[indice]);
    //             indice++;

    //             if (indice === messages.length) {
    //                 clearInterval(interval);

    //                 if (enrollmentCompleted?.status) {
    //                     let message = enrollmentCompleted?.status === 201 ? 'Concluído' : 'Ocorreu um erro';
    //                     setMessageEnrollment(message)
    //                     setEnrollmentCompleted({ ...enrollmentCompleted, active: true });
    //                 }

    //                 setTimeout(() => {
    //                     setLoadingEnrollment(false); // Defina loadingEnrollment como falso após um tempo
    //                     if (enrollmentCompleted?.status === 201) {
    //                         router.push(`/administrative/users/${id}`);
    //                     }
    //                 }, 500);
    //             }
    //         }, 2500);
    //     }

    //     return () => clearInterval(interval);
    // }, [loadingEnrollment, enrollmentCompleted]);


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


    const handleVerifyUser = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/student/reenrollment/verify-student/${id}`)
            const { data } = response
            setStatusStudentData(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleEnrollments = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/enrollments/user/reenrollment/${id}`)
            const { data } = response
            if (data.length > 0) {
                setEnrollmentsList(data)
            }

            const verifyStudent = await api.get(`/student/reenrollment/verify-student/${id}`)
            const studentDataEnrollment = verifyStudent?.data

            if (studentDataEnrollment?.modulo_cursando) {
                setCurrentModule(studentDataEnrollment?.modulo_cursando)
                return studentDataEnrollment?.modulo_cursando
            } else {
                setCurrentModule(1)
                return 1
            }

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleSubscription = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/subscription/interest/${interest}`)
            const { data } = response
            await setSubscriptionData(data)
            await setPagamento(data.forma_pagamento)
            return await data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleResponsible = async (userDatails) => {
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
                setGroupResponsible([
                    {
                        id: data?.id_resp_pag,
                        label: `${data.nome_resp} - (Responsavel pagante)`,
                        value: data?.id_resp_pag
                    },
                    {
                        id: userDatails?.id || userData?.id,
                        label: userDatails?.nome || userData?.nome,
                        value: userDatails?.id || userData?.id
                    },
                ])
            }
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function handleSelectModule(turma_id, currentModule) {
        setLoading(true)

        try {
            const classScheduleResponse = await api.get(`/classSchedule/disciplines/${turma_id}/${currentModule}`);
            const classScheduleData = classScheduleResponse?.data;

            const groupDisciplines = classScheduleData.map(disciplines => ({
                label: disciplines?.nome_disciplina,
                value: disciplines?.id_disciplina.toString(),
                disciplina_cobrada: disciplines?.disciplina_cobrada
            }));

            const requerimentResponse = await api.get(`/requeriment/disciplines/enrollment/${turma_id}/${currentModule}/${id}`);
            const requerimentData = requerimentResponse?.data;

            const groupDisciplinesDispensed = requerimentData?.map(discipline => ({
                label: discipline?.disciplina_id,
                value: discipline?.disciplina_id.toString(),
                disciplina_cobrada: parseInt(discipline?.disciplina_cobrada)
            })) || [];


            const flattenedDisciplinesDispensedReq = groupDisciplinesDispensed.map(discipline => discipline.value).join(', ');
            const filteredDisciplines = groupDisciplines.filter(discipline =>
                !flattenedDisciplinesDispensedReq.includes(discipline.value)
            );

            setQuantityDisciplinesModule(groupDisciplines?.length);
            setDisciplinesSelected(filteredDisciplines?.map(discipline => discipline.value).join(', '));
            setDisciplinesSelectedForCalculation(filteredDisciplines)
            setDisciplines(groupDisciplines);

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    async function handleDisciplinesDP(moduleCurrent) {
        setLoading(true);
        try {
            const response = await api.get(`/enrollment/disciplines/dp/${id}`);
            const { data } = response;
            if (data.length > 0) {
                const groupDisciplines = data.map(disciplines => ({
                    label: disciplines.nome_disciplina,
                    value: disciplines?.disciplina_id.toString(),
                    id_disc_matricula: disciplines?.id_disc_matricula
                }));

                const disciplinesSelect = groupDisciplines.map(discipline => discipline.value);
                const flattenedDisciplinesSelected = disciplinesSelect.join(', ');
                setQuantityDisciplinesDp(groupDisciplines?.length)
                setDisciplinesDpSelected(flattenedDisciplinesSelected)
                setDisciplinesDp(groupDisciplines);


                const classesList = await Promise.all(data.map(async (item) => {
                    const handleClassesToDiscipline = await api.get(`/class/next/discipline/dp/${item?.disciplina_id}/${classId}`);
                    const { data } = handleClassesToDiscipline;
                    classData.id_disc_matricula = item?.id_disc_matricula
                    classData.id_disciplina = item?.disciplina_id
                    return data;
                }));

                classesList.forEach((classes, index) => {
                    groupDisciplines[index].classes = classes;
                });
            }
        } catch (error) {
            console.log(error?.response?.data);
            return error;
        } finally {
            setLoading(false);
        }
    }


    const handleValuesCourse = async (courseId, classId) => {
        setLoading(true)
        try {
            const response = await api.get(`/coursePrices/course/historic/${courseId}?classId=${classId}`)
            const { data } = response
            if (data?.valor_total_avista == null) {
                data.valor_total_avista = data?.valor_total_curso
            }
            if (data?.valor_avista_curso == null) {
                data.valor_avista_curso = data.valor_total_curso
            }

            setValuesCourse(data)
            setNumParce(data?.n_parcelas)
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


    const handleScheduleClassData = async (classId, currentModule) => {
        try {
            const response = await api.get(`/classSchedules/moduleClass/${classId}?moduleEnrollment=${currentModule}`)
            setClassScheduleData(response?.data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handlePaymentsProfile = async () => {
        try {
            const response = await api.get(`/order/paymentProfile/${id}`)
            const { success } = response?.data
            if (success) {
                const { crediCardData } = response?.data
                const groupPaymentsPerfil = [{
                    label: `${crediCardData?.primeiros_numeros} XXXX XXXX ${crediCardData?.ultimos_numeros}`,
                    value: crediCardData?.id_cartao_credito
                }
                ];
                setShowPaymentPerfl({ newProfile: false, registeredProfile: true })
                setGroupPayment(groupPaymentsPerfil)
                setPaymentsProfile(crediCardData)
                return crediCardData
            } else {
                return null
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        handleItems()
    }, [])

    const handleVerifyReprovvedUser = async () => {
        if (isReenrollment) {
            const statusStudent = await handleVerifyUser()
            if (statusStudent?.reprovado) {
                await handleSearchClasses(statusStudent?.modulo_cursando)
                setIsReprovved(true)
                setOpenSelectClassReprovved(true)
            }
        }
    }

    const handleSearchClasses = async (moduleCourse) => {
        try {
            const response = await api.get(`/classes/course/grid/reprovved-reenrollment/${courseId}/${moduleCourse}`)
            const { data } = response
            setListClasses(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    useEffect(() => {
        handleVerifyReprovvedUser()
    }, [])

    const handleItems = async (classIdSelected) => {
        try {
            let moduleCurrent = currentModule;
            const userDatails = await handleUserData()
            const interests = await handleInterest()
            let classIdEnrollment = classIdSelected ? classIdSelected : interests?.turma_id
            let courseIdEnrollment = interests?.curso_id
            if (isReenrollment) {
                moduleCurrent = await handleEnrollments()
                await handleDisciplinesDP(moduleCurrent)
                if (enrollmentDataSelected?.turma_id) {
                    classIdEnrollment = enrollmentDataSelected?.turma_id
                } else {
                    classIdEnrollment = classIdSelected ? classIdSelected : classId
                }
                courseIdEnrollment = courseId
            }
            const subscription = await handleSubscription()
            await handleSelectModule(classIdEnrollment, moduleCurrent)
            await handleValuesCourse(courseIdEnrollment, classIdEnrollment)
            await handleCourseData(courseIdEnrollment)
            await handleClassData(classIdEnrollment, moduleCurrent)
            await handleScheduleClassData(classIdEnrollment, moduleCurrent)
            await handleResponsible(userDatails)
            await handlePaymentsProfile()
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

        if (newPaymentProfile?.dt_expiracao?.length < 7) {
            alert?.error('O ano de expiração de ser preenchido com 4 digitos. (exemplo: 2028)')
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
                    await handleResponsible()
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
                const response = await api.post(`/order/paymentProfile/create/${id}`, { newPaymentProfile, cpfUser: userData?.cpf })
                if (response?.status === 201) {
                    alert.success('Cartão de crédito adicionado.')
                    const creditCard = await handlePaymentsProfile()
                    return creditCard
                }
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
            }
        }
    }

    const handleConfirmEnrollmentSend = async () => {
        try {
            const sendConfirmationEnrollment = await api.post(`/student/enrrolments/confirmationEnrollment`, { userData, isReenrollment });
            if (sendConfirmationEnrollment?.status === 201) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log('Erro ao enviar e-mail', error)
            return error
        }
    }


    const handleUploadContract = async (pdfBlob, contractData, enrollmentId) => {
        try {
            const formData = new FormData();
            formData.append('file', pdfBlob, contractData?.name_file);

            const fileResponse = await api.post(`/student/enrrolments/contract/upload?matricula_id=${enrollmentId}`, formData)
            let file;
            console.log('criou contrato', fileResponse)
            if (fileResponse?.data) {
                const { fileId } = fileResponse?.data
                file = fileId
            }

            return file
        } catch (error) {
            console.log('erro ao criar contrato para assinatura: ', error)
        }
    }


    const handleCreateInstallments = async ({ enrollmentId, paymentInstallmentsEnrollment, creditCard }) => {
        try {
            let responsibleData;
            if (responsiblePayerData) {
                responsibleData = {
                    nome: responsiblePayerData?.nome_resp,
                    rua: responsiblePayerData?.end_resp,
                    numero: responsiblePayerData?.numero_resp,
                    cep: responsiblePayerData?.cep_resp,
                    complemento: responsiblePayerData?.compl_resp,
                    bairro: responsiblePayerData?.bairro_resp,
                    uf: responsiblePayerData?.uf_resp,
                    cidade: responsiblePayerData?.cidade_resp,
                    estado: responsiblePayerData?.estado_resp,
                    pais: responsiblePayerData?.pais_resp,
                    email: responsiblePayerData?.email_resp,
                    telefone: responsiblePayerData?.telefone_resp,
                    cpf: responsiblePayerData?.cpf_resp,
                    rg: responsiblePayerData?.rg_resp,
                }
            }
            const batchSize = 6;
            let success = true
            for (let i = 0; i < paymentInstallmentsEnrollment.length; i += batchSize) {
                const paymentInstallmentsLote = paymentInstallmentsEnrollment.slice(i, i + batchSize);
                const paymentsInstallments = await api.post(`/student/enrrolments/create/installments/enrollment`, {
                    userId: userData?.id,
                    paymentInstallmentsLote,
                    enrollmentId,
                    responsibleData,
                    creditCard
                })
                success = paymentsInstallments?.data?.success
            }
            return success;
        } catch (error) {
            console.log('Erro ao criar parcelas: ', error)
            return false
        }
    }


    const handleSendContractSigners = async ({ signerId, fileId, contractData, enrollmentId, responsiblePayerData }) => {
        try {
            const sendDoc = await api.post('/contract/enrollment/signatures/upload', { signerId, fileId, contractData, enrollmentId, responsiblePayerData })
            console.log('contrato enviado para assinatura', sendDoc)

            return sendDoc?.status
        } catch (error) {
            console.log('error enviar contrato para assinatura: ', error)
        }
    }

    const test = () => {
        let reenrollmentDataDp = []
        const valueModuleCourse = (valuesCourse?.valor_total_curso)?.toFixed(2)
        const costDiscipline = (valueModuleCourse / quantityDisciplinesModule)?.toFixed(2);
        if (isReenrollment) {

            const areDisciplinesInSameClass = classesDisciplinesDpSelected.every(
                (item, index, array) => index === 0 || item.turma === array[index - 1].turma
            );

            if (areDisciplinesInSameClass) {

                let startDate = new Date(classesDisciplinesDpSelected[0]?.dt_inicio);
                let endDate = new Date(classesDisciplinesDpSelected[0]?.dt_fim);
                reenrollmentDataDp = [
                    {
                        usuario_id: id,
                        pendencia_aluno: classesDisciplinesDpSelected?.length,
                        dt_inicio: startDate,
                        dt_final: endDate,
                        status: 'Pendente de assinatura do contrato',
                        turma_id: classesDisciplinesDpSelected[0]?.turma,
                        motivo_desistencia: null,
                        dt_desistencia: null,
                        certificado_emitido: 0,
                        desc_disp_disc: 0,
                        desc_adicional: 0,
                        desc_adicional_porc: 0,
                        valor_tl_desc: 0,
                        valor_matricula: costDiscipline * (classesDisciplinesDpSelected?.length),
                        qnt_disci_dp: classesDisciplinesDpSelected?.length,
                        usuario_resp: userId,
                        vl_disci_dp: costDiscipline * (classesDisciplinesDpSelected?.length),
                        rematricula: 1,
                        modulo: classesDisciplinesDpSelected[0]?.modulo,
                        cursando_dp: 1,
                        nome_turma: classesDisciplinesDpSelected[0]?.nome_turma
                    }
                ]

                setReenrollmentDp(reenrollmentDataDp)

            } else {
                reenrollmentDataDp = classesDisciplinesDpSelected.map((item, index) => ({
                    usuario_id: id,
                    pendencia_aluno: 1,
                    dt_inicio: new Date(item?.dt_inicio),
                    dt_final: new Date(item?.dt_fim),
                    status: 'Pendente de assinatura do contrato',
                    turma_id: item.turma,
                    motivo_desistencia: null,
                    dt_desistencia: null,
                    certificado_emitido: 0,
                    desc_disp_disc: 0,
                    desc_adicional: 0,
                    desc_adicional_porc: 0,
                    valor_tl_desc: 0,
                    valor_matricula: costDiscipline,
                    qnt_disci_dp: 1,
                    usuario_resp: userId,
                    vl_disci_dp: costDiscipline,
                    rematricula: 1,
                    modulo: item?.modulo,
                    cursando_dp: 1,
                    nome_turma: item?.nome_turma

                }))
                setReenrollmentDp(reenrollmentDataDp)
            }
        }
    }

    useEffect(() => {
        test()
    }, [classesDisciplinesDpSelected])

    const handleCreateEnrollStudent = async (enrollment, valuesContract, paymentsInfoData, pdfBlob, contractData) => {

        let startDateEnrollment = `2024-08-05`;
        let endDateEnrollment = `2024-12-20`;

        let enrollmentData = {
            usuario_id: id,
            pendencia_aluno: null,
            // dt_inicio: new Date(classScheduleData?.dt_inicio_cronograma) || new Date(classData?.inicio),
            dt_inicio: isReenrollment ? new Date(startDateEnrollment) : new Date(classData?.inicio),
            dt_final: isReenrollment ? new Date(endDateEnrollment) : new Date(classData?.fim),
            // dt_final: new Date(classScheduleData?.dt_fim_cronograma) || new Date(classData?.fim),
            status: isReenrollment ? 'Aguardando início' : 'Pendente de assinatura do contrato',
            turma_id: classData?.id_turma,
            motivo_desistencia: null,
            dt_desistencia: null,
            certificado_emitido: 0,
            desc_disp_disc: valuesContract?.descontoDispensadas || 0,
            desc_adicional: valuesContract?.valorDescontoAdicional || 0,
            desc_adicional_porc: valuesContract?.descontoAdicional || 0,
            valor_tl_desc: (parseFloat(valuesContract?.valorDescontoAdicional || 0) + parseFloat(valuesContract?.descontoDispensadas)),
            valor_matricula: valuesContract?.valorFinal || 0,
            qnt_disci_disp: valuesContract?.qntDispensadas || 0,
            usuario_resp: userId,
            vl_disci_dp: 0,
            qnt_disci_dp: 0,
            rematricula: isReenrollment ? 1 : 0,
            modulo: isReenrollment ? currentModule : 1,
            cursando_dp: 0
        }

        let paymentInstallmentsEnrollment = enrollment?.map((payment, index) =>

            payment?.filter(pay => pay?.valor_parcela)?.map((item) => ({
                usuario_id: id,
                resp_pagante_id: item?.resp_pagante_id,
                aluno: userData?.nome,
                vencimento: formattedStringInDate(item?.data_pagamento),
                dt_pagamento: null,
                valor_parcela: parseFloat(item?.valor_parcela).toFixed(2),
                n_parcela: item?.n_parcela,
                c_custo: 178,
                forma_pagamento: item?.tipo,
                cartao_credito_id: item?.pagamento > 0 ? item?.pagamento : null,
                conta: 34,
                obs_pagamento: null,
                status_gateway: null,
                status_parcela: 'Pendente',
                parc_protestada: 0,
                usuario_resp: userId
            })));

        let paymentEntryData = {};
        if (paymentsInfoData?.valueEntry > 0) {
            const dateForPaymentEntry = paymentsInfoData?.dateForPaymentEntry;

            paymentEntryData = {
                usuario_id: id,
                resp_pagante_id: responsiblePayerData?.id_resp_pag,
                aluno: userData?.nome,
                vencimento: dateForPaymentEntry,
                dt_pagamento: dateForPaymentEntry,
                valor_parcela: parseFloat(paymentsInfoData?.valueEntry).toFixed(2),
                n_parcela: 0,
                c_custo: 178,
                forma_pagamento: paymentsInfoData?.typePaymentEntry,
                cartao_credito_id: null,
                conta: 34,
                obs_pagamento: 'Pagamento de entrada do curso realizado presencialmente',
                status_gateway: 'Pago',
                status_parcela: 'Pago',
                parc_protestada: 0,
                usuario_resp: userId
            }
        }

        setLoadingEnrollment(true);

        try {
            const response = await api.post(`/student/enrrolments/create/${id}`, { enrollmentData, disciplinesSelected, disciplinesModule: disciplines, paymentEntryData, currentModule },);
            const { data } = response
            if (response?.status === 201) {

                const createInstallments = await handleCreateInstallments({ enrollmentId: data, paymentInstallmentsEnrollment, creditCard: paymentsProfile })
                if (createInstallments) {

                    if (isReenrollment) {
                        alert.success('Matrícula efetivada com sucesso!')
                    } else {
                        const fileId = await handleUploadContract(pdfBlob, contractData, data)
                        const sendDoc = await handleSendContractSigners({ signerId: id, fileId, contractData, enrollmentId: data, responsiblePayerData })
                        if (sendDoc === 200) {
                            alert.success('Matrícula efetivada e contrato enviado por e-mail para assinatura.')
                        } else {
                            alert.error('Houve um erro ao enviar contrato para assinatura.')
                        }
                        alert.success('Matrícula efetivada. Seu contrato será enviado por e-mail..')
                    }
                } else {
                    alert.error('Houve um erro ao enviar contrato para assinatura.')
                }
            }
            else {
                setEnrollmentCompleted({ ...enrollmentCompleted, status: 500 });
                alert.error('Ocorreu um erro ao maticular o aluno.')
            }
            router.push(`/`);
        } catch (error) {
            console.log(error);
            alert.error('Ocorreu um erro ao maticular o aluno.')
            return error;
        } finally {
            handleConfirmEnrollmentSend()
            setLoadingEnrollment(false)
        }
    }


    const handleCreateReEnrollStudentDp = async (enrollment, valuesContract, paymentsInfoData, pdfBlob, contractData) => {
        let reenrollmentDataDp = []
        const valueModuleCourse = (valuesCourse?.valor_total_curso)?.toFixed(2)
        const costDiscipline = (valueModuleCourse / quantityDisciplinesModule)?.toFixed(2);
        if (isReenrollment) {

            const areDisciplinesInSameClass = classesDisciplinesDpSelected.every(
                (item, index, array) => index === 0 || item.turma === array[index - 1].turma
            );


            if (areDisciplinesInSameClass) {

                let startDateEnrollment = `2024-08-05`;
                let endDateEnrollment = `2024-12-20`;
                let startDate = new Date(classesDisciplinesDpSelected[0]?.dt_inicio);
                let endDate = new Date(classesDisciplinesDpSelected[0]?.dt_fim);

                reenrollmentDataDp = [
                    {
                        usuario_id: id,
                        pendencia_aluno: classesDisciplinesDpSelected?.length,
                        dt_inicio: isReenrollment ? new Date(startDateEnrollment) : startDate,
                        dt_final: isReenrollment ? new Date(endDateEnrollment) : endDate,
                        status: 'Pendente de assinatura do contrato',
                        turma_id: classesDisciplinesDpSelected[0]?.turma,
                        motivo_desistencia: null,
                        dt_desistencia: null,
                        certificado_emitido: 0,
                        desc_disp_disc: 0,
                        desc_adicional: 0,
                        desc_adicional_porc: 0,
                        valor_tl_desc: 0,
                        valor_matricula: costDiscipline * (classesDisciplinesDpSelected?.length),
                        qnt_disci_dp: classesDisciplinesDpSelected?.length,
                        usuario_resp: userId,
                        vl_disci_dp: costDiscipline * (classesDisciplinesDpSelected?.length),
                        rematricula: 1,
                        modulo: classesDisciplinesDpSelected[0]?.modulo,
                        cursando_dp: 1
                    }
                ]

            } else {
                reenrollmentDataDp = classesDisciplinesDpSelected.map((item, index) => ({
                    usuario_id: id,
                    pendencia_aluno: 1,
                    dt_inicio: isReenrollment ? new Date(startDateEnrollment) : new Date(item?.dt_inicio),
                    dt_final: isReenrollment ? new Date(endDateEnrollment) : new Date(item?.dt_fim),
                    status: 'Aguardando inicio',
                    turma_id: item.turma,
                    motivo_desistencia: null,
                    dt_desistencia: null,
                    certificado_emitido: 0,
                    desc_disp_disc: 0,
                    desc_adicional: 0,
                    desc_adicional_porc: 0,
                    valor_tl_desc: 0,
                    valor_matricula: costDiscipline,
                    qnt_disci_dp: 1,
                    usuario_resp: userId,
                    vl_disci_dp: costDiscipline,
                    rematricula: 1,
                    modulo: item?.modulo,
                    cursando_dp: 1
                }))
            }
        }

        let paymentInstallmentsEnrollment = enrollment?.map((payment, index) =>

            payment?.filter(pay => pay?.valor_parcela)?.map((item) => ({
                usuario_id: id,
                resp_pagante_id: item?.resp_pagante_id,
                aluno: userData?.nome,
                vencimento: formattedStringInDate(item?.data_pagamento),
                dt_pagamento: null,
                valor_parcela: parseFloat(item?.valor_parcela).toFixed(2),
                n_parcela: item?.n_parcela,
                c_custo: 178,
                forma_pagamento: item?.tipo,
                cartao_credito_id: item?.pagamento > 0 ? item?.pagamento : null,
                conta: 34,
                obs_pagamento: null,
                status_gateway: null,
                status_parcela: 'Pendente',
                parc_protestada: 0,
                usuario_resp: userId
            })));

        let paymentEntryData = {};
        if (paymentsInfoData?.valueEntry > 0) {
            const dateForPaymentEntry = paymentsInfoData?.dateForPaymentEntry;

            paymentEntryData = {
                usuario_id: id,
                resp_pagante_id: responsiblePayerData?.id_resp_pag,
                aluno: userData?.nome,
                vencimento: dateForPaymentEntry,
                dt_pagamento: dateForPaymentEntry,
                valor_parcela: parseFloat(paymentsInfoData?.valueEntry).toFixed(2),
                n_parcela: 0,
                c_custo: 178,
                forma_pagamento: paymentsInfoData?.typePaymentEntry,
                cartao_credito_id: null,
                conta: 34,
                obs_pagamento: 'Pagamento de entrada do curso realizado presencialmente',
                status_gateway: 'Pago',
                status_parcela: 'Pago',
                parc_protestada: 0,
                usuario_resp: userId
            }
        }

        setLoadingEnrollment(true);

        try {
            const response = await api.post(`/student/reenrrolments/dp/create/${id}`, { reenrollmentDataDp, classesDisciplinesDpSelected, paymentEntryData });
            const { data } = response

            if (response?.status === 201) {

                const createInstallments = await handleCreateInstallments({ enrollmentId: data, paymentInstallmentsEnrollment, creditCard: paymentsProfile })
                if (createInstallments) {

                    if (isReenrollment) {
                        alert.success('Matrícula efetivada com sucesso!')
                        window.location.reload();
                    } else {
                        const fileId = await handleUploadContract(pdfBlob, contractData, data)
                        const sendDoc = await handleSendContractSigners({ signerId: id, fileId, contractData, enrollmentId: data, responsiblePayerData })
                        if (sendDoc === 200) {
                            alert.success('Matrícula efetivada e contrato enviado por e-mail para assinatura.')
                        } else {
                            alert.error('Houve um erro ao enviar contrato para assinatura.')
                        }
                        alert.success('Matrícula das disciplinas pendentes realizada.')
                        window.location.reload();
                    }
                } else {
                    alert.error('Houve um erro ao enviar contrato para assinatura.')
                }
            }
            else {
                setEnrollmentCompleted({ ...enrollmentCompleted, status: 500 });
                alert.error('Ocorreu um erro ao maticular o aluno.')
            }
        } catch (error) {
            console.log(error);
            alert.error('Ocorreu um erro ao maticular o aluno.')
            return error;
        } finally {
            setLoadingEnrollment(false)
        }
    }

    const telas = [
        (
            <>
                <EnrollStudentDetails
                    isReprovved={isReprovved}
                    subscriptionData={subscriptionData}
                    handleCreateResponsible={handleCreateResponsible}
                    numParc={numParc}
                    setDisciplinesSelected={setDisciplinesSelected}
                    disciplinesSelected={disciplinesSelected}
                    disciplines={disciplines}
                    valuesCourse={valuesCourse}
                    userData={userData}
                    isReenrollment={isReenrollment}
                    interestData={interestData}
                    setLoading={setLoading}
                    setCheckValidateScreen={setCheckValidateScreen}
                    pushRouteScreen={pushRouteScreen}
                    disciplinesDp={disciplinesDp}
                    classesDisciplinesDpSelected={classesDisciplinesDpSelected}
                    setClassesDisciplinesDpSelected={setClassesDisciplinesDpSelected}
                    disciplinesDpSelected={disciplinesDpSelected}
                    courseData={courseData}
                    classData={classData}
                    classScheduleData={classScheduleData}
                    currentModule={currentModule}
                    valuesDisciplinesDp={valuesDisciplinesDp}
                    setValuesDisciplinesDp={setValuesDisciplinesDp}
                    showScreenDp={showScreenDp} setShowScreenDp={setShowScreenDp}
                    quantityDisciplinesSelected={quantityDisciplinesSelected}
                    quantityDisciplinesModule={quantityDisciplinesModule}
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
                    groupResponsible={groupResponsible}
                    paying={paying}
                    setPaying={setPaying}
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
                    paymentsInfoData={paymentsInfoData}
                    setPaymentsInfoData={setPaymentsInfoData}
                    quantityDisciplinesDp={quantityDisciplinesDp}
                    userId={id}
                    emailDigitalSignature={emailDigitalSignature}
                    setEmailDigitalSignature={setEmailDigitalSignature}
                    handleCreateEnrollStudent={handleCreateEnrollStudent}
                    handleCreateReEnrollStudentDp={handleCreateReEnrollStudentDp}
                    setFormData={setFormData}
                    reenrollmentDp={reenrollmentDp}
                    forma_pagamento={subscriptionData?.forma_pagamento}
                />
            </>
        ),
        (
            <>
                <Payment
                    disciplines={disciplines}
                    courseData={courseData}
                    disciplinesSelectedForCalculation={disciplinesSelectedForCalculation}
                    setCheckValidateScreen={setCheckValidateScreen}
                    isReenrollment={isReenrollment}
                    quantityDisciplinesSelected={quantityDisciplinesSelected}
                    quantityDisciplinesModule={quantityDisciplinesModule}
                    valuesCourse={valuesCourse}
                    setValuesContract={setValuesContract}
                    setPaymentForm={setPaymentForm}
                    valuesContract={valuesContract}
                    classesDisciplinesDpSelected={classesDisciplinesDpSelected}
                    paymentForm={paymentForm}
                    updatedScreen={updatedScreen}
                    responsiblePayerData={responsiblePayerData}
                    setResponsiblePayerData={setResponsiblePayerData}
                    handleAddResponsible={handleCreateResponsible}
                    handleUpdateResponsible={handleUpdateResponsible}
                    handleDeleteResponsible={handleDeleteResponsible}
                    groupResponsible={groupResponsible}
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
                    paymentsInfoData={paymentsInfoData}
                    setPaymentsInfoData={setPaymentsInfoData}
                    quantityDisciplinesDp={quantityDisciplinesDp}
                    setValuesDisciplinesDp={setValuesDisciplinesDp}
                    valuesDisciplinesDp={valuesDisciplinesDp}
                    disciplinesDpSelected={disciplinesDpSelected}
                    currentModule={currentModule}
                    classScheduleData={classScheduleData}
                    forma_pagamento={subscriptionData?.forma_pagamento}
                    numParc={numParc}
                />
            </>
        ),
        (
            <>
                <ContractStudent
                    setCheckValidateScreen={setCheckValidateScreen}
                    paymentForm={paymentForm}
                    isReenrollment={isReenrollment}
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
                    setFormData={setFormData}
                    paymentsInfoData={paymentsInfoData} setPaymentsInfoData={setPaymentsInfoData}
                    quantityDisciplinesDp={quantityDisciplinesDp}
                    currentModule={currentModule}
                    classScheduleData={classScheduleData}
                    classesDisciplinesDpSelected={classesDisciplinesDpSelected}
                    handleCreateReEnrollStudentDp={handleCreateReEnrollStudentDp}
                    forma_pagamento={subscriptionData?.forma_pagamento}
                />
            </>
        )
    ];



    return (
        <>
            <SectionHeader
                perfil={routeScreen || 'Matricula'}
                title={!isReenrollment ? 'Matrícula' : 'Rematrícula'}
            />
            <Text>{userData?.nome}, você está iniciando sua {!isReenrollment ? 'matrícula' : 'rematrícula'} no curso escolhido.
                Para realizá-la é necessário cumprir os 3 passos:
            </Text>

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

            <Backdrop sx={{ zIndex: 99999999 }} open={openSelectClassReprovved}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>
                        <Text bold title>Aluno Reprovado</Text>
                        <Text>Selecione uma turma disponível para cursar novamente o módulo reprovado</Text>
                    </Box>
                    <Text light large>Turmas Disponíveis:</Text>

                    <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                        {listClasses?.map((item, index) => {
                            const title = `${item.nome_turma}_${item?.periodo}`;
                            const selected = enrollmentDataSelected?.turma_id === item?.turma_id
                            return (
                                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 16,
                                            height: 16,
                                            borderRadius: 16,
                                            cursor: 'pointer',
                                            transition: '.5s',
                                            border: !selected ? `1px solid ${colorPalette.textColor}` : '',
                                            '&:hover': {
                                                opacity: selected ? 0.8 : 0.6,
                                                boxShadow: selected ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                            }
                                        }}
                                        onClick={async () => {
                                            setEnrollmentDataSelected({ turma_id: item?.turma_id })
                                            handleItems(item?.turma_id)
                                            setOpenSelectClassReprovved(false)
                                        }}
                                    >
                                        {selected ? (
                                            <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 11,
                                                    height: 11,
                                                    borderRadius: 11,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        opacity: selected ? 0.8 : 0.6,
                                                        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                    },
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Text small>{title}</Text>
                                </Box>
                            );
                        })}
                    </Box>

                </ContentContainer>
            </Backdrop >
        </>
        // :
        // <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        //     <Text bold title> Ocorreu um erro ao buscar turma.</Text>
        // </Box>
    )
}

export const EnrollStudentDetails = (props) => {

    const {
        disciplinesSelected,
        disciplines,
        disciplinesDp,
        setDisciplinesSelected,
        disciplinesDpSelected,
        interestData,
        pushRouteScreen,
        valuesCourse,
        isReenrollment,
        courseData,
        classData,
        currentModule,
        valuesDisciplinesDp,
        setValuesDisciplinesDp,
        classScheduleData,
        classesDisciplinesDpSelected,
        setClassesDisciplinesDpSelected,
        showScreenDp,
        setShowScreenDp,
        quantityDisciplinesSelected,
        quantityDisciplinesModule,
        setValuesContract,
        valuesContract,
        setPaymentForm,
        responsiblePayerData,
        updatedScreen,
        setResponsiblePayerData,
        handleAddResponsible,
        handleUpdateResponsible,
        groupResponsible,
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
        paymentsInfoData, setPaymentsInfoData,
        quantityDisciplinesDp,
        setCheckValidateScreen,
        paymentForm,
        userId,
        emailDigitalSignature,
        setEmailDigitalSignature,
        handleCreateEnrollStudent,
        reenrollmentDp,
        handleCreateReEnrollStudentDp,
        isReprovved,
        subscriptionData,
        numParc,
        handleCreateResponsible
    } = props

    const { colorPalette, theme, alert } = useAppContext()
    const [indiceScreenDp, setIndiceScreenDp] = useState(0)
    const [routeScreenDp, setRouteScreenDp] = useState('Pagamento >')

    const patchRouthDp = (indice, route) => {
        setIndiceScreenDp(indice)
        setRouteScreenDp(route);
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const handleSelect = (item, uniqueKey, discipl) => {
        const isSelected = classesDisciplinesDpSelected.some(
            (selection) => selection.uniqueKey === uniqueKey
        );
        const disciplineId = discipl.value;
        const disciplineSelected = classesDisciplinesDpSelected.some(
            (selection) => selection.disciplina === disciplineId
        );

        if (isSelected) {
            const newSelections = classesDisciplinesDpSelected.filter(
                (selection) => selection.uniqueKey !== uniqueKey
            );
            setClassesDisciplinesDpSelected(newSelections);
        } else {
            if (disciplineSelected) {
                const newSelectionsDisc = classesDisciplinesDpSelected.filter(
                    (selection) => selection.disciplina !== disciplineId
                );
                setClassesDisciplinesDpSelected((prevSelections) => [
                    ...newSelectionsDisc,
                    {
                        id_disc_matricula: discipl?.id_disc_matricula,
                        disciplina_cobrada: item?.disciplina_cobrada,
                        uniqueKey,
                        turma: item.turma_id,
                        disciplina: disciplineId,
                        dt_fim: item?.inicio,
                        dt_inicio: item?.fim,
                        modulo: item?.modulo_grade,
                        periodo: item?.periodo,
                        nome_disciplina: item?.nome_disciplina,
                        nome_turma: item?.nome_turma
                    },
                ]);
            } else {
                setClassesDisciplinesDpSelected((prevSelections) => [
                    ...prevSelections,
                    {
                        uniqueKey,
                        id_disc_matricula: discipl?.id_disc_matricula,
                        disciplina_cobrada: item?.disciplina_cobrada,
                        turma: item.turma_id,
                        disciplina: disciplineId,
                        dt_fim: item?.inicio,
                        dt_inicio: item?.fim,
                        modulo: item?.modulo_grade,
                        periodo: item?.periodo,
                        nome_disciplina: item?.nome_disciplina,
                        nome_turma: item?.nome_turma
                    },
                ]);
            }
        }
    };

    const screensDP = [
        (
            <>
                <Payment
                    disciplines={disciplines}
                    courseData={courseData}
                    setCheckValidateScreen={setCheckValidateScreen}
                    isReenrollment={isReenrollment}
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
                    handleUpdateResponsible={handleUpdateResponsible}
                    handleDeleteResponsible={handleDeleteResponsible}
                    groupResponsible={groupResponsible}
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
                    paymentsInfoData={paymentsInfoData}
                    setPaymentsInfoData={setPaymentsInfoData}
                    quantityDisciplinesDp={quantityDisciplinesDp}
                    setValuesDisciplinesDp={setValuesDisciplinesDp}
                    valuesDisciplinesDp={valuesDisciplinesDp}
                    currentModule={currentModule}
                    classScheduleData={classScheduleData}
                    isDp={true}
                    classesDisciplinesDpSelected={classesDisciplinesDpSelected}
                    handleAddResponsible={handleCreateResponsible}
                    disciplinesDpSelected={disciplinesDpSelected}
                    forma_pagamento={subscriptionData?.forma_pagamento}
                    numParc={numParc}
                />
            </>
        ),
        (
            <>
                {paymentForm.length > 0 &&
                    <ContractStudent
                        setCheckValidateScreen={setCheckValidateScreen}
                        paymentForm={paymentForm}
                        isReenrollment={isReenrollment}
                        valuesContract={valuesContract}
                        courseData={courseData}
                        classData={classData}
                        userId={userId}
                        responsiblePayerData={responsiblePayerData}
                        emailDigitalSignature={emailDigitalSignature}
                        setEmailDigitalSignature={setEmailDigitalSignature}
                        typeDiscountAdditional={typeDiscountAdditional}
                        setTypeDiscountAdditional={setTypeDiscountAdditional}
                        groupPayment={groupPayment}
                        handleCreateEnrollStudent={handleCreateEnrollStudent}
                        pushRouteScreen={pushRouteScreen}
                        // setFormData={setFormData}
                        paymentsInfoData={paymentsInfoData} setPaymentsInfoData={setPaymentsInfoData}
                        quantityDisciplinesDp={quantityDisciplinesDp}
                        currentModule={currentModule}
                        classScheduleData={classScheduleData}
                        isDp={true}
                        reenrollmentDp={reenrollmentDp}
                        classesDisciplinesDpSelected={classesDisciplinesDpSelected}
                        handleCreateReEnrollStudentDp={handleCreateReEnrollStudentDp}
                        forma_pagamento={subscriptionData?.forma_pagamento}
                    />}
            </>
        )
    ]

    return (
        <>
            <ContentContainer gap={2}>
                <Text bold title>{!isReenrollment ? 'Interesse' : 'Dados Curso'}</Text>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    {!isReenrollment ?
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Curso:</Text>
                                <Text>{interestData?.nome_curso}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Turma:</Text>
                                <Text>{interestData?.nome_turma}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Periodo:</Text>
                                <Text>{interestData?.periodo_interesse}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Observação: </Text>
                                <Text>{interestData?.observacao_int || '-'}</Text>
                            </Box>
                        </Box>
                        :
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Curso:</Text>
                                <Text>{courseData?.nome_curso}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Turma:</Text>
                                <Text>{classData?.nome_turma}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Periodo:</Text>
                                <Text>{classData?.periodo}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'start', flexDirection: 'column', gap: 0.5 }}>
                                <Text bold>Observação: </Text>
                                <Text>Rematricula - {currentModule}º Semestre/Módulo</Text>
                            </Box>
                        </Box>
                    }
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: colorPalette?.primary, padding: '5px 10px' }}>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 25,
                            height: 25,
                            aspectRatio: '1/1',
                            backgroundImage: `url('/icons/coin_icon.png')`,
                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                            transition: 'background-color 1s',
                            transition: '.3s',
                        }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Text large>Valor Bruto:</Text>
                            <Text large bold>{formatter.format(valuesCourse?.valor_total_curso)}</Text>
                        </Box>
                    </Box>
                </Box>
            </ContentContainer>

            <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
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

            {(isReenrollment && disciplinesDp.length > 0 && !isReprovved) &&
                <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px', border: `1px solid ${colorPalette.buttonColor}` }} gap={3}>
                    <ContentContainer fullWidth gap={3}>
                        <Text bold title >Disciplinas em Pendência</Text>
                        <Text bold style={{ color: 'red' }}>Se optar por matrícular as disciplinas em pêndencia, é necessário primeiro efeturar o pagamento das mesmas,
                            e então seguir com o processo de rematrícula.</Text>
                        {disciplinesDp.map((discipl, index) => (
                            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                                <Text bold>{discipl.label}</Text>
                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                    {discipl?.classes?.map((item, index) => {
                                        const title = `${item?.nome_disciplina}-${item.nome_turma}_${item.modulo_grade}_${item?.periodo}`;
                                        // const selected = classesDisciplinesDpSelected.turma === item.turma_id &&
                                        //     classesDisciplinesDpSelected.disciplina_id === item.disciplina_id;
                                        const uniqueKey = `${item.turma_id}-${discipl.value}`;
                                        const selected = classesDisciplinesDpSelected.some(
                                            (selection) => selection.uniqueKey === uniqueKey
                                        )
                                        return (
                                            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: 16,
                                                        cursor: 'pointer',
                                                        transition: '.5s',
                                                        border: !selected ? `1px solid ${colorPalette.textColor}` : '',
                                                        '&:hover': {
                                                            opacity: selected ? 0.8 : 0.6,
                                                            boxShadow: selected ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                        }
                                                    }}
                                                    onClick={() => handleSelect(item, uniqueKey, discipl)}
                                                >
                                                    {selected ? (
                                                        <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                width: 11,
                                                                height: 11,
                                                                borderRadius: 11,
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    opacity: selected ? 0.8 : 0.6,
                                                                    boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                                <Text small>{title}</Text>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        ))}
                        <Box sx={{ width: '100%', justifyContent: 'flex-start', display: 'flex' }}>
                            <Button small text="pagamento" style={{ width: 120, height: 30 }} onClick={() => {
                                if (classesDisciplinesDpSelected.length > 0) {
                                    setShowScreenDp(true)
                                } else {
                                    alert.info('Selecione as disciplinas em pendência que deseja cursar.')
                                }
                            }} />
                        </Box>
                    </ContentContainer>
                </ContentContainer>
            }
            <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button text="Continuar" onClick={() => pushRouteScreen(1, 'interesse > Pagamento')} style={{ width: 120 }} />
            </Box>

            <Backdrop open={showScreenDp}>
                <ContentContainer style={{
                    maxHeight: { xs: '90%', sm: '90%', md: '90%', lg: 700, xl: 900 },
                    width: { xs: '70%', sm: '70%', md: '70%', lg: 1080, xl: 1400 },
                    marginLeft: 20,
                    overflowY: 'auto',
                    position: 'relative'
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Text bold={true} large={true}>Pagamento Disciplinas em Pêndencia</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 17,
                            height: 17,
                            aspectRatio: '1/1',
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowScreenDp(false)} />
                    </Box>

                    {showScreenDp === true &&
                        <Box sx={{ overflowY: 'auto', }}>
                            {screensDP[indiceScreenDp]}
                        </Box>
                    }
                    <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end', alignItems: 'center', }}>
                        <Button text="Voltar" onClick={() => indiceScreenDp[indiceScreenDp] !== 0 && patchRouthDp(0, 'Pagamento >')} style={{ width: 120, opacity: indiceScreenDp[indiceScreenDp] === 0 ? 0.5 : 1 }} />
                        {indiceScreenDp < 1 && <Button text="Continuar" onClick={() => patchRouthDp(1, 'Pagamento > Contrato')} style={{ width: 120 }} />}
                    </Box>
                </ContentContainer>
            </Backdrop>
        </>
    )
}

export const Payment = (props) => {
    const {
        isReenrollment,
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
        groupResponsible,
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
        pushRouteScreen,
        paymentsInfoData, setPaymentsInfoData,
        quantityDisciplinesDp,
        valuesDisciplinesDp,
        setValuesDisciplinesDp,
        disciplinesDpSelected,
        classScheduleData,
        classesDisciplinesDpSelected,
        isDp,
        disciplinesSelectedForCalculation,
        disciplines,
        forma_pagamento,
        numParc,
        courseData
    } = props

    const [totalValueFinnaly, setTotalValueFinnaly] = useState()
    const [totalValueComDiscount, setTotalValueComDiscount] = useState()
    const [totalValueAVista, setTotalValueAVista] = useState()
    const [creditCardSelected, setCreditCardSelected] = useState(null)
    const [disciplineDispensedPorcent, setDisciplineDispensedPorcent] = useState()
    const [valueParcel, setValueParcel] = useState()
    const [valueParcelTwo, setValueParcelTwo] = useState()
    const [groupDaysForPay, setGroupDaysForPay] = useState()
    const [totalParcel, setTotalParcel] = useState()
    const [dispensedDisciplines, setDispensedDisciplines] = useState()
    const [discountDispensed, setDiscountDispensed] = useState()
    const [numberOfInstallments, setNumberOfInstallments] = useState(6)
    const [numberOfInstallmentSecondCard, setNumberOfInstallmentSecondCard] = useState(6)
    const [dayForPayment, setDayForPayment] = useState()
    const [monthForPayment, setMonthDayForPayment] = useState()
    const initialTypePaymentsSelected = Array.from({ length: numberOfInstallments }, () => ({ tipo: '', valor_parcela: '', n_parcela: null, data_pagamento: '' }));
    const initialTypePaymentsSelectedTwo = Array.from({ length: numberOfInstallmentSecondCard }, () => ({ tipo: '', valor_parcela: '', n_parcela: null, data_pagamento: '' }));
    const [typePaymentsSelected, setTypePaymentsSelected] = useState(initialTypePaymentsSelected);
    const [typePaymentsSelectedTwo, setTypePaymentsSelectedTwo] = useState(initialTypePaymentsSelectedTwo);
    const [globalTypePaymentsSelected, setGlobalTypePaymentsSelected] = useState('');
    const [globalTypePaymentsSelectedTwo, setGlobalTypePaymentsSelectedTwo] = useState('');
    const [aditionalDiscount, setAditionalDiscount] = useState({ desconto_adicional: '', desconto_formatado: '', jurosPagamentoEstendido: 0, desconto_ex_aluno: 0, desconto_avista: 0 })
    const { colorPalette, alert, theme } = useAppContext()
    const [focusedCreditCard, setFocusedCreditCard] = useState('');
    const [twoCards, setTwoCards] = useState(false)
    const [purchaseValues, setPurchaseValues] = useState({
        firstCard: '',
        secondCard: ''
    })
    const [responsiblesPayers, setResponsiblesPayers] = useState({ first: '', second: '' });
    const [hasEntry, setHasEntry] = useState()
    const [paymentEntry, setPaymentEntry] = useState()
    const [typePaymentEntry, setTypePaymentEntry] = useState('')
    const [formPaymentEntry, setFormPaymentEntry] = useState()
    const [dateForPaymentEntry, setDateForPaymentEntry] = useState()


    const calculationDayPayment = async () => {


        if (globalTypePaymentsSelected === 'Cartão') {
            const currentDate = new Date();
            const year = currentDate.getMonth() + 2 > 12 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
            const nextMonth = currentDate.getMonth() + 2 > 12 ? 1 : currentDate.getMonth() + 2;
            const nextMonthString = String(nextMonth).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${nextMonthString}-${day}`;
            setDayForPayment(currentDate.getDate() + 1)
            setMonthDayForPayment(formattedDate)
        } else {

            const dataAtual = new Date();
            let datePayment;

            const mesAtual = dataAtual.getMonth();
            const anoAtual = dataAtual.getFullYear();
            if (mesAtual > 5) {
                datePayment = new Date();
            } else {
                datePayment = `${anoAtual}-07-${dataAtual.getDate()}`
                datePayment = new Date(datePayment)
            }

            const year = datePayment.getMonth() + 2 > 12 ? datePayment.getFullYear() + 1 : datePayment.getFullYear();
            const nextMonth = datePayment.getMonth() + 2 > 12 ? 1 : datePayment.getMonth() + 2;
            const nextMonthString = String(nextMonth).padStart(2, '0');
            const month = String(datePayment.getMonth() + 1).padStart(2, '0');
            const day = String(datePayment.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${nextMonthString}-${day}`;
            const formattedDateNow = `${year}-${month}-${day}`;

            if (monthForPayment == null) {
                setMonthDayForPayment(`${anoAtual}-07-${dataAtual.getDate()}`)

            }
            if (!dayForPayment) {
                setDayForPayment(dataAtual.getDate())
            }
            setDateForPaymentEntry(formattedDateNow)
        }
    }


    useEffect(() => {

        let calculationDisciplinesModule = disciplines?.filter(item => item?.disciplina_cobrada === 1)?.length;
        let calculationDisciplinesSelected = disciplinesSelectedForCalculation?.filter(item => item?.disciplina_cobrada === 1)?.length;
        let calculationDisciplinesDpSelected = classesDisciplinesDpSelected?.filter(item => item?.disciplina_cobrada === 1);

        if (calculationDisciplinesModule > 0 || calculationDisciplinesSelected > 0) {
            let disciplinesDispensed = calculationDisciplinesModule - calculationDisciplinesSelected;
            let calculationPorcentage = (disciplinesDispensed / calculationDisciplinesModule) * 100;
            let porcentDisciplineDispensed = `${(calculationPorcentage).toFixed(2)}%`;

            let valueModuleCourse = (valuesCourse?.valor_total_curso).toFixed(2);
            let costDiscipline = (valueModuleCourse / calculationDisciplinesModule).toFixed(2);
            let calculationDiscount = (costDiscipline * disciplinesDispensed).toFixed(2)
            let valueFinally = (valueModuleCourse - calculationDiscount).toFixed(2)
            let valuesDisciplineDpTotal = (costDiscipline * (calculationDisciplinesDpSelected?.length)).toFixed(2)


            if (isReenrollment) {
                if (isDp) {
                    disciplinesDispensed = 0;
                    porcentDisciplineDispensed = '0.00%';
                    valueModuleCourse = valuesDisciplineDpTotal;
                    calculationDiscount = 0;
                    valueFinally = parseFloat(valuesDisciplineDpTotal)
                }
            }
            setTotalValueFinnaly(valueFinally)
            setDisciplineDispensedPorcent(porcentDisciplineDispensed)
            setDispensedDisciplines(disciplinesDispensed)
            setDiscountDispensed(calculationDiscount)
            setValuesDisciplinesDp(valuesDisciplineDpTotal)
            setValuesContract({
                valorSemestre: valuesCourse?.valor_total_curso,
                qntDispensadas: disciplinesDispensed,
                descontoDispensadas: calculationDiscount,
                descontoPorcentagemDisp: porcentDisciplineDispensed,
                descontoAdicional: aditionalDiscount?.desconto_adicional,
                valorDescontoAdicional: aditionalDiscount?.desconto_formatado,
                valorFinal: valueFinally
            })
        } else {
            setTotalValueFinnaly((valuesCourse?.valor_total_curso).toFixed(2))
            setDisciplineDispensedPorcent(0)
            setDispensedDisciplines(0)
            setDiscountDispensed(0)
            setValuesDisciplinesDp(valuesCourse?.valor_total_curso.toFixed(2))
            setValuesContract({
                valorSemestre: valuesCourse?.valor_total_curso,
                qntDispensadas: 0,
                descontoDispensadas: 0,
                descontoPorcentagemDisp: 0,
                descontoAdicional: aditionalDiscount?.desconto_adicional,
                valorDescontoAdicional: aditionalDiscount?.desconto_formatado,
                valorFinal: valuesCourse?.valor_total_curso
            })
        }


        calculationDayPayment()
    }, [])

    const handleCalculationEntry = (value) => {
        if (value) {
            let paymentValue = value;
            let formattedPaymentValue = paymentValue?.replace(/\./g, '').replace(',', '.');
            value = parseFloat(formattedPaymentValue)
            return value
        }
        return 0
    }

    // const handleCalculationDiscountAvista = async () => {
    //     if (numberOfInstallments === 1) {
    //         const totalValue = parseFloat(totalValueFinnaly);
    //         let discountPercentage = 5; // Desconto a vista
    //         const discountValue = (totalValue * (discountPercentage / 100)).toFixed(2);
    //         const updatedTotal = (totalValue - parseFloat(discountValue)).toFixed(2);
    //         setTotalValueComDiscount(updatedTotal)
    //         setAditionalDiscount({ desconto_adicional: 5, desconto_formatado: discountValue })
    //         return updatedTotal
    //     } else {
    //         setTotalValueComDiscount(0)
    //         setAditionalDiscount({ desconto_adicional: 0, desconto_formatado: 0 })
    //         return 0
    //     }
    // }


    const handleCalculationValues = async () => {
        let totalValue = await handleCalculationDiscounts();
        let numberParcells = numberOfInstallments;
        let numberParcellsTwo;
        let paymentTwo;
        let totalValuePaymentFirst = totalValueFinnaly;

        if ((numberParcells === 1 || forma_pagamento === 'Ex Aluno' || numberParcells > 6) && totalValue > 0) {
            totalValuePaymentFirst = totalValue
        }

        if (twoCards && purchaseValues?.firstCard) {
            totalValuePaymentFirst = handleCalculationEntry(purchaseValues?.firstCard)
        }
        let paymentFirst = (totalValuePaymentFirst / numberParcells).toFixed(2)
        if (twoCards) {
            numberParcellsTwo = numberOfInstallmentSecondCard;
            paymentTwo = handleCalculationEntry(purchaseValues?.secondCard) / numberParcellsTwo;
        }

        if (paymentEntry && !twoCards) {
            paymentFirst = (totalValuePaymentFirst - handleCalculationEntry(paymentEntry)) / numberParcells;
        }

        // let totalParcelCourse = valuesCourse?.n_parcelas || 6;
        let totalParcelCourse = 24;
        const updatedNumberParcel = Array.from({ length: totalParcelCourse }, (_, index) => ({
            label: index + 1,
            value: index + 1
        }))

        const updatedDayForPayment = Array.from({ length: 31 }, (_, index) => ({
            label: index + 1,
            value: index + 1
        }))

        setGroupDaysForPay(updatedDayForPayment)
        setValueParcel(paymentFirst)
        setValueParcelTwo(paymentTwo)
        setTotalParcel(updatedNumberParcel)

        await calculationDayPayment()


        setTypePaymentsSelected(prevTypePaymentsSelected => {
            const updatedArray = [];

            for (let i = 0; i < numberOfInstallments; i++) {
                let date = monthForPayment ? new Date(monthForPayment) : new Date()
                let selectedDay = dayForPayment;
                const paymentDate = date;
                const typePayment = prevTypePaymentsSelected[i + 1]
                let month = (paymentDate.getMonth() + i + 1) % 12;
                let yearIncrement = Math.floor((paymentDate.getMonth() + i + 1) / 12);
                // month = month === 0 ? 12 : month;
                let isSaturday = false; // Sabado
                let isSunday = false; // Domingo

                paymentDate.setMonth(month - 1);
                paymentDate.setFullYear(paymentDate.getFullYear() + yearIncrement);

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

                let formattedPaymentDate = paymentDate.toLocaleDateString('pt-BR');

                let januaryDate = updatedArray?.filter(item => item?.data_pagamento?.includes('/01/'));
                let isFebruary = updatedArray?.filter(item => item?.data_pagamento?.includes('/02/'));
                if (januaryDate?.length > 0 && isFebruary?.length < 1 && formattedPaymentDate?.includes('/03/')) {
                    let partsDate = formattedPaymentDate?.split('/');
                    formattedPaymentDate = `${partsDate[0]}/02/${partsDate[2]}`
                }

                let payments = paymentsProfile;

                let paymentForm = (globalTypePaymentsSelected === 'Cartão' && (creditCardSelected || payments?.id_cartao_credito)) ||
                    (globalTypePaymentsSelected === 'pix' && 'Pix') ||
                    (globalTypePaymentsSelected === 'Boleto' && 'Boleto') ||
                    (globalTypePaymentsSelected === 'Boleto(PRAVALER)' && 'Boleto(PRAVALER)')
                if (globalTypePaymentsSelected === 'Cartão' && !paymentsProfile) { alert.info('Você não possui um cartão de crédito cadastrado. Por favor, primeiro cadastre um cartão.') }
                updatedArray.push({
                    pagamento: paymentForm,
                    tipo: globalTypePaymentsSelected,
                    valor_parcela: paymentFirst,
                    data_pagamento: formattedPaymentDate,
                    resp_pagante_id: twoCards ? null : (responsiblePayerData?.id_resp_pag || null),
                    n_parcela: i + 1,
                });
            }

            return updatedArray;
        });

        setTypePaymentsSelectedTwo(prevTypePaymentsSelected => {
            const updatedArray = [];

            for (let i = 0; i < numberOfInstallmentSecondCard; i++) {
                let date = monthForPayment ? new Date(monthForPayment) : new Date()
                const paymentDate = date;
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
                let payments = paymentsProfile;

                let paymentForm = (globalTypePaymentsSelectedTwo === 'Cartão' && (creditCardSelected || payments?.id_cartao_credito)) || (globalTypePaymentsSelectedTwo === 'Pix' && 'Pix') ||
                    (globalTypePaymentsSelectedTwo === 'Boleto' && 'Boleto') ||
                    (globalTypePaymentsSelectedTwo === 'Boleto(PRAVALER)' && 'Boleto(PRAVALER)')

                if (globalTypePaymentsSelectedTwo === 'Cartão' && !paymentsProfile) { alert.info('Você não possui um cartão de crédito cadastrado. Por favor, primeiro cadastre um cartão.') }
                if (globalTypePaymentsSelectedTwo === 'Cartão' && paymentsProfile) { alert.info('Selecione o cartão que deseja efetuar o pagamento.') }
                updatedArray.push({
                    pagamento: paymentForm,
                    tipo: globalTypePaymentsSelectedTwo,
                    valor_parcela: paymentTwo,
                    data_pagamento: formattedPaymentDate,
                    resp_pagante_id: responsiblePayerData?.id_resp_pag,
                    n_parcela: i + 1,
                });
            }

            return updatedArray;
        });

    }

    const handleCalculationDiscounts = async () => {
        let valorFinal = totalValueFinnaly;
        let discountAvista = 0;
        let discountExAluno = 0;
        let jurosPagamentoEstendido = 0

        if (forma_pagamento === 'Ex Aluno') {
            const totalValue = parseFloat(totalValueFinnaly);
            let discountPercentage = 5; // Desconto a ex aluno
            discountExAluno = (totalValue * (discountPercentage / 100)).toFixed(2);
            valorFinal = (totalValue - parseFloat(discountExAluno)).toFixed(2);
        }
        if (numberOfInstallments === 1) {
            const totalValue = parseFloat(valorFinal);
            let discountPercentage = 5; // Desconto a vista
            discountAvista = (totalValue * (discountPercentage / 100)).toFixed(2);
            valorFinal = (totalValue - parseFloat(discountAvista)).toFixed(2);
        } else if (numberOfInstallments > 6 && globalTypePaymentsSelected !== 'Boleto(PRAVALER)' &&
            courseData?.nivel_curso !== 'Pós-Graduação'
        ) {
            const totalValue = parseFloat(valorFinal);
            let jurosPercentage = 10; // Desconto a vista
            jurosPagamentoEstendido = (totalValue * (jurosPercentage / 100)).toFixed(2);
            valorFinal = (totalValue + parseFloat(jurosPagamentoEstendido)).toFixed(2);
        }
        else {
            setTotalValueComDiscount(0)
            setAditionalDiscount({ ...aditionalDiscount, desconto_avista: 0, jurosPagamentoEstendido: 0 })
        }

        setTotalValueComDiscount(valorFinal)
        setAditionalDiscount({ ...aditionalDiscount, desconto_avista: discountAvista, desconto_ex_aluno: discountExAluno, jurosPagamentoEstendido })

        return valorFinal
    }


    useEffect(() => {
        handleCalculationValues()
    }, [purchaseValues, totalValueComDiscount, paymentEntry, numberOfInstallments, twoCards, numberOfInstallmentSecondCard, totalValueFinnaly, globalTypePaymentsSelected, globalTypePaymentsSelectedTwo, dayForPayment])


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

    const handlePaymentProfileTwo = (index, value) => {
        setTypePaymentsSelectedTwo((prevTypePaymentsSelected) => {
            const updatedTypePaymentsSelectedTwo = [...prevTypePaymentsSelected];
            updatedTypePaymentsSelectedTwo[index] = {
                ...updatedTypePaymentsSelectedTwo[index],
                pagamento: value,
            };
            return updatedTypePaymentsSelectedTwo;
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


    const handleChangeValueInstallment = async (value, index) => {
        const rawValue = value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

        if (rawValue === '') {
            value = '';
        } else {
            let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
            const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

            if (intValue === '0' && rawValue.length > 2) {
                intValue = '';
            }

            const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
            value = formattedValue;

        }

        const formatterValue = value.replace(/[^\d,]/g, '').replace(',', '.');


        setTypePaymentsSelected((prevTypePaymentsSelected) => {
            const updatedTypePaymentsSelected = [...prevTypePaymentsSelected];
            updatedTypePaymentsSelected[index] = {
                ...updatedTypePaymentsSelected[index],
                valor_parcela: formatterValue,
            };
            return updatedTypePaymentsSelected;
        });
    };


    const formatDateString = (value) => {
        // Remove qualquer caractere que não seja número
        const cleanedValue = value.replace(/\D/g, '');

        // Formatar a string adicionando barras conforme necessário
        let formattedValue = '';
        if (cleanedValue.length > 0) {
            formattedValue += cleanedValue.substring(0, 2);
        }
        if (cleanedValue.length >= 3) {
            formattedValue += '/' + cleanedValue.substring(2, 4);
        }
        if (cleanedValue.length >= 5) {
            formattedValue += '/' + cleanedValue.substring(4, 8);
        }

        return formattedValue;
    };


    const handleChangePaymentDateInstallment = async (value, index) => {
        const formattedValue = formatDateString(value);

        setTypePaymentsSelected((prevTypePaymentsDateSelected) => {
            const updatedTypePaymentsDateSelected = [...prevTypePaymentsDateSelected];
            updatedTypePaymentsDateSelected[index] = {
                ...updatedTypePaymentsDateSelected[index],
                data_pagamento: formattedValue,
            };
            return updatedTypePaymentsDateSelected;
        });
    };

    // const handleBlurCalculationInstallments = (value, index) => {
    //     console.log(value, index)

    //     const formatterValue = value;
    //     const updatedTypePaymentsSelected = typePaymentsSelected;
    //     const totalValue = totalValueFinnaly;

    //     // Número de parcelas restantes
    //     const remainingInstallmentsCount = numberOfInstallments - 1;

    //     console.log(formatterValue)
    //     // Valor das parcelas restantes
    //     const remainingValue = parseFloat(totalValue) - parseFloat(formatterValue);
    //     console.log(formatterValue)

    //     const newInstallmentValue = (remainingValue / remainingInstallmentsCount).toFixed(2);
    //     console.log(newInstallmentValue)

    //     // Atualiza as parcelas restantes
    //     for (let i = 0; i < updatedTypePaymentsSelected.length; i++) {
    //         if (i !== index) {
    //             updatedTypePaymentsSelected[i] = {
    //                 ...updatedTypePaymentsSelected[i],
    //                 valor_parcela: newInstallmentValue,
    //             };
    //         }
    //     }
    // }

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
        let totalValueFirst = 0;
        let totalValueSecond = 0;
        let totalValue = 0;
        let totalValueEntry = 0;
        let firstValueTotal = typePaymentsSelected?.map(item => parseFloat(item.valor_parcela));
        let secondValueTotal = typePaymentsSelectedTwo?.map(item => parseFloat(item.valor_parcela));
        if (firstValueTotal) { totalValueFirst = firstValueTotal?.reduce((acc, curr) => acc += curr, 0); }
        if (secondValueTotal) { totalValueSecond = secondValueTotal?.reduce((acc, curr) => acc += curr, 0); }
        if (paymentEntry) { totalValueEntry = handleCalculationEntry(paymentEntry) }
        totalValue = totalValueFirst + totalValueSecond + totalValueEntry;
        const divergencyPayment = ((parseFloat(totalValueFinnaly) - typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0)) > 0.05 ||
            (parseFloat(totalValueFinnaly) - typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0)) < -0.05) ? true : false;

        /* if ((totalValue + 0.05) < parseFloat(totalValueFinnaly) || (totalValue - 0.05) > parseFloat(totalValueFinnaly) || divergencyPayment) {
             alert.info('Existe divergência no saldo devedor. Verifique os valores das parcelas e entradas, antes de prosseguir.')
             return
         }*/

        if (!globalTypePaymentsSelected || (twoCards && !globalTypePaymentsSelectedTwo)) {
            alert.info('Insira uma forma de pagamento válida.')
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
                estado_resp: data?.state,
                bairro_resp: data.bairro,
                uf_resp: data?.uf
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
            desconto_avista: aditionalDiscount?.desconto_avista,
            jurosPagamentoEstendido: aditionalDiscount?.jurosPagamentoEstendido,
            desconto_ex_aluno: aditionalDiscount?.desconto_ex_aluno,
            valorDescontoAdicional: aditionalDiscount?.desconto_formatado,
            valorFinal: totalValueComDiscount > 0 ? totalValueComDiscount : totalValueFinnaly
        });

        setPaymentsInfoData({
            firsResponsible: responsiblesPayers?.first || userData?.id,
            secondResponsible: responsiblesPayers?.second,
            valueEntry: handleCalculationEntry(paymentEntry),
            typePaymentEntry: typePaymentEntry,
            dateForPaymentEntry
        })

        setPaymentForm([typePaymentsSelected, typePaymentsSelectedTwo]);
    }, [updatedScreen, typePaymentEntry, typePaymentsSelected, typePaymentsSelectedTwo, totalValueComDiscount, numberOfInstallments, totalValueFinnaly, dispensedDisciplines, discountDispensed, disciplineDispensedPorcent, aditionalDiscount, valuesCourse, setValuesContract, setPaymentForm]);


    const handleChangePaymentEntry = async (event) => {

        const rawValue = event.target.value.replace(/[^\d]/g, '');

        if (rawValue === '') {
            event.target.value = '';
        } else {
            let intValue = rawValue.slice(0, -2) || '0';
            const decimalValue = rawValue.slice(-2).padStart(2, '0');

            if (intValue === '0' && rawValue.length > 2) {
                intValue = '';
            }

            const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`;
            event.target.value = formattedValue;

        }

        setPaymentEntry(event.target.value);

        return;
    }


    const handleChangePaymentValuesParcels = async (event) => {

        const rawValue = event.target.value.replace(/[^\d]/g, '');

        if (rawValue === '') {
            event.target.value = '';
        } else {
            let intValue = rawValue.slice(0, -2) || '0';
            const decimalValue = rawValue.slice(-2).padStart(2, '0');

            if (intValue === '0' && rawValue.length > 2) {
                intValue = '';
            }

            const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`;
            event.target.value = formattedValue;

        }

        setPurchaseValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));

        return;
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const listPaymentType = [
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Boleto(PRAVALER)', value: 'Boleto(PRAVALER)' },
        { label: 'Cartão', value: 'Cartão' },
        { label: 'Cartão (Maquininha melies)', value: 'Cartão (Maquininha melies)' },
        // { label: 'Pix', value: 'Pix' },
    ]

    const listPaymentTypeEntry = [
        { label: 'Pix', value: 'Pix' },
        { label: 'Dinheiro', value: 'Dinheiro' },
        { label: 'Cartão (Maquininha melies)', value: 'Cartão (Maquininha melies)' },
    ]

    const listEntry = [
        { label: 'Entrada', value: 'Sim' },
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

    const monthFilter = [
        { label: 'Jan', value: 0 },
        { label: 'Fev', value: 1 },
        { label: 'Mar', value: 2 },
        { label: 'Abr', value: 3 },
        { label: 'Mai', value: 4 },
        { label: 'Jun', value: 5 },
        { label: 'Jul', value: 6 },
        { label: 'Ago', value: 7 },
        { label: 'Set', value: 8 },
        { label: 'Out', value: 9 },
        { label: 'Nov', value: 10 },
        { label: 'Dez', value: 11 },
    ]

    const divergencyPayment = ((parseFloat(totalValueFinnaly) - typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0)) > 0.05 ||
        (parseFloat(totalValueFinnaly) - typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0)) < -0.05) ? true : false;
    const totalPaymentsInstallment = typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0)
    const calculationDiferenceValues = (parseFloat(totalValueFinnaly) - typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0))
    return (
        <>
            <ContentContainer style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                <ContentContainer style={{ flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'row', xl: 'row' }, boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                    <ContentContainer fullWidth gap={4} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 40px' }}>
                        <Text bold title>Resumo da contratação</Text>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                <Text bold>Total:</Text>
                                {isDp ? <Text>{formatter.format(totalValueFinnaly)}</Text>
                                    : <Text>{formatter.format(valuesCourse?.valor_total_curso)}</Text>}
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                <Text bold>Disciplinas dispensadas:</Text>
                                <Text>{dispensedDisciplines}</Text>
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                <Text bold>Disciplinas dispensadas - Desconto (R$):</Text>
                                <Text>{formatter.format(discountDispensed)}</Text>
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                <Text bold>Disciplinas dispensadas - Desconto (%):</Text>
                                <Text>{disciplineDispensedPorcent}</Text>
                            </Box>
                            <Divider distance={0} />
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
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                <Text bold>Desconto adicional:</Text>
                                <Text>{(typeDiscountAdditional?.real && formatter.format(aditionalDiscount?.desconto_adicional || 0))
                                    || (typeDiscountAdditional?.porcent && parseFloat(aditionalDiscount?.desconto_adicional || 0).toFixed(2) + '%')
                                    || '0'}</Text>
                            </Box>
                            <Divider distance={0} />
                            {(numberOfInstallments > 6 && globalTypePaymentsSelected !== 'Boleto(PRAVALER)' &&
                                courseData?.nivel_curso !== 'Pós-Graduação') &&
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                        <Text bold>Juros 10% pagamento estendido:</Text>
                                        <Text>{formatter.format(aditionalDiscount?.jurosPagamentoEstendido)}</Text>
                                    </Box>
                                    <Divider distance={0} />
                                </>}
                            {forma_pagamento === "Ex Aluno" &&
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                        <Text bold>Desconto 5% Ex aluno:</Text>
                                        <Text>{'5.00%'}</Text>
                                    </Box>
                                    <Divider distance={0} />
                                </>}
                            <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center', flexDirection: 'row', gap: 1.75 }}>
                                <Text bold>Valor Total com desconto:</Text>
                                <Text large>{formatter.format(totalValueComDiscount > 0 ? totalValueComDiscount : totalValueFinnaly)}</Text>

                            </Box>
                            <Divider distance={0} />
                            {/* <SelectList fullWidth data={groupDaysForPay} valueSelection={dayForPayment || ''} onSelect={(value) => setDayForPayment(value)}
                                title="Selecione o dia do vencimento *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            /> */}
                            <TextInput name='monthForPayment' onChange={(e) => {

                                setMonthDayForPayment(e.target.value)
                                let date = new Date(e.target.value)
                                if (date?.getDate() >= 1 && date?.getDate() <= 31) {
                                    setDayForPayment(date?.getDate() + 1);
                                } else {
                                    return
                                }
                            }} value={(monthForPayment)} type="date" label='Dt cobrança' sx={{ flex: 1, }} />

                            <CheckBoxComponent
                                padding={false}
                                valueChecked={hasEntry}
                                boxGroup={listEntry}
                                horizontal={false}
                                onSelect={(value) => {
                                    setHasEntry(value)
                                    if (!value) {
                                        setTypePaymentEntry('')
                                        setPaymentEntry('')
                                        setFormPaymentEntry('')
                                    }
                                }}
                                sx={{ flex: 1, }}
                            />
                            {hasEntry === 'Sim' &&
                                <>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextInput
                                            placeholder='0,00'
                                            name='paymentEntry'
                                            type="coin"
                                            onChange={handleChangePaymentEntry}
                                            value={paymentEntry || ''}
                                            label='Valor da entrada' sx={{ flex: 1, }}
                                        />
                                        <SelectList fullWidth data={listPaymentTypeEntry} valueSelection={typePaymentEntry || ''} onSelect={(value) => setTypePaymentEntry(value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            title="Forma de pagamento *"
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />

                                        <TextInput name='dateForPaymentEntry' onChange={(e) => setDateForPaymentEntry(e.target.value)} value={(dateForPaymentEntry)?.split('T')[0] || ''} type="date" label='Data pagamento' sx={{ flex: 1, }} />
                                    </Box>
                                </>}
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
                                    <TextInput placeholder='Nome/Razão Social' id="field-1" name='nome_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.nome_resp || ''} label='Nome/Razão Social *' sx={{ flex: 1, }} />
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
                                    <TextInput placeholder='CPF/CNPJ' name='cpf_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cpf_resp || ''} label='CPF/CNPJ *' sx={{ flex: 1, }} />
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
                                    <TextInput placeholder='UF' name='uf_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.uf_resp || ''} label='UF *' sx={{ flex: 1, }} />
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

                <Box sx={{ display: 'flex', gap: 3, flexDirection: twoCards ? 'column' : { xs: 'column', xm: 'column', md: 'column', lg: `column`, xl: 'row' } }}>

                    {globalTypePaymentsSelected === 'Cartão' && <ContentContainer gap={4} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 30px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexDirection: 'column' }}>
                            <Text bold title>Cartão de crédito</Text>
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
                                        <TextInput name='cpf_cartao' onChange={handleChangePerfilPayment} value={newPaymentProfile?.cpf_cartao || ''} label='CPF *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                        <Box sx={{ ...styles.inputSection }}>
                                            <TextInput placeholder="ex: 2028" name='dt_expiracao' onChange={handleChangePerfilPayment} value={newPaymentProfile?.dt_expiracao || ''} label='Validade *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                            <TextInput name='cvc' onChange={handleChangePerfilPayment} value={newPaymentProfile?.cvc || ''} label='CVC *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                        </Box>
                                    </Box>
                                    <Button small style={{ width: 100, height: 30 }} text="cadastrar" onClick={async () => {
                                        {
                                            const creditCard = await handleCreatePaymentProfile()
                                            if (creditCard) {
                                                setCreditCardSelected(creditCard?.id_cartao_credito)
                                            }
                                        }
                                    }} />
                                </Box>

                            ) :
                            (
                                <Box sx={{ display: 'flex', flexDirection: twoCards ? 'row' : { xs: 'row', xm: 'row', md: 'row', lg: `row`, xl: 'column' }, gap: 2, maxHeight: 400, overflow: 'auto' }}>

                                    {showPaymentPerfl?.registeredProfile && paymentsProfile ?
                                        <Box sx={{
                                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1.8, padding: '30px 40px', borderRadius: 3,
                                            transition: '0.3s',
                                            "&:hover": {
                                                backgroundColor: colorPalette.primary,
                                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`
                                            }
                                        }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Text bold>{paymentsProfile?.apelido_cartao}</Text>
                                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                                    <CheckCircleIcon style={{ color: 'green', fontSize: 18 }} />
                                                    <Text small style={{}}>padrão</Text>
                                                </Box>
                                            </Box>
                                            <Cards
                                                cvc={paymentsProfile?.cvc || ''}
                                                expiry={paymentsProfile?.dt_expiracao || ''}
                                                name={paymentsProfile?.nome_cartao || ''}
                                                number={paymentsProfile?.numero_cartao || ''}
                                                focused={focusedCreditCard}
                                            />
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                                                <TextInput name='cvc' onChange={(e) => setPaymentsProfile({ ...paymentsProfile, cvc: e.target.value })} value={paymentsProfile?.cvc || ''} label='CVC *' sx={{ flex: 1, }} onFocus={handleFocused} />
                                                <Button small text="Confirmar" onClick={() => {
                                                    setShowCreditCard(false)
                                                    setCreditCardSelected(paymentsProfile?.id_cartao_credito)
                                                }} style={{ borderRadius: 2 }} />
                                            </Box>
                                        </Box>
                                        :
                                        <Text light small>Não existem perfís de pagamento cadastrados</Text>
                                    }
                                </Box>
                            )}
                    </ContentContainer>}

                    <ContentContainer fullWidth gap={4} sx={{ display: 'flex', flexDirection: 'column', padding: '30px 40px', position: 'relative' }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', position: 'relative' }}>
                            <Box sx={{ display: 'flex', gap: 1.8, justifyContent: 'space-between' }}>
                                <Text bold title>Forma de pagamento</Text>
                                <Button small secondary={twoCards ? false : true} text="dividir em 2 pagantes" onClick={() => {
                                    if (responsiblePayerData?.id_resp_pag) {
                                        setTwoCards(!twoCards)
                                        if (!twoCards) {
                                            setPurchaseValues({ ...purchaseValues, secondCard: '' })
                                            setTypePaymentsSelectedTwo(initialTypePaymentsSelectedTwo)
                                        }
                                    } else {
                                        alert.info('Adicione um responsável pagante para dividir em 2 pagamentos.')
                                    }
                                }} style={{ height: '30px', borderRadius: 0 }} />
                            </Box>

                            <Box sx={{ display: 'flex' }}>
                                {
                                    forma_pagamento === "Ex Aluno" &&

                                    <Box sx={{ display: 'flex', padding: '8px 12px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor }}>
                                        <Text bold xsmall style={{ color: '#fff' }}>5% Desconto Ex Aluno!</Text>
                                    </Box>
                                }
                                {
                                    numberOfInstallments === 1 &&

                                    <Box sx={{ display: 'flex', marginLeft: "10px" }}>
                                        <Box sx={{ display: 'flex', padding: '8px 12px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor }}>
                                            <Text bold xsmall style={{ color: '#fff' }}>5% Desconto á Vista!</Text>
                                        </Box>
                                    </Box>
                                }

                                {
                                    (numberOfInstallments > 6 && globalTypePaymentsSelected !== 'Boleto(PRAVALER)' &&
                                        courseData?.nivel_curso !== 'Pós-Graduação') &&

                                    <Box sx={{ display: 'flex', marginLeft: "10px" }}>
                                        <Box sx={{ display: 'flex', padding: '8px 12px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor }}>
                                            <Text bold xsmall style={{ color: '#fff' }}>10% Juros pagamento estendido!</Text>
                                        </Box>
                                    </Box>
                                }
                            </Box>

                            {(twoCards) &&
                                <Box sx={{ display: 'flex', top: -20, left: 250, position: 'absolute', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: colorPalette?.primary, padding: '5px 10px' }}>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        width: 25,
                                        height: 25,
                                        aspectRatio: '1/1',
                                        backgroundImage: `url('/icons/coin_icon.png')`,
                                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                        transition: 'background-color 1s',
                                        transition: '.3s',
                                    }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Text large bold>{formatter.format((parseFloat(totalValueFinnaly) - handleCalculationEntry(paymentEntry)) - (handleCalculationEntry(purchaseValues?.firstCard) + handleCalculationEntry(purchaseValues?.secondCard)))}</Text>
                                        <Text light>Saldo devedor:</Text>
                                    </Box>
                                </Box>
                            }

                            {globalTypePaymentsSelected === 'Boleto(PRAVALER)' &&
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: colorPalette?.primary, padding: '5px 10px' }}>

                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: colorPalette?.primary, padding: '5px 10px' }}>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 25,
                                            height: 25,
                                            aspectRatio: '1/1',
                                            backgroundImage: `url('/icons/coin_icon.png')`,
                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                            transition: 'background-color 1s',
                                            transition: '.3s',
                                        }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text large bold>{formatter.format(parseFloat(totalValueFinnaly))}</Text>
                                            <Text light>Valor da Matrícula:</Text>
                                        </Box>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5,
                                        backgroundColor: divergencyPayment ? parseFloat(totalValueFinnaly) == typePaymentsSelected?.map(item => parseFloat(item.valor_parcela))?.reduce((acc, curr) => acc += curr, 0) ?
                                            'green' : 'red' : colorPalette?.primary, padding: '5px 10px'
                                    }}>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 25,
                                            height: 25,
                                            aspectRatio: '1/1',
                                            backgroundImage: `url('/icons/coin_icon.png')`,
                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                            transition: 'background-color 1s',
                                            transition: '.3s',
                                        }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text large bold>{formatter.format(totalPaymentsInstallment)}</Text>
                                            <Text light>Soma das Parcelas:</Text>
                                        </Box>
                                    </Box>

                                    {divergencyPayment && <Box sx={{
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5,
                                        backgroundColor: colorPalette?.primary, padding: '5px 10px'
                                    }}>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 25,
                                            height: 25,
                                            aspectRatio: '1/1',
                                            backgroundImage: `url('/icons/coin_icon.png')`,
                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                            transition: 'background-color 1s',
                                            transition: '.3s',
                                        }} />
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text large bold>{formatter.format(calculationDiferenceValues)}</Text>
                                            <Text light>Saldo Divergente:</Text>
                                        </Box>
                                    </Box>}
                                </Box>
                            }

                            <Box sx={{ display: twoCards && 'flex', gap: twoCards ? 3 : 1.8, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'column', xl: 'column' } }}>
                                <Box sx={{ display: twoCards && 'flex', gap: 1.8, flexDirection: 'column', marginTop: twoCards && 5 }}>
                                    {twoCards &&
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', marginBottom: 5 }}>
                                            <Text large bold>Primeiro pagante:</Text>
                                            <Text large light>{userData?.nome}</Text>
                                        </Box>
                                    }
                                    <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                        <SelectList fullWidth data={listPaymentType} valueSelection={globalTypePaymentsSelected || ''} onSelect={(value) => setGlobalTypePaymentsSelected(value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            title="Selecione a forma de pagamento *"
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            clean={false}
                                        />
                                        <SelectList fullWidth data={totalParcel} valueSelection={numberOfInstallments || ''} onSelect={(value) => setNumberOfInstallments(value)}
                                            title="Selecione o numero de parcelas *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        {twoCards && <>

                                            <TextInput
                                                placeholder="0,00"
                                                name='firstCard'
                                                type={"coin"}
                                                onChange={(event) => handleChangePaymentValuesParcels(event)}
                                                value={purchaseValues?.firstCard || ''}
                                                label='Valor a pagar' sx={{ flex: 1, }}
                                            />
                                        </>}

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
                                                    let date = monthForPayment ? new Date(monthForPayment) : new Date()
                                                    const paymentDate = date;
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
                                                    const formattedPayChange = formattedStringInDate(formattedPaymentDate)

                                                    return (
                                                        <tr key={installmentNumber}>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {installmentNumber}</td>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, border: '1px solid lightgray' }}>
                                                                {typePaymentsSelected[index]?.tipo}
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
                                                                {globalTypePaymentsSelected === 'Boleto(PRAVALER)' ?
                                                                    <TextInput
                                                                        placeholder='R$5,00'
                                                                        name='valor_parcela'
                                                                        type="coin"
                                                                        onChange={(e) => handleChangeValueInstallment(e.target.value, index)}
                                                                        value={(typePaymentsSelected[index]?.valor_parcela) || ''}
                                                                    /> :
                                                                    <Text>{formatter.format(typePaymentsSelected[index]?.valor_parcela)}</Text>}
                                                            </td>
                                                            <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                {installmentNumber !== 1 ?
                                                                    formattedPaymentDate :
                                                                    <TextInput
                                                                        name='data_pagamento'
                                                                        // type="date"
                                                                        onChange={(e) => handleChangePaymentDateInstallment(e.target.value, index)}
                                                                        value={typePaymentsSelected[index]?.data_pagamento || ''}
                                                                    />}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Box>
                                {twoCards &&
                                    <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column', justifyContent: 'start', marginTop: 5 }}>
                                        {twoCards &&
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', marginBottom: 5 }}>
                                                <Text large bold>Segundo pagante:</Text>
                                                <Text large light>{responsiblePayerData?.nome_resp}</Text>
                                            </Box>
                                        }
                                        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                            <SelectList fullWidth data={totalParcel} valueSelection={numberOfInstallmentSecondCard || ''} onSelect={(value) => setNumberOfInstallmentSecondCard(value)}
                                                title="Selecione o numero de parcelas *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            />
                                            <SelectList fullWidth data={listPaymentType} valueSelection={globalTypePaymentsSelectedTwo || ''} onSelect={(value) => setGlobalTypePaymentsSelectedTwo(value)}
                                                filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                title="Selecione a forma de pagamento *"
                                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                clean={false}
                                            />
                                            {twoCards && <>
                                                <TextInput
                                                    placeholder="0,00"
                                                    name='secondCard'
                                                    type={"coin"}
                                                    onChange={(event) => handleChangePaymentValuesParcels(event)}
                                                    value={purchaseValues?.secondCard || ''}
                                                    label='Valor a pagar' sx={{ flex: 1, }}
                                                />
                                            </>}
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
                                                    {Array.from({ length: numberOfInstallmentSecondCard }, (_, index) => {

                                                        const installmentNumber = index + 1;
                                                        let date = monthForPayment ? new Date(monthForPayment) : new Date()
                                                        const paymentDate = date;
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
                                                                    {typePaymentsSelectedTwo[index]?.tipo}
                                                                </td>
                                                                <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, border: '1px solid lightgray' }}>
                                                                    {typePaymentsSelectedTwo[index]?.tipo === 'Cartão' ? <SelectList fullWidth data={groupPayment} valueSelection={typePaymentsSelectedTwo[index]?.pagamento || ''} onSelect={(value) => handlePaymentProfileTwo(index, value)}
                                                                        filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                                        clean={false}
                                                                    />
                                                                        :
                                                                        typePaymentsSelectedTwo[index]?.tipo}
                                                                </td>
                                                                <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                                    {formatter.format(valueParcelTwo)}</td>
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
                                }
                            </Box>
                        </Box>
                    </ContentContainer>
                </Box >

            </ContentContainer >
            {!isDp && <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Button secondary text="Voltar" onClick={() => pushRouteScreen(0, 'interesse >')} style={{ width: 120 }} />
                <Button text="Continuar" onClick={() => checkEnrollmentData(2, 'interesse > Pagamento > Contrato')} style={{ width: 120 }} />
            </Box>}
        </>
    )

}


export const ContractStudent = (props) => {
    const {
        isReenrollment,
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
        pushRouteScreen,
        setFormData,
        paymentsInfoData, setPaymentsInfoData,
        currentModule,
        classScheduleData,
        isDp,
        reenrollmentDp,
        classesDisciplinesDpSelected,
        handleCreateReEnrollStudentDp,
        forma_pagamento
    } = props



    const { colorPalette, setLoading, alert } = useAppContext()
    const [paymentData, setPaymentData] = useState([])
    const [userData, setUserData] = useState({})
    const [valueContractPravaler, setValueContract] = useState(0)
    const contractService = useRef()
    pdfMake.vfs = pdfFonts.pdfMake.vfs;




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

    useEffect(() => {

        const updatedPaymentForm = paymentForm.map((payment) =>

            payment?.map((items) => ({
                ...items,
                pagamento: items?.pagamento || items?.tipo,
                valor_parcela: items?.valor_parcela ? parseFloat(items?.valor_parcela).toFixed(2) : null
            }))
        );
        const valueContract = paymentForm.map((payment) =>
            payment?.map((items) => ({
                valor_parcela: +items?.valor_parcela ? parseFloat(items?.valor_parcela).toFixed(2) : null
            }))
        );

        // Somar todas as parcelas
        const totalValueContract = paymentForm.flat().reduce((acc, payment) => {
            const valor = parseFloat(payment?.valor_parcela);
            return acc + (isNaN(valor) ? 0 : valor);
        }, 0).toFixed(2);
        setValueContract(totalValueContract)



        setPaymentData(updatedPaymentForm)
    }, [])


    const className = classData?.nome_turma;
    const startDateClass = formatDate(classData?.inicio);
    // const startDateClass = formatTimeStamp(classScheduleData?.dt_inicio_cronograma) || formatDate(classData?.inicio);
    const courseSigle = courseData?.sigla;
    const courseName = courseData?.nome_curso;
    const modalityCourse = courseData?.modalidade_curso;

    let query = `Curso: `;
    if (className) query += `${className}-${currentModule}SEM - `;
    if (courseSigle) query += `${courseSigle} `;
    if (courseName) query += `${courseName} `;
    if (modalityCourse) query += `${modalityCourse} `;
    if (startDateClass) query += `- ${startDateClass}`;

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    if (isDp) {
        for (let dpData of reenrollmentDp) {
            query = `Cursando DP: ${dpData?.nome_turma}-${dpData?.modulo}SEM - `;
            if (courseSigle) query += `${courseSigle} `;
            if (courseName) query += `${courseName} EAD `;
            // if (dpData?.dt_inicio) query += `- ${formatTimeStamp(dpData?.dt_inicio)}`;
        }
    }


    let nameContract = `contrato_ `;
    if (userData?.nome) nameContract += `${userData?.nome}_`;
    if (className) nameContract += `${className}-${currentModule}SEM_`;
    if (courseName) nameContract += `${courseName}_`;
    if (modalityCourse) nameContract += `${modalityCourse}`;

    if (isDp) {
        for (let dpData of reenrollmentDp) {
            nameContract = `contrato_DP_${userData?.nome}_${dpData?.nome_turma}-${dpData?.modulo}SEM_`;
            if (courseName) nameContract += `${courseName}_EAD`;
        }
    }

    const base64toBlob = (base64, contentType) => {
        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    };


    const handleSubmitEnrollment = async () => {
        try {
            let pdfBlob;
            if (isReenrollment) {
                pdfBlob = null
            } else {
                pdfBlob = await handleGeneratePdf();
            }
            // const pdfBase64 = await convertBlobToBase64(pdfBlob);
            // const blob = base64toBlob(pdfBase64, 'application/pdf');
            // const blobUrl = URL.createObjectURL(blob);
            // window.open(blobUrl, '_blank');

            let contractData = {
                name_file: nameContract,
                size: null,
                key_file: null,
                location: null,
                usuario_id: userData?.id,
                status_assinaturas: 'Pendente de assinatura',
                modulo: currentModule ? currentModule : 1,
                matricula_id: null,
                token_doc: null,
                external_id: null,
                deletado: 0,
                dt_deletado: null
            }

            if (isDp) {
                await handleCreateReEnrollStudentDp(paymentData, valuesContract, paymentsInfoData, pdfBlob, contractData)
            } else {
                await handleCreateEnrollStudent(paymentData, valuesContract, paymentsInfoData, pdfBlob, contractData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const convertBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]); // Retorna apenas a parte do Base64
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    async function loadImageAsDataURL(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, image.width, image.height);
                const dataURL = canvas.toDataURL('image/jpeg'); // Pode ser 'image/png' dependendo do formato da imagem
                resolve(dataURL);
            };
            image.onerror = reject;
            image.src = url;
        });
    }

    const handleGeneratePdf = async () => {
        return new Promise(async (resolve, reject) => {

            const currentDate = new Date();
            const options = {
                day: "numeric",
                month: "long",
                year: "numeric",
            };
            const formattedDate = new Intl.DateTimeFormat("pt-BR", options).format(currentDate);
            const imageUrl = '/background/doc_melies_contrato_compacto.jpeg';
            const imageDataURL = await loadImageAsDataURL(imageUrl);

            try {
                const documentDefinition = {
                    background: function (currentPage, pageSize) {
                        return {
                            image: imageDataURL,
                            width: pageSize.width,
                            height: pageSize.height,
                            absolutePosition: { x: 0, y: 0 },
                            opacity: 0.5, // Opacidade da marca d'água (opcional)
                        };

                    },
                    content: [
                        { text: 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS EDUCACIONAIS', fontSize: 16, alignment: 'center', fontFamily: 'MetropolisBold', bold: true },

                        { text: '', margin: [0, 20, 0, 20], },
                        {
                            table: {
                                widths: ['30%', '70%'],
                                body: userDataTable(userData).map(row => [
                                    { text: row?.title, bold: true, fontFamily: 'Metropolis Regular' },
                                    { text: row?.value || '', fontFamily: 'MetropolisBold' },
                                ]),
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return i === 0 ? 0 : 1;
                                    },
                                    vLineWidth: function (i, node) {
                                        return 0;
                                    },
                                },
                            },
                        },

                        {
                            text: 'Dados do(a) Responsável / Empresa / Pagante',
                            fontFamily: 'MetropolisBold',
                            background: '#F49519',
                            bold: true,
                            alignment: 'center',
                            width: '100%',
                            margin: [0, 20, 0, 20],
                        },

                        {
                            table: {
                                widths: ['30%', '70%'],
                                body: responsiblePayerDataTable(responsiblePayerData, userData).map(row => [
                                    { text: row.title, bold: true },
                                    { text: row.value || '' },
                                ]),
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return i === 0 ? 0 : 1;
                                    },
                                    vLineWidth: function (i, node) {
                                        return 0;
                                    },
                                },
                            },
                        },



                        { text: query || 'Dados de pagamento', bold: true, margin: [0, 40, 0, 20], alignment: 'center', fontFamily: 'MetropolisBold' },

                        {
                            margin: [80, 0],

                            table: {
                                widths: ['45%', '50%'],
                                body: [
                                    userData?.nome ? ['Aluno:', userData?.nome] : [],
                                    ['Resp. pagante:', responsiblePayerData?.nome_resp || userData?.nome],
                                    paymentForm[0][0].tipo == 'Boleto(PRAVALER)' ? ['Valor total do semestre:', formatter.format(formatter.format(valueContractPravaler))] : isDp ? ['Valor total do semestre:', formatter.format(valuesContract?.valorFinal)] : ['Valor total do semestre:', formatter.format(valuesContract?.valorSemestre)],


                                    ['Disciplinas dispensadas:', valuesContract?.qntDispensadas],
                                    classesDisciplinesDpSelected?.length > 0 && ['Disciplinas DP:', classesDisciplinesDpSelected?.length],
                                    valuesContract?.descontoDispensadas > 0 && ['Disciplinas dispensadas - Desconto (R$):', formatter.format(valuesContract.descontoDispensadas)],
                                    valuesContract?.descontoPorcentagemDisp != '0.00%' && ['Disciplinas dispensadas - Desconto (%):', valuesContract?.descontoPorcentagemDisp],
                                    valuesContract?.descontoAdicional && ['DESCONTO (adicional):', (typeDiscountAdditional?.real && formatter.format(valuesContract?.descontoAdicional || 0))
                                        || (typeDiscountAdditional?.porcent && parseFloat(valuesContract?.descontoAdicional || 0).toFixed(2) + '%')
                                        || '0'],

                                    (forma_pagamento == 'Ex Aluno' && valuesContract?.desconto_ex_aluno > 0) && ['DESCONTO Ex aluno (5%):', formatter.format(parseFloat(valuesContract?.desconto_ex_aluno))],
                                    (valuesContract?.desconto_avista > 0) && ['DESCONTO á vista (5%):', formatter.format(parseFloat(valuesContract?.desconto_avista))],
                                    (valuesContract?.jurosPagamentoEstendido > 0) && ['Juros Pagamento Estendido (10%):', formatter.format(parseFloat(valuesContract?.jurosPagamentoEstendido))],


                                    (valuesContract?.descontoAdicional && valuesContract?.descontoDispensadas > 0) && ['DESCONTO TOTAL:', formatter.format(parseFloat(valuesContract?.valorDescontoAdicional) + parseFloat(valuesContract?.descontoDispensadas))],


                                    paymentsInfoData?.valueEntry > 0 && ['VALOR DE ENTRADA:', formatter.format(paymentsInfoData?.valueEntry)],

                                    paymentForm[0][0].tipo == 'Boleto(PRAVALER)' ? ['VALOR A PAGAR:', formatter.format(valueContractPravaler)] : ['VALOR A PAGAR:', formatter.format(valuesContract?.valorFinal)],

                                ].filter(row => row.length > 0),
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return i === 0 ? 0 : 1;
                                    },
                                    vLineWidth: function (i, node) {
                                        return 0;
                                    },
                                },
                            },
                        },

                        ...(paymentsInfoData?.valueEntry > 0 ? [{ text: 'Forma de pagamento escolhida:', bold: true, margin: [0, 40, 0, 10], alignment: 'center' }] : []),
                        // ...(paymentsInfoData?.valueEntry > 0 ? [{ text: `Entrada:`, bold: true, margin: [10, 40, 10, 20], alignment: 'center' }] : []),
                        // createPaymentEntryTable(paymentsInfoData),
                        ...(paymentData?.map((payment, index) => {
                            const nonNullPayments = payment?.filter(pay => pay?.valor_parcela);
                            if (nonNullPayments?.length > 0) {
                                return [
                                    { text: `${index + 1}º Pagante/Pagamento:`, bold: true, margin: [10, 20, 10, 20], alignment: 'center', },
                                    createPaymentTable(payment),
                                ];
                            }
                            return null;
                        }).filter(Boolean)),
                        { text: ``, margin: [10, 30, 10, 30] },
                        ...(bodyContractEnrollment?.map((body, index) => {
                            const title = body?.title ? true : false;
                            return [
                                { text: `${body?.text}`, fontFamily: title ? 'MetropolisBold' : 'Metropolis Regular', margin: title ? [10, 30, 10, 10] : [10, 10], bold: title ? true : false, fontSize: title ? 12 : 10 },
                            ];
                        })),
                        { text: `São Paulo, ${formattedDate}`, margin: [80, 30, 10, 10], fontFamily: 'MetropolisBold', }
                    ],
                    styles: {
                        header: { fontSize: 18, bold: true },
                    },
                    pageMargins: [40, 80, 30, 80],

                };

                const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
                const pdfBlob = await new Promise((pdfResolve) => {
                    pdfDocGenerator.getBlob(pdfResolve);
                });

                resolve(pdfBlob);
            } catch (error) {
                console.log(error)
                reject(error);
            }
        });
    };


    const createPaymentTable = (paymentData) => {
        const tableBody = [];
        tableBody.push([
            { text: 'Nº Parcela', style: 'tableHeader', fillColor: '#F49519' },
            { text: 'Forma', style: 'tableHeader', fillColor: '#F49519' },
            { text: 'Pagamento', style: 'tableHeader', fillColor: '#F49519' },
            { text: 'Valor da Parcela', style: 'tableHeader', fillColor: '#F49519' },
            { text: 'Data de Pagamento', style: 'tableHeader', fillColor: '#F49519' },
        ]);

        paymentData?.forEach((pay) => {
            const payment = pay?.pagamento > 0 ? groupPayment?.filter((item) => item.value === pay?.pagamento).map((item) => item.label) : pay?.pagamento;

            tableBody.push([
                pay?.n_parcela,
                pay?.tipo,
                payment,
                formatter.format(pay?.valor_parcela),
                pay?.data_pagamento
            ]);
        });


        const tableDefinition = {
            table: {
                widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
                body: tableBody,
                styles: {
                    fontSize: 13
                },
                alignment: 'center'
            },
            margin: [20, 0, 0, 0],
            layout: {
                hLineWidth: function (i, node) {
                    return i === 0 ? 0 : 1;
                },
                vLineWidth: function (i, node) {
                    return 0;
                },
            },
        };

        return tableDefinition;
    };


    const createPaymentEntryTable = (paymentData) => {
        try {
            const tableBody = [];
            const formatter = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            });

            tableBody.push([
                { text: 'Valor de entrada', style: 'tableHeader', fillColor: '#F49519' },
                { text: 'Forma de pagamento', style: 'tableHeader', fillColor: '#F49519' },
                { text: 'Pagamento', style: 'tableHeader', fillColor: '#F49519' },
                { text: 'Data de Pagamento', style: 'tableHeader', fillColor: '#F49519' },
            ]);

            const dateForPaymentEntry = paymentData?.dateForPaymentEntry;
            const isValidDate = !isNaN(new Date(dateForPaymentEntry).getTime());

            if (isValidDate) {
                tableBody.push([
                    formatter.format(paymentData?.valueEntry),
                    paymentData?.typePaymentEntry || '',
                    'Pagamento realizado presencialmente',
                    { text: dateForPaymentEntry, alignment: 'center' }, // Format the date
                ]);
            } else {
                console.error('Invalid dateForPaymentEntry:', dateForPaymentEntry);
                return null; // or handle it accordingly
            }


            const tableDefinition = {
                table: {
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
                    body: tableBody,
                    styles: {
                        fontSize: 13
                    },
                    alignment: 'center'
                },
                margin: [20, 0, 0, 0],
                layout: {
                    hLineWidth: function (i, node) {
                        return i === 0 ? 0 : 1;
                    },
                    vLineWidth: function (i, node) {
                        return 0;
                    },
                },
            };

            return tableDefinition;
        } catch (error) {
            alert.error('Houve um erro ao processar contrato.');
            return error;
        }
    };




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
            <ContentContainer>
                <div ref={contractService} style={{ padding: '0px 40px' }}>
                    <ContractStudentComponent
                        userData={userData}
                        responsiblePayerData={responsiblePayerData}
                    >

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

                                <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Aluno:</Text>
                                    <Text small style={styles.textDataPayments}>{userData?.nome}</Text>
                                </Box>
                                <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Resp. pagante:</Text>
                                    <Text small style={styles.textDataPayments}>{responsiblePayerData?.nome_resp || userData?.nome}</Text>
                                </Box>
                                <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Valor total do semestre:</Text>
                                    <Text small style={styles.textDataPayments}>
                                        {
                                            paymentForm[0][0].tipo == 'Boleto(PRAVALER)' ?

                                                formatter.format(valueContractPravaler)

                                                :

                                                isDp ? formatter?.format(valuesContract?.valorFinal) : formatter.format(valuesContract?.valorSemestre)
                                        }



                                    </Text>
                                </Box>
                                {isDp && <Box sx={styles.containerValues}>
                                    <Text small style={styles.textDataPayments} bold>Disciplinas DP:</Text>
                                    <Text small style={styles.textDataPayments}>{classesDisciplinesDpSelected?.length || 0}</Text>
                                </Box>}
                                <Box sx={styles.containerValues}>
                                    <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas:</Text>
                                    <Text small style={styles.textDataPayments}>{valuesContract?.qntDispensadas}</Text>
                                </Box>
                                {valuesContract?.descontoDispensadas > 0 &&
                                    <Box sx={styles.containerValues}>
                                        <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (R$):</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(valuesContract.descontoDispensadas)}</Text>
                                    </Box>
                                }
                                {valuesContract?.descontoPorcentagemDisp != '0.00%' &&
                                    <Box sx={styles.containerValues}>
                                        <Text small bold style={styles.textDataPayments}>Disciplinas dispensadas - Desconto (%):</Text>
                                        <Text small style={styles.textDataPayments}>{valuesContract?.descontoPorcentagemDisp}</Text>
                                    </Box>
                                }
                                {/* {valuesContract?.descontoAdicional &&
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO (adicional):</Text>

                                        <Text small style={styles.textDataPayments}>{(typeDiscountAdditional?.real && formatter.format(valuesContract?.descontoAdicional || 0))
                                            || (typeDiscountAdditional?.porcent && parseFloat(valuesContract?.descontoAdicional || 0).toFixed(2) + '%')
                                            || '0'}</Text>
                                    </Box>
                                } */}
                                {valuesContract?.descontoAdicional &&
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO (adicional):</Text>

                                        <Text small style={styles.textDataPayments}>{(typeDiscountAdditional?.real && formatter.format(valuesContract?.descontoAdicional || 0))
                                            || (typeDiscountAdditional?.porcent && parseFloat(valuesContract?.descontoAdicional || 0).toFixed(2) + '%')
                                            || '0'}</Text>
                                    </Box>
                                }

                                {(forma_pagamento == 'Ex Aluno' && valuesContract?.desconto_ex_aluno > 0) &&
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO Ex Aluno (5%):</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(parseFloat(valuesContract?.desconto_ex_aluno))}</Text>
                                    </Box>
                                }

                                {(valuesContract?.desconto_avista > 0) &&
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO valor á vista (5%):</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(parseFloat(valuesContract?.desconto_avista))}</Text>
                                    </Box>
                                }

                                {(valuesContract?.jurosPagamentoEstendido > 0) &&
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>Juros pagamento estendido (10%):</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(parseFloat(valuesContract?.jurosPagamentoEstendido))}</Text>
                                    </Box>
                                }


                                {valuesContract?.descontoAdicional && valuesContract?.descontoDispensadas > 0 &&
                                    <Box sx={styles.containerValues}>
                                        <Text small style={styles.textDataPayments} bold>DESCONTO TOTAL:</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(parseFloat(valuesContract?.valorDescontoAdicional) + parseFloat(valuesContract?.descontoDispensadas))}</Text>
                                    </Box>
                                }
                                {paymentsInfoData?.valueEntry > 0 &&
                                    <Box sx={{ ...styles.containerValues, borderRadius: '0px 0px 8px 8px' }}>
                                        <Text small style={styles.textDataPayments} bold>VALOR DE ENTRADA:</Text>
                                        <Text small style={styles.textDataPayments}>{formatter.format(paymentsInfoData?.valueEntry)}</Text>
                                    </Box>
                                }
                                {valuesContract?.valorFinal &&
                                    <Box sx={{ ...styles.containerValues, borderRadius: '0px 0px 8px 8px' }}>
                                        <Text small style={styles.textDataPayments} bold>VALOR A PAGAR:</Text>
                                        <Text small style={styles.textDataPayments}>
                                            {
                                                paymentForm[0][0].tipo == 'Boleto(PRAVALER)' ?
                                                    formatter.format(valueContractPravaler) : formatter.format(valuesContract?.valorFinal)
                                            }


                                        </Text>
                                    </Box>
                                }
                            </Box>
                        </ContentContainer>



                        <ContentContainer style={{ display: 'flex', flexDirection: 'column', gap: 3, boxShadow: 'none', alignItems: 'center', marginBottom: 25 }}>
                            <Text bold>Forma de pagamento escolhida:</Text>
                            {paymentsInfoData?.valueEntry > 0 &&
                                <>
                                    <Text bold>Entrada</Text>
                                    <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '100%' }}>

                                        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Valor de entrada</th>
                                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Forma de pagamento</th>
                                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Pagamento</th>
                                                    <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Data de Pagamento</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ flex: 1 }}>
                                                <tr>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {formatter.format(paymentsInfoData?.valueEntry)}
                                                    </td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {paymentsInfoData?.typePaymentEntry}</td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        Pagamento realizado presencialmente
                                                    </td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                                        {paymentsInfoData?.dateForPaymentEntry}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            }

                            {paymentData?.map((payment, index) => {
                                const nonNullPayments = payment?.filter(pay => pay?.valor_parcela);

                                if (nonNullPayments?.length > 0) {
                                    return (
                                        <>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Text bold>{index + 1}º Pagante/Pagamento: </Text>
                                            </Box>
                                            <div key={{ index }} style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}`, width: '100%' }}>

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
                                                        {payment?.map((pay, payIndex) => {
                                                            const payment = pay?.pagamento > 0 ? groupPayment?.filter(item => item.value === pay?.pagamento).map(item => item.label) : pay?.pagamento
                                                            return (
                                                                <tr key={`${pay}-${payIndex}`}>
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
                                        </>
                                    )
                                }
                            })}
                        </ContentContainer>

                    </ContractStudentComponent>
                </div>
            </ContentContainer>
            {!isReenrollment && <ContentContainer gap={2}>
                <Text bold>Assinatura Digital:</Text>
                <Box sx={{ ...styles.inputSection, marginTop: 2 }}>
                    <TextInput placeholder='E-mail 1º' name='email_1' onChange={handleChange} value={emailDigitalSignature?.email_1 || ''} label='E-mail 1º *' sx={{ flex: 1, }} />
                    <TextInput placeholder='E-mail 2º' name='email_2' onChange={handleChange} value={emailDigitalSignature?.email_2 || ''} label='E-mail 2º' sx={{ flex: 1, }} />
                </Box>
            </ContentContainer>}
            <Box sx={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {!isDp && <Button secondary text="Voltar" onClick={() => pushRouteScreen(1, 'interesse > Pagamento')} style={{ width: 120 }} />}
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}>
                    <Button text="efetivar matrícula" onClick={() => handleSubmitEnrollment(paymentData, valuesContract)} style={{ width: '200px', height: '35px' }} />
                </Box>
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
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
}
