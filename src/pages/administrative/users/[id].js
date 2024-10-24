import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { Avatar, Backdrop, useMediaQuery, useTheme, Tooltip } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, PhoneInputField, FileInput, Divider, ButtonIcon } from "../../../atoms"
import { CheckBoxComponent, CustomDropzone, RadioItem, SectionHeader, TableOfficeHours, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createContract, createEnrollment, createUser, deleteFile, deleteUser, editContract, editeEnrollment, editeUser } from "../../../validators/api-requests"
import { emailValidator, formatCEP, formatCPF, formatDate, formatRg, formatTimeStamp, getRandomInt } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"
import Link from "next/link"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Dropzone from "react-dropzone"
import Cards from 'react-credit-cards'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { groupData } from "../../../helpers/groupData"
require('dotenv').config();


export default function EditUser() {
    const { setLoading, alert, colorPalette, user, matches, theme, setShowConfirmationDialog, menuItemsList, userPermissions } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newUser = id === 'new';
    const [perfil, setPerfil] = useState('')
    const [fileCallback, setFileCallback] = useState()
    const [enrollmentRegisterData, setEnrollmentRegisterData] = useState({
        turma_id: null,
        modulo: null,
        qnt_disci_dp: 0,
        qnt_disci_disp: 0,
        rematricula: null,
        cursando_dp: null,
        dt_inicio: null,
        dt_final: null,
        status: null,
        motivo_desistencia: null,
        dt_desistencia: null,
        certificado_emitido: 0,
        adimplente: 0,
        preferencia_pagamento: null,
        disciplinesData: [],
    })
    const [enrollmentUnlockingData, setEnrollmentUnlockingData] = useState({
        turma_id: null,
        modulo: null,
        qnt_disci_dp: 0,
        qnt_disci_disp: 0,
        dt_inicio: null,
        dt_final: null,
        status: null,
        adimplente: 0,
        preferencia_pagamento: null,
        disciplinesData: [],
    })
    const [arrayEnrollmentRegisterData, setArrayEnrollmentRegisterData] = useState([])
    const [userData, setUserData] = useState({
        cd_cliente: null,
        autista: null,
        superdotacao: null,
        ra: null,
        cpf: null,
        naturalidade: null,
        nacionalidade: 'Brasileira Nata',
        estado_civil: null,
        conjuge: null,
        email_melies: null,
        email_pessoal: null,
        nome_pai: null,
        nome_mae: null,
        escolaridade: null,
        genero: null,
        cor_raca: null,
        deficiencia: null,
        doc_estrangeiro: null,
        pais_origem: 'Brasil',
        telefone_emergencia: null,
        telefone: null,
        professor: 0,
        rg: null,
        expedicao: '2001-01-01',
        orgao: null,
        uf_rg: null,
        titulo: null,
        zona: null,
        secao: null,
        rua: null,
        cidade: null,
        uf: null,
        bairro: null,
        cep: null,
        complemento: null,
        numero: null,
        ativo: 1,
        admin_melies: 0,
        portal_aluno: 0,
        login: null,
        nascimento: null,
        tipo_deficiencia: null,
        nome_emergencia: null,
        foto_perfil_id: fileCallback?.preview || null,
        nome_social: null
    })
    const [contract, setContract] = useState({
        funcao: null,
        area: null,
        horario: null,
        admissao: null,
        desligamento: null,
        ctps: null,
        serie: null,
        pis: null,
        conta_id: null,
        banco_1: null,
        conta_1: null,
        agencia_1: null,
        tipo_conta_1: null,
        banco_2: null,
        conta_2: null,
        agencia_2: null,
        tipo_conta_2: null,
        cartao_ponto: null,
        superior: null,
        nivel_cargo: null
    })
    const [enrollmentData, setEnrollmentData] = useState([])
    const [countries, setCountries] = useState([])
    const [courses, setCourses] = useState([])
    const [classes, setClasses] = useState([])
    const [period, setPeriod] = useState([])
    const [usersForCoordinator, setUsersForCoordinator] = useState([])
    const [periodSelected, setPeriodSelected] = useState([])
    const [classesInterest, setClassesInterest] = useState([])
    const [groupPermissions, setGroupPermissions] = useState([])
    const [permissionPerfil, setPermissionPerfil] = useState()
    const [responsiblePayerData, setResponsiblePayerData] = useState({})
    const [creditCards, setCreditCards] = useState([])
    const [permissionPerfilBefore, setPermissionPerfilBefore] = useState()
    const [foreigner, setForeigner] = useState(false)
    const [showContract, setShowContract] = useState(true)
    const [showEnrollment, setShowEnrollment] = useState(true)
    const [showEnrollmentAdd, setShowEnrollmentAdd] = useState(false)
    const [showSelectiveProcess, setShowSelectiveProcess] = useState(true)
    const [showEditPaymentResponsible, setShowEditPaymentResponsible] = useState(false)
    const [selectiveProcessData, setSelectiveProcessData] = useState({
        agendamento_processo: '',
        nota_processo: '',
        status_processo: '',
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [interests, setInterests] = useState({
        modulo_curso: 1
    });
    const [arrayInterests, setArrayInterests] = useState([])
    const [showSections, setShowSections] = useState({
        registration: false,
        interest: false,
        historic: false,
        addHistoric: false,
        addInterest: false,
        viewInterest: false,
        permissions: false,
        accessData: false,
        editEnroll: false
    })
    const [showEditFile, setShowEditFiles] = useState({
        photoProfile: false,
        cpf: false,
        rg: false,
        foreigner: false,
        address: false,
        certificate: false,
        schoolRecord: false,
        contractStudent: false,
        cpf_dependente: false,
        titleDoc: false,
        ctps: false,
        enem: false,
        cert_nascimento: false,
        pis: false
    })
    const [historicData, setHistoricData] = useState({
        responsavel: user?.nome
    });
    const [arrayHistoric, setArrayHistoric] = useState([])
    const [arrayDependent, setArrayDependent] = useState([])
    const [dependent, setDependent] = useState({})
    const [arrayDisciplinesProfessor, setArrayDisciplinesProfessor] = useState([])
    const [disciplinesProfessor, setDisciplinesProfessor] = useState({})
    const [valueIdHistoric, setValueIdHistoric] = useState()
    const [valueIdInterst, setValueIdInterst] = useState()
    const [interestSelected, setInterestSelected] = useState({})
    const [filesUser, setFilesUser] = useState([])
    const [contractStudent, setContractStudent] = useState([])
    const [officeHours, setOfficeHours] = useState([
        { dia_semana: '2ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '3ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '4ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '5ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '6ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: 'Sábado', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
    ]);
    const [showEnrollTable, setShowEnrollTable] = useState({})
    const [showSelectiveProcessTable, setShowSelectiveProcessTable] = useState({})
    const [enrollmentStudentEditId, setEnrollmentStudentEditId] = useState()
    const [enrollmentStudentEditData, setEnrollmentStudentEditData] = useState({})
    const [disciplines, setDisciplines] = useState([])
    const [disciplinesEnrollmentRegister, setDisciplinesEnrollmentRegister] = useState([])
    const [currentModule, setCurrentModule] = useState(1)
    const [highestModule, setHighestModule] = useState(null)
    const [showEditPhoto, setShowEditPhoto] = useState(false)
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showEnrollmentsRegisters, setShowEnrollmentsRegisters] = useState({});
    const [menuView, setMenuView] = useState('userData');
    const [showEditWritingGrade, setShowEditWritingGrade] = useState({ active: false, writing: {} })
    const [essayWritingData, setEssayWritingData] = useState({})
    const [open, setOpen] = useState(false);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
            // if (parseInt(id) === parseInt(user?.id)) {
            //     setIsPermissionEdit(true)
            // } else {
            //     setIsPermissionEdit(actions)
            // }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const toggleEnrollmentRegisters = (index) => {
        setShowEnrollmentsRegisters(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    useEffect(() => {
        setPerfil()
        findCountries()
        listCourses()
        listPermissions()
        listDisciplines()
        fetchPermissions()
    }, [])

    useEffect(() => {
        listClass()
    }, [enrollmentData?.curso_id, interests.curso_id, interestSelected?.curso_id])


    const getUserData = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            setUserData(data)
            return data
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getDependent = async () => {
        try {
            const response = await api.get(`/user/dependent/${id}`)
            const { data } = response
            setArrayDependent(data.dependents)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getDisciplineProfessor = async () => {
        try {
            const response = await api.get(`/discipline/professor/${id}`)
            const { data } = response
            setArrayDisciplinesProfessor(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getContract = async () => {
        try {
            const response = await api.get(`/contract/${id}`)
            const { data } = response
            await listUserByArea(data?.area)
            setContract(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getEnrollment = async () => {
        try {
            const response = await api.get(`/enrollment/${id}`)
            const { data } = response
            if (data?.length > 0) {

                const sortedEnrollments = data?.filter(item => item?.status !== 'Transferido')?.sort((a, b) => b.modulo - a.modulo);
                const highestModule = sortedEnrollments[0]?.modulo

                // data.sort((a, b) => a.modulo - b.modulo);
                // const highestModule = data[data.length - 1].modulo;
                setHighestModule(highestModule);
            }
            console.log(data)
            setEnrollmentData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getInterest = async () => {
        try {
            const response = await api.get(`/user/interests/${id}`)
            const { data } = response
            console.log(data)
            setArrayInterests(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getInterestEdit = async (interestId) => {
        try {
            const response = await api.get(`/user/interest/${interestId}`)
            const { data } = response
            setInterestSelected(data)
            if (data) {
                await listClassesInterest(data?.curso_id)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getHistoric = async () => {
        try {
            const response = await api.get(`/user/historical/${id}`)
            const { data } = response
            setArrayHistoric(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getFileUser = async () => {
        try {
            const response = await api.get(`/files/${id}`)
            const { data } = response
            setFilesUser(data)
        } catch (error) {
            console.log(error)
        }
    }


    const getContractStudent = async () => {
        try {
            const response = await api.get(`/student/enrollment/contracts/${id}`)
            const { data } = response
            if (data.length > 0) {
                setContractStudent(data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getOfficeHours = async () => {
        try {
            const response = await api.get(`/officeHours/${id}`)
            const { data = [] } = response
            if (data.length > 0) {
                setOfficeHours(data)
                return
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const getPermissionUser = async () => {
        try {
            const response = await api.get(`/permissionPerfil/${id}`)
            const { data } = response
            if (response.status === 200) {
                setPermissionPerfil(data)
                setPermissionPerfilBefore(data)
                return
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

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
            const response = await api.get(`/order/paymentProfile/list/${id}`)
            const { success } = response?.data
            if (success) {
                const { crediCards } = response?.data
                const groupPaymentsPerfil = crediCards?.map(item => ({
                    numero_cartao: `${item?.primeiros_numeros} XXXX XXXX ${item?.ultimos_numeros}`,
                    nome_cartao: item?.nome_cartao,
                    dt_expiracao: item?.dt_expiracao,
                }))

                const removeDuplicateCards = (cards) => {
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
        (async () => {
            if (newUser) {
                return
            }
            await handleItems();
        })();
    }, [id])

    const handleBlurCEP = (event) => {
        const { value } = event.target;
        findCEP(value);
    };

    const handleBlurCEPResp = (event) => {
        const { value } = event.target;
        findCEPResp(value);
    };

    async function findCEP(cep) {
        setLoading(true)
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            const { data } = response;

            setUserData((prevValues) => ({
                ...prevValues,
                rua: data.logradouro,
                cidade: data.localidade,
                uf: data.uf,
                bairro: data.bairro,
            }))
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    async function findCEPResp(cep) {
        setLoading(true)
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            const { data } = response;

            setResponsiblePayerData((prevValues) => ({
                ...prevValues,
                end_resp: data.logradouro,
                cidade_resp: data.localidade,
                uf_resp: data.uf,
                bairro_resp: data.bairro,
            }))
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    async function findCountries() {
        try {
            const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/paises/paises`);
            const { data = [] } = response;
            const abbreviatedNames = data.map(country => country.nome.abreviado);
            const uniqueAbbreviatedNames = [...new Set(abbreviatedNames)];

            uniqueAbbreviatedNames.sort()

            const groupAccount = uniqueAbbreviatedNames.map(name => ({
                label: name,
                value: name
            }));

            setCountries(groupAccount);
        } catch (error) {
        }
    }

    async function listCourses() {
        try {
            const response = await api.get(`/courses`)
            const { data } = response
            const groupCourses = data?.filter(item => item.ativo === 1)?.map(course => ({
                label: `${course.nome_curso}_${course?.modalidade_curso}`,
                value: course?.id_curso
            }));

            setCourses(groupCourses);
        } catch (error) {
        }
    }

    async function listClass() {

        try {
            const response = await api.get(`/classes`)

            const { data = [] } = response
            const groupClass = data.filter(item => item.ativo === 1)?.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma
            }));

            const groupPeriod = data.filter(item => item.ativo === 1)?.map(turma => ({
                label: turma?.periodo,
                value: turma?.periodo,
                idClass: turma?.id_turma
            }));

            setClasses(groupClass);
            setPeriod(groupPeriod)
        } catch (error) {
            return error
        }
    }

    const handleModules = (module) => {
        if (module) {

            const moduleArray = [];
            for (let i = 1; i <= module; i++) {
                moduleArray.push({
                    label: `${i}º Módulo`,
                    value: i,
                });
            }
            return moduleArray;
        } else {
            return []
        }
    }


    async function listClassesInterest(id_course) {

        try {
            const response = await api.get(`/class/course/${id_course}`)

            const { data = [] } = response
            const groupClass = data.filter(item => item.ativo === 1)?.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma,
                modules: handleModules(turma?.duracao)
            }));

            const groupPeriod = data.filter(item => item.ativo === 1)?.map(turma => ({
                label: turma?.periodo,
                value: turma?.periodo
            }));

            setClassesInterest(groupClass);
            setPeriodSelected(groupPeriod)
        } catch (error) {
            return error
        }
    }


    async function listPermissions() {

        try {
            const response = await api.get(`/permissions`)
            const { data } = response
            const groupPermissions = data.map(permission => ({
                label: permission.permissao,
                value: permission?.id_grupo_perm.toString()
            }));

            setGroupPermissions(groupPermissions);
        } catch (error) {
        }
    }

    async function listDisciplines() {
        try {
            const response = await api.get(`/disciplines/active`)
            const { data } = response
            const groupDisciplines = data.filter(item => item.ativo === 1)?.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
        }
    }


    async function autoEmailMelies() {
        try {
            const name = userData?.nome?.split(' ');
            const firstName = name[0];
            const lastName = name.length > 1 ? name[name.length - 1] : '';
            let firstEmail = `${firstName}.${lastName}@melies.com.br`;

            if (!lastName) {
                firstEmail = `${firstName}01@melies.com.br`;
            }
        } catch (error) {
        }
    }


    async function listUserByArea() {
        try {
            const response = await api.get(`/users`)
            const { data } = response

            const groupUser = data.filter(item => item.perfil.includes('funcionario'))?.map(responsible => ({
                label: responsible.nome,
                value: responsible?.id,
                area: responsible?.area
            }));

            const sortedUsers = groupUser?.sort((a, b) => a.label.localeCompare(b.label));
            setUsersForCoordinator(sortedUsers)
        } catch (error) {
            return error
        }
    }



    const handleEnrollments = async () => {
        try {
            const response = await api.get(`/enrollments/user/reenrollment/${id}`)
            const { data } = response
            if (data?.length > 0) {
                const lastModule = data?.map(item => item.modulo)
                lastModule.sort((a, b) => a - b)
                const highestModule = Math.max(...lastModule);
                setCurrentModule(highestModule + 1)
                return highestModule + 1
            }
            return false
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const userDetails = await getUserData()
            if (userDetails.perfil.includes('aluno') || userDetails.perfil.includes('interessado')) {
                await getEnrollment()
                await getInterest()
                await getContractStudent()
                await handleEnrollments()
                await handleResponsible()
                await handlePaymentsProfile()

            }

            if (userDetails.perfil.includes('funcionario')) {
                await getContract()
                await getOfficeHours()
                await getDisciplineProfessor()
            }
            await getHistoric()
            await getFileUser()
            await getPermissionUser()
            await getDependent()
            await listClass()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Usuarios')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        if (value.target.name == 'cpf') {
            let str = value.target.value;
            value.target.value = formatCPF(str)
        }

        if (value.target.name == 'rg') {
            let str = value.target.value;
            value.target.value = formatRg(str)
        }

        if (value.target.name == 'cep') {
            let str = value.target.value;
            value.target.value = formatCEP(str)
        }

        setUserData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeContract = (value) => {
        setContract((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeSelectiveProcess = (event) => {


        setSelectiveProcessData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const handleBlurNota = (event, subscription) => {

        let nota = event.target.value;

        if (nota > 50) {
            handleChangeSubscriptionData({ interestId: subscription?.interesse_id, field: 'status_processo_sel', value: 'Classificado' })
            return
        }
        if (nota <= 50) {
            handleChangeSubscriptionData({ interestId: subscription?.interesse_id, field: 'status_processo_sel', value: 'Desclassificado' })
            return
        }
    }

    const handleChangeEnrollment = (value) => {

        setEnrollmentData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeEnrollmentEdit = (value) => {

        setEnrollmentStudentEditData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }


    const handleChangeEnrollmentRegister = (value) => {

        setEnrollmentRegisterData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }


    const handleChangeUnlockingData = (value) => {

        setEnrollmentUnlockingData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }




    const handleChangeEnrollmentDisciplinesDataRegister = (disciplineId, field, value) => {

        setEnrollmentRegisterData((prevValues) => {
            const updatedDisciplinesData = prevValues?.disciplinesData?.map((item) => {
                if (item?.disciplina_id === disciplineId) {
                    return {
                        ...item,
                        [field]: value
                    }
                }
                return item
            })
            return {
                ...prevValues,
                disciplinesData: updatedDisciplinesData
            }
        })
    }

    const handleChangeEnrollmentDisciplinesDataDestrancamento = (modulo, disciplineId, field, value) => {

        setEnrollmentUnlockingData((prevValues) => {
            const updatedDisciplinesData = prevValues?.disciplinesData?.map((m) => {
                if (modulo === m.modulo_grade) {
                    return {
                        ...m,
                        disciplinas: m.disciplinas.map((item) => {
                            if (item?.disciplina_id === disciplineId) {
                                return {
                                    ...item,
                                    [field]: value
                                }
                            }
                            return item
                        })
                    }
                }
                return m
            })

            return {
                ...prevValues,
                disciplinesData: updatedDisciplinesData
            }
        })
    }

    const handleCalculateFrequency = (presenca, falta) => {
        const presencas = parseInt(presenca);
        const faltas = parseInt(falta);
        const totalAulas = (presencas + faltas) || 1;
        const frequency = (presencas / totalAulas) * 100

        return `${parseFloat(frequency || 0).toFixed(1)}%`
    }


    const handleChangeHistoric = (value) => {

        setHistoricData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeInterest = async (value, field) => {

        if (field === 'curso_id') {
            let [courseName] = courses?.filter(item => item.value === value).map(item => item.label)
            setInterests({
                ...interests,
                curso_id: value,
                nome_curso: courseName
            })
            return
        }

        if (field === 'turma_id') {

            let [className] = classes?.filter(item => item.value === value).map(item => item.label)
            setInterests({
                ...interests,
                turma_id: value,
                nome_turma: className
            })

            const duration = classesInterest?.filter(item => item.value === value)?.map(item => item.modules)
            return
        }

        setInterests((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeInterestSelected = (value) => {

        setInterestSelected((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleOfficeHours = (newData) => {
        setOfficeHours(newData);
    };

    const handleChangeDependent = (value) => {

        if (value.target.name?.includes('cpf_dependente')) {
            let str = value.target.value;
            value.target.value = formatCPF(str)
        }


        setDependent((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const handleChangeDependentArray = (event, fieldName, id_dependente) => {

        if (event.target.name?.includes('cpf_dependente')) {
            let str = event.target.value;
            event.target.value = formatCPF(str)
        }

        const newValue = event.target.value;

        setArrayDependent((prevArray) => {
            const newArray = prevArray.map((item) =>
                item.id_dependente === id_dependente
                    ? { ...item, [fieldName]: newValue }
                    : item
            );
            return newArray;
        });
    };


    const handleChangeDisciplineProfessor = (value) => {
        setDisciplinesProfessor((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const addInterest = () => {
        if (!interests.curso_id) {
            alert.error('Por favor, selecione o curso de interesse.')
            return
        }

        setArrayInterests((prevArray) => [
            ...prevArray,
            {
                curso_id: interests?.curso_id,
                turma_id: interests?.turma_id,
                nome_curso: interests?.nome_curso,
                nome_turma: interests?.nome_turma,
                periodo_interesse: interests?.periodo_interesse,
                observacao_int: interests?.observacao_int || '',
                inscricao: {},
                requeriments: []
            }
        ]);

        setInterests({})
    }

    const deleteInterest = (index) => {
        if (newUser) {
            setArrayInterests((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const handleDeleteInterest = async (id_interesse) => {
        setLoading(true)
        try {
            const response = await api.delete(`/user/interest/delete/${id_interesse}`)
            if (response?.status == 201) {
                alert.success('Interesse removido.');
                getInterest()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover o Interesse selecionado.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddInterest = async () => {
        setLoading(true)
        let userId = userData?.id;

        try {
            const response = await api.post(`/user/interest/create/${usuario_id}`, { interests, userId })
            if (response?.status == 201) {
                alert.success('Interesse adicionado.');
                setInterests({})
                getInterest()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar Interesse.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditInterest = async (id_interest) => {
        setLoading(true)
        try {
            const response = await api.patch(`/user/interest/update/${id_interest}`, { interestSelected })
            if (response?.status === 200) {
                alert.success('Interesse atualizado.');
                setShowSections({ ...showSections, viewInterest: false })
                getInterest()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar Interesse.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const addHistoric = () => {
        if (!historicData?.dt_ocorrencia || !historicData?.responsavel || !historicData?.ocorrencia) {
            alert.error('Por favor, preencha os campos antes de adicionar.')
            return
        }

        setArrayHistoric((prevArray) => [
            ...prevArray,
            {
                dt_ocorrencia: historicData?.dt_ocorrencia,
                responsavel: historicData?.responsavel,
                ocorrencia: historicData?.ocorrencia,
            }
        ]);

        setHistoricData({})
    }

    const deleteHistoric = (index) => {
        if (newUser) {
            setArrayHistoric((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const handleDeleteHistoric = async (id_historic) => {
        setLoading(true)
        try {
            const response = await api.delete(`/user/historic/delete/${id_historic}`)
            if (response?.status == 201) {
                alert.success('Historico removido.');
                setValueIdHistoric('')
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover o Historico selecionado.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddHistoric = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/user/historic/create/${id}`, { historicData })
            if (response?.status == 201) {
                alert.success('Historico adicionado.');
                setHistoricData({})
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar Historico.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditHistoric = async (id_historic) => {
        setLoading(true)
        try {
            const response = await api.post(`/user/historic/update/${id_historic}`, { historicData })
            if (response?.status == 201) {
                alert.success('Historico atualizado.');
                setHistoricData({})
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar Historico.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const checkRequiredFields = () => {
        if (!userData?.nome) {
            alert?.error('O campo nome é obrigatório')
            return false
        }
        if (!userData?.email) {
            alert?.error('O campo email é obrigatório')
            return false
        }
        if (!emailValidator(userData?.email)) {
            alert?.error('O e-mail inserido parece estar incorreto.')
            return false
        }

        if (userData?.nova_senha !== userData?.confirmar_senha) {
            alert?.error('As senhas não correspondem. Por favor, verifique novamente.')
            return false
        }

        if (userData?.complemento !== '' && userData?.complemento?.length > 30) {
            alert?.error('O complemento não pode ser superior a 30 caractéres.')
            return false
        }

        return true
    }


    const handleCreateUser = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await createUser(userData, arrayInterests, arrayHistoric, arrayDisciplinesProfessor, usuario_id)
                const { data } = response

                if (data?.success) {


                    if (userData?.perfil?.includes('funcionario')) { await createContract(data?.userId, contract) }
                    if (userData?.perfil?.includes('aluno') && arrayEnrollmentRegisterData?.length > 0) {
                        await api.post(`/enrollment/student/register/${data?.userId}`, { enrollmentRegisterData: arrayEnrollmentRegisterData, userResp: user?.id })
                    }
                    // if (fileCallback) { await api.patch(`/file/edit/${fileCallback?.id_foto_perfil}/${data?.userId}`) }
                    if (fileCallback) {
                        const formData = new FormData();
                        formData.append('file', fileCallback?.file, encodeURIComponent(fileCallback?.name));
                        let query = `?usuario_id=${data?.userId}`;
                        if (fileCallback?.campo) query += `&campo=${fileCallback?.campo}`;
                        if (fileCallback?.tipo) query += `&tipo=${fileCallback?.tipo}`;
                        await api.post(`/file/upload${query}`, formData, { headers: { 'Authorization': "bearer " + 'token' } })
                    }
                    if (filesUser?.length > 0) {
                        for (const uploadedFile of filesUser) {
                            const formData = new FormData();
                            formData.append('file', uploadedFile?.file, encodeURIComponent(uploadedFile?.name));
                            let query = `?usuario_id=${data?.userId}`;
                            if (uploadedFile?.campo) query += `&campo=${uploadedFile?.campo}`;
                            if (uploadedFile?.tipo) query += `&tipo=${uploadedFile?.tipo}`;
                            if (uploadedFile?.matricula_id) query += `&matricula_id=${uploadedFile?.matricula_id}`;
                            const documents = await api.post(`/file/upload${query}`, formData, { headers: { 'Authorization': "bearer " + 'token' } })
                        }
                    }
                    if (officeHours) { await api.post(`/officeHours/create/${data?.userId}`, { officeHours }) }
                    if (newUser && filesUser) { await api.patch(`/file/editFiles/${data?.userId}`, { filesUser }); }
                    if (permissionPerfil) {
                        const permissionsToAdd = permissionPerfil.split(',').map(id => parseInt(id));
                        if (permissionsToAdd.length > 0) {
                            await api.post(`/permissionPerfil/create/${data?.userId}`, { permissionsToAdd })
                        }
                    }
                    if (response?.status === 201) {
                        alert.success('Usuário cadastrado com sucesso.');
                        router.push(`/administrative/users/${data?.userId}`)
                    }
                    if (response?.status === 200) {
                        return alert.error(response?.data?.msg);
                    }
                } else {
                    return alert.error(response?.data?.msg);
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar usuário.');
                console.log(error)
            } finally {
                setLoading(false)
            }
            return setLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        setLoading(true)
        try {
            const response = await deleteUser(id)
            if (response?.status == 200) {
                alert.success('Usuário excluído com sucesso.');
                router.push(`/administrative/users/list`)
            }
        } catch (error) {
            alert.error('Tivemos um problema ao excluir usuário.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditUser = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editeUser({ id, userData })
                if (response.status === 422) return alert.error('CPF já cadastrado.')
                if (contract) {
                    const contr = await editContract({ id, contract })
                }
                if (userData?.perfil?.includes('aluno') && arrayEnrollmentRegisterData?.length > 0) {
                    await api.post(`/enrollment/student/register/${id}`, { enrollmentRegisterData: arrayEnrollmentRegisterData, userResp: user?.id })
                }
                if (!(officeHours.filter((item) => item?.id_hr_trabalho).length > 0)) {
                    await api.post(`/officeHours/create/${id}`, { officeHours })
                }
                if (officeHours?.map((item) => item.id_hr_trabalho).length > 0) {
                    await api.patch(`/officeHours/update`, { officeHours })
                }
                if (arrayDependent?.length > 0) {
                    await api.patch(`/user/dependent/update`, { arrayDependent })
                }

                if (arrayInterests?.length > 0) {
                    for (let interest of arrayInterests) {
                        const subscription = { ...interest?.inscricao, id_redacao: interest?.id_redacao };
                        if (subscription) {
                            if (subscription?.id_inscricao) {
                                await api.patch(`/subscription/update/${subscription?.id_inscricao}`, { subscriptionData: subscription, userResp: user?.id })
                            } else if (subscription?.forma_ingresso) {
                                await api.post(`/subscription/create`, {
                                    subscriptionData: {
                                        ...subscription,
                                        turma_id: interest?.turma_id,
                                        usuario_id: id,
                                        interesse_id: interest?.id_interesse
                                    }
                                })
                            }

                        }
                    }
                }
                if (response?.status === 201) {
                    alert.success('Usuário atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar usuário.');
            } catch (error) {
                console.log(error)
                alert.error('Tivemos um problema ao atualizar usuário.');
                return error;
            } finally {
                setLoading(false)
            }
        }

    }

    const handleAddPermission = async () => {
        setLoading(true)
        try {

            const currentPermissions = permissionPerfil.split(',').map(id => parseInt(id));
            const previousPermissions = permissionPerfilBefore.split(',').map(id => parseInt(id));

            const permissionsToAdd = currentPermissions.filter(id => !previousPermissions.includes(id));
            const permissionsToRemove = previousPermissions.filter(id => !currentPermissions.includes(id));

            if (permissionsToAdd.length > 0) {
                const responseData = await api.post(`/permissionPerfil/create/${id}`, { permissionsToAdd })
            }

            if (permissionsToRemove.length > 0) {
                const permissionsToRemoveString = permissionsToRemove.join(','); // Converta o array em uma string
                const responseData = await api.delete(`/permissionPerfil/remove/${id}?permissions=${permissionsToRemoveString}`);
            }
            alert.info('Permissões do usuário atualizadas.');
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao atualizar as permissões.');
            return error;
        } finally {
            setLoading(false)
        }
    }

    const handleChangeFilesUser = (field, fileId, filePreview) => {
        setFilesUser((prevClassDays) => [
            ...prevClassDays,
            {
                id_doc_usuario: fileId,
                location: filePreview,
                campo: field,
            }
        ]);
    };

    const replicateToDaysWork = () => {
        const firstWorkingHours = officeHours.find(day => day.dia_semana === '2ª Feira')
        if (firstWorkingHours?.ent1 !== '') {
            const updatedOfficeHours = officeHours.map(day => ({
                ...day,
                ent1: firstWorkingHours.ent1,
                sai1: firstWorkingHours.sai1,
                ent2: firstWorkingHours.ent2,
                sai2: firstWorkingHours.sai2,
                ent3: firstWorkingHours.ent3,
                sai3: firstWorkingHours.sai3,
            }))
            setOfficeHours(updatedOfficeHours)
        }
    }

    const checkEnrollmentData = (enrollmentRegisterData) => {
        const requiredFields = ['turma_id', 'modulo', 'dt_inicio', 'dt_final', 'status', 'preferencia_pagamento', 'rematricula', 'cursando_dp'];


        for (const field of requiredFields) {
            if (enrollmentRegisterData[field] === '' || enrollmentRegisterData[field] === null) {
                alert.info('Preencha todos os campos obrigatórios antes de prosseguir.');
                return false;
            }
        }

        let classId = enrollmentRegisterData?.turma_id;
        let selectedModule = enrollmentRegisterData?.modulo;
        let statusEnrollment = enrollmentRegisterData?.status;
        if (arrayEnrollmentRegisterData?.filter(item => (item.turma_id === classId) && item?.modulo === selectedModule && item?.status === statusEnrollment)?.length > 0
        ) {
            alert.info('Já foi adicionado uma matrícula com a turma e módulo selecionados. Verifique nas matriculas já incluídas acima, para que não haja duplicidade.')
            return false;
        }

        return true
    }

    const handleAddEnrollmentRegister = () => {
        if (checkEnrollmentData(enrollmentRegisterData)) {
            setArrayEnrollmentRegisterData((prevArray) => [...prevArray, {
                turma_id: enrollmentRegisterData?.turma_id,
                modulo: enrollmentRegisterData?.modulo,
                qnt_disci_dp: enrollmentRegisterData?.qnt_disci_dp,
                qnt_disci_disp: enrollmentRegisterData?.qnt_disci_disp,
                rematricula: enrollmentRegisterData?.rematricula,
                cursando_dp: enrollmentRegisterData?.cursando_dp,
                dt_inicio: enrollmentRegisterData?.dt_inicio,
                dt_final: enrollmentRegisterData?.dt_final,
                status: enrollmentRegisterData?.status,
                motivo_desistencia: enrollmentRegisterData?.motivo_desistencia,
                dt_desistencia: enrollmentRegisterData?.dt_desistencia,
                certificado_emitido: enrollmentRegisterData?.certificado_emitido,
                adimplente: enrollmentRegisterData?.adimplente,
                preferencia_pagamento: enrollmentRegisterData?.preferencia_pagamento,
                disciplinesData: enrollmentRegisterData?.disciplinesData
            }])
            setEnrollmentRegisterData({
                turma_id: null,
                modulo: null,
                qnt_disci_dp: 0,
                qnt_disci_disp: 0,
                rematricula: null,
                cursando_dp: null,
                dt_inicio: null,
                dt_final: null,
                status: null,
                motivo_desistencia: null,
                dt_desistencia: null,
                certificado_emitido: 0,
                adimplente: 0,
                preferencia_pagamento: null,
                disciplinesData: []
            })
        }
    }

    const removeEnrollmentRegister = (index) => {
        setArrayEnrollmentRegisterData((prevArray) => {
            const newArray = [...prevArray];
            newArray.splice(index, 1);
            return newArray;
        });
    };

    const addDependent = () => {
        setArrayDependent((prevArray) => [...prevArray, { nome_dependente: dependent.nome_dependente }])
        setDependent({ nome_dependente: '', cpf_dependente: '', dt_nasc_dependente: '' })
    }

    const deleteDependent = (index) => {
        if (newUser) {
            setArrayDependent((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const handleAddDependent = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/user/dependent/create/${id}`, { dependent })
            if (response?.status === 201) {
                alert.success('Dependente incluido')
                setDependent({})
                getDependent()
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteDependent = async (id_dependente) => {
        setLoading(true)
        try {
            const response = await api.delete(`/user/dependent/delete/${id_dependente}`)
            if (response?.status === 200) {
                alert.success('Dependente removido.');
                getDependent()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const addDisciplineProfessor = () => {
        setArrayDisciplinesProfessor((prevArray) => [...prevArray, { disciplina_id: disciplinesProfessor.disciplina_id }])
        setDisciplinesProfessor({ disciplina_id: '' })
    }

    const deleteDisciplineProfessor = (index) => {
        if (newUser) {
            setArrayDisciplinesProfessor((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const handleAddDisciplineProfessor = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/discipline/professor/create/${id}`, { disciplinesProfessor, usuario_id })
            if (response?.status === 201) {
                alert.success('Disciplina vinculada ao professor')
                setDisciplinesProfessor({})
                getDisciplineProfessor()
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteDisciplineProfessor = async (disciplineProfessorId) => {
        setLoading(true)
        try {
            const response = await api.delete(`/discipline/professor/delete/${disciplineProfessorId}`)
            if (response?.status === 200) {
                alert.success('Dependente removido.');
                getDisciplineProfessor()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const verifyExistsClassSchedule = async (turma_id) => {
        setLoading(true)
        try {
            const response = await api.get(`/classSchedule/verify/${turma_id}/1`)
            const { data } = response
            return data
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const toggleEnrollTable = (index) => {
        setShowEnrollTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };



    const toggleProcessSectiveTable = (index) => {
        setShowSelectiveProcessTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };


    const handleEnrollStudentById = async (id) => {
        setLoading(true)
        try {
            const response = await api.get(`/enrollment/edit/${id}`)
            const { data } = response
            if (data) {
                setEnrollmentStudentEditData(data)
            }

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleReenrollmentPos = async ({ classId, moduleCourse }) => {
        try {
            setLoading(true)
            const response = await api.post(`/enrollment/create/pos-graduacao/reenrollment`, {
                classId, moduleCourse,
                userId: userData?.id
            })
            if (response?.data?.success) {
                alert.success('Rematrícula realizada com sucesso!')
                await getEnrollment()
            } else {
                alert.error('Ocorreu um erro ao realizar sua Rematrícula. Entre em contato com o atendimento, ou tente novamente mais tarde.')
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleEnrollStudentEdit = async () => {
        setLoading(true)
        try {
            if (enrollmentStudentEditData) {
                const responseData = await editeEnrollment({ enrollmentStudentEditId, enrollmentStudentEditData })

                if (responseData.status === 201) {
                    setShowSections({ ...showSections, editEnroll: false })
                    getEnrollment()
                }
            }

        } catch (error) {
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleValidateGetway = async () => {
        setLoading(true)
        try {
            const result = await api.post(`/user/validate/getway`, { userData })
            return result
        } catch (error) {
            alert.error('Ocorreu um erro. Valide os seus dados (Verifique se seu CPF está correto) e tente novamente.')
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleEnrollment = async (interest, subscription) => {
        if (verifyDataToGetway()) {
            if (verifyEnrollment(interest)) {
                setLoading(true)
                try {
                    const result = await handleValidateGetway()
                    if (result?.status === 201 || result?.status === 200) {
                        if (subscription?.forma_ingresso === 'Destrancamento de matrícula') {
                            router.push(`/administrative/users/${id}/enrollStudent?classId=${interest?.turma_id}&courseId=${interest?.curso_id}&reenrollment=true&unlocked=true&interest=${interest?.id_interesse}`)
                        }
                        else if ((subscription?.forma_ingresso !== 'Trânsferência')) {
                            router.push(`/administrative/users/${id}/enrollStudent?interest=${interest?.id_interesse}`)
                        } else {
                            router.push(`/administrative/users/${id}/enrollStudent?classId=${interest?.turma_id}&courseId=${interest?.curso_id}&reenrollment=true`)
                        }
                        return
                    } else {
                        alert.error('Ocorreu um erro. Valide os seus dados (Verifique se seu CPF está correto) e tente novamente.')
                    }
                } catch (error) {
                    alert.error('Ocorreu um erro. Valide os seus dados (Verifique se seu CPF está correto) e tente novamente.')
                    return error
                } finally {
                    setLoading(false)
                }
            }
        }
    }


    const handleSendRequeriment = async ({ classId, courseId, entryForm = null, moduleCourse = 1 }) => {
        if (userData?.cep) {
            setLoading(true)
            try {
                const response = await api.post(`/requeriment/subscription/create`, { classId, courseId, entryForm, userData, moduleEnrollment: moduleCourse, userResp: user?.id })
                if (response?.status === 201) {
                    alert.success('Requerimento enviado com sucesso.')
                    await handleEditUser()
                } else {
                    alert.error('Ocorreu um erro interno ao enviar o requerimento. Tente novamente ou consulte o Suporte.')
                }
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
            }
        } else {
            alert.info('Preencha primeiramente o endereço completo do usuario, antes de prosseguir.')
        }

    }

    const verifyDataToGetway = () => {

        if (!userData?.nome) {
            alert.error('Preencha o campo nome para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.cpf) {
            alert.error('Preencha o campo cpf para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.nascimento) {
            alert.error('Preencha o campo nascimento para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.telefone) {
            alert.error('Preencha o campo telefone para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.rua) {
            alert.error('Preencha o campo rua para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.numero) {
            alert.error('Preencha o campo numero para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.bairro) {
            alert.error('Preencha o campo bairro para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.cidade) {
            alert.error('Preencha o campo cidade para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.uf) {
            alert.error('Preencha o campo uf para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.cep) {
            alert.error('Preencha o campo cep para seguirmos com a matrícula.')
            return false
        }

        return true
    }

    const verifyEnrollment = (interest) => {
        const isRegistered = enrollmentData?.filter(item => item.turma_id === interest?.turma_id)

        if (isRegistered?.length > 0) {
            alert.info('O aluno já está matrículado na turma selecionada. Analíse bem antes de prosseguir, para não "duplicar" matrículas ativas.')
            return false
        }
        return true
    }

    const handleSendSelectiveEssayWriting = async (interest) => {
        try {
            setLoading(true)
            const result = await api.post(`/redacao-online/create`, {
                essayData: {
                    usuario_id: id,
                    interesse_id: interest?.id_interesse,
                    curso_id: interest?.curso_id,
                    usuario_resp: user?.id
                }
            })
            if (result.status !== 201) {
                alert.error('Houve um erro ao enviar e-mail.')
                return
            } else {
                alert.success('E-mail enviado com sucesso.')
                await handleEditUser()
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    async function handleSelectModule(value) {

        let moduleClass = value;
        try {
            const response = await api.get(`/classSchedule/disciplines/${enrollmentRegisterData?.turma_id}/${moduleClass}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                nome_disciplina: disciplines.nome_disciplina,
                disciplina_id: disciplines?.id_disciplina,
                nt_final: 0,
                qnt_presenca: 0,
                qnt_falta: 0,
                selecionada: 1
            }));

            setDisciplinesEnrollmentRegister(groupDisciplines);
            setEnrollmentRegisterData({
                ...enrollmentRegisterData,
                disciplinesData: groupDisciplines
            })
        } catch (error) {
            return error
        }
    }


    async function handleSelectDisciplinesGrid(value) {

        try {
            const response = await api.get(`/grid/disciplines/classId/${value}`)
            const { data } = response
            const groupDisciplines = []

            data.forEach((objeto) => {
                const currentModule = objeto?.modulo_grade;
                const grupo = groupDisciplines.find((grupo) => grupo.modulo_grade === currentModule);

                if (grupo) {
                    grupo.disciplinas.push({
                        nome_disciplina: objeto?.nome_disciplina,
                        disciplina_id: objeto?.id_disciplina,
                        modulo_curso: objeto?.id_disciplina,
                        selecionada: objeto?.modulo_grade
                    });

                } else {
                    const newGrupo = {
                        modulo_grade: objeto?.modulo_grade,
                        disciplinas: [
                            {
                                nome_disciplina: objeto?.nome_disciplina,
                                disciplina_id: objeto?.id_disciplina,
                                modulo_curso: objeto?.id_disciplina,
                                selecionada: objeto?.modulo_grade
                            }
                        ]
                    };
                    groupDisciplines.push(newGrupo);
                }
            });

            setDisciplinesEnrollmentRegister(groupDisciplines);
            setEnrollmentUnlockingData({
                ...enrollmentRegisterData,
                disciplinesData: groupDisciplines,
                turma_id: value
            })
        } catch (error) {
            return error
        }
    }




    const handleChangeSubscriptionData = ({ interestId, field, value }) => {

        setUserData({ ...userData, portal_aluno: 1 })
        setArrayInterests((prevClassDays) =>
            prevClassDays?.map((item) => {

                if (item?.id_interesse === interestId) {
                    const updatedItem = { ...item };

                    updatedItem.inscricao[field] = value;
                    return updatedItem;
                } else {
                    return item;
                }
            }))
    }



    const handleGetWriting = async (redacaoId) => {
        setLoading(true)
        try {
            const response = await api.get(`/redacao-online/${redacaoId}`)
            if (response?.status === 200) {
                const { data } = response
                setShowEditWritingGrade({ active: true, writing: data })
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleChangeEssayWriting = (value) => {

        setEssayWritingData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }


    const handleApprovedStatus = async () => {
        if (essayWritingData?.status_processo_sel && essayWritingData?.nt_redacao) {
            setLoading(true)
            try {
                let approved = essayWritingData?.status_processo_sel === 'Classificado' && 1 ||
                    essayWritingData?.status_processo_sel === 'Desclassificado' && 0 || null
                let essayData = {
                    aprovado: approved,
                    status_processo_sel: essayWritingData?.status_processo_sel,
                    nt_redacao: essayWritingData?.nt_redacao,
                    id_redacao: showEditWritingGrade?.writing?.id_redacao,
                    interesse_id: showEditWritingGrade?.writing?.interesse_id
                }
                const response = await api.patch(`/redacao-online/approved/status`, { essayData })

                if (response?.status === 200) {
                    alert.success('Nota lançada.')
                    setEssayWritingData({})
                    setShowEditWritingGrade({ active: false, writing: {} })
                    handleItems()
                } else {
                    alert.error('Ocorreu um erro ao lançar nota. Tente novamente ou entre em contato com o Suporte.')
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        } else {
            alert.info('Preencha o campo de Nota e Status da redação antes de enviar.')
        }
    }


    const handleUpdateResponsible = async () => {
        if (responsiblePayerData?.compl_resp !== '' && responsiblePayerData?.compl_resp.length > 30) {
            return alert.info('O complemento não pode ser superior a 30 caractéres.')
        }
        setLoading(true)
        try {
            const response = await api.patch(`/responsible/update/${responsiblePayerData?.id_resp_pag}`, { responsiblePayerData })
            if (response?.status === 200) {
                alert.success('Dados do responsável atualizados.')
                setShowEditPaymentResponsible(false)
                handleResponsible()
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
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


    const groupPerfil = [
        { label: 'Funcionário', value: 'funcionario' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Interessado', value: 'interessado' },
    ]

    const groupCivil = [
        { label: 'Solteiro', value: 'Solteiro' },
        { label: 'Casado', value: 'Casado' },
        { label: 'Separado', value: 'Separado' },
        { label: 'Divorciado', value: 'Divorciado' },
        { label: 'Viúvo', value: 'Viúvo' },
        { label: 'União estável', value: 'União estável' }
    ]

    const groupEscolaridade = [
        { label: 'Ensino fundamental (incompleto)', value: 'Ensino fundamental (incompleto)' },
        { label: 'Ensino fundamental', value: 'Ensino fundamental' },
        { label: 'Ensino médio', value: 'Ensino médio' },
        { label: 'Superior (Graduação)', value: 'Superior (Graduação)' },
        { label: 'Pós-graduação', value: 'Pós-graduação' },
        { label: 'Mestrado', value: 'Mestrado' },
        { label: 'Doutorado', value: 'Doutorado' },
    ]

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupIngresso = [
        { label: 'Redação Online', value: 'Redação Online' },
        { label: 'Nota do Enem', value: 'Nota do Enem' },
        { label: 'Segunda Graduação', value: 'Segunda Graduação' },
        { label: 'Trânsferência', value: 'Trânsferência' },
        { label: 'Curso de extensão', value: 'Curso de extensão' },
        { label: 'Destrancamento de matrícula', value: 'Destrancamento de matrícula' },
    ]

    const groupPayment = [
        { label: 'Pagamento estendido', value: 'Pagamento estendido' },
        { label: 'PRAVALER', value: 'PRAVALER' },
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
        { label: 'Ex Aluno 5%', value: 'Ex Aluno' },
    ]

    const groupContact = [
        { label: 'WhatsApp', value: 'WhatsApp' },
        { label: 'E-mail', value: 'E-mail' },
        { label: 'Ligação', value: 'Ligação' },
        { label: 'Visita presencial ao Campus (São Paulo)', value: 'Visita presencial ao Campus (São Paulo)' },
    ]

    const groupProfessor = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const groupCertificate = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const groupAdimplente = [
        { label: 'Em dia', value: 1 },
        { label: 'Pendência financeira', value: 0 },
    ]

    const groupAdmin = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const groupEnrollment = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const grouPreferPayment = [
        { label: 'Cartão de crédito', value: 'cartao de credito' },
        { label: 'Boleto', value: 'boleto' },
        { label: 'Boleto (PRAVALER)', value: 'pravaler(boleto)' },
        { label: 'Pix', value: 'pix' },
    ]

    const groupRacaCor = [
        { label: 'Prefiro não declarar', value: 'Prefiro não declarar' },
        { label: 'Branco', value: 'Branco' },
        { label: 'Preto', value: 'Preto' },
        { label: 'Pardo', value: 'Pardo' },
        { label: 'Amarelo', value: 'Amarelo' },
        { label: 'Indígena', value: 'Indígena' },
    ]

    const groupGender = [
        { label: 'Masculino', value: 'Masculino' },
        { label: 'Feminino', value: 'Feminino' },
        { label: 'Outro', value: 'Outro' },
        { label: 'Prefiro não informar', value: 'Prefiro não informar' },
    ]

    const groupDisability = [
        { label: 'Sim', value: 'Sim' },
        { label: 'Não', value: 'Não' },
        { label: 'Não dispõe de informação', value: 'Não dispõe de informação' },
    ]

    const groupNationality = [
        { label: 'Brasileira Nata', value: 'Brasileira Nata' },
        { label: 'Brasileira por Naturalização', value: 'Brasileira por Naturalização' },
        { label: 'Estrangeira', value: 'Estrangeira' },
    ]

    const groupAccount = [
        { label: 'Conta Corrente', value: 'Conta Corrente' },
        { label: 'Conta salário', value: 'Conta salário' },
        { label: 'Conta poupança', value: 'Conta poupança' }
    ]


    const groupBank = [
        { label: 'Itaú', value: 'Itau' },
        { label: 'Bradesco', value: 'Bradesco' }
    ]


    const groupLevelEmployee = [
        { label: 'Junior', value: 'Junior' },
        { label: 'Pleno', value: 'Pleno' },
        { label: 'Sênior', value: 'Sênior' },
        { label: 'Instrutor', value: 'Instrutor' },
        { label: 'Especialista A', value: 'Especialista A' },
        { label: 'Especialista B', value: 'Especialista B' },
        { label: 'Especialista C', value: 'Especialista C' },
        { label: 'Especialista D', value: 'Especialista D' },
        { label: 'Especialista E', value: 'Especialista E' },
        { label: 'Especialista F', value: 'Especialista F' },
        { label: 'Mestre A', value: 'Mestre A' },
        { label: 'Mestre B', value: 'Mestre B' },
        { label: 'Mestre C', value: 'Mestre C' },
        { label: 'Mestre D', value: 'Mestre D' },
        { label: 'Mestre E', value: 'Mestre E' },
        { label: 'Mestre F', value: 'Mestre F' },
        { label: 'Doutor A', value: 'Doutor A' },
        { label: 'Doutor B', value: 'Doutor B' },
        { label: 'Doutor C', value: 'Doutor C' },
        { label: 'Doutor D', value: 'Doutor D' },
        { label: 'Doutor E', value: 'Doutor E' },
        { label: 'Doutor F', value: 'Doutor F' }

    ]

    const groupArea = [
        { label: 'Financeiro', value: 'Financeiro' },
        { label: 'Biblioteca', value: 'Biblioteca' },
        { label: 'TI - Suporte', value: 'TI - Suporte' },
        { label: 'RH', value: 'RH' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Atendimento/Recepção', value: 'Atendimento/Recepção' },
        { label: 'Secretaria', value: 'Secretaria' },
        { label: 'Administrativo', value: 'Administrativo' },
        { label: 'Diretoria', value: 'Diretoria' },
        { label: 'Acadêmica', value: 'Acadêmica' },

    ]

    const groupStatusProcess = [
        { label: 'Classificado', value: 'Classificado' },
        { label: 'Desclassificado', value: 'Desclassificado' },
        { label: 'Pendente', value: 'Pendente' },
    ]

    const grouperiod = [
        { label: 'Manhã', value: 'Manhã' },
        { label: 'Tarde', value: 'Tarde' },
        { label: 'Noite', value: 'Noite' }
    ]

    const groupSituation = [
        { label: 'Aguardando início', value: 'Aguardando início' },
        { label: 'Pendente de assinatura do contrato', value: 'Pendente de assinatura do contrato' },
        { label: 'Em andamento', value: 'Em andamento' },
        { label: 'Concluído', value: 'Concluído' },
        { label: 'Curso Finalizado', value: 'Curso Finalizado' },
        { label: 'Turma cancelada', value: 'Turma cancelada' },
        { label: 'Aprovado', value: 'Aprovado' },
        { label: 'Reprovado', value: 'Reprovado' },
        { label: 'Bloq. Online', value: 'Bloq. Online' },
        { label: 'Matrícula cancelada', value: 'Matrícula cancelada' },
        { label: 'Transferido ', value: 'Transferido ' },
        { label: 'Desistente ', value: 'Desistente ' },
        { label: 'Nenhuma', value: 'Nenhuma' },
        { label: 'Trancamento', value: 'Trancamento' },
    ]

    const groupReasonsDroppingOut = [
        { label: 'Pessoal', value: 'Pessoal' },
        { label: 'Financeiro', value: 'Financeiro' },
        { label: 'Insatisfação', value: 'Insatisfação' },
        { label: 'Turma cancelada', value: 'Turma cancelada' },
        { label: 'Reprovação', value: 'Reprovação' },
        { label: 'Profissional', value: 'Profissional' },
        { label: 'Saúde', value: 'Saúde' },
        { label: 'Dificuldade', value: 'Dificuldade' },
        { label: 'Não quis informar ', value: 'Não quis informar ' },
    ]

    const groupDeficiency = [
        { label: 'Deficiência visual', value: 'Deficiência visual' },
        { label: 'Deficiência intelectual', value: 'Deficiência intelectual' },
        { label: 'Deficiência múltipla ', value: 'Deficiência múltipla ' },
        { label: 'Surdez e deficiência auditiva', value: 'Surdez e deficiência auditiva' },
        { label: 'Deficiência auditiva', value: 'Deficiência auditiva' },
        { label: 'Deficiência fisica e motora', value: 'Deficiência fisica e motora' }
    ]


    const groupOrigemEnsinoMedio = [
        { label: 'Pública', value: 'Pública' },
        { label: 'Privada', value: 'Privada' }
    ]

    const groupAutism = [
        {
            label: 'Transtorno global do desenvolvimento (TGD)',
            value: 'Transtorno global do desenvolvimento (TGD)'
        },
        {
            label: 'Transtorno do espectro autista (TEA)',
            value: 'Transtorno do espectro autista (TEA)'
        },
    ]

    const groupSuperGifted = [
        {
            label: 'Altas habilidades/superdotação',
            value: 'Altas habilidades/superdotação'
        },
    ]

    const userForeigner = [
        {
            label: 'Estrangeiro sem CPF',
            value: true
        },
    ]

    const columnHistoric = [
        { key: 'id_historico', label: 'ID' },
        { key: 'ocorrencia', label: 'Ocorrência' },
        { key: 'dt_ocorrencia', label: 'Data', date: true },
        { key: 'responsavel', label: 'Responsável' }
    ];


    const menuUser = [
        {
            id: '01', icon: '/icons/user_data_icon.png', text: 'Dados do Usuário', queryId: true, screen: 'userData',
            perfil: ['aluno', 'interessado', 'funcionario']
        },
        {
            id: '02', icon: '/icons/documentation_icon.png', text: 'Documentos', screen: 'userFiles',
            perfil: ['aluno', 'interessado', 'funcionario']
        },
        { id: '03', icon: '/icons/matricula_icon.png', text: 'Matrículas', queryId: true, screen: 'enrollments', perfil: ['aluno', 'interessado'] },
        { id: '04', icon: '/icons/cursos_icon_home.png', text: 'Inscrições e Interesses', queryId: true, screen: 'interests', perfil: ['aluno', 'interessado'] },
        { id: '05', icon: '/icons/contract_icon.png', text: 'Contrato do Funcionário', queryId: true, screen: 'contractEmployee', perfil: ['funcionario'] },
        { id: '06', icon: '/icons/holerite.png', text: 'Preferência de Pagamento', queryId: true, screen: 'paymentPerfil', perfil: ['aluno'] },
        { id: '06', icon: '/icons/grade_icon.png', text: 'Destrancamento de Matrícula', queryId: true, screen: 'openEnrollment', perfil: ['aluno'] },
    ]



    const documentsStudent = [
        {
            id: '01',
            icon: '/icons/folder_icon.png', key: 'cpf', text: 'CPF'
        },
        {
            id: '02',
            icon: '/icons/folder_icon.png', key: 'rg', text: 'RG'
        },
        {
            id: '13',
            icon: '/icons/folder_icon.png', key: 'pis', text: 'PIS'
        },
        {
            id: '03',
            icon: '/icons/folder_icon.png', key: 'comprovante_residencia', text: 'Comprovante de Residência'
        },
        {
            id: '04',
            icon: '/icons/folder_icon.png', key: 'nascimento', text: 'Certidão de nascimento'
        },
        {
            id: '12',
            icon: '/icons/folder_icon.png', key: 'titulo', text: 'Título de Eleitor'
        },
        {
            id: '05',
            icon: '/icons/folder_icon.png', key: 'diploma_historico_graduacao', text: 'Diploma e histórico de graduação'
        },
        {
            id: '05',
            icon: '/icons/folder_icon.png', key: 'historico_ensino_medio', text: 'Histórico do ensino médio'
        },
        {
            id: '05',
            icon: '/icons/folder_icon.png', key: 'certificado_ensino_medio', text: 'Certificado do ensino médio'
        },
        {
            id: '07',
            icon: '/icons/folder_icon.png', key: 'boletim_enem', text: 'Boletim do ENEM'
        },
        {
            id: '08',
            icon: '/icons/folder_icon.png', key: 'foto_perfil', text: 'Foto/Selfie (3/4)'
        },
        {
            id: '09',
            icon: '/icons/folder_icon.png', key: 'declaracao_transferencia', text: 'Declaração de transferência'
        },
        {
            id: '10',
            icon: '/icons/folder_icon.png', key: 'solicitacao_vaga', text: 'Solicitação de vaga'
        },
        {
            id: '11',
            icon: '/icons/folder_icon.png', key: 'historico_escolar_graduacao', text: 'Histórico escolar de graduação'
        },
        {
            id: '12',
            icon: '/icons/folder_icon.png', key: 'conteudo_programatico', text: 'Conteúdo programático das disciplinas cursadas'
        },
    ]

    const deleteMatricula = async (usuario_id, turma_id, matricula_id, modulo_id) => {
        try {
            await handleClose()
            setLoading(true)
            const result = await api.post(`/enrollment/delete`, {
                data: {
                    usuario_id: usuario_id,
                    turma_id: turma_id,
                    matricula_id: matricula_id,
                    modulo_id: modulo_id,
                }
            })
            if (result.status !== 201) {
                alert.error('Houve um erro ao apagar matricular.')
                return
            } else {
                alert.success('Matricula apagada com sucesso')
                await handleItems()
            }
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
                perfil={userData?.perfil}
                title={userData.nome_social == null ? userData?.nome : userData.nome_social || `Novo ${userData?.perfil === 'funcionario' && 'Funcionário' || userData?.perfil === 'aluno' && 'Aluno' || userData?.perfil === 'interessado' && 'Interessado' || 'Usuário'}`}
                saveButton={isPermissionEdit}
                saveButtonAction={newUser ? handleCreateUser : handleEditUser}
                deleteButton={!newUser && isPermissionEdit && menuView === 'userData'}
                deleteButtonAction={(event) => setShowConfirmationDialog({
                    active: true,
                    event,
                    acceptAction: handleDeleteUser,
                    title: 'Excluir usuário',
                    message: 'Tem certeza que deseja prosseguir com a exclusão do usuário? Todos os dados vinculados a esse usuário serão excluídos, sem opção de recuperação.',
                })}
            />


            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {menuUser?.map((item, index) => {
                    const isScreen = item?.screen === menuView;
                    const userProfiles = userData?.perfil?.includes(',') ? userData?.perfil?.split(',').map(profile => profile.trim()) : userData?.perfil?.trim();
                    const showMenu = item?.perfil.some(profile => userProfiles?.includes(profile));
                    return (
                        <Box key={index} sx={{
                            display: showMenu ? 'flex' : 'none', padding: '25px',
                            borderRadius: 2,
                            backgroundColor: isScreen ? colorPalette.buttonColor + '33' : colorPalette.secondary,
                            boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            gap: 2,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer',
                                transform: 'scale(1.05, 1.05)'
                            }

                        }} onClick={() => setMenuView(item?.screen)}>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 25, height: 25, aspectRatio: '1/1',
                                backgroundImage: `url('${item?.icon}')`,
                                transition: '.3s',

                            }} />
                            <Text bold style={{ color: isScreen ? colorPalette?.buttonColor : colorPalette?.textColor }}>{item?.text}</Text>
                        </Box>
                    )
                })
                }
            </Box>

            {menuView === 'userData' &&
                <>
                    <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                            <Box>
                                <Text title bold style={{}}>Pré-Cadastro</Text>
                            </Box>

                            <EditFile
                                setFilesUser={setFilesUser}
                                filesUser={filesUser}
                                isPermissionEdit={isPermissionEdit}
                                columnId="id_foto_perfil"
                                open={showEditFile.photoProfile}
                                newUser={newUser}
                                onSet={(set) => {
                                    setShowEditFiles({ ...showEditFile, photoProfile: set })
                                }}
                                setFileCallback={setFileCallback}
                                title='Foto de perfil'
                                text='Para alterar sua foto de perfil, clique ou arraste no local desejado.'
                                textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                fileData={userData?.foto}
                                usuarioId={id}
                                campo='foto_perfil'
                                tipo='foto'
                                bgImage={userData?.foto?.location || fileCallback?.preview}
                                callback={(file) => {
                                    if (file.status === 201 || file.status === 200) {
                                        setFileCallback({
                                            status: file.status,
                                            id_foto_perfil: file.fileId,
                                            filePreview: file.filePreview
                                        })
                                        if (!newUser) { handleItems() }
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{ ...styles.inputSection, whiteSpace: 'nowrap', alignItems: 'start', gap: 4 }}>

                            <Box sx={{
                                justifyContent: 'center', alignItems: 'center',
                                width: 300,
                                gap: 2
                            }}>
                                <Avatar src={userData?.foto?.location || fileCallback?.preview} sx={{
                                    height: 'auto',
                                    borderRadius: '16px',
                                    width: { xs: '100%', sm: 150, md: 200, lg: 300 },
                                    aspectRatio: '1/1',
                                }} variant="square" onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })} />
                                <Box sx={{
                                    display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', backgroundColor: colorPalette.inputColor,
                                    borderRadius: '12px',
                                    padding: '12px 0px 12px 12px',
                                    marginTop: 2, border: '1px solid lightgray',
                                    position: 'relative',
                                    '&:hover': { opacity: 0.8, cursor: 'pointer' },
                                }} onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })}>
                                    <Text bold small>Selecionar Foto...</Text>
                                    <Box sx={{
                                        display: 'flex', padding: '10px', zIndex: 99, backgroundColor: colorPalette.buttonColor, borderRadius: '0px 11px 11px 0px', border: `1px solid ${colorPalette.buttonColor}`,
                                        position: 'absolute', right: 0, top: 0, bottom: 0
                                    }}>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(/icons/upload.png)`,
                                            transition: '.3s',
                                        }} />
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ ...styles.inputSection, flexDirection: 'column', }}>
                                {userData?.perfil?.includes('aluno') &&
                                    <Box sx={{ ...styles.inputSection }}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='RA' name='ra' onChange={handleChange} value={userData?.cd_cliente || ''} label='CD_CLIENTE *' sx={{ flex: 1, }} />
                                        <TextInput disabled={true} placeholder='RA' name='ra' onChange={handleChange} value={id} label='RA *' sx={{ flex: 1, }} />
                                    </Box>
                                }
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome Completo' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome Completo *' onBlur={autoEmailMelies} sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome Social' name='nome_social' onChange={isPermissionEdit && handleChange} value={userData?.nome_social || ''} label='Nome Social' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail *' sx={{ flex: 1, }} />
                                    <PhoneInputField
                                        disabled={!isPermissionEdit && true}
                                        label='Telefone *'
                                        name='telefone'
                                        onChange={(phone) => setUserData({ ...userData, telefone: phone })}
                                        value={userData?.telefone}
                                        sx={{ flex: 1, }}
                                    />
                                </Box>
                                <Box sx={{ ...styles.inputSection }}>

                                    {!foreigner &&
                                        <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, cpf: value })}
                                            existsFiles={filesUser?.filter((file) => file.campo === 'cpf').length > 0}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.cpf || ''} label='CPF' sx={{ flex: 1, }} />
                                        </FileInput>
                                    }
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.cpf}
                                        newUser={newUser}
                                        onSet={(set) => {
                                            setShowEditFiles({ ...showEditFile, cpf: set })
                                        }}
                                        title='CPF - Frente e verso'
                                        text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'cpf')}
                                        usuarioId={id}
                                        campo='cpf'
                                        tipo='documento usuario'
                                        callback={(file) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { handleItems() }
                                                else {
                                                    handleChangeFilesUser('cpf', file.fileId, file.filePreview)
                                                }
                                            }
                                        }}
                                    />
                                    <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, cert_nascimento: value })} existsFiles={filesUser?.filter((file) => file.campo === 'nascimento').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Nascimento' name='nascimento' onChange={handleChange} type="date" value={(userData?.nascimento)?.split('T')[0] || ''} label='Nascimento *' sx={{ flex: 1, }} />
                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.cert_nascimento}
                                            newUser={newUser}
                                            onSet={(set) => {
                                                setShowEditFiles({ ...showEditFile, cert_nascimento: set })
                                            }}
                                            title='Certidão de Nascimento ou de Certidão de Casamento'
                                            text='Faça o upload da sua certidão frente e verso, depois clique em salvar.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'nascimento')}
                                            usuarioId={id}
                                            campo='nascimento'
                                            tipo='documento usuario'
                                            callback={(file) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { handleItems() }
                                                    else {
                                                        handleChangeFilesUser('nascimento', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />
                                    </FileInput>
                                </Box>

                                <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25 }}>
                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                        valueChecked={userData?.perfil ? userData?.perfil : null}
                                        boxGroup={groupPerfil}
                                        title="Perfil *"
                                        horizontal={mobile ? false : true}
                                        onSelect={(value) => setUserData({
                                            ...userData,
                                            perfil: value,
                                            admin_melies: !value.includes('funcionario') ? 0 : 1,
                                            // portal_aluno: !value.includes('aluno') ? 0 : 1,
                                        })}
                                        sx={{ flex: 1, }}
                                    />

                                </Box>
                                <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25, padding: '0px 0px 20px 15px' }}>

                                    {/* {(userData?.perfil?.includes('interessado') || userData?.perfil?.includes('aluno') || arrayInterests?.length > 0) &&
                                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                            <Text bold small>Lista de interesses:</Text>
                                            <Button small text='interesses' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                                        </Box>} */}
                                    {!newUser &&
                                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                            <Text bold small>Observações do {userData?.perfil}:</Text>
                                            <Button small text='observação' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, historic: true })} />
                                        </Box>
                                    }

                                </Box>
                                <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.ativo} group={groupStatus} title="Status *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({
                                    ...userData,
                                    ativo: parseInt(value),
                                    admin_melies: value < 1 ? parseInt(value) : userData?.admin_melies,
                                    portal_aluno: value < 1 ? parseInt(value) : userData?.admin_melies
                                })} />
                            </Box>
                        </Box>
                    </ContentContainer>

                    <ContentContainer style={{ ...styles.containerRegister, padding: showSections?.accessData ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, padding: showSections?.accessData ? '0px 0px 20px 0px' : '0px', "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowSections({ ...showSections, accessData: !showSections?.accessData })}>
                            <Text title bold >Dados de acesso</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showSections?.accessData ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                            }} />
                        </Box>
                        {showSections?.accessData &&
                            <>
                                <Box sx={{ ...styles.inputSection, whiteSpace: 'nowrap', alignItems: { xs: 'start', md: 'start', lg: 'end', xl: 'end' }, gap: 4 }}>
                                    <Box sx={{ ...styles.inputSection, flexDirection: 'column', }}>
                                        <Box sx={{ padding: '10px 0px 10px 10px' }}>
                                            <Text small light>Último acesso em: {formatTimeStamp(userData?.ultimo_acesso, true)}</Text>
                                        </Box>
                                        <Box sx={{ ...styles.inputSection }}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Login' name='login' onChange={handleChange} value={userData?.login || ''} label='Login *' sx={{ flex: 1, }} />
                                        </Box>
                                    </Box>
                                </Box>
                                {!newUser && <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 1.8 }}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nova senha' name='nova_senha' onChange={handleChange} value={userData?.nova_senha || ''} type="password" label='Nova senha' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Confirmar senha' name='confirmar_senha' onChange={handleChange} value={userData?.confirmar_senha || ''} type="password" label='Confirmar senha' sx={{ flex: 1, }} />
                                </Box>}
                                {userData?.perfil.includes('funcionario') && <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.admin_melies} group={groupAdmin} title="Acesso ao AdminMéliès *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, admin_melies: parseInt(value) })} />}
                                {(userData?.perfil.includes('aluno') || userData?.perfil.includes('interessado')) && <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.portal_aluno} group={groupAdmin} title="Acesso ao Portal do aluno *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, portal_aluno: parseInt(value) })} />}

                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'start', marginTop: 2, flexDirection: 'column', padding: '0px 0px 20px 12px' }}>
                                    <Button small text='permissões' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, permissions: true })} />
                                </Box>

                                <Backdrop open={showSections.permissions} sx={{ zIndex: 99999, }}>

                                    <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '0px' }, overflowY: matches && 'auto', marginLeft: { md: '180px', lg: '280px' } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                                            <Text bold large>Permissões</Text>
                                            <Box sx={{
                                                ...styles.menuIcon,
                                                backgroundImage: `url(${icons.gray_close})`,
                                                transition: '.3s',
                                                zIndex: 999999999,
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => setShowSections({ ...showSections, permissions: false })} />
                                        </Box>
                                        <Divider padding={0} />
                                        <ContentContainer style={{ boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                                <Text bold>Grupo de permissões</Text>
                                                <CheckBoxComponent disabled={!isPermissionEdit && true}
                                                    boxGroup={groupPermissions}
                                                    valueChecked={permissionPerfil || ''}
                                                    horizontal={false}
                                                    onSelect={(value) => {
                                                        setPermissionPerfil(value)
                                                    }}
                                                    sx={{ width: 1 }}
                                                />
                                            </Box>
                                        </ContentContainer>
                                        <Divider padding={0} />
                                        <Box style={{ display: 'flex' }}>
                                            <Button disabled={!isPermissionEdit && true} small
                                                style={{ width: '50%', marginRight: 1, height: 30 }}
                                                text='Salvar'
                                                onClick={() => {
                                                    !newUser ? handleAddPermission() :
                                                        alert.info('Permissões atualizadas')
                                                    setShowSections({ ...showSections, permissions: false })
                                                }}
                                            />
                                            <Button disabled={!isPermissionEdit && true} secondary small
                                                style={{ width: '50%', height: 30 }}
                                                text='Cancelar'
                                                onClick={() => setShowSections({ ...showSections, permissions: false })}
                                            />
                                        </Box>
                                    </ContentContainer>
                                </Backdrop>

                            </>}
                    </ContentContainer>

                    <ContentContainer style={{ ...styles.containerRegister, padding: showSections.registration ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', gap: 1, padding: showSections.registration ? '0px 0px 20px 0px' : '0px', "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowSections({ ...showSections, registration: !showSections.registration })}>
                            <Text title bold >Cadastro Completo</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showSections.registration ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                            }} />
                        </Box>
                        {showSections.registration &&
                            <>
                                <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.professor}
                                    group={groupProfessor}
                                    title="Professor *"
                                    horizontal={mobile ? false : true}
                                    onSelect={(value) => setUserData({ ...userData, professor: parseInt(value) })} />

                                {userData?.professor === 1 &&
                                    <ContentContainer style={{ maxWidth: '580px', margin: '10px 0px 10px 0px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Text bold style={{ padding: '0px 0px 0px 10px' }}>Selecionar disciplina</Text>
                                        {arrayDisciplinesProfessor.length > 0 &&
                                            arrayDisciplinesProfessor?.map((disciplina, index) => (
                                                <>

                                                    <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                                        <SelectList disabled={!isPermissionEdit && true}
                                                            clean={false}
                                                            fullWidth={true}
                                                            data={disciplines}
                                                            valueSelection={disciplina?.disciplina_id}
                                                            title="Disciplina"
                                                            filterOpition="value"
                                                            sx={{ color: colorPalette.textColor, flex: 1 }}
                                                            inputStyle={{
                                                                color: colorPalette.textColor,
                                                                fontSize: "15px",
                                                                fontFamily: "MetropolisBold",
                                                            }}
                                                        />

                                                        <Box sx={{
                                                            backgroundSize: 'cover',
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'center',
                                                            width: 25,
                                                            height: 25,
                                                            backgroundImage: `url(/icons/remove_icon.png)`,
                                                            transition: '.3s',
                                                            "&:hover": {
                                                                opacity: 0.8,
                                                                cursor: 'pointer'
                                                            }
                                                        }} onClick={() => {
                                                            newUser ? deleteDisciplineProfessor(index) : handleDeleteDisciplineProfessor(disciplina?.id_disciplina_prof)
                                                        }} />
                                                    </Box>
                                                </>
                                            ))}
                                        <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <SelectList disabled={!isPermissionEdit && true}

                                                fullWidth={true}
                                                data={disciplines}
                                                valueSelection={disciplinesProfessor?.disciplina_id}
                                                title="Disciplina"
                                                filterOpition="value"
                                                sx={{ color: colorPalette.textColor, flex: 1 }}
                                                inputStyle={{
                                                    color: colorPalette.textColor,
                                                    fontSize: "15px",
                                                    fontFamily: "MetropolisBold",
                                                }}
                                                onSelect={(value) => setDisciplinesProfessor({ ...disciplinesProfessor, disciplina_id: value })}
                                            />
                                            <Box sx={{
                                                backgroundSize: 'cover',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                width: 25,
                                                height: 25,
                                                borderRadius: '50%',
                                                backgroundImage: `url(/icons/include_icon.png)`,
                                                transition: '.3s',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => {
                                                if (disciplinesProfessor?.disciplina_id) {
                                                    newUser ? addDisciplineProfessor() : handleAddDisciplineProfessor()
                                                }
                                            }} />
                                        </Box>
                                    </ContentContainer>
                                }

                                <Box sx={{ padding: '0px 0px 20px 0px' }}>
                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                        boxGroup={groupData.groupForeigner}
                                        valueChecked={userData?.foreigner || ''}
                                        horizontal={mobile ? false : true}
                                        onSelect={(value) => {
                                            setForeigner(value)
                                            setUserData({ ...userData, nacionalidade: value === true ? 'Estrangeira' : 'Brasileira Nata' })
                                        }}
                                        sx={{ width: 1 }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    {!foreigner &&
                                        <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, cpf: value })}
                                            existsFiles={filesUser?.filter((file) => file.campo === 'cpf').length > 0}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.cpf || ''} label='CPF' sx={{ flex: 1, }} />
                                        </FileInput>
                                    }
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.cpf}
                                        newUser={newUser}
                                        onSet={(set) => {
                                            setShowEditFiles({ ...showEditFile, cpf: set })
                                        }}
                                        title='CPF - Frente e verso'
                                        text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'cpf')}
                                        usuarioId={id}
                                        campo='cpf'
                                        tipo='documento usuario'
                                        callback={(file) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { handleItems() }
                                                else {
                                                    handleChangeFilesUser('cpf', file.fileId, file.filePreview)
                                                }
                                            }
                                        }}
                                    />
                                    {foreigner &&
                                        <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, foreigner: value })}
                                            existsFiles={filesUser?.filter((file) => file.campo === 'estrangeiro').length > 0}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Doc estrangeiro' name='doc_estrangeiro' onChange={handleChange} value={userData?.doc_estrangeiro || ''} label='Doc estrangeiro' sx={{ flex: 1, }} />
                                            <EditFile
                                                setFilesUser={setFilesUser}
                                                filesUser={filesUser}
                                                isPermissionEdit={isPermissionEdit}
                                                columnId="id_doc_usuario"
                                                open={showEditFile.foreigner}
                                                newUser={newUser}
                                                onSet={(set) => {
                                                    setShowEditFiles({ ...showEditFile, foreigner: set })
                                                }}
                                                title='Documento estrangeiro - Frente e verso'
                                                text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                                textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                                fileData={filesUser?.filter((file) => file.campo === 'estrangeiro')}
                                                usuarioId={id}
                                                campo='estrangeiro'
                                                tipo='documento usuario'
                                                callback={(file) => {
                                                    if (file.status === 201 || file.status === 200) {
                                                        if (!newUser) { handleItems() }
                                                        else {
                                                            handleChangeFilesUser('estrangeiro', file.fileId, file.filePreview)
                                                        }
                                                    }
                                                }}
                                            />
                                        </FileInput>
                                    }
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Cidade' name='naturalidade' onChange={handleChange} value={userData?.naturalidade || ''} label='Naturalidade *' sx={{ flex: 1, }} />

                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={countries} valueSelection={userData?.pais_origem || ''} onSelect={(value) => setUserData({ ...userData, pais_origem: value })}
                                        title="Pais de origem *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupNationality} valueSelection={userData?.nacionalidade || ''} onSelect={(value) => setUserData({ ...userData, nacionalidade: value })}
                                        title="Nacionalidade *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>

                                <Box sx={styles.inputSection}>
                                    <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, rg: value })}
                                        existsFiles={filesUser?.filter((file) => file.campo === 'rg').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='RG' name='rg' onChange={handleChange} value={userData?.rg || ''} label='RG *' sx={{ flex: 1, }} />
                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.rg}
                                            newUser={newUser}
                                            onSet={(set) => {
                                                setShowEditFiles({ ...showEditFile, rg: set })
                                            }}
                                            title='RG - Frente e verso'
                                            text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'rg')}
                                            usuarioId={id}
                                            campo='rg'
                                            tipo='documento usuario'
                                            callback={(file) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { handleItems() }
                                                    else {
                                                        handleChangeFilesUser('rg', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />
                                    </FileInput>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='UF' name='uf_rg' onChange={handleChange} value={userData?.uf_rg || ''} label='UF RG *' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Expedição' name='expedicao' onChange={handleChange} type="date" value={(userData?.expedicao)?.split('T')[0] || ''} label='Expedição *' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Orgão' name='orgao' onChange={handleChange} value={userData?.orgao || ''} label='Orgão *' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, titleDoc: value })}
                                        existsFiles={filesUser?.filter((file) => file.campo === 'titulo').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Título de Eleitor' name='titulo' onChange={handleChange} value={userData?.titulo || ''} label='Título de Eleitor' sx={{ flex: 1, }} />
                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.titleDoc}
                                            newUser={newUser}
                                            onSet={(set) => {
                                                setShowEditFiles({ ...showEditFile, titleDoc: set })
                                            }}
                                            title='Título de Eleitor'
                                            text='Faça o upload do seu título, depois clique em salvar.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'titulo')}
                                            usuarioId={id}
                                            campo='titulo'
                                            tipo='documento usuario'
                                            callback={(file) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { handleItems() }
                                                    else {
                                                        handleChangeFilesUser('titulo', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />

                                    </FileInput>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Zona' name='zona' onChange={handleChange} value={userData?.zona || ''} label='Zona' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Seção' name='secao' onChange={handleChange} value={userData?.secao || ''} label='Seção' sx={{ flex: 1, }} />
                                </Box>

                                <Box sx={styles.inputSection}>

                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupRacaCor} valueSelection={userData.cor_raca} onSelect={(value) => setUserData({ ...userData, cor_raca: value })}
                                        title="Cor/raça *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />

                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupGender} valueSelection={userData?.genero} onSelect={(value) => setUserData({ ...userData, genero: value })}
                                        title="Gênero *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />

                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupDisability} valueSelection={userData?.deficiencia} onSelect={(value) => setUserData({ ...userData, deficiencia: value })}
                                        title="Deficiência Física/Necessidade especial educacional*" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />

                                </Box>

                                {userData?.deficiencia?.includes('Sim') &&
                                    <>
                                        <CheckBoxComponent disabled={!isPermissionEdit && true}
                                            valueChecked={userData?.tipo_deficiencia || ''}
                                            boxGroup={groupDeficiency}
                                            title="Tipo de deficiência"
                                            horizontal={mobile ? false : true}
                                            onSelect={(value) => setUserData({
                                                ...userData,
                                                tipo_deficiencia: value
                                            })}
                                            sx={{ width: 1 }}
                                        />

                                        <CheckBoxComponent disabled={!isPermissionEdit && true}
                                            valueChecked={userData?.autista || ''}
                                            boxGroup={groupAutism}
                                            title="Transtorno global do desenvolvimento/Transtorno do espectro autista"
                                            horizontal={mobile ? false : true}
                                            onSelect={(value) => setUserData({
                                                ...userData,
                                                autista: value
                                            })}
                                            sx={{ width: 1 }}
                                        />

                                        <CheckBoxComponent disabled={!isPermissionEdit && true}
                                            valueChecked={userData?.superdotado || ''}
                                            boxGroup={groupSuperGifted}
                                            title="Altas habilidades/superdotação"
                                            horizontal={mobile ? false : true}
                                            onSelect={(value) => setUserData({
                                                ...userData,
                                                superdotado: value
                                            })}
                                            sx={{ width: 1 }}
                                        />
                                    </>
                                }

                                <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.estado_civil} group={groupCivil} title="Estado Cívil *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, estado_civil: value })} />
                                <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                    <TextInput fullWidth disabled={!isPermissionEdit && true} placeholder='E-mail Méliès' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail Méliès' />
                                    <TextInput fullWidth disabled={!isPermissionEdit && true} placeholder='E-mail Pessoal' name='email_pessoal' onChange={handleChange} value={userData?.email_pessoal || ''} label='E-mail Pessoal' />
                                </Box>
                                <Box sx={{ maxWidth: '580px', margin: '10px 0px 10px 0px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Text bold style={{ padding: '0px 0px 0px 10px' }}>Dependentes</Text>
                                    {arrayDependent.map((dep, index) => (
                                        <>

                                            <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                                <FileInput left onClick={() => setShowEditFiles({ ...showEditFile, cpf_dependente: true })}
                                                    existsFiles={filesUser?.filter((file) => file.campo === 'cpf_dependente').length > 0}>
                                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name={`nome_dependente-${index}`} onChange={(e) => handleChangeDependentArray(e, 'nome_dependente', dep?.id_dependente)} value={dep.nome_dependente} sx={{ flex: 1 }} />
                                                    <TextInput disabled={!isPermissionEdit && true} placeholder='CPF' name={`cpf_dependente-${index}`} onChange={(e) => handleChangeDependentArray(e, 'cpf_dependente', dep?.id_dependente)} value={dep.cpf_dependente} sx={{ flex: 1 }} />
                                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data de Nascimento' name={`dt_nasc_dependente-${index}`} onChange={(e) => handleChangeDependentArray(e, 'dt_nasc_dependente', dep?.id_dependente)} type="date" value={(dep.dt_nasc_dependente)?.split('T')[0] || ''} sx={{ flex: 1 }} />
                                                </FileInput>
                                                <EditFile
                                                    setFilesUser={setFilesUser}
                                                    filesUser={filesUser}
                                                    isPermissionEdit={isPermissionEdit}
                                                    columnId="id_doc_usuario"
                                                    open={showEditFile.cpf_dependente}
                                                    newUser={newUser}
                                                    onSet={(set) => {
                                                        setShowEditFiles({ ...showEditFile, cpf_dependente: set })
                                                    }}
                                                    title='CPF Dependente - Frente e verso'
                                                    text='Faça o upload do documento do Dependente frente e verso, depois clique em salvar.'
                                                    textDropzone='Arraste ou clique para selecionar a Foto ou Arquivo que deseja'
                                                    fileData={filesUser?.filter((file) => file.campo === 'cpf_dependente')}
                                                    usuarioId={id}
                                                    campo='cpf_dependente'
                                                    tipo='documento usuario'
                                                    callback={(file) => {
                                                        if (file.status === 201 || file.status === 200) {
                                                            if (!newUser) { handleItems() }
                                                            else {
                                                                handleChangeFilesUser('cpf_dependente', file.fileId, file.filePreview)
                                                            }
                                                        }
                                                    }}
                                                />

                                                {isPermissionEdit && <Box sx={{
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'center',
                                                    width: 25,
                                                    height: 25,
                                                    backgroundImage: `url(/icons/remove_icon.png)`,
                                                    transition: '.3s',
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    }
                                                }} onClick={() => {
                                                    newUser ? deleteDependent(index) : handleDeleteDependent(dep?.id_dependente)
                                                }} />}

                                            </Box>
                                        </>
                                    ))}
                                    {isPermissionEdit &&
                                        <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name={`nome_dependente`} onChange={handleChangeDependent} value={dependent?.nome_dependente} sx={{ flex: 1 }} />
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='CPF' name={`cpf_dependente`} onChange={handleChangeDependent} value={dependent?.cpf_dependente} sx={{ flex: 1 }} />
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Data de Nascimento' name={`dt_nasc_dependente`} onChange={handleChangeDependent} type="date" value={(dependent?.dt_nasc_dependente)?.split('T')[0] || ''} sx={{ flex: 1 }} />
                                            <Box sx={{
                                                backgroundSize: 'cover',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center',
                                                width: 25,
                                                height: 25,
                                                borderRadius: '50%',
                                                backgroundImage: `url(/icons/include_icon.png)`,
                                                transition: '.3s',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => {
                                                newUser ? addDependent() : handleAddDependent()
                                            }} />
                                        </Box>}
                                </Box>

                                <Box sx={styles.inputSection}>
                                    {userData?.estado_civil === 'Casado' && <TextInput disabled={!isPermissionEdit && true} placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.conjuge || ''} label='Conjuge' sx={{ flex: 1, }} />}
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.nome_pai || ''} label='Nome do Pai' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.nome_mae || ''} label='Nome da Mãe *' sx={{ flex: 1, }} />

                                </Box>
                                <ContentContainer>
                                    <Text large bold >Contato de Emergência</Text>
                                    <Box sx={styles.inputSection}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name='nome_emergencia' onChange={handleChange} value={userData?.nome_emergencia || ''} label='Nome' sx={{ flex: 1, }} />
                                        <PhoneInputField
                                            disabled={!isPermissionEdit && true}
                                            label='Telefone de emergência'
                                            placeholder='(11) 91234-6789'
                                            name='telefone_emergencia'
                                            onChange={(phone) => setUserData({ ...userData, telefone_emergencia: phone })}
                                            value={userData?.telefone_emergencia}
                                            sx={{ flex: 1, }}
                                        />
                                    </Box>
                                </ContentContainer>
                                <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, schoolRecord: value })}
                                    existsFiles={filesUser?.filter((file) => file.campo === 'historico/diploma').length > 0}>
                                    <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.escolaridade} group={groupEscolaridade} title="Escolaridade *" horizontal={mobile ? false : true} onSelect={(value) => {
                                        if (value !== 'Ensino médio') {
                                            setUserData({ ...userData, escolaridade: value, tipo_origem_ensi_med: '' })
                                        } else {
                                            setUserData({ ...userData, escolaridade: value })
                                        }
                                    }
                                    } />
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.schoolRecord}
                                        newUser={newUser}
                                        onSet={(set) => {
                                            setShowEditFiles({ ...showEditFile, schoolRecord: set })
                                        }}
                                        title='Historico Escolar/Diploma/Certificado de conclusão'
                                        text='Por favor, faça o upload do seu certificado, diploma ou histórico escolar. Caso você tenha mais de um diploma ou certificado de conclusão,
                                 faça também o upload do mesmo.'
                                        textDropzone='Arraste ou clique para selecionar a Foto ou arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'historico/diploma')}
                                        usuarioId={id}
                                        campo='historico/diploma'
                                        tipo='documento usuario'
                                        callback={(file) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { handleItems() }
                                                else {
                                                    handleChangeFilesUser('historico/diploma', file.fileId, file.filePreview)
                                                }
                                            }
                                        }}
                                    />
                                </FileInput>
                                {userData?.escolaridade === 'Ensino médio' && <RadioItem disabled={!isPermissionEdit && true}
                                    valueRadio={userData?.tipo_origem_ensi_med}
                                    group={groupOrigemEnsinoMedio}
                                    title="Origem Ensino Médio *"
                                    horizontal={mobile ? false : true}
                                    onSelect={(value) => setUserData({ ...userData, tipo_origem_ensi_med: value })}
                                />}

                                <Box sx={styles.inputSection}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='CEP' name='cep' onChange={handleChange} value={userData?.cep || ''} label='CEP *' onBlur={handleBlurCEP} sx={{ flex: 1, }} />
                                    <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, address: value })}
                                        existsFiles={filesUser?.filter((file) => file.campo === 'comprovante_residencia').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Endereço' name='rua' onChange={handleChange} value={userData?.rua || ''} label='Endereço *' sx={{ flex: 1, }} />
                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.address}
                                            newUser={newUser}
                                            onSet={(set) => {
                                                setShowEditFiles({ ...showEditFile, address: set })
                                            }}
                                            title='Comprovante de residencia'
                                            text='Faça o upload do seu comprovante de residencia, precisa ser uma conta em seu nome ou comprovar que mora com o titular da conta.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'comprovante_residencia')}
                                            usuarioId={id}
                                            campo='comprovante_residencia'
                                            tipo='documento usuario'
                                            callback={(file) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { handleItems() }
                                                    else {
                                                        handleChangeFilesUser('comprovante_residencia', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />
                                    </FileInput>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nº' name='numero' onChange={handleChange} value={userData?.numero || ''} label='Nº *' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Cidade' name='cidade' onChange={handleChange} value={userData?.cidade || ''} label='Cidade *' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='UF' name='uf' onChange={handleChange} value={userData?.uf || ''} label='UF *' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Bairro' name='bairro' onChange={handleChange} value={userData?.bairro || ''} label='Bairro *' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Complemento' name='complemento' onChange={handleChange} value={userData?.complemento || ''} label='Complemento' sx={{ flex: 1, }} />
                                </Box>
                            </>
                        }
                    </ContentContainer>
                </>
            }

            {/* contrato */}
            {(userData.perfil && userData.perfil.includes('funcionario') && menuView === 'contractEmployee') &&
                <>
                    <ContentContainer style={{ ...styles.containerContract, padding: showContract ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', padding: showContract ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowContract(!showContract)}>
                            <Text title bold >Contrato</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showContract ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} />
                        </Box>
                        {showContract &&
                            <>
                                <Box sx={styles.inputSection}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Função' name='funcao' onChange={handleChangeContract} value={contract?.funcao || ''} label='Função' sx={{ flex: 1, }} />

                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupLevelEmployee} valueSelection={contract?.nivel_cargo} onSelect={(value) => setContract({ ...contract, nivel_cargo: value })}
                                        title="Nível do cargo:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupArea} valueSelection={contract?.area} onSelect={(value) => {
                                        setContract({ ...contract, area: value })
                                        listUserByArea(value)
                                    }}
                                        title="Área de atuação:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true} fullWidth data={usersForCoordinator} valueSelection={contract?.superior} onSelect={(value) => setContract({ ...contract, superior: value })}
                                        title="Superior Responsável:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Cartão de Ponto' name='cartao_ponto' onChange={handleChangeContract} value={contract?.cartao_ponto || ''} label='Cartão de Ponto' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Admissão' name='admissao' type="date" onChange={handleChangeContract} value={(contract?.admissao)?.split('T')[0] || ''} label='Admissão' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Desligamento' name='desligamento' type="date" onChange={handleChangeContract} value={contract?.desligamento?.split('T')[0] || ''} label='Desligamento' sx={{ flex: 1, }} onBlur={() => {
                                        new Date(contract?.desligamento) > new Date(1001, 0, 1) &&
                                            setUserData({ ...userData, ativo: 0, admin_melies: contract?.desligamento ? 0 : userData?.admin_melies })
                                    }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, ctps: value })}
                                        existsFiles={filesUser?.filter((file) => file.campo === 'ctps').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='CTPS' name='ctps' onChange={handleChangeContract} value={contract?.ctps || ''} label='CTPS' sx={{ flex: 1, }} />

                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.ctps}
                                            newUser={newUser}
                                            onSet={(set) => {
                                                setShowEditFiles({ ...showEditFile, ctps: set })
                                            }}
                                            title='Carteira de Trabalho'
                                            text='Faça o upload da dua carteira de trabalho, depois clique em salvar.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'ctps')}
                                            usuarioId={id}
                                            campo='ctps'
                                            tipo='documento usuario'
                                            callback={(file) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { handleItems() }
                                                    else {
                                                        handleChangeFilesUser('ctps', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />

                                    </FileInput>

                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Série' name='serie' onChange={handleChangeContract} value={contract?.serie || ''} label='Série' sx={{ flex: 1, }} />
                                    <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, pis: value })}
                                        existsFiles={filesUser?.filter((file) => file.campo === 'pis').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='PIS' name='pis' onChange={handleChangeContract} value={contract?.pis || ''} label='PIS' sx={{ flex: 1, }} />

                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.pis}
                                            newUser={newUser}
                                            onSet={(set) => {
                                                setShowEditFiles({ ...showEditFile, pis: set })
                                            }}
                                            title='Pis'
                                            text='Faça o upload do seu PIS, depois clique em salvar.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'pis')}
                                            usuarioId={id}
                                            campo='pis'
                                            tipo='documento usuario'
                                            callback={(file) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { handleItems() }
                                                    else {
                                                        handleChangeFilesUser('pis', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />
                                    </FileInput>
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupBank} valueSelection={contract?.banco_1} onSelect={(value) => setContract({ ...contract, banco_1: value })}
                                        title="Banco" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Agência' name='agencia_1' onChange={handleChangeContract} value={contract?.agencia_1 || ''} label='Agência' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Conta' name='conta_1' onChange={handleChangeContract} value={contract?.conta_1 || ''} label='Conta' sx={{ flex: 1, }} />
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupAccount} valueSelection={contract?.tipo_conta_1} onSelect={(value) => setContract({ ...contract, tipo_conta_1: value })}
                                        title="Tipo de conta" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Banco 2' name='banco_2' onChange={handleChangeContract} value={contract?.banco_2 || ''} label='Banco 2' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Agência 2' name='agencia_2' onChange={handleChangeContract} value={contract?.agencia_2 || ''} label='Agência 2' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Conta 2' name='conta_2' onChange={handleChangeContract} value={contract?.conta_2 || ''} label='Conta 2' sx={{ flex: 1, }} />
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupAccount} valueSelection={contract?.tipo_conta_2} onSelect={(value) => setContract({ ...contract, tipo_conta_2: value })}
                                        title="Tipo de conta 2" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>

                                <ContentContainer style={{ boxShadow: 'none' }}>
                                    <Box sx={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                            <Text bold title>Horário de trabalho</Text>
                                            {officeHours && <Box sx={{ display: 'flex' }}>
                                                <Button disabled={!isPermissionEdit && true} small text='replicar' style={{ padding: '5px 16px 5px 16px' }} onClick={replicateToDaysWork} />
                                            </Box>}
                                        </Box>
                                        <TableOfficeHours data={officeHours} onChange={handleOfficeHours} />
                                    </Box>
                                </ContentContainer>

                            </>
                        }
                    </ContentContainer>

                </>}

            {(userData.perfil && userData.perfil.includes('aluno') && menuView === 'enrollments') &&
                <>
                    <ContentContainer style={{ ...styles.containerContract, padding: showEnrollmentAdd ? '40px' : '25px', border: `1px solid ${colorPalette.buttonColor}` }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', padding: showEnrollmentAdd ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowEnrollmentAdd(!showEnrollmentAdd)}>
                            <Text title bold >Cadastrar Matrícula do Aluno (Manualmente)</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showEnrollmentAdd ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} />
                        </Box>
                        {showEnrollmentAdd &&
                            <>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Text bold large style={{ color: colorPalette?.buttonColor }}>Matrículas Incluídas:</Text>
                                    {arrayEnrollmentRegisterData?.length > 0 && arrayEnrollmentRegisterData?.map((item, index) => {
                                        const initDate = formatTimeStamp(item?.dt_inicio)
                                        const endDate = formatTimeStamp(item?.dt_final)
                                        const className = classes?.filter(v => v.value === item?.turma_id)?.map(i => i.label)
                                        const title = `${className}_${item?.modulo}º Módulo - ${initDate} á ${endDate} - ${item?.status}`
                                        return (
                                            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'start', flexDirection: 'column', backgroundColor: colorPalette?.primary, borderRadius: 2, padding: '15px 20px' }}>

                                                <Box sx={{
                                                    display: 'flex', alignItems: 'center', padding: showEnrollmentsRegisters[index] ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    },
                                                    justifyContent: 'space-between'
                                                }} onClick={() => toggleEnrollmentRegisters(index)}>
                                                    <Text bold title>{title}</Text>
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        backgroundImage: `url(${icons.gray_arrow_down})`,
                                                        transform: showEnrollmentsRegisters[index] ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                        transition: '.3s',
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} />
                                                </Box>
                                                <Box sx={{
                                                    display: showEnrollmentsRegisters[index] ? 'flex' : 'none', flexDirection: 'column', gap: 2, alignItems: 'start', backgroundColor: colorPalette?.primary, borderRadius: 2, padding: '15px 20px',
                                                    width: '100%'
                                                }}>
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Turma:</Text>
                                                        <Text>{className}</Text>
                                                    </Box>

                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Módulo/Semestre:</Text>
                                                        <Text>{item?.modulo}</Text>
                                                    </Box>
                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Qnt de Disciplina com DP:</Text>
                                                        <Text>{item?.qnt_disci_dp}</Text>
                                                    </Box>
                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Qnt de Disciplina Dispensada:</Text>
                                                        <Text>{item?.qnt_disci_disp}</Text>
                                                    </Box>
                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Cursando Rematrícula:</Text>
                                                        <Text>{groupEnrollment?.filter(v => v.value === item?.rematricula)?.map(i => i.label)}</Text>
                                                    </Box>
                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Cursando alguma DP:</Text>
                                                        <Text>{groupEnrollment?.filter(v => v.value === item?.cursando_dp)?.map(i => i.label)}</Text>
                                                    </Box>


                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Inicio:</Text>
                                                        <Text>{initDate}</Text>
                                                    </Box>

                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Fim:</Text>
                                                        <Text>{endDate}</Text>
                                                    </Box>

                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Status/Situação:</Text>
                                                        <Text>{groupSituation?.filter(v => v.value === item?.status)?.map(i => i.label)}</Text>
                                                    </Box>
                                                    {
                                                        enrollmentData.status?.includes('Desistente') &&
                                                        <>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Motivo da desistência:</Text>
                                                                <Text>{groupReasonsDroppingOut?.filter(v => v.value === item?.motivo_desistencia)?.map(i => i.label)}</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Data da desistência:</Text>
                                                                <Text>{item?.dt_desistencia}</Text>
                                                            </Box>

                                                        </>
                                                    }
                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Certificado emitido:</Text>
                                                        <Text>{groupCertificate?.filter(v => v.value === item?.certificado_emitido)?.map(i => i.label)}</Text>
                                                    </Box>
                                                    <Divider padding={0} />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Preferência de Pagamento:</Text>
                                                        <Text>{grouPreferPayment?.filter(v => v.value === item?.preferencia_pagamento)?.map(i => i.label)}</Text>
                                                    </Box>

                                                    {item?.disciplinesData?.length > 0 &&
                                                        <Box sx={{
                                                            display: 'flex', width: '100%', flexDirection: 'column', gap: 1.8, marginTop: 2, borderRadius: 2, padding: '20px',
                                                            border: `1px solid ${colorPalette?.buttonColor}`
                                                        }}>
                                                            <Text bold style={{ color: colorPalette?.buttonColor }}>Disciplinas referente ao Módulo Cursado: </Text>
                                                            {item?.disciplinesData?.map((item, index) => (
                                                                <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                                    <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 350 }}>
                                                                            <Box sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                width: 16,
                                                                                height: 16,
                                                                                borderRadius: 16,
                                                                                cursor: 'pointer',
                                                                                transition: '.5s',
                                                                                border: parseInt(item?.selecionada) > 0 ? '' : `1px solid ${colorPalette.textColor}`,
                                                                                '&:hover': {
                                                                                    opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                                                                                    boxShadow: parseInt(item?.selecionada) > 0 ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                                }
                                                                            }}
                                                                                onClick={() => {
                                                                                    if (parseInt(item?.selecionada) > 0) {
                                                                                        handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, 'selecionada', parseInt(0))
                                                                                    } else {
                                                                                        handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, 'selecionada', 1)
                                                                                    }
                                                                                }}>
                                                                                {parseInt(item?.selecionada) > 0 ? (
                                                                                    <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                                                ) : (
                                                                                    <Box
                                                                                        sx={{
                                                                                            width: 11,
                                                                                            height: 11,
                                                                                            borderRadius: 11,
                                                                                            cursor: 'pointer',
                                                                                            '&:hover': {
                                                                                                opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                                                                                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                                            },
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                            <Text bold small>{item?.nome_disciplina}</Text>
                                                                        </Box>
                                                                        <TextInput disabled={!isPermissionEdit && true} label="Nota Final" name='nt_final' value={item?.nt_final} sx={{ width: '120px' }} />
                                                                        <TextInput disabled={!isPermissionEdit && true} label="Qnt Presenças" Ï name='qnt_presenca' value={item?.qnt_presenca} sx={{ width: '120px' }} />
                                                                        <TextInput disabled={!isPermissionEdit && true} label="Qnt Faltas" name='qnt_falta' value={item?.qnt_falta} sx={{ width: '120px' }} />
                                                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                            <Text bold small>Frequência:</Text>
                                                                            <Text bold small>{handleCalculateFrequency(item?.qnt_presenca, item?.qnt_falta)}</Text>
                                                                        </Box>
                                                                    </Box>
                                                                    <Divider distance={0} />
                                                                </Box>
                                                            ))}
                                                        </Box>}

                                                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start' }}>
                                                        <Button text="Remover" small onClick={() => removeEnrollmentRegister(index)} style={{ width: 120, height: 30 }} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )
                                    })}
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Divider padding={0} />
                                    <Text bold title>Nova Matrícula/Rematrícula</Text>
                                    <Box sx={styles.inputSection}>
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={classes} valueSelection={enrollmentRegisterData?.turma_id} onSelect={(value) => setEnrollmentRegisterData({ ...enrollmentRegisterData, turma_id: value })}
                                            title="Turma " filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Módulo/Semestre' name='modulo' onChange={handleChangeEnrollmentRegister} type="number" value={enrollmentRegisterData?.modulo} label='Módulo/Semestre *' sx={{ flex: 1, }} onBlur={(e) => handleSelectModule(e.target.value)} />
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Qnt de Disciplina com DP' name='qnt_disci_dp' onChange={handleChangeEnrollmentRegister} type="number" value={enrollmentRegisterData?.qnt_disci_dp} label='Qnt de Disciplina com DP *' sx={{ flex: 1, }} />
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Qnt de Disciplina Dispensada' name='qnt_disci_disp' onChange={handleChangeEnrollmentRegister} type="number" value={enrollmentRegisterData?.qnt_disci_disp} label='Qnt de Disciplina Dispensada *' sx={{ flex: 1, }} />
                                    </Box>
                                    <Box sx={styles.inputSection}>
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupEnrollment} valueSelection={enrollmentRegisterData?.rematricula} onSelect={(value) => setEnrollmentRegisterData({ ...enrollmentRegisterData, rematricula: value })}
                                            title="Cursando Rematrícula? *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupEnrollment} valueSelection={enrollmentRegisterData?.cursando_dp} onSelect={(value) => setEnrollmentRegisterData({ ...enrollmentRegisterData, cursando_dp: value })}
                                            title="Cursando alguma DP? *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                    </Box>
                                    <Box sx={styles.inputSection}>
                                        <TextInput disabled={!isPermissionEdit && true} name='dt_inicio' onChange={handleChangeEnrollmentRegister} type="date" value={(enrollmentRegisterData?.dt_inicio)?.split('T')[0] || ''} label='Inicio *' sx={{ flex: 1, }} />
                                        <TextInput disabled={!isPermissionEdit && true} name='dt_final' onChange={handleChangeEnrollmentRegister} type="date" value={(enrollmentRegisterData?.dt_final)?.split('T')[0] || ''} label='Fim *' sx={{ flex: 1, }} />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupSituation} valueSelection={enrollmentRegisterData?.status} onSelect={(value) => setEnrollmentRegisterData({ ...enrollmentRegisterData, status: value })}
                                            title="Status/Situação *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                    </Box>
                                    {
                                        enrollmentData.status?.includes('Desistente') &&
                                        <>

                                            <CheckBoxComponent disabled={!isPermissionEdit && true}
                                                valueChecked={enrollmentRegisterData?.motivo_desistencia || ''}
                                                boxGroup={groupReasonsDroppingOut}
                                                title="Motivo da desistência"
                                                horizontal={mobile ? false : true}
                                                onSelect={(value) => setEnrollmentRegisterData({
                                                    ...enrollmentRegisterData,
                                                    motivo_desistencia: value
                                                })}
                                                sx={{ width: 1 }}
                                            />
                                            <TextInput disabled={!isPermissionEdit && true} name='dt_desistencia' onChange={handleChangeEnrollmentRegister} type="date" value={(enrollmentRegisterData?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                                        </>
                                    }
                                    <RadioItem disabled={!isPermissionEdit && true} valueRadio={enrollmentRegisterData?.certificado_emitido}
                                        group={groupCertificate}
                                        title="Certificado emitido: *"
                                        horizontal={mobile ? false : true}
                                        onSelect={(value) => setEnrollmentRegisterData({ ...enrollmentRegisterData, certificado_emitido: parseInt(value) })} />

                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={grouPreferPayment} valueSelection={enrollmentRegisterData?.preferencia_pagamento} onSelect={(value) => setEnrollmentRegisterData({ ...enrollmentRegisterData, preferencia_pagamento: value })}
                                        title="Preferência de Pagamento: *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />

                                    {enrollmentRegisterData?.disciplinesData?.length > 0 &&
                                        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 1.8, marginTop: 2 }}>
                                            <Text bold>Disciplinas referente ao Módulo Cursado</Text>
                                            <Text small light style={{ color: 'red' }}>Inserir Nota Final e Frequência</Text>
                                            {enrollmentRegisterData?.disciplinesData?.map((item, index) => (
                                                <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                    <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 350 }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: 16,
                                                                cursor: 'pointer',
                                                                transition: '.5s',
                                                                border: parseInt(item?.selecionada) > 0 ? '' : `1px solid ${colorPalette.textColor}`,
                                                                '&:hover': {
                                                                    opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                                                                    boxShadow: parseInt(item?.selecionada) > 0 ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                }
                                                            }}
                                                                onClick={() => {
                                                                    if (parseInt(item?.selecionada) > 0) {
                                                                        handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, 'selecionada', parseInt(0))
                                                                    } else {
                                                                        handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, 'selecionada', 1)
                                                                    }
                                                                }}>
                                                                {parseInt(item?.selecionada) > 0 ? (
                                                                    <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                                ) : (
                                                                    <Box
                                                                        sx={{
                                                                            width: 11,
                                                                            height: 11,
                                                                            borderRadius: 11,
                                                                            cursor: 'pointer',
                                                                            '&:hover': {
                                                                                opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                                                                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                            },
                                                                        }}
                                                                    />
                                                                )}
                                                            </Box>
                                                            <Text bold small>{item?.nome_disciplina}</Text>
                                                        </Box>
                                                        <TextInput
                                                            InputProps={{
                                                                style: { opacity: parseInt(item?.selecionada) < 1 ? .5 : 1 }
                                                            }}
                                                            InputLabelProps={{
                                                                style: { opacity: parseInt(item?.selecionada) < 1 ? .5 : 1 }
                                                            }}
                                                            disabled={(parseInt(item?.selecionada) < 1 || !isPermissionEdit) && true}
                                                            label="Nota Final"
                                                            name='nt_final'
                                                            value={item?.nt_final}
                                                            sx={{ width: '120px' }}
                                                            onChange={(e) => handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, e.target.name, e.target.value)} />
                                                        <TextInput InputProps={{
                                                            style: { opacity: parseInt(item?.selecionada) < 1 ? .5 : 1 }
                                                        }}
                                                            InputLabelProps={{
                                                                style: { opacity: parseInt(item?.selecionada) < 1 ? .5 : 1 }
                                                            }}
                                                            disabled={(parseInt(item?.selecionada) < 1 || !isPermissionEdit) && true} label="Qnt Presenças" Ï name='qnt_presenca' value={item?.qnt_presenca || ''} sx={{ width: '120px' }} onChange={(e) => handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, e.target.name, e.target.value)} />
                                                        <TextInput InputProps={{
                                                            style: { opacity: parseInt(item?.selecionada) < 1 ? .5 : 1 }
                                                        }}
                                                            InputLabelProps={{
                                                                style: { opacity: parseInt(item?.selecionada) < 1 ? .5 : 1 }
                                                            }}
                                                            disabled={(parseInt(item?.selecionada) < 1 || !isPermissionEdit) && true} label="Qnt Faltas" name='qnt_falta' value={item?.qnt_falta || ''} sx={{ width: '120px' }} onChange={(e) => handleChangeEnrollmentDisciplinesDataRegister(item?.disciplina_id, e.target.name, e.target.value)} />
                                                        <Box sx={{
                                                            display: 'flex', gap: 2, alignItems: 'center',
                                                            opacity: parseInt(item?.selecionada) < 1 ? .5 : 1
                                                        }}>
                                                            <Text bold small>Frequência:</Text>
                                                            <Text bold small>{handleCalculateFrequency(item?.qnt_presenca, item?.qnt_falta)}</Text>
                                                        </Box>
                                                    </Box>
                                                    <Divider distance={0} />
                                                </Box>
                                            ))}
                                        </Box>}
                                </Box>
                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                                    <Button text="Adicionar" small onClick={() => handleAddEnrollmentRegister()} style={{ width: 120, height: 30 }} />
                                </Box>
                            </>
                        }

                    </ContentContainer >

                    {(!newUser && menuView === 'enrollments') &&
                        <ContentContainer style={{ ...styles.containerContract, padding: showEnrollment ? '40px' : '25px' }}>
                            <Box sx={{
                                display: 'flex', alignItems: 'center', padding: showEnrollment ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                },
                                justifyContent: 'space-between'
                            }} onClick={() => setShowEnrollment(!showEnrollment)}>
                                <Text title bold >Matrículas</Text>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(${icons.gray_arrow_down})`,
                                    transform: showEnrollment ? 'rotate(0deg)' : 'rotate(-90deg)',
                                    transition: '.3s',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} />
                            </Box>
                            {showEnrollment &&
                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>

                                    {enrollmentData.length > 0 ?
                                        enrollmentData?.map((item, index) => {

                                            const isReenrollment = (item.status === "Concluído" || item.status === "Aprovado") &&
                                                item.modulo === highestModule;
                                            const isPosGratuation = item?.nivel_curso === 'Pós-Graduação';
                                            const isDp = item.cursando_dp === 1;
                                            const className = item?.nome_turma;
                                            const courseName = item?.nome_curso;
                                            const period = item?.periodo;
                                            let datePeriod = new Date(item?.dt_inicio)
                                            // let datePeriod = new Date(item?.dt_inicio_cronograma || item?.dt_inicio)
                                            let year = datePeriod.getFullYear()
                                            let month = datePeriod.getMonth()
                                            let moduloYear = month >= 6 ? '2' : '1';
                                            let periodEnrollment = `${year}.${moduloYear}`
                                            const startDate = formatDate(item?.dt_inicio)
                                            // const startDate = formatDate(item?.dt_inicio_cronograma || item?.dt_inicio)
                                            const title = `${periodEnrollment} - ${className}_${item?.modulo}SEM_${courseName}_${startDate}_${period}`
                                            const enrollmentId = item?.id_matricula;
                                            const files = contractStudent?.filter((file) => file?.matricula_id === item?.id_matricula);
                                            const bgImagePdf = files?.filter(file => file.matricula_id === item?.id_matricula)?.name_file?.includes('pdf') ? '/icons/pdf_icon.png' : files?.location

                                            return (

                                                <ContentContainer key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2, border: isReenrollment && `1px solid ${colorPalette.buttonColor}` }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'start',
                                                            gap: 4,
                                                            maxWidth: '90%',
                                                            "&:hover": {
                                                                opacity: 0.8,
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                        onClick={() => toggleEnrollTable(index)}
                                                    >
                                                        <Box
                                                            sx={{
                                                                ...styles.menuIcon,
                                                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                                                transform: showEnrollTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                                                transition: '.3s',
                                                                width: 17,
                                                                height: 17
                                                            }}
                                                        />
                                                        <Text bold style={{ color: colorPalette.buttonColor }}>{title}</Text>
                                                        {isReenrollment && <Box sx={{ padding: '5px 15px', backgroundColor: colorPalette.buttonColor, borderRadius: 2 }}>
                                                            <Text bold small style={{ color: '#fff' }}>Pendente de Rematrícula - {item?.modulo + 1} Semetre/Módulo</Text>
                                                        </Box>}
                                                        {isDp && <Box sx={{ padding: '5px 15px', backgroundColor: 'red', borderRadius: 2 }}>
                                                            <Text bold small style={{ color: '#fff' }}>Cursando DP</Text>
                                                        </Box>}
                                                    </Box>
                                                    {showEnrollTable[index] && (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '20px 0px 0px 0px' }}>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Turma:</Text>
                                                                <Text light>{item?.nome_turma}</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Pendências:</Text>
                                                                <Text light>{item?.qnt_disci_dp || 0}</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Semestre/Módulo cursando:</Text>
                                                                <Text light>{item?.modulo}º Módulo</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ ...styles.inputSection, justifyContent: 'flex-start', gap: 2 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1 }}>
                                                                    <Text bold>Contrato do aluno:</Text>
                                                                    <Box sx={{
                                                                        ...styles.menuIcon,
                                                                        backgroundImage: `url('${icons.file}')`,
                                                                        transition: '.3s',
                                                                        "&:hover": {
                                                                            opacity: 0.8,
                                                                            cursor: 'pointer'
                                                                        }
                                                                    }} onClick={() => setShowEditFiles({ ...showEditFile, contractStudent: true })} />
                                                                    <Box sx={{
                                                                        ...styles.menuIcon,
                                                                        width: 22,
                                                                        height: 22,
                                                                        backgroundImage: `url('${icons.print}')`,
                                                                        transition: '.3s',
                                                                        "&:hover": {
                                                                            opacity: 0.8,
                                                                            cursor: 'pointer'
                                                                        }
                                                                    }} />
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
                                                                    }} />
                                                                    <EditFile
                                                                        setFilesUser={setFilesUser}
                                                                        filesUser={filesUser}
                                                                        isPermissionEdit={isPermissionEdit}
                                                                        columnId="id_contrato_aluno"
                                                                        open={showEditFile.contractStudent}
                                                                        newUser={newUser}
                                                                        onSet={(set) => {
                                                                            setShowEditFiles({ ...showEditFile, contractStudent: set })
                                                                        }}
                                                                        title='Contrato do aluno'
                                                                        text='Faça o upload do contrato do aluno, depois clique em salvar.'
                                                                        textDropzone='Arraste ou clique para selecionar a foto/arquivo que deseja'
                                                                        fileData={contractStudent?.filter((file) => file?.matricula_id === enrollmentId)}
                                                                        usuarioId={id}
                                                                        matriculaId={enrollmentId}
                                                                        bgImage={bgImagePdf}
                                                                        callback={(file) => {
                                                                            if (file.status === 201 || file.status === 200) {
                                                                                handleItems()
                                                                            }
                                                                        }}
                                                                    />
                                                                </Box>

                                                                <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                    <Text bold>Gerar um novo contrato:</Text>
                                                                    <Link href={`/administrative/users/${id}/generateContract?enrollmentId=${enrollmentId}`} target="_blank">
                                                                        <Button small text="Gerar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                                    </Link>
                                                                </Box>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Data de Início:</Text>
                                                                <Text light>{startDate}</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Data Final:</Text>
                                                                <Text light>{item?.dt_fim_cronograma ? formatTimeStamp(item?.dt_fim_cronograma) : 'Aguardando Criação do Cronograma'}</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Status/Situação:</Text>
                                                                <Text light>{item?.status}</Text>
                                                            </Box>
                                                            <Divider padding={0} />
                                                            {/* <Box sx={styles.inputSection}>
                                                        <TextInput disabled={!isPermissionEdit && true} name='dt_inicio' type="date" value={(item?.dt_inicio)?.split('T')[0] || ''} label='Inicio' sx={{ flex: 1, }} />
                                                        <TextInput disabled={!isPermissionEdit && true} name='dt_final' type="date" value={(item?.dt_final)?.split('T')[0] || ''} label='Fim' sx={{ flex: 1, }} />
                                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupSituation} valueSelection={item?.status} clean={false}
                                                            title="Status/Situação" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                        />
                                                    </Box>
                                                    <Divider padding={0} /> */}
                                                            {
                                                                enrollmentData.status?.includes('Desistente') &&
                                                                <>

                                                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                                                        valueChecked={item?.motivo_desistencia || ''}
                                                                        boxGroup={groupReasonsDroppingOut}
                                                                        title="Motivo da desistência"
                                                                        horizontal={mobile ? false : true}
                                                                        sx={{ width: 1 }}
                                                                    />
                                                                    <TextInput disabled={!isPermissionEdit && true} name='dt_desistencia' type="date" value={(item?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                                                                    <Divider padding={0} />
                                                                </>
                                                            }


                                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={item?.certificado_emitido}
                                                                group={groupCertificate}
                                                                title="Certificado emitido:"
                                                                horizontal={mobile ? false : true}
                                                            />
                                                            <Divider padding={0} />

                                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={item?.adimplente}
                                                                group={groupAdimplente}
                                                                title="Adimplente?"
                                                                horizontal={mobile ? false : true}
                                                            />
                                                            <Divider padding={0} />



                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Usuário responsável:</Text>
                                                                <Text light>{item?.nome_usuario_resp}</Text>
                                                            </Box>
                                                            <Divider padding={0} />

                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Data de criação:</Text>
                                                                <Text light>{formatTimeStamp(item?.dt_criacao)}</Text>
                                                            </Box>
                                                            <Divider padding={0} />

                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Notas, frequências, atividades complementares:</Text>
                                                                <Link href={`/academic/teacherArea/${id}`} target="_blank">
                                                                    <Button small text="vizualizar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                                </Link>
                                                            </Box>
                                                            <Divider padding={0} />

                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Text bold>Situação dos pagamentos:</Text>
                                                                <Link href={`/administrative/users/${id}/statusPayment?enrollmentId=${enrollmentId}`} target="_blank">
                                                                    <Button small text="vizualizar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                                </Link>
                                                            </Box>
                                                            {user?.area === 'TI - Suporte' &&
                                                                <>
                                                                    <Divider padding={0} />
                                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                        <Text bold>Excluir Matricula:</Text>
                                                                        <Button small text="Excluir" onClick={handleClickOpen} style={{ width: 105, height: 25, alignItems: 'center' }} />

                                                                    </Box>
                                                                    <Dialog
                                                                        open={open}

                                                                        keepMounted
                                                                        onClose={handleClose}
                                                                        aria-describedby="alert-dialog-slide-description"
                                                                    >
                                                                        <DialogTitle>{"ATENÇÃO!"}</DialogTitle>
                                                                        <DialogContent>
                                                                            <DialogContentText id="alert-dialog-slide-description">
                                                                                Deseja apagar essa matrícula permanentemente
                                                                            </DialogContentText>
                                                                        </DialogContent>
                                                                        <DialogActions>
                                                                            <Button onClick={handleClose} small text="Não" />
                                                                            <Button onClick={() => deleteMatricula(id, item?.turma_id, enrollmentId, item?.modulo)} small text="Sim" />
                                                                        </DialogActions>
                                                                    </Dialog>
                                                                </>}

                                                            <Divider padding={0} />
                                                            <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                                <Button disabled={!isPermissionEdit && true} secondary small text="editar matrícula" style={{ width: 140, height: 30, alignItems: 'center' }} onClick={() => {
                                                                    setEnrollmentStudentEditId(item?.id_matricula)
                                                                    handleEnrollStudentById(item?.id_matricula)
                                                                    setShowSections({ ...showSections, editEnroll: true })
                                                                }} />
                                                                {isReenrollment ? (
                                                                    isPosGratuation ? (
                                                                        <Button
                                                                            disabled={!isPermissionEdit}
                                                                            small
                                                                            text="rematrícular pós"
                                                                            style={{ width: 140, height: 30, alignItems: 'center' }}
                                                                            onClick={() => handleReenrollmentPos({ classId: item?.turma_id, moduleCourse: item?.modulo + 1 })} />
                                                                    ) : (
                                                                        <Link
                                                                            href={`/administrative/users/${id}/enrollStudent?classId=${item?.turma_id}&courseId=${item?.curso_id}&reenrollment=true`}
                                                                            target="_blank"
                                                                        >
                                                                            <Button
                                                                                disabled={!isPermissionEdit}
                                                                                small
                                                                                text="rematrícula"
                                                                                style={{ width: 140, height: 30, alignItems: 'center' }}
                                                                            />
                                                                        </Link>
                                                                    )
                                                                ) : null}

                                                            </Box>
                                                        </Box>
                                                    )
                                                    }
                                                </ContentContainer>

                                            )
                                        })
                                        :
                                        <Text light> Não encontramos matrículas cadastradas.</Text>}
                                    <Button disabled={!isPermissionEdit && true} text="Nova matrícula" style={{ width: 150, marginTop: 3 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                                </Box>
                            }

                        </ContentContainer >}
                </>
            }

            <Backdrop open={showSections?.editEnroll} sx={{ zIndex: 999 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <ContentContainer>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <Text bold>Editar Matrícula</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_close})`,
                                transition: '.3s',
                                zIndex: 999999999,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => setShowSections({ ...showSections, editEnroll: false })} />
                        </Box>
                        <Divider padding={0} />
                        <Box sx={styles.inputSection}>
                            <SelectList disabled={!isPermissionEdit && true} fullWidth data={classes} valueSelection={enrollmentStudentEditData?.turma_id} onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, turma_id: value })}
                                title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Pendências' name='qnt_disci_dp' onChange={handleChangeEnrollmentEdit} type="number" value={enrollmentStudentEditData?.qnt_disci_dp || '0'} label='Pendências' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput disabled={!isPermissionEdit && true} name='dt_inicio' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_inicio)?.split('T')[0] || ''} label='Inicio' sx={{ flex: 1, }} />
                            <TextInput disabled={!isPermissionEdit && true} name='dt_final' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_final)?.split('T')[0] || ''} label='Fim' sx={{ flex: 1, }} />
                            <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupSituation} valueSelection={enrollmentStudentEditData?.status} onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, status: value })}
                                title="Status/Situação" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>
                        {
                            enrollmentData.status?.includes('Desistente') &&
                            <>

                                <CheckBoxComponent disabled={!isPermissionEdit && true}
                                    valueChecked={enrollmentStudentEditData?.motivo_desistencia || ''}
                                    boxGroup={groupReasonsDroppingOut}
                                    title="Motivo da desistência"
                                    horizontal={mobile ? false : true}
                                    onSelect={(value) => setEnrollmentStudentEditData({
                                        ...enrollmentStudentEditData,
                                        motivo_desistencia: value
                                    })}
                                    sx={{ width: 1 }}
                                />
                                <TextInput disabled={!isPermissionEdit && true} name='dt_desistencia' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                            </>
                        }
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={enrollmentStudentEditData?.certificado_emitido}
                            group={groupCertificate}
                            title="Certificado emitido:"
                            horizontal={mobile ? false : true}
                            onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, certificado_emitido: parseInt(value) })} />
                        <Divider padding={0} />
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={enrollmentStudentEditData?.adimplente}
                            group={groupAdimplente}
                            title="Adimplente?"
                            horizontal={mobile ? false : true}
                            onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, adimplente: parseInt(value) })} />
                        <Divider padding={0} />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                            <Button disabled={!isPermissionEdit && true} small text="salvar" onClick={() => handleEnrollStudentEdit()} />
                            <Button disabled={!isPermissionEdit && true} secondary small text="cancelar" style={{}} onClick={() => setShowSections({ ...showSections, editEnroll: false })} />
                        </Box>

                    </ContentContainer>
                </Box>
            </Backdrop>



            {
                (userData.perfil && (userData.perfil.includes('aluno') || userData.perfil.includes('interessado')) && menuView === 'interests') &&
                <>
                    <ContentContainer style={{ ...styles.containerContract, padding: showSelectiveProcess ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', padding: showSelectiveProcess ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowSelectiveProcess(!showSelectiveProcess)}>
                            <Text title bold>Inscrições</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: showSelectiveProcess ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} />
                        </Box>
                        {showSelectiveProcess &&
                            <>
                                <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>
                                    {
                                        arrayInterests?.map((interest, index) => {
                                            const requeriments = interest?.requeriments && interest?.requeriments?.some(item => item?.aprovado === 1);
                                            const [isHaveRequeriment] = interest?.requeriments && interest?.requeriments?.map(item => item?.id_req_matricula) || [];
                                            const [isRequerimentoAproved] = interest?.requeriments && interest?.requeriments?.map(item => parseInt(item?.aprovado) === 1) || [];
                                            const [isRequerimentoReproved] = interest?.requeriments && interest?.requeriments?.map(item => parseInt(item?.aprovado) === 0) || [];
                                            const approvedRequeriment = requeriments ? true : false;
                                            const subscription = interest?.inscricao;
                                            const disable = (interest?.turma_id && approvedRequeriment && isPermissionEdit && (subscription?.forma_ingresso !== 'Trânsferência' && subscription?.forma_ingresso !== 'Destrancamento de matrícula')) ? false : true;
                                            const interestTitle = `${interest?.nome_curso}_${interest?.nome_turma}_${interest?.periodo_interesse}_${interest?.modulo_curso}º módulo`;
                                            const [respAnalisar] = interest?.requeriments?.map(req => req.analisado_por) || [];
                                            let linkRequeriment;
                                            if (isHaveRequeriment) {
                                                linkRequeriment = `/secretary/studentDetails/requeriments/student/${isHaveRequeriment}`
                                            } else {
                                                linkRequeriment = `/secretary/studentDetails/requeriments?userId=${userData?.id}&classId=${interest?.turma_id}&moduleEnrollment=1&courseId=${interest?.curso_id}&formaIngresso=${subscription?.forma_ingresso}`;
                                            }

                                            return (
                                                <ContentContainer key={`${interest}-${index}`} style={{ width: '100%' }}>
                                                    <Box sx={{
                                                        display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center',
                                                        transition: '.3s',
                                                        '&:hover': {
                                                            opacity: .7,
                                                            cursor: 'pointer'
                                                        }
                                                    }}
                                                        onClick={() => toggleProcessSectiveTable(index)}>
                                                        <Text bold>{interestTitle}</Text>
                                                        <Box sx={{
                                                            ...styles.menuIcon,
                                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                                            transform: showSelectiveProcessTable[index] ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                            transition: '.3s',
                                                        }} />
                                                    </Box>
                                                    <Box sx={{ display: showSelectiveProcessTable[index] ? 'flex' : 'none', gap: 3, flex: 1, flexDirection: 'column' }}>
                                                        <Divider padding={0} />

                                                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={subscription?.forma_ingresso} group={groupIngresso} title="Forma de Ingresso:" horizontal={mobile ? false : true}
                                                            onSelect={(value) => handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'forma_ingresso', value })} />


                                                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={subscription?.forma_pagamento} group={groupPayment} title="Forma Pagamento:" horizontal={mobile ? false : true}
                                                            onSelect={(value) => handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'forma_pagamento', value })} />

                                                        <CheckBoxComponent disabled={!isPermissionEdit && true}
                                                            valueChecked={subscription?.forma_contato || ''}
                                                            boxGroup={groupContact}
                                                            title="Forma de contato:"
                                                            horizontal={mobile ? false : true}
                                                            onSelect={(value) =>
                                                                handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'forma_contato', value })}
                                                            sx={{ width: 1 }}
                                                        />

                                                        {subscription?.forma_ingresso === 'Nota do Enem' &&
                                                            <>
                                                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1, padding: '0px 0px 0px 5px' }}>
                                                                    <Text bold>Boletim de resultados do ENEM:</Text>
                                                                    <Box sx={{
                                                                        ...styles.menuIcon,
                                                                        backgroundImage: `url('${icons.file}')`,
                                                                        transition: '.3s',
                                                                        "&:hover": {
                                                                            opacity: 0.8,
                                                                            cursor: 'pointer'
                                                                        }
                                                                    }} onClick={() => setShowEditFiles({ ...showEditFile, enem: true })} />
                                                                </Box>

                                                                <EditFile
                                                                    setFilesUser={setFilesUser}
                                                                    filesUser={filesUser}
                                                                    isPermissionEdit={isPermissionEdit}
                                                                    columnId="id_doc_usuario"
                                                                    open={showEditFile.enem}
                                                                    newUser={newUser}
                                                                    onSet={(set) => {
                                                                        setShowEditFiles({ ...showEditFile, enem: set })
                                                                    }}
                                                                    title='Boletim de resultados do ENEM'
                                                                    text='Faça o upload do seu Boletim, depois clique em salvar.'
                                                                    textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                                                    fileData={filesUser?.filter((file) => file.campo === 'enem')}
                                                                    usuarioId={id}
                                                                    campo='enem'
                                                                    tipo='documento usuario'
                                                                    callback={(file) => {
                                                                        if (file.status === 201 || file.status === 200) {
                                                                            if (!newUser) { handleItems() }
                                                                            else {
                                                                                handleChangeFilesUser('enem', file.fileId, file.filePreview)
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </>
                                                        }
                                                        {subscription?.forma_ingresso === 'Redação Online' &&
                                                            <>
                                                                <Divider padding={0} />
                                                                <Box sx={{ ...styles.inputSection, maxWidth: 280 }}>
                                                                    <TextInput disabled={!isPermissionEdit && true} name='agendamento_processo' onChange={(e) =>
                                                                        handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: e.target.name, value: e.target.value })}
                                                                        type="datetime-local" value={(subscription?.agendamento_processo) || ''}
                                                                        label='Data do agendamento' sx={{ flex: 1, }} />
                                                                </Box>

                                                                <Divider padding={0} />
                                                                {(!interest?.id_redacao && !newUser) &&
                                                                    <>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'start', flex: 1, padding: '0px 0px 0px 5px', flexDirection: 'column' }}>
                                                                            <Text bold>Redação:</Text>
                                                                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
                                                                                <Button disabled={!isPermissionEdit && true} text="enviar" onClick={() => handleSendSelectiveEssayWriting(interest)} style={{ width: 120, height: 30 }} />
                                                                                {/* <Button disabled={!isPermissionEdit && true} secondary text="re-enviar" style={{ width: 120, height: 30 }} /> */}
                                                                            </Box>
                                                                        </Box>
                                                                        <Divider padding={0} />
                                                                    </>
                                                                }
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                                                                    {/* <TextInput disabled={!isPermissionEdit && true} placeholder='Nota da prova' name='nt_redacao' onBlur={(e) => handleBlurNota(e, subscription)}
                                                                        type="number" onChange={(e) =>
                                                                            handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: e.target.name, value: e.target.value })}
                                                                        value={subscription?.nt_redacao || ''} label='Nota da prova' sx={{ flex: 1, }} /> */}
                                                                    <Text bold>Nota da Redação: </Text>
                                                                    <Text light>{subscription?.nt_redacao || ''}</Text>
                                                                </Box>

                                                            </>
                                                        }
                                                        <>
                                                            {subscription?.forma_ingresso === 'Nota do Enem'
                                                                && <Box sx={styles.inputSection}>
                                                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nota da prova' name='nt_enem'
                                                                        type="number" onChange={(e) =>
                                                                            handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: e.target.name, value: e.target.value })}
                                                                        value={subscription?.nt_enem || ''} label='Nota da prova' sx={{ flex: 1, }} />
                                                                </Box>}
                                                            {/* <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupStatusProcess}
                                                                valueSelection={subscription?.status_processo_sel} onSelect={(value) =>
                                                                    handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'status_processo_sel', value })}
                                                                title="Status processo seletivo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                            /> */}
                                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                <Box sx={{
                                                                    display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                                    border: `1px solid green`,
                                                                    transition: '.3s',
                                                                    backgroundColor: subscription?.status_processo_sel === 'Classificado' ? 'green' : 'trasnparent', borderRadius: 2,
                                                                    "&:hover": {
                                                                        opacity: subscription?.forma_ingresso != 'Redação Online' && 0.8,
                                                                        cursor: subscription?.forma_ingresso != 'Redação Online' && 'pointer',
                                                                        transform: subscription?.forma_ingresso != 'Redação Online' && 'scale(1.03, 1.03)'
                                                                    },
                                                                }} onClick={() => {
                                                                    if (subscription?.forma_ingresso != 'Redação Online') {
                                                                        if (subscription?.status_processo_sel !== 'Classificado') {
                                                                            handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'status_processo_sel', value: 'Classificado' })
                                                                        }
                                                                    }
                                                                }}>
                                                                    {subscription?.status_processo_sel !== 'Classificado' && <CheckCircleIcon style={{ color: 'green', fontSize: 13 }} />}
                                                                    <Text bold style={{ color: subscription?.status_processo_sel === 'Classificado' ? '#fff' : 'green' }}>{
                                                                        subscription?.status_processo_sel === 'Classificado' ? "Classificado" : "Classificar"
                                                                    }</Text>
                                                                </Box>
                                                                <Box sx={{
                                                                    display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                                    border: `1px solid red`,
                                                                    backgroundColor: subscription?.status_processo_sel === 'Desclassificado' ? 'red' : 'trasnparent', borderRadius: 2,
                                                                    transition: '.3s',
                                                                    "&:hover": {
                                                                        opacity: subscription?.forma_ingresso != 'Redação Online' && 0.8,
                                                                        cursor: subscription?.forma_ingresso != 'Redação Online' && 'pointer',
                                                                        transform: subscription?.forma_ingresso != 'Redação Online' && 'scale(1.03, 1.03)'
                                                                    },
                                                                }} onClick={() => {
                                                                    if (subscription?.forma_ingresso != 'Redação Online') {
                                                                        if (subscription?.status_processo_sel !== 'Desclassificado') {
                                                                            handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'status_processo_sel', value: 'Desclassificado' })
                                                                        }
                                                                    }
                                                                }}>
                                                                    {subscription?.status_processo_sel !== 'Desclassificado' && <CancelIcon style={{ color: 'red', fontSize: 13 }} />}
                                                                    <Text bold style={{ color: subscription?.status_processo_sel === 'Desclassificado' ? '#fff' : 'red' }}>{
                                                                        subscription?.status_processo_sel === 'Desclassificado' ? "Desclassificado" : "Desclassificar"
                                                                    }</Text>
                                                                </Box>
                                                            </Box>

                                                            <Divider padding={0} />
                                                            {(!newUser) && <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'start', flex: 1, padding: '0px 0px 0px 5px', flexDirection: 'column' }}>
                                                                <Text bold>{(subscription?.forma_ingresso !== 'Trânsferência' && subscription?.forma_ingresso !== 'Destrancamento de matrícula') ?
                                                                    'Requerimento de Matrícula/Cadastro:' : 'Matrícula:'}</Text>
                                                                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
                                                                    {(subscription?.forma_ingresso !== 'Trânsferência' && subscription?.forma_ingresso !== 'Destrancamento de matrícula') && <Tooltip title={isRequerimentoAproved ? 'Requerimento aprovado' : isRequerimentoReproved ? 'Requerimento reprovado' : isHaveRequeriment ? 'Já existe um requerimento em andamento' : ''}>
                                                                        <div>
                                                                            {isRequerimentoAproved ?
                                                                                <Box sx={{
                                                                                    display: 'flex', gap: 1, padding: '6px 8px', alignItems: 'center', border: '1px solid green',
                                                                                    backgroundColor: 'transparent',
                                                                                    borderRadius: `100px`,
                                                                                    justifyContent: 'space-around',
                                                                                    transition: '.3s',
                                                                                    "&:hover": {
                                                                                        opacity: 0.8,
                                                                                        cursor: 'pointer'
                                                                                    },
                                                                                }} onClick={() => window.open(linkRequeriment, '_blank')}>
                                                                                    <CheckCircleIcon style={{ color: 'green', fontSize: 15 }} />
                                                                                    <Text style={{ color: 'green' }}>
                                                                                        Ver Requerimento
                                                                                    </Text>
                                                                                </Box>
                                                                                :

                                                                                isRequerimentoReproved ?
                                                                                    <Box sx={{
                                                                                        display: 'flex', gap: 1, padding: '6px 8px', alignItems: 'center', border: '1px solid red',
                                                                                        backgroundColor: 'transparent',
                                                                                        borderRadius: `100px`,
                                                                                        justifyContent: 'space-around',
                                                                                        transition: '.3s',
                                                                                        "&:hover": {
                                                                                            opacity: 0.8,
                                                                                            cursor: 'pointer'
                                                                                        },
                                                                                    }} onClick={() => window.open(linkRequeriment, '_blank')}>
                                                                                        <CancelIcon style={{ color: 'red', fontSize: 15 }} />
                                                                                        <Text style={{ color: 'red' }}>
                                                                                            Ver Requerimento
                                                                                        </Text>
                                                                                    </Box>
                                                                                    :
                                                                                    <Button disabled={(!isPermissionEdit || subscription?.status_processo_sel !== 'Classificado') && true}
                                                                                        secondary={isHaveRequeriment}
                                                                                        small text={isHaveRequeriment ? 'Ver Requerimento' : "Enviar Requerimento"} sx={{
                                                                                            // width: 25,
                                                                                            transition: '.3s',
                                                                                            zIndex: 999999999,
                                                                                            "&:hover": {
                                                                                                opacity: 0.8,
                                                                                                cursor: 'pointer'
                                                                                            }
                                                                                        }} onClick={() => {
                                                                                            if (subscription?.forma_ingresso) {
                                                                                                if (isHaveRequeriment) {
                                                                                                    window.open(linkRequeriment, '_blank')
                                                                                                } else {
                                                                                                    handleSendRequeriment({ classId: interest?.turma_id, courseId: interest?.curso_id, entryForm: subscription?.forma_ingresso, moduleCourse: interest?.modulo_curso })
                                                                                                }
                                                                                            } else {
                                                                                                alert.info('Preencha primeiro a forma de ingresso do candidato.')
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                            }
                                                                        </div>
                                                                    </Tooltip>}
                                                                    <Tooltip title={(subscription?.forma_ingresso === 'Trânsferência' || subscription?.forma_ingresso === 'Destrancamento de matrícula') ? false : disable ? 'Necessário primeiro requerimento' : ''}>
                                                                        <div>
                                                                            <Button disabled={(subscription?.forma_ingresso === 'Trânsferência' || subscription?.forma_ingresso === 'Destrancamento de matrícula') ? false : disable} small text="Matricular" sx={{
                                                                                // width: 25,
                                                                                transition: '.3s',
                                                                                zIndex: 999999999,
                                                                                "&:hover": {
                                                                                    opacity: 0.8,
                                                                                    cursor: 'pointer'
                                                                                }
                                                                            }} onClick={() => handleEnrollment(interest, subscription)} />
                                                                        </div>
                                                                    </Tooltip>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', marginTop: 3 }}>
                                                                    <Text small bold>Responsável por análisar:</Text>
                                                                    <Text small>{respAnalisar || '-'}</Text>
                                                                </Box>
                                                            </Box>}
                                                        </>
                                                    </Box>
                                                </ContentContainer>
                                            );
                                        })

                                    }
                                </Box>

                                <Button disabled={!isPermissionEdit && true} text="Nova inscrição/Interesse" style={{ width: 250, marginTop: 3 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                            </>
                        }
                    </ContentContainer>

                </>
            }

            <Backdrop open={showSections.interest} sx={{ zIndex: 999 }}>

                {showSections.interest &&
                    <ContentContainer style={{
                        maxWidth: { md: '800px', lg: '1980px' },
                        maxHeight: { md: '180px', lg: '1280px' },
                        overflowY: matches && 'auto',
                        marginLeft: { md: '180px', lg: '280px' }
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text bold large>Interesses</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_close})`,
                                transform: showEnrollment ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: '.3s',
                                zIndex: 999999999,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => {
                                setShowSections({ ...showSections, interest: false })
                                alert.info('Lembresse de salvar antes de sair da tela.')
                            }} />
                        </Box>
                        <Divider padding={0} />
                        <ContentContainer style={{ boxShadow: 'none', overflowY: matches && 'auto', }}>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid #eaeaea`, }}>
                                <table style={{ borderCollapse: 'collapse', }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', width: '100%', borderRadius: '8px 0px 0px 8px', border: `1px solid #eaeaea`, }}>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Curso</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Turma</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Periodo</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Módulo</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ flex: 1 }}>
                                        {
                                            arrayInterests?.map((interest, index) => {
                                                const requeriments = interest?.requeriments && interest?.requeriments?.some(item => item?.aprovado === 1);
                                                const [isHaveRequeriment] = interest?.requeriments && interest?.requeriments?.map(item => item?.id_req_matricula);
                                                const [isRequerimentoAproved] = interest?.requeriments && interest?.requeriments?.map(item => parseInt(item?.aprovado) === 1);
                                                const approvedRequeriment = requeriments ? true : false;
                                                const disable = (interest?.turma_id && approvedRequeriment && isPermissionEdit) ? false : true;
                                                const subscription = interest?.inscricao;
                                                let linkRequeriment;
                                                if (isHaveRequeriment) {
                                                    linkRequeriment = `/secretary/studentDetails/requeriments/student/${isHaveRequeriment}`
                                                } else {
                                                    linkRequeriment = `/secretary/studentDetails/requeriments?userId=${userData?.id}&classId=${interest?.turma_id}&moduleEnrollment=1&courseId=${interest?.curso_id}`;
                                                }

                                                return (
                                                    <tr key={`${interest}-${index}`} style={{ width: '100%' }}>
                                                        <td style={{ fontSize: '13px', width: '100%', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.nome_curso || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', width: '100%', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.nome_turma || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', width: '100%', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.periodo_interesse || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', width: '100%', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {`${interest?.modulo_curso}º módulo` || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', width: '100%', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.observacao_int || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', width: '100%', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>

                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%' }}>

                                                                {newUser ?
                                                                    (
                                                                        <Box sx={{
                                                                            backgroundSize: 'cover',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center',
                                                                            width: 25,
                                                                            height: 25,
                                                                            backgroundImage: `url(/icons/remove_icon.png)`,
                                                                            transition: '.3s',
                                                                            zIndex: 999999999,
                                                                            "&:hover": {
                                                                                opacity: 0.8,
                                                                                cursor: 'pointer'
                                                                            }
                                                                        }} onClick={() => {
                                                                            deleteInterest(index)
                                                                        }} />
                                                                    ) : (
                                                                        <>
                                                                            <Button disabled={!isPermissionEdit && true} secondary small text="Editar" sx={{
                                                                                width: 40,
                                                                                transition: '.3s',
                                                                                zIndex: 999999999,
                                                                                "&:hover": {
                                                                                    opacity: 0.8,
                                                                                    cursor: 'pointer'
                                                                                }
                                                                            }} onClick={() => {
                                                                                setValueIdInterst(interest?.id_interesse)
                                                                                getInterestEdit(interest?.id_interesse)
                                                                                setShowSections({ ...showSections, viewInterest: true })
                                                                            }} />
                                                                            <Tooltip title={isRequerimentoAproved ? 'Requerimento aprovado' : isHaveRequeriment ? 'Já existe um requerimento em andamento' : ''}>
                                                                                <div>
                                                                                    {isRequerimentoAproved ?
                                                                                        < Box sx={{
                                                                                            display: 'flex', gap: 1, padding: '6px 8px',
                                                                                            alignItems: 'center', border: '1px solid green',
                                                                                            backgroundColor: 'transparent',
                                                                                            borderRadius: `100px`,
                                                                                            width: 140,
                                                                                            justifyContent: 'space-around',
                                                                                            transition: '.3s',
                                                                                            "&:hover": {
                                                                                                opacity: 0.8,
                                                                                                cursor: 'pointer'
                                                                                            },
                                                                                        }} onClick={() => window.open(linkRequeriment, '_blank')}>
                                                                                            <CheckCircleIcon style={{ color: 'green', fontSize: 15 }} />
                                                                                            <Text small style={{ color: 'green' }}>
                                                                                                Ver Requerimento
                                                                                            </Text>
                                                                                        </Box>
                                                                                        :
                                                                                        <Button disabled={!isPermissionEdit && true}
                                                                                            secondary={isHaveRequeriment}
                                                                                            small text={isHaveRequeriment ? 'Ver Requerimento' : "Enviar Requerimento"}
                                                                                            style={{ width: 160 }} onClick={() => {
                                                                                                if (subscription?.forma_ingresso) {
                                                                                                    if (isHaveRequeriment) {
                                                                                                        window.open(linkRequeriment, '_blank')
                                                                                                    } else {
                                                                                                        handleSendRequeriment({ classId: interest?.turma_id, courseId: interest?.curso_id, entryForm: subscription?.forma_ingresso, moduleCourse: interest?.modulo_curso })
                                                                                                    }
                                                                                                } else {
                                                                                                    alert.info('Preencha primeiro a forma de ingresso do candidato.')
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    }
                                                                                </div>
                                                                            </Tooltip>
                                                                            <Tooltip title={disable ? 'Necessário primeiro requerimento' : ''}>
                                                                                <div>
                                                                                    <Button disabled={disable} small text="Matricular" sx={{
                                                                                        // width: 25,
                                                                                        transition: '.3s',
                                                                                        zIndex: 999999999,
                                                                                        "&:hover": {
                                                                                            opacity: 0.8,
                                                                                            cursor: 'pointer'
                                                                                        }
                                                                                    }} onClick={() => handleEnrollment(interest)} />
                                                                                </div>
                                                                            </Tooltip>
                                                                        </>)
                                                                }
                                                            </Box>
                                                        </td>
                                                    </tr>
                                                );
                                            })

                                        }
                                    </tbody>
                                </table>
                            </div>

                            {(!showSections.addInterest && !showSections.viewInterest) &&
                                <>
                                    <Divider padding={0} />
                                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                        <Button disabled={!isPermissionEdit && true} small text='novo' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, addInterest: true })} />
                                    </Box>
                                </>
                            }

                            {showSections.addInterest &&
                                <ContentContainer style={{ overflowY: matches && 'auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text bold style={{ padding: '5px 0px 0px 0px' }}>Novo Interesse</Text>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 15,
                                            height: 15,
                                            backgroundImage: `url(${icons.gray_close})`,
                                            transition: '.3s',
                                            zIndex: 999999999,
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => setShowSections({ ...showSections, addInterest: false })} />
                                    </Box>
                                    <Divider padding={0} />
                                    <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={courses} valueSelection={interests?.curso_id} onSelect={(value) => {
                                            handleChangeInterest(value, 'curso_id')
                                            listClassesInterest(value)
                                        }}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={classesInterest} valueSelection={interests?.turma_id} onSelect={(value) => handleChangeInterest(value, 'turma_id')}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={interests?.turma_id ? period?.filter(item => item.idClass === interests?.turma_id) : []} valueSelection={interests?.periodo_interesse} onSelect={(value) => setInterests({ ...interests, periodo_interesse: value })}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={
                                            interests?.turma_id ? classesInterest?.filter(item => item.value === interests?.turma_id)?.map(item => item.modules)[0] : []} valueSelection={interests?.modulo_curso} onSelect={(value) => setInterests({ ...interests, modulo_curso: value })}
                                            title="Módulo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />

                                    </Box>
                                    <TextInput disabled={!isPermissionEdit && true}
                                        placeholder='Observação'
                                        name='observacao_int'
                                        onChange={handleChangeInterest}
                                        value={interests?.observacao_int || ''}
                                        sx={{ flex: 1 }}
                                        multiline
                                        maxRows={5}
                                        rows={3}
                                    />
                                    <Divider padding={0} />
                                    <Button disabled={!isPermissionEdit && true} small text='incluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={async () => {
                                        let isClassExists = arrayInterests?.filter(item => item?.turma_id === interests?.turma_id)?.length > 0;
                                        let isPeriodExists = arrayInterests?.filter(item => item?.periodo_interesse === interests?.periodo_interesse)?.length > 0;
                                        // const classSchedule = await verifyExistsClassSchedule(interests?.turma_id)

                                        // if (classSchedule?.length > 0) {

                                        if (isClassExists && isPeriodExists) {
                                            alert.info('Já existe um interesse cadastrado com as mesmas informações')
                                        } else {
                                            newUser ? addInterest() : handleAddInterest()
                                            setShowSections({ ...showSections, addInterest: false })
                                            setShowSections({ ...showSections, interest: false })
                                        }
                                        // } else {
                                        //     alert.info('Não existe cronograma cadastrado para a turma selecionada. Verifique com a secretaria a criação do cronograma, antes de prosseguir.')
                                        // }
                                    }} />
                                </ContentContainer>
                            }

                            {showSections.viewInterest &&
                                <ContentContainer style={{ overflowY: matches && 'auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text bold style={{ padding: '5px 0px 0px 0px' }}>Interesse</Text>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 15,
                                            height: 15,
                                            backgroundImage: `url(${icons.gray_close})`,
                                            transition: '.3s',
                                            zIndex: 999999999,
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => setShowSections({ ...showSections, viewInterest: false })} />
                                    </Box>
                                    <Divider padding={0} />
                                    <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={courses} valueSelection={interestSelected?.curso_id}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value) => {
                                                setInterestSelected({ ...interestSelected, curso_id: value })
                                                listClassesInterest(value)
                                            }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} data={classesInterest} valueSelection={interestSelected?.turma_id}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value) => setInterestSelected({ ...interestSelected, turma_id: value })}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} data={periodSelected} valueSelection={interestSelected?.periodo_interesse}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value) => setInterestSelected({ ...interestSelected, periodo_interesse: value })}
                                        />
                                    </Box>
                                    <TextInput disabled={!isPermissionEdit && true}
                                        placeholder='Observação'
                                        name='observacao_int'
                                        value={interestSelected?.observacao_int || ''}
                                        sx={{ flex: 1 }}
                                        onChange={handleChangeInterestSelected}
                                        multiline
                                        maxRows={5}
                                        rows={3}
                                    />
                                    <Divider padding={0} />
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Button disabled={!isPermissionEdit && true} small text="atualizar" style={{ padding: '5px 6px 5px 6px', width: 100 }}
                                            onClick={() => {
                                                handleEditInterest(interestSelected?.id_interesse)

                                            }} />
                                        <Button disabled={!isPermissionEdit && true} small secondary text='excluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                            handleDeleteInterest(interestSelected?.id_interesse)
                                            setShowSections({ ...showSections, viewInterest: false })
                                        }} />
                                    </Box>

                                </ContentContainer>}
                        </ContentContainer>
                    </ContentContainer>
                }
            </Backdrop >

            <Backdrop open={showSections.historic} sx={{ zIndex: 99999, }}>
                {showSections.historic &&
                    <ContentContainer style={{
                        maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '280px' },
                        margin: { xs: '0px 10px', md: '0px', lg: '0px' }, overflowY: matches && 'auto',
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                            <Text bold large>Observações</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_close})`,
                                transition: '.3s',
                                zIndex: 999999999,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => setShowSections({ ...showSections, historic: false })} />
                        </Box>
                        <Divider padding={0} />
                        <ContentContainer style={{ boxShadow: 'none', overflowY: matches && 'auto', }}>
                            <Table_V1 columns={columnHistoric}
                                data={arrayHistoric}
                                columnId="id_historico"
                                columnActive={false}
                                onSelect={(value) => setValueIdHistoric(value)}
                                routerPush={false}
                            />

                            {!showSections.addHistoric && <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button disabled={!isPermissionEdit && true} small text='adicionar' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, addHistoric: true })} />
                            </Box>}

                            {showSections.addHistoric &&
                                <>
                                    <ContentContainer style={{ overflowY: matches && 'auto', }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                                            <Text bold>Nova Observação</Text>
                                            <Box sx={{
                                                ...styles.menuIcon,
                                                width: 15,
                                                height: 15,
                                                backgroundImage: `url(${icons.gray_close})`,
                                                transition: '.3s',
                                                zIndex: 999999999,
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => setShowSections({ ...showSections, addHistoric: false })} />
                                        </Box>
                                        <Divider />
                                        <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_ocorrencia' onChange={handleChangeHistoric} value={(historicData?.dt_ocorrencia)?.split('T')[0] || ''} type="date" sx={{ flex: 1 }} />
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Responsável' name='responsavel' onChange={handleChangeHistoric} value={historicData?.responsavel || ''} label="Responsável" sx={{ flex: 1 }} />
                                        </Box>
                                        <TextInput disabled={!isPermissionEdit && true}
                                            placeholder='Ocorrência'
                                            name='ocorrencia'
                                            onChange={handleChangeHistoric}
                                            value={historicData?.ocorrencia || ''}
                                            label="Ocorrência"
                                            sx={{ flex: 1 }}
                                            multiline
                                            maxRows={5}
                                            rows={3}
                                        />
                                        <Divider />
                                        <Button disabled={!isPermissionEdit && true} small text='incluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                            newUser ? addHistoric() : handleAddHistoric()
                                            setShowSections({ ...showSections, addHistoric: false })
                                        }} />
                                    </ContentContainer>
                                </>}

                            {valueIdHistoric && arrayHistoric.filter((item) => item.id_historico === valueIdHistoric).map((historic) => (
                                <>
                                    <ContentContainer style={{ overflowY: matches && 'auto', }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                                            <Text bold>Observação</Text>
                                            <Box sx={{
                                                ...styles.menuIcon,
                                                backgroundSize: 'contain',
                                                width: 15,
                                                height: 15,
                                                backgroundImage: `url(${icons.gray_close})`,
                                                transition: '.3s',
                                                zIndex: 999999999,
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => setValueIdHistoric('')} />
                                        </Box>
                                        <Divider />
                                        <Box key={historic} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_ocorrencia' onChange={handleChangeHistoric} value={(historic?.dt_ocorrencia)?.split('T')[0] || ''} type="date" sx={{ flex: 1 }} />
                                            <TextInput disabled={!isPermissionEdit && true} placeholder='Responsável' name='responsavel' onChange={handleChangeHistoric} value={historic?.responsavel || ''} label="Responsável" sx={{ flex: 1 }} />
                                        </Box>
                                        <TextInput disabled={!isPermissionEdit && true}
                                            placeholder='Ocorrência'
                                            name='ocorrencia'
                                            onChange={handleChangeHistoric}
                                            value={historic?.ocorrencia || ''}
                                            label="Ocorrência"
                                            sx={{ flex: 1 }}
                                            multiline
                                            maxRows={5}
                                            rows={3}
                                        />
                                        <Divider />
                                        <Button disabled={!isPermissionEdit && true} small secondary text='excluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                            newUser ? deleteHistoric(valueIdHistoric) : handleDeleteHistoric(historic?.id_historico)
                                        }} />
                                    </ContentContainer>
                                </>
                            ))}
                        </ContentContainer>

                    </ContentContainer>
                }
            </Backdrop>



            <Box sx={{ display: menuView === 'userFiles' ? 'flex' : 'none', gap: 2, flexDirection: 'column' }}>
                {documentsStudent?.map((item, index) => {

                    const fileInsert = filesUser?.filter(file => file?.campo === item?.key)?.length > 0;
                    const associatedFile = filesUser?.find(file => file?.campo === item?.key);

                    const boxBackgroundColor = associatedFile
                        ? parseInt(associatedFile?.aprovado) === 1
                            ? 'rgba(144, 238, 144, 0.7)'
                            : parseInt(associatedFile?.aprovado) === 0
                                ? 'rgba(255, 99, 71, 0.7)'
                                : colorPalette?.secondary
                        : colorPalette?.secondary;

                    const titleTooltip = associatedFile
                        ? parseInt(associatedFile?.aprovado) === 1
                            ? 'Documento aprovado'
                            : parseInt(associatedFile?.aprovado) === 0
                                ? (associatedFile?.motivo_reprovado || '')
                                : ''
                        : '';
                    return (
                        <Box key={index}>
                            <Tooltip title={titleTooltip}>
                                <div>
                                    <Box key={index} sx={{
                                        display: 'flex', padding: '35px 30px',
                                        flexDirection: 'column',
                                        gap: 1,
                                        transition: '.3s',
                                        backgroundColor: boxBackgroundColor,
                                    }}>
                                        <Box sx={{
                                            display: 'flex', padding: '10px 30px',
                                            width: '100%',
                                            borderRadius: 2,
                                            // boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                                            alignItems: 'start',
                                            justifyContent: 'flex-start',
                                            gap: 2,
                                            transition: '.3s',

                                        }}>
                                            <Box sx={{
                                                ...styles.menuIcon,
                                                width: 25, height: 25, aspectRatio: '1/1',
                                                backgroundImage: `url('${item?.icon}')`,
                                                transition: '.3s',
                                                filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',

                                            }} />
                                            <Box sx={{ display: 'flex', gap: .5, alignItems: 'start', flexDirection: 'column' }}>
                                                <Text bold>{item?.text}</Text>
                                                <Text small light>{associatedFile ? 'Documentos Aprovados' : 'Sem documentos anexados.'}</Text>
                                            </Box>
                                            {fileInsert ? (
                                                <CheckCircleIcon style={{ color: 'green', fontSize: 12 }} />
                                            ) : (
                                                <CancelIcon style={{ color: 'red', fontSize: 12 }} />
                                            )}

                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1, padding: '20px', flexDirection: 'column' }}>
                                            {filesUser &&
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    {filesUser?.filter(file => file?.campo === item?.key)?.map((item, index) => {
                                                        const nameFile = item?.name_file || item?.name;
                                                        const typePdf = item?.name?.includes('pdf') || null;
                                                        const fileUrl = item?.location || item?.preview || '';
                                                        return (
                                                            <Link key={index} href={fileUrl} target="_blank">
                                                                <Box sx={{ display: 'flex', gap: 1, backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} >
                                                                    <Tooltip title={decodeURI(nameFile)}>
                                                                        <div>
                                                                            <Box sx={{ display: 'flex', gap: 1, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                                                                <Text small style={{
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    maxWidth: 100
                                                                                }}>{decodeURI(nameFile)}</Text>
                                                                                {/* {isEdit && <Box sx={{
                                                                                ...styles.menuIcon,
                                                                                width: 12,
                                                                                height: 12,
                                                                                aspectRatio: '1:1',
                                                                                backgroundImage: `url(${icons.gray_close})`,
                                                                                transition: '.3s',
                                                                                zIndex: 9999,
                                                                                "&:hover": {
                                                                                    opacity: 0.8,
                                                                                    cursor: 'pointer'
                                                                                }
                                                                            }} onClick={() => handleRemoveFile(item)} />} */}
                                                                            </Box>
                                                                        </div>
                                                                    </Tooltip>

                                                                    <Box
                                                                        sx={{
                                                                            backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : fileUrl}')`,
                                                                            backgroundSize: 'cover',
                                                                            backgroundRepeat: 'no-repeat',
                                                                            backgroundPosition: 'center center',
                                                                            width: { xs: '100%', sm: 100, md: 100, lg: 100, xl: 100 },
                                                                            aspectRatio: '1/1',
                                                                        }} />
                                                                </Box>
                                                            </Link>
                                                        )
                                                    })}
                                                </Box>}

                                        </Box>
                                    </Box>
                                </div>
                            </Tooltip>
                        </Box>
                    )
                })
                }
            </Box>


            {
                (userData.perfil && userData.perfil.includes('aluno') && menuView === 'paymentPerfil') && responsiblePayerData?.nome_resp &&
                <>
                    <ContentContainer style={{ ...styles.containerContract, padding: '40px' }}>
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

                            {responsiblePayerData?.nome_resp && <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button text="Editar" onClick={() => setShowEditPaymentResponsible(true)} />
                            </Box>}
                        </Box>
                    </ContentContainer>

                    {creditCards?.length > 0 &&
                        <ContentContainer style={{ ...styles.containerContract, padding: '40px' }}>
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
                        </ContentContainer>}
                </>
            }


            <Backdrop open={showEditPaymentResponsible} sx={{ zIndex: 99999, }}>
                <ContentContainer style={{
                    maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '280px' },
                    margin: { xs: '0px 10px', md: '0px', lg: '0px' }, overflowY: matches && 'auto',
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                        <Text bold large>Responsável Financeiro</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowEditPaymentResponsible(false)} />
                    </Box>
                    <Divider padding={0} />
                    <ContentContainer style={{ boxShadow: 'none', overflowY: matches && 'auto', }}>

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
                            <TextInput placeholder='CEP' name='cep_resp' onChange={handleChangeResponsibleData} value={responsiblePayerData?.cep_resp || ''} onBlur={handleBlurCEPResp} label='CEP *' sx={{ flex: 1, }} />

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

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button text="Salvar" onClick={() => handleUpdateResponsible()} />
                            <Button cancel text="Cancelar" onClick={() => setShowEditPaymentResponsible(false)} />
                        </Box>
                    </ContentContainer>
                </ContentContainer>
            </Backdrop>




            {(userData.perfil && userData.perfil.includes('aluno') && menuView === 'openEnrollment') &&
                <>
                    <ContentContainer style={{ ...styles.containerContract, padding: '40px', }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', padding: '0px 0px 20px 0px', gap: 1, "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowEnrollmentAdd(!showEnrollmentAdd)}>
                            <Text title bold >Destrancamento de Matrícula</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                transform: 'rotate(0deg)',
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} />
                        </Box>

                        <>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Divider padding={0} />
                                <Text bold title>Dados da Matrícula</Text>
                                <Box sx={styles.inputSection}>
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={classes} valueSelection={enrollmentUnlockingData?.turma_id}
                                        onSelect={(value) => handleSelectDisciplinesGrid(value)}
                                        title="Turma " filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Módulo/Semestre' name='modulo' onChange={handleChangeUnlockingData} type="number" value={enrollmentUnlockingData?.modulo} label='Módulo/Semestre *' sx={{ flex: 1, }} onBlur={(e) => handleSelectModule(e.target.value)} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupEnrollment} valueSelection={enrollmentUnlockingData?.rematricula} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentUnlockingData, rematricula: value })}
                                        title="Cursando Rematrícula? *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupEnrollment} valueSelection={enrollmentUnlockingData?.cursando_dp} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentUnlockingData, cursando_dp: value })}
                                        title="Cursando alguma DP? *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput disabled={!isPermissionEdit && true} name='dt_inicio' onChange={handleChangeUnlockingData} type="date" value={(enrollmentUnlockingData?.dt_inicio)?.split('T')[0] || ''} label='Inicio *' sx={{ flex: 1, }} />
                                    <TextInput disabled={!isPermissionEdit && true} name='dt_final' onChange={handleChangeUnlockingData} type="date" value={(enrollmentUnlockingData?.dt_final)?.split('T')[0] || ''} label='Fim *' sx={{ flex: 1, }} />
                                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupSituation} valueSelection={enrollmentUnlockingData?.status} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentUnlockingData, status: value })}
                                        title="Status/Situação *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={grouPreferPayment} valueSelection={enrollmentUnlockingData?.preferencia_pagamento} onSelect={(value) => setEnrollmentUnlockingData({ ...enrollmentRegisterData, preferencia_pagamento: value })}
                                    title="Preferência de Pagamento: *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />

                                {enrollmentUnlockingData?.disciplinesData?.length > 0 &&
                                    <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', gap: 1.8, marginTop: 2 }}>
                                        <Text bold>Disciplinas que o aluno irá cursar</Text>
                                        {enrollmentUnlockingData?.disciplinesData?.map((mod, index) => {
                                            return (
                                                <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                    <Text bold large>{mod?.modulo_grade}º Módulo</Text>

                                                    <Box key={index} sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                        {mod?.disciplinas?.map((item, index) => (
                                                            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 350 }}>
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: 16,
                                                                        height: 16,
                                                                        borderRadius: 16,
                                                                        cursor: 'pointer',
                                                                        transition: '.5s',
                                                                        border: parseInt(item?.selecionada) > 0 ? '' : `1px solid ${colorPalette.textColor}`,
                                                                        '&:hover': {
                                                                            opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                                                                            boxShadow: parseInt(item?.selecionada) > 0 ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                        }
                                                                    }}
                                                                        onClick={() => {
                                                                            const newValue = parseInt(item?.selecionada) > 0 ? 0 : 1;
                                                                            handleChangeEnrollmentDisciplinesDataDestrancamento(mod?.modulo_grade, item?.disciplina_id, 'selecionada', newValue);
                                                                        }}
                                                                    >
                                                                        {parseInt(item?.selecionada) > 0 ? (
                                                                            <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                                        ) : (
                                                                            <Box
                                                                                sx={{
                                                                                    width: 11,
                                                                                    height: 11,
                                                                                    borderRadius: 11,
                                                                                    cursor: 'pointer',
                                                                                    '&:hover': {
                                                                                        opacity: parseInt(item?.selecionada) > 0 ? 0.8 : 0.6,
                                                                                        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                                    },
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                    <Text bold small>{item?.nome_disciplina}</Text>
                                                                </Box>
                                                                <Divider distance={0} />
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )
                                        })}
                                    </Box>}
                            </Box>
                            {/* <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                                <Button text="Adicionar" small onClick={() => handleAddEnrollmentRegister()} style={{ width: 120, height: 30 }} />
                            </Box> */}
                        </>


                    </ContentContainer >
                </>
            }
        </>
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

export const EditFile = (props) => {
    const {
        open = false,
        onSet = () => { },
        callback = () => { },
        title = '',
        text = '',
        textDropzone = '',
        campo = '',
        tipo = '',
        bgImage = '',
        usuarioId,
        newUser,
        fileData = [],
        columnId = '',
        matriculaId,
        isPermissionEdit,
        courseId,
        setFilesUser,
        filesUser,
        setFileCallback
    } = props

    const { alert, setLoading, matches, theme, colorPalette } = useAppContext()

    const handleDeleteFile = async (files) => {
        setLoading(true)
        const response = await deleteFile({ fileId: files?.[columnId], usuario_id: usuarioId, campo: files.campo, key: files?.key_file, matriculaId, courseId })
        const { status } = response
        let file = {
            status
        }
        if (status === 200) {
            alert.success('Aqruivo removido.');
            callback(file)
        } else {
            alert.error('Ocorreu um erro ao remover arquivo.');
        }
        setLoading(false)
    }


    const onDropFiles = async (files) => {
        try {
            setLoading(true)
            const uploadedFiles = files.map(file => ({
                file,
                id: getRandomInt(1, 999),
                name: file.name,
                preview: URL.createObjectURL(file),
                progress: 0,
                uploaded: false,
                error: false,
                url: null,
                campo: campo,
                tipo: tipo,
                usuario_id: usuarioId,
                matricula_id: matriculaId,
                courseId: courseId
            }));

            const [filePerfil] = uploadedFiles;
            if (campo === 'foto_perfil') {
                setFileCallback(filePerfil);
            }

            setFilesUser(prevFilesDrop => [...prevFilesDrop, ...uploadedFiles]);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleRemoveFile = (file) => {
        const arquivosAtualizados = filesUser.filter((uploadedFile) => uploadedFile.id !== file.id);
        setFilesUser(arquivosAtualizados);
    };


    const statusColor = (data) => ((data === 'Pendente de assinatura' && 'yellow') ||
        (data === 'Assinado' && 'green'))

    return (
        <>
            <Backdrop open={open} sx={{ zIndex: 99999, }}>
                <ContentContainer style={{
                    ...styles.containerFile, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '0px' }, overflowY: matches && 'scroll',
                    maxWidth: 550,
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 2, alignItems: 'center', padding: '0px 0px 8px 0px' }}>
                        <Text bold>{title}</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 15,
                            height: 15,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => {
                            onSet(false)
                        }} />
                    </Box>
                    <Divider />
                    <Box sx={{
                        display: 'flex',
                        whiteSpace: 'wrap',
                        // maxWidth: 280,
                        justifyContent: 'center'
                    }}>
                        <Text>{text}</Text>
                    </Box>
                    {isPermissionEdit &&
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            {!newUser ?
                                <CustomDropzone
                                    txt={textDropzone}
                                    bgImage={bgImage}
                                    bgImageStyle={{
                                        backgroundImage: `url(${bgImage})`,
                                        backgroundSize: campo === 'foto_perfil' ? 'cover' : 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center center',
                                        width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                        borderRadius: campo === 'foto_perfil' ? '50%' : '',
                                        aspectRatio: '1/1',
                                    }}
                                    callback={(file) => {
                                        if (file.status === 201) {
                                            callback(file)
                                        }
                                    }}
                                    usuario_id={usuarioId}
                                    campo={campo}
                                    tipo={tipo}
                                    matricula_id={matriculaId}
                                    courseId={courseId}
                                />
                                : <Dropzone
                                    accept={{ 'image/jpeg': ['.jpeg', '.JPEG', '.jpg', '.JPG'], 'image/png': ['.png', '.PNG'], 'application/pdf': ['.pdf'] }}
                                    onDrop={onDropFiles}
                                    addRemoveLinks={true}
                                    removeLink={(file) => handleRemoveFile(file)}
                                >
                                    {({ getRootProps, getInputProps, isDragActive, isDragReject }) => (
                                        <Box {...getRootProps()}
                                            sx={{
                                                // ...styles.dropZoneContainer,
                                                // border: `2px dashed ${colorPalette.primary + 'aa'}`,
                                                // backgroundColor: isDragActive && !isDragReject ? colorPalette.secondary : isDragReject ? '#ff000042' : colorPalette.primary,
                                            }}
                                        >
                                            <input {...getInputProps()} />
                                            <Box sx={{ textAlign: 'center', display: 'flex', fontSize: 12, gap: 0, alignItems: 'center' }}>
                                                <Button small style={{ height: 25, borderRadius: '6px 0px 0px 6px' }} text="Selecionar" />
                                                <Box sx={{ textAlign: 'center', display: 'flex', border: `1px solid ${(theme ? '#eaeaea' : '#404040')}`, padding: '0px 15px', maxWidth: 400, height: 25, alignItems: 'center' }}>
                                                    <Text light small>{textDropzone}</Text>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Dropzone>}

                        </Box>}

                    {bgImage &&
                        <>
                            <Divider padding={0} />

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column' }}>

                                {newUser &&
                                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text bold>Atual</Text>
                                        <Avatar src={bgImage} sx={{
                                            height: 'auto',
                                            borderRadius: '16px',
                                            width: { xs: 150, sm: 150, md: 200, lg: 250 },
                                            aspectRatio: '1/1',
                                        }} variant="square" />
                                    </Box>
                                }
                                <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                    <Button disabled={!isPermissionEdit && true} secondary small text='Remover' style={{ padding: '5px 10px 5px 10px', width: 120 }}
                                        onClick={() => {
                                            if (newUser) {
                                                callback("")
                                                setFileCallback({})
                                            } else {
                                                handleDeleteFile()
                                            }
                                        }} />
                                </Box>
                            </Box>
                        </>
                    }

                    {campo != 'foto_perfil' && fileData?.length > 0 &&
                        <ContentContainer style={{ boxShadow: 'none', padding: '15px' }}>
                            <Text bold>Arquivos</Text>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflow: 'auto', padding: '15px 10px' }}>
                                {fileData?.map((file, index) => {
                                    const typePdf = file?.name_file
                                        ?.includes('pdf') || null;
                                    const fileName = file?.name_file || file?.name
                                    const fileLocation = file?.location || file?.preview
                                    return (
                                        <Box key={`${file}-${index}`} sx={{
                                            display: 'flex', flexDirection: 'column',
                                            gap: 1,
                                            maxWidth: '200px',
                                            padding: '10px 8px', backgroundColor: colorPalette?.primary, borderRadius: 2
                                        }}>

                                            <Link
                                                style={{ display: 'flex', position: 'relative', border: `1px solid gray`, borderRadius: '8px' }}
                                                href={fileLocation || ''} target="_blank">
                                                <Box
                                                    sx={{
                                                        backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : fileLocation}')`,
                                                        backgroundSize: 'contain',
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: 'center center',
                                                        width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                                        aspectRatio: '1/1',
                                                    }}>
                                                </Box>
                                                {isPermissionEdit && <Box sx={{
                                                    backgroundSize: "cover",
                                                    backgroundRepeat: "no-repeat",
                                                    backgroundPosition: "center",
                                                    width: 22,
                                                    height: 22,
                                                    backgroundImage: `url(/icons/remove_icon.png)`,
                                                    position: 'absolute',
                                                    top: -5,
                                                    right: -5,
                                                    transition: ".3s",
                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: "pointer",
                                                    },
                                                    zIndex: 9999999,
                                                }} onClick={(event) => {
                                                    event.preventDefault()
                                                    if (newUser) {
                                                        handleRemoveFile(file)
                                                    } else {
                                                        handleDeleteFile(file)
                                                    }
                                                }} />}
                                            </Link>
                                            <Box sx={{ display: 'flex', gap: .5, padding: '5px', borderRadius: 2, flexDirection: 'column', backgroundColor: colorPalette?.secondary }}>
                                                <Text xsmall sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Nome: <strong>{decodeURIComponent(fileName)}</strong>
                                                </Text>
                                                {file?.dt_criacao && <Text xsmall sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    Dt Criação: <strong>{formatTimeStamp(file?.dt_criacao, true)}</strong>
                                                </Text>}
                                                {(columnId === 'id_contrato_aluno' && file?.status_assinaturas) &&
                                                    <Box sx={{ display: 'flex', gap: .3 }}>
                                                        <Text xsmall sx={{ whiteSpace: 'nowrap' }}>
                                                            Status:</Text>
                                                        <Box sx={{ display: 'flex', padding: '2px 5px', backgroundColor: statusColor(file?.status_assinaturas), borderRadius: 2 }}>
                                                            <Text bold xsmall sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {file?.status_assinaturas}
                                                            </Text>
                                                        </Box>
                                                    </Box>
                                                }
                                            </Box>
                                        </Box>
                                    )
                                })}
                            </Box>
                        </ContentContainer>
                    }
                </ContentContainer>
            </Backdrop>
        </>
    )
}
