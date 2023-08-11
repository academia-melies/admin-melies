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
import { emailValidator, formatCEP, formatCPF, formatRg } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"
import Link from "next/link"

export default function EditUser() {
    const { setLoading, alert, colorPalette, user, setUser, matches, theme, setShowConfirmationDialog } = useAppContext()
    const usuario_id = user.id;
    const router = useRouter()
    const { id, slug } = router.query;
    const newUser = id === 'new';
    const [perfil, setPerfil] = useState('')
    const [fileCallback, setFileCallback] = useState([])
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
        login: null,
        nascimento: null,
        tipo_deficiencia: null,
        nome_emergencia: null,
        foto_perfil_id: bgPhoto?.location || fileCallback?.filePreview || null
    })
    const [contract, setContract] = useState({})
    const [enrollmentData, setEnrollmentData] = useState({
        status: null,
        motivo_desistencia: null,
        dt_desistencia: null,
        certificado_emitido: null,
    })
    const [countries, setCountries] = useState([])
    const [courses, setCourses] = useState([])
    const [classes, setClasses] = useState([])
    const [classesInterest, setClassesInterest] = useState([])
    const [groupPermissions, setGroupPermissions] = useState([])
    const [permissionPerfil, setPermissionPerfil] = useState()
    const [permissionPerfilBefore, setPermissionPerfilBefore] = useState()
    const [foreigner, setForeigner] = useState(false)
    const [showContract, setShowContract] = useState(false)
    const [showEnrollment, setShowEnrollment] = useState(false)
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
        accessData: false
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
    const [valueIdHistoric, setValueIdHistoric] = useState()
    const [valueIdInterst, setValueIdInterst] = useState()
    const [filesUser, setFilesUser] = useState([])
    const [officeHours, setOfficeHours] = useState([
        { dia_semana: '2ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '3ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '4ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '5ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: '6ª Feira', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
        { dia_semana: 'Sábado', ent1: null, sai1: null, ent2: null, sai2: null, ent3: null, sai3: null },
    ]);

    useEffect(() => {
        setPerfil(slug)
        findCountries()
        listCourses()
        listClassesInterest()
        listPermissions()
    }, [slug])

    useEffect(() => {
        listClass()
    }, [enrollmentData?.curso_id, interests.curso_id])

    const getUserData = async () => {
        try {
            const response = await api.get(`/user/${id}`)
            const { data } = response
            setUserData(data.response)
            setArrayDependent(data.dependents)
        } catch (error) {
            console.log(error)
        }
    }

    const getContract = async () => {
        try {
            const response = await api.get(`/contract/${id}`)
            const { data } = response
            setContract(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getEnrollment = async () => {
        try {
            const response = await api.get(`/enrollment/${id}`)
            const { data } = response
            setEnrollmentData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getInterest = async () => {
        try {
            const response = await api.get(`/user/interests/${id}`)
            const { data } = response
            setArrayInterests(data)
        } catch (error) {
            console.log(error)
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

        let id_course = enrollmentData?.curso_id || interests.curso_id;

        try {
            const response = await api.get(`/class/course/${id_course}`)
            const { data = [] } = response
            const groupClass = data.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma
            }));

            setClasses(groupClass);
        } catch (error) {
        }
    }

    async function listClassesInterest() {

        try {
            const response = await api.get(`/classes`)
            const { data = [] } = response
            const groupClass = data.map(turma => ({
                label: turma.nome_turma,
                value: turma?.id_turma
            }));

            setClassesInterest(groupClass);
        } catch (error) {
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

    // async function verifyCPF(cpf, nascimento) {
    //     setLoading(true)
    //     let token_access = 'F285AF4D-13C7-46B9-8C66-583DBE14E017';
    //     let cpf = cpf;
    //     let dataNascimento = nascimento;
    //     let plugin = 'CPF';


    //     try {
    //         const response = await axios.get(`https://www.sintegraws.com.br/api/v1/execute-api.php?token=${token_access}&cpf=${cpf}&data-nascimento=${dataNascimento}&plugin=${plugin}`)
    //         const { data } = response;

    //     } catch (error) {
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    async function autoEmailMelies(email) {
        try {
            const name = userData?.nome?.split(' ');
            const firstName = name[0];
            const lastName = name.length > 1 ? name[name.length - 1] : '';
            let firstEmail = `${firstName}.${lastName}@melies.com.br`;

            if (!lastName) {
                firstEmail = `${firstName}01@melies.com.br`;
            }

            // setUserData((prevValues) => ({
            //     ...prevValues,
            //     email_melies: firstEmail.toLowerCase(),
            // }))
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
            getEnrollment()
            getContract()
            getInterest()
            getHistoric()
            getPhoto()
            getFileUser()
            getOfficeHours()
            getPermissionUser()
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

    const handleChangeEnrollment = (value) => {

        setEnrollmentData((prevValues) => ({
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

    const handleChangeInterest = (value) => {

        setInterests((prevValues) => ({
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
                handleItems()
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
                handleItems()
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

        if (!userData.perfil.includes('interessado')) {
            if (userData?.senha !== userData?.confirmar_senha) {
                alert?.error('As senhas não correspondem. Por favor, verifique novamente.')
                return false
            }

            if (!userData?.telefone) {
                alert?.error('O campo telefone é obrigatório')
                return false
            }

            if (!userData?.perfil) {
                alert?.error('O campo perfil é obrigatório')
                return false
            }

            // if (!userData?.ativo) {
            //     alert?.error('O campo banana é obrigatório')
            //     return false
            // }

            if (!userData?.naturalidade) {
                alert?.error('O campo naturalidade é obrigatório')
                return false
            }

            if (!userData?.pais_origem) {
                alert?.error('O campo País de origem é obrigatório')
                return false
            }

            if (!userData?.nacionalidade) {
                alert?.error('O campo nacionalidade é obrigatório')
                return false
            }

            if (!userData?.cor_raca) {
                alert?.error('O campo Cor e raça é obrigatório')
                return false
            }

            if (!userData?.genero) {
                alert?.error('O campo gênero é obrigatório')
                return false
            }

            if (!userData?.deficiencia) {
                alert.error('O campo deficiência é obrigatório')
                return false
            }

            if (!userData?.estado_civil) {
                alert.error('O campo Estado cívil é obrigatório')
                return false
            }

            if (!userData?.escolaridade) {
                alert.error('O campo escolaridade é obrigatório')
                return false
            }

            if (!userData?.cep) {
                alert.error('O campo CEP é obrigatório')
                return false
            }

            if (!userData?.telefone) {
                alert.error('O campo numero é obrigatório')
                return false
            }

            if (!userData?.cidade) {
                alert.error('O campo cidade é obrigatório')
                return false
            }

            if (!userData?.rg) {
                alert.error('O campo RG é obrigatório')
                return false
            }

            if (!userData?.cpf) {
                alert.error('O campo CPF é obrigatório')
                return false
            }
            return true
        }

        return true
    }

    const handleCreateUser = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await createUser(userData, arrayInterests, arrayHistoric, usuario_id);
                const { data } = response
                if (userData?.perfil?.includes('funcionario')) {
                    const responseData = await createContract(data?.userId, contract)

                }
                if (userData?.perfil?.includes('aluno')) {
                    const responseData = await createEnrollment(data?.userId, enrollmentData);

                }
                if (fileCallback) {
                    const responseData = await api.patch(`/file/edit/${fileCallback?.id_foto_perfil}/${data?.userId}`);

                }
                if (officeHours) {
                    const responseData = await api.post(`/officeHours/create/${data?.userId}`, { officeHours })

                }
                if (newUser && filesUser) {
                    const responseData = await api.patch(`/file/editFiles/${data?.userId}`, { filesUser });

                }

                if (permissionPerfil) {
                    const permissionsToAdd = permissionPerfil.split(',').map(id => parseInt(id));

                    if (permissionsToAdd.length > 0) {
                        const responseData = await api.post(`/permissionPerfil/create/${data?.userId}`, { permissionsToAdd })
                    }
                }

                if (response?.status === 201) {
                    alert.success('Usuário cadastrado com sucesso.');
                    if (data?.userId) router.push(`/administrative/users/${data?.userId}`)
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

        setLoading(true)
        try {
            const response = await editeUser({ id, userData })
            if (contract) {
                const responseData = await editContract({ id, contract })
            }
            if (enrollmentData) {
                const responseData = await editeEnrollment({ id, enrollmentData })
            }
            if (!(officeHours.filter((item) => item?.id_hr_trabalho).length > 0)) {
                const responseData = await api.post(`/officeHours/create/${id}`, { officeHours })
            }
            if (officeHours?.map((item) => item.id_hr_trabalho).length > 0) {
                const responseData = await api.patch(`/officeHours/update`, { officeHours })
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
                handleItems()
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
                handleItems()
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

    const grouperiod = [
        { label: 'Manhã', value: 'Manhã' },
        { label: 'Tarde', value: 'Tarde' },
        { label: 'Noite', value: 'Noite' }
    ]

    const groupSituation = [
        { label: 'Aguardando início', value: 'Aguardando início' },
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

            {/* usuario */}
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
                    <Box sx={{ '&:hover': { opacity: 0.8, cursor: 'pointer' }, }}>
                        <Avatar src={bgPhoto?.location || fileCallback?.filePreview} sx={{
                            height: 'auto',
                            borderRadius: '16px',
                            width: { xs: '100%', sm: 150, md: 150, lg: 180 },
                            aspectRatio: '1/1',
                        }} variant="square" onClick={() => setShowEditFiles({ ...showEditFile, photoProfile: true })} />
                    </Box>
                </Box>
                {/* <RadioItem valueRadio={userData?.perfil} group={groupPerfil} title="Perfil" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, perfil: value, admin_melies: value === 'interessado' ? 0 : userData.admin_melies })} sx={{ flex: 1, }} /> */}
                <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25 }}>
                    <CheckBoxComponent
                        valueChecked={userData?.perfil}
                        boxGroup={groupPerfil}
                        title="Perfil *"
                        horizontal={mobile ? false : true}
                        onSelect={(value) => setUserData({
                            ...userData,
                            perfil: value,
                            admin_melies: !value.includes('funcionario') ? 0 : 1
                        })}
                        sx={{ flex: 1, }}
                    />
                </Box>
                <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25, padding: '0px 0px 20px 15px' }}>

                    {userData?.perfil?.includes('interessado') &&
                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                            <Text bold small>Lista de interesses:</Text>
                            <Button small text='interesses' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, interest: true })} />
                        </Box>}
                    {!newUser &&
                        <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                            <Text bold small>Observações do {userData.perfil}:</Text>
                            <Button small text='observação' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, historic: true })} />
                        </Box>
                    }

                </Box>
                {/* {!newUser && <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-around', gap: 1.8 }}>
                    <TextInput placeholder='Nova senha' name='nova_senha' onChange={handleChange} value={userData?.nova_senha || ''} type="password" label='Nova senha' sx={{ flex: 1, }} />
                    <TextInput placeholder='Confirmar senha' name='confirmar_senha' onChange={handleChange} value={userData?.confirmar_senha || ''} type="password" label='Confirmar senha' sx={{ flex: 1, }} />
                </Box>} */}

                <RadioItem valueRadio={userData?.ativo} group={groupStatus} title="Status *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, ativo: parseInt(value), admin_melies: value < 1 ? parseInt(value) : userData?.admin_melies })} />
                {/* <RadioItem valueRadio={userData?.admin_melies} group={groupAdmin} title="Acesso ao AdminMéliès *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, admin_melies: parseInt(value) })} /> */}
            </ContentContainer>


            <ContentContainer style={{ ...styles.containerRegister, padding: showSections.accessData ? '40px' : '25px' }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, padding: showSections.accessData ? '0px 0px 20px 0px' : '0px', "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    },
                    justifyContent: 'space-between'
                }} onClick={() => setShowSections({ ...showSections, accessData: !showSections.accessData })}>
                    <Text title bold >Dados de acesso</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transform: showSections.accessData ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: '.3s',
                    }} />
                </Box>
                {showSections.accessData &&
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
                        <RadioItem valueRadio={userData?.admin_melies} group={groupAdmin} title="Acesso ao AdminMéliès *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, admin_melies: parseInt(value) })} />
                    </>}
            </ContentContainer>


            {/* dados_pessoais */}
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

                                    <Box style={{ display: 'flex' }}>
                                        <Button
                                            style={{ width: '50%', marginRight: 1 }}
                                            text='Salvar'
                                            onClick={() => {
                                                !newUser ? handleAddPermission() : alert.info('Permissões atualizadas')
                                            }}
                                        />
                                        <Button secondary
                                            style={{ width: '50%', }}
                                            text='Cancelar'
                                            onClick={() => setShowSections({ ...showSections, permissions: false })}
                                        />
                                    </Box>
                                </ContentContainer>
                            </ContentContainer>
                        </Backdrop>

                        <RadioItem valueRadio={userData?.professor}
                            group={groupProfessor}
                            title="Professor *"
                            horizontal={mobile ? false : true}
                            onSelect={(value) => setUserData({ ...userData, professor: parseInt(value) })} />

                        <Box sx={{ padding: '0px 0px 20px 0px' }}>
                            <CheckBoxComponent
                                boxGroup={groupForeigner}
                                valueChecked={userData?.foreigner || ''}
                                // title="Estrangeiro sem CPF" 
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

                        {/* <RadioItem valueRadio={userData?.cor_raca} group={groupCivil} title="Cor/raça" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, cor_raca: value })} />
                         */}
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

                        {/* Incluir campos ocorrencia, data_ocorrencia, responsável quando usuario !newUser */}


                        <RadioItem valueRadio={userData?.estado_civil} group={groupCivil} title="Estado Cívil *" horizontal={mobile ? false : true} onSelect={(value) => setUserData({ ...userData, estado_civil: value })} />

                        {/* <TextInput placeholder='Estado Cívil' name='estado_civil' onChange={handleChange} value={userData?.estado_civil || ''} label='Estado Cívil' /> */}
                        <TextInput placeholder='E-mail Méliès' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail Méliès' />
                        {/* <TextInput placeholder='Dependente' name='dependente' onChange={handleChange} value={userData?.dependente || ''} label='Dependente' sx={{ flex: 1, }} /> */}


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
                                        {/* <Box sx={{
                                            backgroundSize: 'cover',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center',
                                            width: 25,
                                            height: 25,
                                            backgroundImage: `url(/icons/edit_icon.png)`,
                                            transition: '.3s',
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => {
                                            !newUser && dependent && handleEditDependent(dep?.id_dependente)
                                        }} /> */}
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
                                {/* <TextInput placeholder='Horário' name='horario' onChange={handleChangeContract} value={contract?.horario || ''} label='Horário' sx={{ flex: 1, }} /> */}
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
                        <Text title bold >Matrícula</Text>
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
                        <>
                            <Box sx={styles.inputSection}>
                                <SelectList fullWidth data={classesInterest} valueSelection={enrollmentData?.turma_id} onSelect={(value) => setEnrollmentData({ ...enrollmentData, turma_id: value })}
                                    title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                                <TextInput placeholder='Pendências' name='pendencia_aluno' onChange={handleChangeEnrollment} value={enrollmentData?.pendencia_aluno || ''} label='Pendências' sx={{ flex: 1, }} />
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
                                        columnId="id_doc_usuario"
                                        open={showEditFile.contractStudent}
                                        newUser={newUser}
                                        onSet={(set) => {
                                            setShowEditFiles({ ...showEditFile, contractStudent: set })
                                        }}
                                        title='Contrato do aluno'
                                        text='Faça o upload do contrato do aluno, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar a foto/arquivo que deseja'
                                        fileData={filesUser?.filter((file) => file.campo === 'contrato aluno')}
                                        usuarioId={id}
                                        campo='contrato aluno'
                                        tipo='documento usuario'
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
                                <TextInput name='dt_inicio' onChange={handleChangeEnrollment} type="date" value={(enrollmentData?.dt_inicio)?.split('T')[0] || ''} label='Inicio' sx={{ flex: 1, }} />
                                <TextInput name='dt_final' onChange={handleChangeEnrollment} type="date" value={(enrollmentData?.dt_final)?.split('T')[0] || ''} label='Fim' sx={{ flex: 1, }} />
                                <SelectList fullWidth data={groupSituation} valueSelection={enrollmentData?.status} onSelect={(value) => setEnrollmentData({ ...enrollmentData, status: value })}
                                    title="Status/Situação" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                            </Box>
                            {
                                enrollmentData.status?.includes('Desistente') &&
                                <>

                                    <CheckBoxComponent
                                        valueChecked={enrollmentData?.motivo_desistencia || ''}
                                        boxGroup={groupReasonsDroppingOut}
                                        title="Motivo da desistência"
                                        horizontal={mobile ? false : true}
                                        onSelect={(value) => setEnrollmentData({
                                            ...enrollmentData,
                                            motivo_desistencia: value
                                        })}
                                        sx={{ width: 1 }}
                                    />
                                    <TextInput name='dt_desistencia' onChange={handleChangeEnrollment} type="date" value={(enrollmentData?.dt_desistencia)?.split('T')[0] || ''} label='Data da desistência' sx={{ flex: 1, }} />
                                </>
                            }
                            <RadioItem valueRadio={enrollmentData?.certificado_emitido}
                                group={groupCertificate}
                                title="Certificado emitido:"
                                horizontal={mobile ? false : true}
                                onSelect={(value) => setEnrollmentData({ ...enrollmentData, certificado_emitido: parseInt(value) })} />

                            {/* <SelectList fullWidth data={courses} valueSelection={enrollmentData?.curso_id} onSelect={(value) => setEnrollmentData({ ...enrollmentData, curso_id: value })}
                                    title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                /> */}
                        </>
                    }
                </ContentContainer >
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
                            }} onClick={() => setShowSections({ ...showSections, interest: false })} />
                        </Box>
                        <ContentContainer style={{ boxShadow: 'none', overflowY: matches && 'auto', }}>
                            <Box sx={{ ...styles.inputSection, alignItems: 'center', backgroundColor: colorPalette.buttonColor, padding: '8px', borderRadius: '8px', zIndex: 999999999 }}>
                                <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Curso</Text>
                                <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Turma</Text>
                                <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Periodo</Text>
                                <Text bold style={{ flex: 1, textAlign: 'center', color: '#fff' }}>Observação</Text>
                            </Box>

                            {arrayInterests.map((interest, index) => (
                                <>

                                    <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                        <SelectList fullWidth data={courses} valueSelection={interest?.curso_id}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            clean={false}
                                        />
                                        <SelectList data={classesInterest} valueSelection={interest?.turma_id}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            clean={false}
                                        />
                                        <SelectList data={grouperiod} valueSelection={interest?.periodo_interesse}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            clean={false}
                                        />
                                        <TextInput
                                            placeholder='Observação'
                                            name='observacao_int'
                                            value={interest?.observacao_int || ''}
                                            sx={{ flex: 1 }}
                                        // rows={3}
                                        />
                                        <Box sx={{
                                            backgroundSize: 'cover',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'center',
                                            backgroundBlendMode: '#fff',
                                            width: 25,
                                            height: 25,
                                            backdropFilter: 'inherit',
                                            backgroundImage: `url(${icons.edit})`,
                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                            transition: '.3s',
                                            zIndex: 999999999,
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => {
                                            setValueIdInterst(interest.id_interesse)
                                            setShowSections({ ...showSections, viewInterest: true })
                                        }} />
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
                                </>
                            ))}

                            {!showSections.addInterest && <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button small text='adicionar' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, addInterest: true })} />
                                <Button small text='salvar' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                    alert.info('Lista de Interesses salva.')
                                    setShowSections({ ...showSections, interest: false })
                                }} />
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
                                        <SelectList fullWidth data={courses} valueSelection={interests?.curso_id} onSelect={(value) => setInterests({ ...interests, curso_id: value })}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList fullWidth data={classes} valueSelection={interests?.turma_id} onSelect={(value) => setInterests({ ...interests, turma_id: value })}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList fullWidth data={grouperiod} valueSelection={interests?.periodo_interesse} onSelect={(value) => setInterests({ ...interests, periodo_interesse: value })}
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
                                    {arrayInterests.filter((item) => item.id_interesse === valueIdInterst).map((interest, index) => (
                                        <>

                                            <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                                <SelectList fullWidth data={courses} valueSelection={interest?.curso_id}
                                                    title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    clean={false}
                                                />
                                                <SelectList data={classesInterest} valueSelection={interest?.turma_id}
                                                    title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    clean={false}
                                                />
                                                <SelectList data={grouperiod} valueSelection={interest?.periodo_interesse}
                                                    title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    clean={false}
                                                />
                                            </Box>
                                            <TextInput
                                                placeholder='Observação'
                                                name='observacao_int'
                                                value={interest?.observacao_int || ''}
                                                sx={{ flex: 1 }}
                                                multiline
                                                maxRows={5}
                                                rows={3}
                                            />
                                            <Button small secondary text='excluir' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => {
                                                handleDeleteInterest(interest?.id_interesse)
                                                setShowSections({ ...showSections, viewInterest: false })
                                            }} />
                                        </>
                                    ))}
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
        columnId = ''
    } = props

    const { alert, setLoading, matches } = useAppContext()

    const handleDeleteFile = async (files) => {
        setLoading(true)
        const response = await deleteFile({ fileId: files?.[columnId], usuario_id: usuarioId, campo: files.campo, key: files?.key_file })
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
                            backgroundImage: `url('${bgImage}')`,
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

                            {/* <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button small text='Salvar' style={{ padding: '5px 10px 5px 10px', width: 120 }} onClick={() => {
                                    onSet(false)
                                    alert.info('Sua foto de perfil foi atualizada.')
                                }} />
                            </Box> */}
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