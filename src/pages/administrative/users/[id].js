import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { Avatar, Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, PhoneInputField, FileInput } from "../../../atoms"
import { CheckBoxComponent, CustomDropzone, RadioItem, SectionHeader, TableOfficeHours, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createContract, createEnrollment, createUser, deleteFile, deleteUser, editContract, editeEnrollment, editeUser } from "../../../validators/api-requests"
import { emailValidator, formatCEP, formatCPF, formatDate, formatRg, formatTimeStamp } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"
import Link from "next/link"
import { da } from "date-fns/locale"

export default function EditUser() {
    const { setLoading, alert, colorPalette, user, matches, theme, setShowConfirmationDialog } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newUser = id === 'new';
    const [perfil, setPerfil] = useState('')
    const [fileCallback, setFileCallback] = useState()
    const [bgPhoto, setBgPhoto] = useState({})
    const [userData, setUserData] = useState({
        autista: null,
        superdotacao: null,
        cpf: null,
        naturalidade: null,
        nacionalidade: null,
        estado_civil: null,
        conjuge: null,
        email_melies: null,
        nome_pai: null,
        nome_mae: null,
        escolaridade: null,
        genero: null,
        cor_raca: null,
        deficiencia: null,
        doc_estrangeiro: null,
        pais_origem: 'Brasil',
        telefone_emergencia: null,
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
        foto_perfil_id: bgPhoto?.location || fileCallback?.filePreview || null,
        nome_social: null
    })
    const [contract, setContract] = useState({
        funcao: null,
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
    })
    const [enrollmentData, setEnrollmentData] = useState([])
    const [countries, setCountries] = useState([])
    const [courses, setCourses] = useState([])
    const [classes, setClasses] = useState([])
    const [classesEnrollment, setClassesEnrollment] = useState([])
    const [period, setPeriod] = useState([])
    const [periodSelected, setPeriodSelected] = useState([])
    const [classesInterest, setClassesInterest] = useState([])
    const [groupPermissions, setGroupPermissions] = useState([])
    const [permissionPerfil, setPermissionPerfil] = useState()
    const [permissionPerfilBefore, setPermissionPerfilBefore] = useState()
    const [foreigner, setForeigner] = useState(false)
    const [showContract, setShowContract] = useState(false)
    const [showEnrollment, setShowEnrollment] = useState(false)
    const [showSelectiveProcess, setShowSelectiveProcess] = useState(false)
    const [selectiveProcessData, setSelectiveProcessData] = useState({
        agendamento_processo: '',
        nota_processo: '',
        status_processo: '',
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [interests, setInterests] = useState({});
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
        contractStudent: false
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
    const [testSelectiveProcess, setTestSelectiveProcess] = useState('')
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
    const [enrollmentStudentEditId, setEnrollmentStudentEditId] = useState()
    const [enrollmentStudentEditData, setEnrollmentStudentEditData] = useState({})
    const [disciplines, setDisciplines] = useState([])
    const [installmentsStudent, setInstallmentsStudent] = useState([])
    const [showEditPhoto, setShowEditPhoto] = useState(false)


    useEffect(() => {
        setPerfil(slug)
        findCountries()
        listCourses()
        listPermissions()
        listDisciplines()
    }, [slug])

    useEffect(() => {
        listClass()
    }, [enrollmentData?.curso_id, interests.curso_id, interestSelected?.curso_id])


    const getUserData = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            setUserData(data.response)
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
        setLoading(true)
        try {
            const response = await api.get(`/user/historical/${id}`)
            const { data } = response
            setArrayHistoric(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getPhoto = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/photo/${id}`)
            const { data } = response
            setBgPhoto(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const getPhotoNewUser = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/photo/${fileCallback?.id_foto_perfil}`)
            const { data } = response
            setBgPhoto(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getFileUser = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/files/${id}`)
            const { data } = response
            setFilesUser(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const getContractStudent = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/student/enrollment/contracts/${id}`)
            const { data } = response
            if (data.length > 0) {
                setContractStudent(data)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getOfficeHours = async () => {
        setLoading(true)
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
        } finally {
            setLoading(false)
        }
    }

    const getInstallments = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/student/installment/user/${id}`)
            const { data = [] } = response
            if (data?.length > 0) {
                setInstallmentsStudent(data)
                return
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const getPermissionUser = async () => {
        setLoading(true)
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
        } finally {
            setLoading(false)
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

    useEffect(() => {
        if (newUser && fileCallback?.id_foto_perfil) {
            getPhotoNewUser()
        }
    }, [fileCallback])

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
            const groupCourses = data.map(course => ({
                label: course.nome_curso,
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
            const groupClass = data.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma
            }));

            const groupPeriod = data.map(turma => ({
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



    async function listClassesInterest(id_course) {

        try {
            const response = await api.get(`/class/course/${id_course}`)
            const { data = [] } = response
            const groupClass = data.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma
            }));

            const groupPeriod = data.map(turma => ({
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
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
        }
    }

    async function autoEmailMelies(email) {
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

    const handleBlurCEP = (event) => {
        const { value } = event.target;
        findCEP(value);
    };

    const handleItems = async () => {
        setLoading(true)
        try {
            await getUserData()
            await getEnrollment()
            getContract()
            getInterest()
            getHistoric()
            getPhoto()
            getFileUser()
            getContractStudent()
            getOfficeHours()
            getPermissionUser()
            getDependent()
            getDisciplineProfessor()
            await listClass()
            getInstallments()
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

    const handleBlurNota = (event) => {

        let nota = event.target.value;

        if (nota >= 51) {
            setSelectiveProcessData({ ...selectiveProcessData, status_processo: 'Aprovado - pré-matricula' })
            return
        }
        if (nota < 50) {
            setSelectiveProcessData({ ...selectiveProcessData, status_processo: 'Reprovado' })
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

    const handleChangeHistoric = (value) => {

        setHistoricData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleChangeInterest = (value, field) => {

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
        setDependent((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
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
                curso_id: interests.curso_id,
                turma_id: interests.turma_id,
                nome_curso: interests.nome_curso,
                nome_turma: interests.nome_turma,
                periodo_interesse: interests.periodo_interesse,
                observacao_int: interests.observacao_int || '',
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

        return true
    }

    const handleCreateUser = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await createUser(userData, arrayInterests, arrayHistoric, arrayDisciplinesProfessor, usuario_id)
                const { data } = response
                if (userData?.perfil?.includes('funcionario')) { await createContract(data?.userId, contract) }
                if (fileCallback) { await api.patch(`/file/edit/${fileCallback?.id_foto_perfil}/${data?.userId}`) }
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
                    if (data?.userId) router.push(`/administrative/users/list`)
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
                if (contract) { await editContract({ id, contract }) }
                if (!(officeHours.filter((item) => item?.id_hr_trabalho).length > 0)) {
                    await api.post(`/officeHours/create/${id}`, { officeHours })
                }
                if (officeHours?.map((item) => item.id_hr_trabalho).length > 0) {
                    await api.patch(`/officeHours/update`, { officeHours })
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

    const addDependent = () => {
        setArrayDependent((prevArray) => [...prevArray, { nome_dependente: dependent.nome_dependente }])
        setDependent({ nome_dependente: '' })
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

    const handleEditDependent = async (id_dependente) => {
        setLoading(true)
        try {
            const response = await api.patch(`/user/dependent/update/${id_dependente}`, { dependent })
            if (response?.status === 201) {
                alert.success('Dependente Atualizado')
                setDependent({})
                handleItems()
            }
        } catch (error) {
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


    const toggleEnrollTable = (index) => {
        setShowEnrollTable(prevState => ({
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

    const groupProfessor = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const groupCertificate = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const groupAdmin = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const groupRacaCor = [
        { label: 'Prefiro não declarar', value: 'Prefiro não declarar' },
        { label: 'Branca', value: 'Branca' },
        { label: 'Preta', value: 'Preta' },
        { label: 'Parda', value: 'Parda' },
        { label: 'Amarela', value: 'Amarela' },
        { label: 'Indigena', value: 'Indigena' },
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

    const groupStatusProcess = [
        { label: 'Aprovado - pré-matricula', value: 'Aprovado - pré-matricula' },
        { label: 'Reprovado', value: 'Reprovado' },
        { label: 'Pendente de nota', value: 'Pendente de nota' },
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
        { label: 'Turma cancelada', value: 'Turma cancelada' },
        { label: 'Aprovado', value: 'Aprovado' },
        { label: 'Reprovado', value: 'Reprovado' },
        { label: 'Bloq. Online', value: 'Bloq. Online' },
        { label: 'Matrícula cancelada', value: 'Matrícula cancelada' },
        { label: 'Transferido ', value: 'Transferido ' },
        { label: 'Desistente ', value: 'Desistente ' },
        { label: 'Nenhuma', value: 'Nenhuma' },
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
        { label: 'Baixa visão', value: 'Baixa visão' },
        { label: 'Deficiência intelectual', value: 'Deficiência intelectual' },
        { label: 'Cegueira', value: 'Cegueira' },
        { label: 'Surdez', value: 'Surdez' },
        { label: 'Deficiência auditiva', value: 'Deficiência auditiva' },
        { label: 'Surdocegueira', value: 'Surdocegueira' },
        { label: 'Deficiência fisica', value: 'Deficiência fisica' }
    ]

    const groupAutism = [
        {
            label: 'Transtorno global do desenvolvimento (TGD)/Transtorno do espectro autista (TEA)',
            value: 'Transtorno global do desenvolvimento (TGD)/Transtorno do espectro autista (TEA)'
        },
    ]

    const groupSuperGifted = [
        {
            label: 'Altas habilidades/superdotação',
            value: 'Altas habilidades/superdotação'
        },
    ]

    const groupForeigner = [
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

    return (
        <>
            <SectionHeader
                perfil={userData?.perfil}
                title={userData?.nome || `Novo ${userData?.perfil === 'funcionario' && 'Funcionário' || userData?.perfil === 'aluno' && 'Aluno' || userData?.perfil === 'interessado' && 'Interessado' || 'Usuário'}`}
                saveButton
                saveButtonAction={newUser ? handleCreateUser : handleEditUser}
                deleteButton={!newUser}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteUser })}
            />

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                    <Box>
                        <Text title bold style={{}}>Contato</Text>
                    </Box>

                    <EditFile
                        columnId="id_foto_perfil"
                        open={showEditFile.photoProfile}
                        newUser={newUser}
                        onSet={(set) => {
                            setShowEditFiles({ ...showEditFile, photoProfile: set })
                        }}
                        title='Foto de perfil'
                        text='Para alterar sua foto de perfil, clique ou arraste no local desejado.'
                        textDropzone='Arraste ou clique para selecionar a Foto que deseja'
                        fileData={bgPhoto}
                        usuarioId={id}
                        campo='foto_perfil'
                        tipo='foto'
                        bgImage={bgPhoto?.location || fileCallback?.filePreview}
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
                <Box sx={{ ...styles.inputSection, whiteSpace: 'nowrap', alignItems: 'end', gap: 4 }}>
                    <Box sx={{ ...styles.inputSection, flexDirection: 'column', }}>
                        <Box sx={{ ...styles.inputSection }}>
                            <TextInput placeholder='Nome Completo' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome Completo *' onBlur={autoEmailMelies} sx={{ flex: 1, }} />
                            <TextInput placeholder='Nome Social' name='nome_social' onChange={handleChange} value={userData?.nome_social || ''} label='Nome Social' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={{ ...styles.inputSection }}>
                            <TextInput placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail *' sx={{ flex: 1, }} />
                            <PhoneInputField
                                label='Telefone *'
                                name='telefone'
                                onChange={(phone) => setUserData({ ...userData, telefone: phone })}
                                value={userData?.telefone}
                                sx={{ flex: 1, }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ position: 'relative', justifyContent: 'center', alignItems: 'center', '&:hover': { opacity: 0.8, cursor: 'pointer' }, }}
                        onMouseEnter={() => setShowEditPhoto(true)}
                        onMouseLeave={() => setShowEditPhoto(false)}>
                        <Avatar src={bgPhoto?.location || fileCallback?.filePreview} sx={{
                            height: 'auto',
                            borderRadius: '16px',
                            width: { xs: '100%', sm: 150, md: 150, lg: 180 },
                            aspectRatio: '1/1',
                        }} variant="square" onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })} />
                        {showEditPhoto &&
                            <Box sx={{ display: 'flex', position: 'absolute', justifyContent: 'center', alignItems: 'center', transition: '.3s', top: 0, bottom: 0, left: 0, right: 0 }}>
                                <Button
                                    small
                                    style={{ borderRadius: '8px', padding: '5px 10px', transition: '.3s', }}
                                    text='editar'
                                    onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })}
                                />
                            </Box>}
                    </Box>
                </Box>
                <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25 }}>
                    <CheckBoxComponent
                        valueChecked={userData?.perfil}
                        boxGroup={groupPerfil}
                        title="Perfil *"
                        horizontal={mobile ? false : true}
                        onSelect={(value) => setUserData({
                            ...userData,
                            perfil: value,
                            admin_melies: !value.includes('funcionario') ? 0 : 1,
                            portal_aluno: !value.includes('aluno') ? 0 : 1,
                        })}
                        sx={{ flex: 1, }}
                    />

                </Box>
                <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25, padding: '0px 0px 20px 15px' }}>

                    {(userData?.perfil?.includes('interessado') || userData?.perfil?.includes('aluno') || arrayInterests?.length > 0) &&
                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                            <Text bold small>Lista de interesses:</Text>
                            <Button small text='interesses' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                        </Box>}
                    {!newUser &&
                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                            <Text bold small>Observações do {userData?.perfil}:</Text>
                            <Button small text='observação' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, historic: true })} />
                        </Box>
                    }

                </Box>
                <RadioItem valueRadio={userData?.ativo} group={groupStatus} title="Status *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({
                    ...userData,
                    ativo: parseInt(value),
                    admin_melies: value < 1 ? parseInt(value) : userData?.admin_melies,
                    portal_aluno: value < 1 ? parseInt(value) : userData?.admin_melies
                })} />
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
                        <Box sx={{ ...styles.inputSection, whiteSpace: 'nowrap', alignItems: 'end', gap: 4 }}>
                            <Box sx={{ ...styles.inputSection, flexDirection: 'column', }}>
                                <Box sx={{ ...styles.inputSection }}>
                                    <TextInput placeholder='Login' name='login' onChange={handleChange} value={userData?.login || ''} label='Login *' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Nascimento' name='nascimento' onChange={handleChange} type="date" value={(userData?.nascimento)?.split('T')[0] || ''} label='Nascimento *' sx={{ flex: 1, }} />
                                </Box>
                            </Box>
                        </Box>
                        {!newUser && <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 1.8 }}>
                            <TextInput placeholder='Nova senha' name='nova_senha' onChange={handleChange} value={userData?.nova_senha || ''} type="password" label='Nova senha' sx={{ flex: 1, }} />
                            <TextInput placeholder='Confirmar senha' name='confirmar_senha' onChange={handleChange} value={userData?.confirmar_senha || ''} type="password" label='Confirmar senha' sx={{ flex: 1, }} />
                        </Box>}
                        {userData?.perfil.includes('funcionario') && <RadioItem valueRadio={userData?.admin_melies} group={groupAdmin} title="Acesso ao AdminMéliès *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, admin_melies: parseInt(value) })} />}
                        {userData?.perfil.includes('aluno') && <RadioItem valueRadio={userData?.portal_aluno} group={groupAdmin} title="Acesso ao Portal do aluno *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, portal_aluno: parseInt(value) })} />}
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
                                <ContentContainer style={{ boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                        <Text bold>Grupo de permissões</Text>
                                        <CheckBoxComponent
                                            boxGroup={groupPermissions}
                                            valueChecked={permissionPerfil || ''}
                                            horizontal={false}
                                            onSelect={(value) => {
                                                setPermissionPerfil(value)
                                            }}
                                            sx={{ width: 1 }} />
                                    </Box>
                                </ContentContainer>
                                <Box style={{ display: 'flex' }}>
                                    <Button small
                                        style={{ width: '50%', marginRight: 1, height: 30 }}
                                        text='Salvar'
                                        onClick={() => {
                                            !newUser ? handleAddPermission() :
                                                alert.info('Permissões atualizadas')
                                            setShowSections({ ...showSections, permissions: false })
                                        }}
                                    />
                                    <Button secondary small
                                        style={{ width: '50%', height: 30 }}
                                        text='Cancelar'
                                        onClick={() => setShowSections({ ...showSections, permissions: false })}
                                    />
                                </Box>
                            </ContentContainer>
                        </Backdrop>

                        <RadioItem valueRadio={userData?.professor}
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
                                                <SelectList
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
                                    <SelectList
                                        clean={false}
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
                            <CheckBoxComponent
                                boxGroup={groupForeigner}
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
                                <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, cpf: value })}>
                                    <TextInput placeholder='CPF' name='cpf' onChange={handleChange} value={userData?.cpf || ''} label='CPF' sx={{ flex: 1, }} />
                                </FileInput>
                            }
                            <EditFile
                                columnId="id_doc_usuario"
                                open={showEditFile.cpf}
                                newUser={newUser}
                                onSet={(set) => {
                                    setShowEditFiles({ ...showEditFile, cpf: set })
                                }}
                                title='CPF - Frente e verso'
                                text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                textDropzone='Arraste ou clique para selecionar a Foto que deseja'
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
                                <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, foreigner: value })}>
                                    <TextInput placeholder='Doc estrangeiro' name='doc_estrangeiro' onChange={handleChange} value={userData?.doc_estrangeiro || ''} label='Doc estrangeiro' sx={{ flex: 1, }} />
                                    <EditFile
                                        columnId="id_doc_usuario"
                                        open={showEditFile.foreigner}
                                        newUser={newUser}
                                        onSet={(set) => {
                                            setShowEditFiles({ ...showEditFile, foreigner: set })
                                        }}
                                        title='Documento estrangeiro - Frente e verso'
                                        text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar a Foto que deseja'
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
                            <TextInput placeholder='Cidade' name='naturalidade' onChange={handleChange} value={userData?.naturalidade || ''} label='Naturalidade *' sx={{ flex: 1, }} />

                            <SelectList fullWidth data={countries} valueSelection={userData?.pais_origem || ''} onSelect={(value) => setUserData({ ...userData, pais_origem: value })}
                                title="Pais de origem *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <SelectList fullWidth data={groupNationality} valueSelection={userData?.nacionalidade || ''} onSelect={(value) => setUserData({ ...userData, nacionalidade: value })}
                                title="Nacionalidade *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>

                        <Box sx={styles.inputSection}>

                            <SelectList fullWidth data={groupRacaCor} valueSelection={userData.cor_raca} onSelect={(value) => setUserData({ ...userData, cor_raca: value })}
                                title="Etnia *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />

                            <SelectList fullWidth data={groupGender} valueSelection={userData?.genero} onSelect={(value) => setUserData({ ...userData, genero: value })}
                                title="Gênero *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />

                            <SelectList fullWidth data={groupDisability} valueSelection={userData?.deficiencia} onSelect={(value) => setUserData({ ...userData, deficiencia: value })}
                                title="Deficiência Física*" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />

                        </Box>

                        {userData?.deficiencia?.includes('Sim') &&
                            <>
                                <CheckBoxComponent
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

                                <CheckBoxComponent
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

                                <CheckBoxComponent
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

                        <RadioItem valueRadio={userData?.estado_civil} group={groupCivil} title="Estado Cívil *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, estado_civil: value })} />
                        <TextInput placeholder='E-mail Méliès' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail Méliès' />

                        <Box sx={{ maxWidth: '580px', margin: '10px 0px 10px 0px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Text bold style={{ padding: '0px 0px 0px 10px' }}>Dependentes</Text>
                            {arrayDependent.map((dep, index) => (
                                <>

                                    <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                        <TextInput placeholder='Nome' name={`nome_dependente-${index}`} onChange={handleChangeDependent} value={dep.nome_dependente} sx={{ flex: 1 }} />

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
                                            newUser ? deleteDependent(index) : handleDeleteDependent(dep?.id_dependente)
                                        }} />
                                    </Box>
                                </>
                            ))}
                            <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput placeholder='Nome' name={`nome_dependente`} onChange={handleChangeDependent} value={dependent.nome_dependente} sx={{ flex: 1 }} />
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
                            </Box>
                        </Box>


                        <Box sx={styles.inputSection}>
                            {userData?.estado_civil === 'Casado' && <TextInput placeholder='Conjuge' name='conjuge' onChange={handleChange} value={userData?.conjuge || ''} label='Conjuge' sx={{ flex: 1, }} />}
                            <TextInput placeholder='Nome do Pai' name='nome_pai' onChange={handleChange} value={userData?.nome_pai || ''} label='Nome do Pai' sx={{ flex: 1, }} />
                            <TextInput placeholder='Nome da Mãe' name='nome_mae' onChange={handleChange} value={userData?.nome_mae || ''} label='Nome da Mãe *' sx={{ flex: 1, }} />

                        </Box>
                        <ContentContainer>
                            <Text large bold >Contato de Emergência</Text>
                            <Box sx={styles.inputSection}>
                                <TextInput placeholder='Nome' name='nome_emergencia' onChange={handleChange} value={userData?.nome_emergencia || ''} label='Nome' sx={{ flex: 1, }} />
                                <PhoneInputField
                                    label='Telefone de emergência'
                                    placeholder='(11) 91234-6789'
                                    name='telefone_emergencia'
                                    onChange={(phone) => setUserData({ ...userData, telefone_emergencia: phone })}
                                    value={userData?.telefone_emergencia}
                                    sx={{ flex: 1, }}
                                />
                            </Box>
                        </ContentContainer>
                        <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, schoolRecord: value })} style={{ alignItems: 'center' }}>
                            <RadioItem valueRadio={userData?.escolaridade} group={groupEscolaridade} title="Escolaridade *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, escolaridade: value })} />
                            <EditFile
                                columnId="id_doc_usuario"
                                open={showEditFile.schoolRecord}
                                newUser={newUser}
                                onSet={(set) => {
                                    setShowEditFiles({ ...showEditFile, schoolRecord: set })
                                }}
                                title='Historico Escolar/Diploma'
                                text='Por favor, faça o upload do seu histórico escolar. Caso você tenha concluído um bacharelado,
                                 por favor, também faça o upload do seu diploma.'
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
                        <Box sx={styles.inputSection}>
                            <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, address: value })}>
                                <TextInput placeholder='CEP' name='cep' onChange={handleChange} value={userData?.cep || ''} label='CEP *' onBlur={handleBlurCEP} sx={{ flex: 1, }} />
                                <EditFile
                                    columnId="id_doc_usuario"
                                    open={showEditFile.address}
                                    newUser={newUser}
                                    onSet={(set) => {
                                        setShowEditFiles({ ...showEditFile, address: set })
                                    }}
                                    title='Comprovante de residencia'
                                    text='Faça o upload do seu comprovante de residencia, precisa ser uma conta em seu nome ou comprovar que mora com o titular da conta.'
                                    textDropzone='Arraste ou clique para selecionar a Foto que deseja'
                                    fileData={filesUser?.filter((file) => file.campo === 'comprovante residencia')}
                                    usuarioId={id}
                                    campo='comprovante residencia'
                                    tipo='documento usuario'
                                    callback={(file) => {
                                        if (file.status === 201 || file.status === 200) {
                                            if (!newUser) { handleItems() }
                                            else {
                                                handleChangeFilesUser('comprovante residencia', file.fileId, file.filePreview)
                                            }
                                        }
                                    }}
                                />
                            </FileInput>
                            <TextInput placeholder='Endereço' name='rua' onChange={handleChange} value={userData?.rua || ''} label='Endereço *' sx={{ flex: 1, }} />
                            <TextInput placeholder='Nº' name='numero' onChange={handleChange} value={userData?.numero || ''} label='Nº *' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput placeholder='Cidade' name='cidade' onChange={handleChange} value={userData?.cidade || ''} label='Cidade *' sx={{ flex: 1, }} />
                            <TextInput placeholder='UF' name='uf' onChange={handleChange} value={userData?.uf || ''} label='UF *' sx={{ flex: 1, }} />
                            <TextInput placeholder='Bairro' name='bairro' onChange={handleChange} value={userData?.bairro || ''} label='Bairro *' sx={{ flex: 1, }} />
                            <TextInput placeholder='Complemento' name='complemento' onChange={handleChange} value={userData?.complemento || ''} label='Complemento' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <FileInput onClick={(value) => setShowEditFiles({ ...showEditFile, rg: value })}>
                                <TextInput placeholder='RG' name='rg' onChange={handleChange} value={userData?.rg || ''} label='RG *' sx={{ flex: 1, }} />
                                <EditFile
                                    columnId="id_doc_usuario"
                                    open={showEditFile.rg}
                                    newUser={newUser}
                                    onSet={(set) => {
                                        setShowEditFiles({ ...showEditFile, rg: set })
                                    }}
                                    title='RG - Frente e verso'
                                    text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                    textDropzone='Arraste ou clique para selecionar a Foto que deseja'
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
                            <TextInput placeholder='UF' name='uf_rg' onChange={handleChange} value={userData?.uf_rg || ''} label='UF RG *' sx={{ flex: 1, }} />
                            <TextInput placeholder='Expedição' name='expedicao' onChange={handleChange} type="date" value={(userData?.expedicao)?.split('T')[0] || ''} label='Expedição *' sx={{ flex: 1, }} />
                            <TextInput placeholder='Orgão' name='orgao' onChange={handleChange} value={userData?.orgao || ''} label='Orgão *' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput placeholder='Título de Eleitor' name='titulo' onChange={handleChange} value={userData?.titulo || ''} label='Título de Eleitor' sx={{ flex: 1, }} />
                            <TextInput placeholder='Zona' name='zona' onChange={handleChange} value={userData?.zona || ''} label='Zona' sx={{ flex: 1, }} />
                            <TextInput placeholder='Seção' name='secao' onChange={handleChange} value={userData?.secao || ''} label='Seção' sx={{ flex: 1, }} />
                        </Box>

                    </>
                }
            </ContentContainer>

            {/* contrato */}
            {userData.perfil && userData.perfil.includes('funcionario') &&
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
                                    <TextInput placeholder='Função' name='funcao' onChange={handleChangeContract} value={contract?.funcao || ''} label='Função' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Cartão de Ponto' name='cartao_ponto' onChange={handleChangeContract} value={contract?.cartao_ponto || ''} label='Cartão de Ponto' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput placeholder='Admissão' name='admissao' type="date" onChange={handleChangeContract} value={(contract?.admissao)?.split('T')[0] || ''} label='Admissão' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Desligamento' name='desligamento' type="date" onChange={handleChangeContract} value={contract?.desligamento?.split('T')[0] || ''} label='Desligamento' sx={{ flex: 1, }} onBlur={() => {
                                        new Date(contract?.desligamento) > new Date(1001, 0, 1) &&
                                            setUserData({ ...userData, ativo: 0, admin_melies: contract?.desligamento ? 0 : userData?.admin_melies })
                                    }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput placeholder='CTPS' name='ctps' onChange={handleChangeContract} value={contract?.ctps || ''} label='CTPS' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Série' name='serie' onChange={handleChangeContract} value={contract?.serie || ''} label='Série' sx={{ flex: 1, }} />
                                    <TextInput placeholder='PIS' name='pis' onChange={handleChangeContract} value={contract?.pis || ''} label='PIS' sx={{ flex: 1, }} />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput placeholder='Banco' name='banco_1' onChange={handleChangeContract} value={contract?.banco_1 || ''} label='Banco' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Conta' name='conta_1' onChange={handleChangeContract} value={contract?.conta_1 || ''} label='Conta' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Agência' name='agencia_1' onChange={handleChangeContract} value={contract?.agencia_1 || ''} label='Agência' sx={{ flex: 1, }} />
                                    <SelectList fullWidth data={groupAccount} valueSelection={contract?.tipo_conta_1} onSelect={(value) => setContract({ ...contract, tipo_conta_1: value })}
                                        title="Tipo de conta" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>
                                <Box sx={styles.inputSection}>
                                    <TextInput placeholder='Banco 2' name='banco_2' onChange={handleChangeContract} value={contract?.banco_2 || ''} label='Banco 2' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Conta 2' name='conta_2' onChange={handleChangeContract} value={contract?.conta_2 || ''} label='Conta 2' sx={{ flex: 1, }} />
                                    <TextInput placeholder='Agência 2' name='agencia_2' onChange={handleChangeContract} value={contract?.agencia_2 || ''} label='Agência 2' sx={{ flex: 1, }} />
                                    <SelectList fullWidth data={groupAccount} valueSelection={contract?.tipo_conta_2} onSelect={(value) => setContract({ ...contract, tipo_conta_2: value })}
                                        title="Tipo de conta 2" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    />
                                </Box>

                                <ContentContainer style={{ boxShadow: 'none' }}>
                                    <Box sx={{ display: 'flex', gap: 5, flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                                            <Text bold title>Horário de trabalho</Text>
                                            {officeHours && <Box sx={{ display: 'flex' }}>
                                                <Button small text='replicar' style={{ padding: '5px 16px 5px 16px' }} onClick={replicateToDaysWork} />
                                            </Box>}
                                        </Box>
                                        <TableOfficeHours data={officeHours} onChange={handleOfficeHours} />
                                    </Box>
                                </ContentContainer>

                            </>
                        }
                    </ContentContainer>

                </>}

            {userData.perfil && userData.perfil.includes('aluno') &&
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

                            {enrollmentData ?
                                enrollmentData?.map((item, index) => {
                                    const className = item?.nome_turma;
                                    const courseName = item?.nome_curso;
                                    const period = item?.periodo;
                                    const startDate = formatDate(item.dt_inicio)
                                    const title = `${className} - ${courseName} - ${startDate} - ${period}`
                                    const enrollmentId = item?.id_matricula;
                                    const files = contractStudent?.filter((file) => file?.matricula_id === enrollmentId);
                                    const bgImagePdf = files?.name_file?.includes('pdf') ? '/icons/pdf_icon.png' : files?.location
                                    const installments = installmentsStudent?.filter(item => item.matricula_id === item?.enrollmentId)

                                    return (

                                        <ContentContainer key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                            </Box>
                                            {showEnrollTable[index] && (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '20px 0px 0px 0px' }}>
                                                    <Box sx={styles.inputSection}>
                                                        <SelectList fullWidth data={classes} valueSelection={item?.turma_id} clean={false}
                                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                        />
                                                        <TextInput placeholder='Pendências' name='pendencia_aluno' value={item?.pendencia_aluno || ''} label='Pendências' sx={{ flex: 1, }} />
                                                    </Box>
                                                    <Box sx={styles.inputSection}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1, padding: '10px 0px 10px 5px' }}>
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
                                                    </Box>
                                                    <Box sx={styles.inputSection}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1, padding: '10px 0px 10px 5px' }}>
                                                            <Text bold>Boleto:</Text>
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
                                                                backgroundImage: `url('${icons.file}')`,
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
                                                        </Box>
                                                    </Box>

                                                    <Box sx={styles.inputSection}>
                                                        <TextInput name='dt_inicio' type="date" value={(item?.dt_inicio)?.split('T')[0] || ''} label='Inicio' sx={{ flex: 1, }} />
                                                        <TextInput name='dt_final' type="date" value={(item?.dt_final)?.split('T')[0] || ''} label='Fim' sx={{ flex: 1, }} />
                                                        <SelectList fullWidth data={groupSituation} valueSelection={item?.status} clean={false}
                                                            title="Status/Situação" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                        />
                                                    </Box>
                                                    {
                                                        enrollmentData.status?.includes('Desistente') &&
                                                        <>

                                                            <CheckBoxComponent
                                                                valueChecked={item?.motivo_desistencia || ''}
                                                                boxGroup={groupReasonsDroppingOut}
                                                                title="Motivo da desistência"
                                                                horizontal={mobile ? false : true}
                                                                sx={{ width: 1 }}
                                                            />
                                                            <TextInput name='dt_desistencia' type="date" value={(item?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                                                        </>
                                                    }
                                                    <RadioItem valueRadio={item?.certificado_emitido}
                                                        group={groupCertificate}
                                                        title="Certificado emitido:"
                                                        horizontal={mobile ? false : true}
                                                    />
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Usuário responsável:</Text>
                                                        <Text bold>{item?.nome_usuario_resp}</Text>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Data de criação:</Text>
                                                        <Text>{formatTimeStamp(item?.dt_criacao)}</Text>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 1.8, alignItems: 'center' }}>
                                                        <Text bold>Notas, frequências, atividades complementares:</Text>
                                                        <Link href={`/academic/teacherArea/${id}`} target="_blank">
                                                            <Button small text="vizualizar" style={{ width: 105, height: 25, alignItems: 'center' }} />
                                                        </Link>

                                                    </Box>
                                                    <Button secondary small text="editar matrícula" style={{ width: 140, height: 30, alignItems: 'center' }} onClick={() => {
                                                        setEnrollmentStudentEditId(item?.id_matricula)
                                                        handleEnrollStudentById(item?.id_matricula)
                                                        setShowSections({ ...showSections, editEnroll: true })
                                                    }} />
                                                </Box>
                                            )}
                                        </ContentContainer>

                                    )
                                })
                                :
                                <Text light> Não encontramos matrículas cadastradas.</Text>}
                            <Button text="Nova matrícula" style={{ width: 150, marginTop: 3 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                        </Box>
                    }

                </ContentContainer >
            }

            <Backdrop open={showSections?.editEnroll} sx={{ zIndex: 999 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                    <ContentContainer>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
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

                        <Box sx={styles.inputSection}>
                            <SelectList fullWidth data={classes} valueSelection={enrollmentStudentEditData?.turma_id} onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, turma_id: value })}
                                title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <TextInput placeholder='Pendências' name='pendencia_aluno' onChange={handleChangeEnrollmentEdit} value={enrollmentStudentEditData?.pendencia_aluno || ''} label='Pendências' sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={styles.inputSection}>
                            <TextInput name='dt_inicio' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_inicio)?.split('T')[0] || ''} label='Inicio' sx={{ flex: 1, }} />
                            <TextInput name='dt_final' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_final)?.split('T')[0] || ''} label='Fim' sx={{ flex: 1, }} />
                            <SelectList fullWidth data={groupSituation} valueSelection={enrollmentStudentEditData?.status} onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, status: value })}
                                title="Status/Situação" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                        </Box>
                        {
                            enrollmentData.status?.includes('Desistente') &&
                            <>

                                <CheckBoxComponent
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
                                <TextInput name='dt_desistencia' onChange={handleChangeEnrollmentEdit} type="date" value={(enrollmentStudentEditData?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                            </>
                        }
                        <RadioItem valueRadio={enrollmentStudentEditData?.certificado_emitido}
                            group={groupCertificate}
                            title="Certificado emitido:"
                            horizontal={mobile ? false : true}
                            onSelect={(value) => setEnrollmentStudentEditData({ ...enrollmentStudentEditData, certificado_emitido: parseInt(value) })} />
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                            <Button small text="salvar" onClick={() => handleEnrollStudentEdit()} />
                            <Button secondary small text="cancelar" style={{}} onClick={() => setShowSections({ ...showSections, editEnroll: false })} />
                        </Box>

                    </ContentContainer>
                </Box>
            </Backdrop>



            {userData.perfil && (userData.perfil.includes('aluno') || userData.perfil.includes('interessado')) &&
                <>
                    <ContentContainer style={{ ...styles.containerContract, padding: showSelectiveProcess ? '40px' : '25px' }}>
                        <Box sx={{
                            display: 'flex', alignItems: 'center', padding: showSelectiveProcess ? '0px 0px 20px 0px' : '0px', gap: 1, "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            },
                            justifyContent: 'space-between'
                        }} onClick={() => setShowSelectiveProcess(!showSelectiveProcess)}>
                            <Text title bold >Processo seletivo</Text>
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
                                <Box sx={{ display: 'flex', gap: 3, flex: 1, flexDirection: 'column' }}>

                                    <Box sx={{ ...styles.inputSection, maxWidth: 280 }}>
                                        <TextInput name='agendamento_processo' onChange={handleChangeSelectiveProcess} type="datetime-local" value={(selectiveProcessData?.agendamento_processo) || ''} label='Data do agendamento' sx={{ flex: 1, }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'start', flex: 1, padding: '10px 0px 10px 5px', flexDirection: 'column' }}>
                                        <Text bold>Redação:</Text>
                                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
                                            <Button text="enviar" onClick={() => console.log('enviar')} style={{ width: 120, height: 30 }} />
                                            <Button secondary text="re-enviar" onClick={() => console.log('enviar')} style={{ width: 120, height: 30 }} />
                                        </Box>
                                    </Box>

                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1, padding: '10px 0px 10px 5px' }}>
                                            <Text bold>Prova - Redação:</Text>
                                            <Box sx={{
                                                ...styles.menuIcon,
                                                backgroundImage: `url('${icons.file}')`,
                                                transition: '.3s',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => console.log('redação')} />
                                        </Box>

                                        <Box sx={styles.inputSection}>
                                            <TextInput placeholder='Nota da prova' name='nota_processo' onBlur={handleBlurNota} type="number" onChange={handleChangeSelectiveProcess} value={selectiveProcessData?.nota_processo || ''} label='Nota da prova' sx={{ flex: 1, }} />
                                            <SelectList fullWidth data={groupStatusProcess} valueSelection={selectiveProcessData?.status_processo} onSelect={(value) => setSelectiveProcessData({ ...selectiveProcessData, status_processo: value })}
                                                title="Status processo seletivo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            />
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'start', flex: 1, padding: '10px 0px 10px 5px', flexDirection: 'column' }}>
                                            <Text bold>Pré-Matrícula/Cadastro:</Text>
                                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
                                                <Button text="enviar" onClick={() => console.log('enviar')} style={{ width: 120, height: 30 }} />
                                                <Button secondary text="re-enviar" onClick={() => console.log('enviar')} style={{ width: 120, height: 30 }} />
                                            </Box>
                                        </Box>
                                    </>
                                </Box>
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
                        <ContentContainer style={{ boxShadow: 'none', overflowY: matches && 'auto', }}>
                            <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid #eaeaea`, }}>
                                <table style={{ borderCollapse: 'collapse', }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', width: '100%', borderRadius: '8px 0px 0px 8px', border: `1px solid #eaeaea`, }}>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Curso</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Turma</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Periodo</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Observação</th>
                                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ flex: 1 }}>
                                        {
                                            arrayInterests?.map((interest, index) => {
                                                return (
                                                    <tr key={`${interest}-${index}`}>
                                                        <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.nome_curso || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.nome_turma || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.periodo_interesse || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>
                                                            {interest?.observacao_int || '-'}
                                                        </td>
                                                        <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '.5px solid #eaeaea' }}>

                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                <Button secondary small text="Editar" sx={{
                                                                    width: 40,
                                                                    transition: '.3s',
                                                                    zIndex: 999999999,
                                                                    "&:hover": {
                                                                        opacity: 0.8,
                                                                        cursor: 'pointer'
                                                                    }
                                                                }} onClick={() => {
                                                                    setValueIdInterst(interest.id_interesse)
                                                                    getInterestEdit(interest.id_interesse)
                                                                    setShowSections({ ...showSections, viewInterest: true })
                                                                }} />

                                                                {interest?.turma_id && <Button small text="Matricular" sx={{
                                                                    // width: 25,
                                                                    transition: '.3s',
                                                                    zIndex: 999999999,
                                                                    "&:hover": {
                                                                        opacity: 0.8,
                                                                        cursor: 'pointer'
                                                                    }
                                                                }} onClick={() => {
                                                                    let query = `?interest=${interest.id_interesse}`;
                                                                    router.push(`/administrative/users/${id}/enrollStudent${query}`)
                                                                }} />}
                                                                {newUser &&
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

                            {(!showSections.addInterest && !showSections.viewInterest) && <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button small text='novo' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, addInterest: true })} />
                            </Box>}

                            {showSections.addInterest &&
                                <ContentContainer style={{ overflowY: matches && 'auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text bold style={{ padding: '5px 0px 8px 0px' }}>Novo Interesse</Text>
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
                                    <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                        <SelectList fullWidth data={courses} valueSelection={interests?.curso_id} onSelect={(value) => {
                                            handleChangeInterest(value, 'curso_id')
                                            listClassesInterest(value)
                                        }}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList fullWidth data={classesInterest} valueSelection={interests?.turma_id} onSelect={(value) => handleChangeInterest(value, 'turma_id')}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList fullWidth data={interests?.turma_id ? period?.filter(item => item.idClass === interests?.turma_id) : period} valueSelection={interests?.periodo_interesse} onSelect={(value) => setInterests({ ...interests, periodo_interesse: value })}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />

                                    </Box>
                                    <TextInput
                                        placeholder='Observação'
                                        name='observacao_int'
                                        onChange={handleChangeInterest}
                                        value={interests?.observacao_int || ''}
                                        sx={{ flex: 1 }}
                                        multiline
                                        maxRows={5}
                                        rows={3}
                                    />
                                    <Button small text='incluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                        newUser ? addInterest() : handleAddInterest()
                                        setShowSections({ ...showSections, addInterest: false })
                                    }} />
                                </ContentContainer>
                            }

                            {showSections.viewInterest &&
                                <ContentContainer style={{ overflowY: matches && 'auto' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text bold style={{ padding: '5px 0px 8px 0px' }}>Interesse</Text>
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

                                    <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                        <SelectList fullWidth data={courses} valueSelection={interestSelected?.curso_id}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value) => {
                                                setInterestSelected({ ...interestSelected, curso_id: value })
                                                listClassesInterest(value)
                                            }}
                                        />
                                        <SelectList data={classesInterest} valueSelection={interestSelected?.turma_id}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value) => setInterestSelected({ ...interestSelected, turma_id: value })}
                                        />
                                        <SelectList data={periodSelected} valueSelection={interestSelected?.periodo_interesse}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value) => setInterestSelected({ ...interestSelected, periodo_interesse: value })}
                                        />
                                    </Box>
                                    <TextInput
                                        placeholder='Observação'
                                        name='observacao_int'
                                        value={interestSelected?.observacao_int || ''}
                                        sx={{ flex: 1 }}
                                        onChange={handleChangeInterestSelected}
                                        multiline
                                        maxRows={5}
                                        rows={3}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Button small text="atualizar" style={{ padding: '5px 6px 5px 6px', width: 100 }}
                                            onClick={() => {
                                                handleEditInterest(interestSelected?.id_interesse)

                                            }} />
                                        <Button small secondary text='excluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                            handleDeleteInterest(interestSelected?.id_interesse)
                                            setShowSections({ ...showSections, viewInterest: false })
                                        }} />
                                    </Box>

                                </ContentContainer>}
                        </ContentContainer>
                    </ContentContainer>
                }
            </Backdrop>

            <Backdrop open={showSections.historic} sx={{ zIndex: 99999, }}>
                {showSections.historic &&
                    <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '280px' }, overflowY: matches && 'auto', }}>
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
                        <ContentContainer style={{ boxShadow: 'none', overflowY: matches && 'auto', }}>
                            <Table_V1 columns={columnHistoric}
                                data={arrayHistoric}
                                columnId="id_historico"
                                columnActive={false}
                                onSelect={(value) => setValueIdHistoric(value)}
                                routerPush={false}
                            />

                            {!showSections.addHistoric && <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button small text='adicionar' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, addHistoric: true })} />
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
                                        <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <TextInput placeholder='Data' name='dt_ocorrencia' onChange={handleChangeHistoric} value={(historicData?.dt_ocorrencia)?.split('T')[0] || ''} type="date" sx={{ flex: 1 }} />
                                            <TextInput placeholder='Responsável' name='responsavel' onChange={handleChangeHistoric} value={historicData?.responsavel || ''} label="Responsável" sx={{ flex: 1 }} />
                                        </Box>
                                        <TextInput
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

                                        <Button small text='incluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
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
                                        <Box key={historic} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <TextInput placeholder='Data' name='dt_ocorrencia' onChange={handleChangeHistoric} value={(historic?.dt_ocorrencia)?.split('T')[0] || ''} type="date" sx={{ flex: 1 }} />
                                            <TextInput placeholder='Responsável' name='responsavel' onChange={handleChangeHistoric} value={historic?.responsavel || ''} label="Responsável" sx={{ flex: 1 }} />
                                        </Box>
                                        <TextInput
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
                                        <Button small secondary text='excluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                            newUser ? deleteHistoric(valueIdHistoric) : handleDeleteHistoric(historic?.id_historico)
                                        }} />
                                    </ContentContainer>
                                </>
                            ))}
                        </ContentContainer>

                    </ContentContainer>
                }
            </Backdrop>
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
        matriculaId
    } = props

    const { alert, setLoading, matches } = useAppContext()

    const handleDeleteFile = async (files) => {
        setLoading(true)
        const response = await deleteFile({ fileId: files?.[columnId], usuario_id: usuarioId, campo: files.campo, key: files?.key_file, matriculaId })
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

    return (
        <Backdrop open={open} sx={{ zIndex: 99999, }}>
            <ContentContainer style={{ ...styles.containerFile, maxHeight: { md: '180px', lg: '1280px' }, marginLeft: { md: '180px', lg: '0px' }, overflowY: matches && 'scroll', }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, alignItems: 'center', padding: '0px 0px 8px 0px' }}>
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
                <Box sx={{
                    display: 'flex',
                    whiteSpace: 'wrap',
                    maxWidth: 280,
                    justifyContent: 'center'
                }}>
                    <Text>{text}</Text>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
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
                    />

                </Box>

                {bgImage &&
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button secondary small text='Remover' style={{ padding: '5px 10px 5px 10px', width: 120 }} onClick={() => {
                                    newUser ? callback("") : handleDeleteFile()
                                }} />
                            </Box>
                        </Box>
                    </>
                }

                {campo != 'foto_perfil' && fileData?.length > 0 &&
                    <ContentContainer>
                        <Text bold>Arquivos</Text>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                            {fileData?.map((file, index) => (
                                <Link key={`${file}-${index}`} style={{ display: 'flex', position: 'relative', border: `1px solid gray`, borderRadius: '8px' }} href={file.location} target="_blank">
                                    <Box
                                        sx={{
                                            backgroundImage: `url('${file?.location}')`,
                                            backgroundSize: 'contain',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center center',
                                            width: { xs: '100%', sm: 150, md: 150, lg: 150 },
                                            aspectRatio: '1/1',
                                        }}>
                                    </Box>
                                    <Box sx={{
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
                                        handleDeleteFile(file)
                                    }} />
                                </Link>

                            ))}
                        </Box>
                    </ContentContainer>
                }
            </ContentContainer>
        </Backdrop>
    )
}