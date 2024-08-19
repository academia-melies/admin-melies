import React, { ChangeEvent, useEffect, useState } from "react"
import { Box, Button, ButtonIcon, ContentContainer, Divider, FileInput, PhoneInputField, Text, TextInput } from "../../../../../atoms"
import { EditFile } from "../../[id]"
import { Avatar, Backdrop, CircularProgress } from "@mui/material"
import { CheckBoxComponent, RadioItem, SelectList, Table_V1 } from "../../../../../organisms"
import { useAppContext } from "../../../../../context/AppContext"
import { emailValidator, formatCEP, formatCPF, formatRg, formatTimeStamp } from "../../../../../helpers"
import { groupData } from '../../../../../helpers/groupData';
import { api } from "../../../../../api/api"
import { icons } from "../../../../../organisms/layout/Colors"
import axios from "axios"
import { editeUser } from "../../../../../validators/api-requests"
import { useRouter } from "next/router"

interface UserDataProps {
    id: number | string
    newUser: boolean
    isPermissionEdit: boolean
    mobile: boolean
    userId: number | string
    setPerfil: React.Dispatch<React.SetStateAction<string | null>>
}

export interface UserDataObjectProps {
    nome: string | null
    email: string | null
    perfil: string | null
    cd_cliente: string | null | number,
    autista: null | number,
    superdotacao: null | number,
    superdotado: string | null
    ra: null | number | string,
    cpf: null | number | string,
    naturalidade: null | string,
    nacionalidade: null | string,
    estado_civil: null | string,
    conjuge: null | string,
    email_melies: null | string,
    email_pessoal: null | string,
    nome_pai: null | string,
    nome_mae: null | string,
    escolaridade: null | string,
    genero: null | string,
    cor_raca: null | string,
    deficiencia: null | string,
    doc_estrangeiro: null | string,
    pais_origem: null | string,
    telefone_emergencia: null | string,
    telefone: null | string,
    professor: null | string | number,
    rg: null | string,
    expedicao: null | string,
    orgao: null | string,
    uf_rg: null | string,
    titulo: null | string,
    zona: null | string,
    secao: null | string,
    rua: null | string,
    cidade: null | string,
    uf: null | string,
    bairro: null | string,
    cep: null | string,
    complemento: null | string,
    numero: null | string,
    ativo: null | number | string,
    admin_melies: null | number | string,
    portal_aluno: null | number | string,
    login: null | string,
    nascimento: null | string,
    tipo_deficiencia: null | string,
    nome_emergencia: null | string,
    foto_perfil_id: null | string,
    nome_social: null | string
    ultimo_acesso: null | string
    nova_senha: null | string
    confirmar_senha: null | string,
    foto: PhotoProps | null
    foreigner: number | null | string
    tipo_origem_ensi_med: string | null
}

interface PhotoProps {
    location: string | null
}

interface FileCallBackProps {
    status?: number | string | null,
    id_foto_perfil?: string | null | number,
    preview?: string | null
    campo?: string | null
    name?: string | null
    tipo?: string | null
    file?: any
}

interface GropPermissionProps {
    label: string | null
    value: string | null
}

interface Permission {
    permissao: string | null;
    id_grupo_perm: number;
}

interface Disciplines {
    nome_disciplina: string | null;
    id_disciplina: number;
    ativo: number
}

interface DisciplinesState {
    label: string | null;
    value: number | string | null;
}

interface ShowSections {
    registration: boolean,
    interest: boolean,
    historic: boolean,
    addHistoric: boolean,
    addInterest: boolean,
    viewInterest: boolean,
    permissions: boolean,
    accessData: boolean,
    editEnroll: boolean
}

interface Countries {
    label: string
    value: string
}

export interface FilePreview {
    status: number | string,
    fileId: string | null,
    filePreview: string
}

interface Country {
    nome: {
        abreviado: string;
    };
}

export interface FileUser {
    id_doc_usuario: string | null;
    location: string;
    campo: string;
    name?: string | null
    tipo?: string | null
    file?: any
}

interface ArrayDependent {
    id_dependente?: string | null
    nome_dependente: string | null
    cpf_dependente: string | null
    dt_nasc_dependente: string | null
}

interface Dependent {
    nome_dependente: string | null
    cpf_dependente: string | null,
    dt_nasc_dependente: string | null
}

interface DisciplinesArrayProfessor {
    disciplina_id: string | number | null
    id_disciplina_prof?: string | number | null
}

interface DisciplinesProfessor {
    disciplina_id: string | number | null
    id_disciplina_prof?: string | number | null
}

interface HistoricData {
    dt_ocorrencia: string | null
    responsavel: string | null
    ocorrencia: string | null
}


interface HistoricDataArray {
    id_historico?: string | number | null
    dt_ocorrencia: string | null
    responsavel: string | null
    ocorrencia: string | null
}



const UserData = ({
    id,
    newUser,
    isPermissionEdit,
    mobile,
    userId,
    setPerfil
}: UserDataProps) => {
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
    const [userData, setUserData] = useState<UserDataObjectProps>({
        nome: null,
        email: null,
        perfil: null,
        cd_cliente: null,
        autista: null,
        superdotacao: null,
        superdotado: null,
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
        foto_perfil_id: null,
        nome_social: null,
        ultimo_acesso: null,
        nova_senha: null,
        confirmar_senha: null,
        foto: {
            location: null
        },
        foreigner: null,
        tipo_origem_ensi_med: null
    })
    const [filesUser, setFilesUser] = useState<FileUser[]>([])
    const [fileCallback, setFileCallback] = useState<FileCallBackProps>({
        status: null,
        id_foto_perfil: null,
        preview: '',
        campo: ''
    })
    const [foreigner, setForeigner] = useState<boolean>(false)
    const [groupPermissions, setGroupPermissions] = useState<GropPermissionProps[]>([])
    const [disciplines, setDisciplines] = useState<DisciplinesState[]>([])
    const [showSections, setShowSections] = useState<ShowSections>({
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
    const [permissionPerfil, setPermissionPerfil] = useState<string | null>()
    const [permissionPerfilBefore, setPermissionPerfilBefore] = useState<string | null>()
    const [arrayDisciplinesProfessor, setArrayDisciplinesProfessor] = useState<DisciplinesArrayProfessor[]>([])
    const [disciplinesProfessor, setDisciplinesProfessor] = useState<DisciplinesProfessor>({
        disciplina_id: null,
        id_disciplina_prof: null
    })
    const [countries, setCountries] = useState<Countries[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [arrayDependent, setArrayDependent] = useState<ArrayDependent[]>([])
    const [arrayHistoric, setArrayHistoric] = useState<HistoricDataArray[]>([])
    const [valueIdHistoric, setValueIdHistoric] = useState<number | null>()
    const [historicData, setHistoricData] = useState<HistoricData>({
        responsavel: null,
        dt_ocorrencia: null,
        ocorrencia: null
    });
    const [dependent, setDependent] = useState<Dependent>({
        nome_dependente: '', cpf_dependente: '', dt_nasc_dependente: ''
    })
    const { colorPalette, alert, setLoading, theme, matches, user } = useAppContext()
    const router = useRouter()
    const fetchData = async () => {
        setLoadingData(true)
        try {
            const [userResponse, dependentResponse, disciplineResponse, permissionsResponse, disciplinesResponse, countriesResponse, arrayHistoricResponse] = await Promise.all([
                api.get(`/user/${id}`),
                api.get(`/user/dependent/${id}`),
                api.get(`/discipline/professor/${id}`),
                api.get<Permission[]>(`/permissions`),
                api.get<Disciplines[]>(`/disciplines/active`),
                axios.get<Country[]>(`https://servicodados.ibge.gov.br/api/v1/paises/paises`),
                api.get(`/user/historical/${id}`)
            ]);
            const userDataResponse = userResponse.data
            if (!newUser) {
                setUserData(userDataResponse);
            }
            const dependents = dependentResponse.data.dependents;
            if (!newUser) {
                setArrayDependent(dependents);
            }

            const disciplinesProfessor = disciplineResponse.data;
            setArrayDisciplinesProfessor(disciplinesProfessor);

            const permissions = permissionsResponse.data;
            const groupPermissions = permissions.map(permission => ({
                label: permission.permissao,
                value: permission?.id_grupo_perm.toString()
            }));
            setGroupPermissions(groupPermissions);

            const disciplines = disciplinesResponse.data.filter(item => item.ativo === 1)
                .map(discipline => ({
                    label: discipline.nome_disciplina,
                    value: discipline?.id_disciplina
                }));
            setDisciplines(disciplines);

            const countriesData = countriesResponse.data;
            const abbreviatedNames = countriesData.map(country => country.nome.abreviado);
            const uniqueAbbreviatedNames = [...new Set(abbreviatedNames)];
            uniqueAbbreviatedNames.sort();
            const groupAccount = uniqueAbbreviatedNames.map(name => ({
                label: name,
                value: name
            }));
            setCountries(groupAccount);

            const arrayHitoricData = arrayHistoricResponse.data
            setArrayHistoric(arrayHitoricData)

        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoadingData(false);
        }
    };
    useEffect(() => {
        fetchData()
    }, [id])

    const handleChangeFilesUser = (field: string, fileId: string | null, filePreview: string) => {
        setFilesUser((prevClassDays) => [
            ...prevClassDays,
            {
                id_doc_usuario: fileId,
                location: filePreview,
                campo: field,
            }
        ]);
    };

    const handleChange = (value: ChangeEvent<HTMLInputElement>) => {

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

    const handleAddPermission = async () => {
        setLoading(true)
        try {

            const currentPermissions = permissionPerfil && permissionPerfil.split(',').map(id => parseInt(id));
            const previousPermissions = permissionPerfilBefore && permissionPerfilBefore.split(',').map(id => parseInt(id));
            let permissionsToAdd = null
            let permissionsToRemove = null
            if (currentPermissions && previousPermissions) {
                permissionsToAdd = currentPermissions.filter(id => !previousPermissions.includes(id));
                permissionsToRemove = previousPermissions.filter(id => !currentPermissions.includes(id));
            }

            if (permissionsToAdd && permissionsToAdd.length > 0) {
                await api.post(`/permissionPerfil/create/${id}`, { permissionsToAdd })
            }

            if (permissionsToRemove && permissionsToRemove.length > 0) {
                const permissionsToRemoveString = permissionsToRemove.join(','); // Converta o array em uma string
                await api.delete(`/permissionPerfil/remove/${id}?permissions=${permissionsToRemoveString}`);
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

    const addDisciplineProfessor = () => {
        setArrayDisciplinesProfessor((prevArray) => [...prevArray, { disciplina_id: disciplinesProfessor.disciplina_id }])
        setDisciplinesProfessor({ disciplina_id: '' })
    }

    const deleteDisciplineProfessor = (index: number) => {
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
            const response = await api.post(`/discipline/professor/create/${id}`, { disciplinesProfessor, usuario_id: userId })
            if (response?.status === 201) {
                alert.success('Disciplina vinculada ao professor')
                setDisciplinesProfessor({ disciplina_id: null })
                await fetchData()
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteDisciplineProfessor = async (disciplineProfessorId?: string | number | null) => {
        if (disciplineProfessorId) {
            setLoading(true)
            try {
                const response = await api.delete(`/discipline/professor/delete/${disciplineProfessorId}`)
                if (response?.status === 200) {
                    alert.success('Dependente removido.');
                    await fetchData()
                }
            } catch (error) {
                alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleChangeDependentArray = (
        event: React.ChangeEvent<HTMLInputElement>,
        fieldName: string,
        id_dependente?: string | null
    ) => {

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

    const addDependent = () => {
        setArrayDependent((prevArray) => [...prevArray, {
            nome_dependente: dependent.nome_dependente,
            cpf_dependente: dependent.cpf_dependente,
            dt_nasc_dependente: dependent.dt_nasc_dependente
        }])
        setDependent({ nome_dependente: '', cpf_dependente: '', dt_nasc_dependente: '' })
    }

    const deleteDependent = (index: number) => {
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
                setDependent({ nome_dependente: '', cpf_dependente: '', dt_nasc_dependente: '' })
                await fetchData()
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteDependent = async (id_dependente?: string | null) => {
        setLoading(true)
        try {
            const response = await api.delete(`/user/dependent/delete/${id_dependente}`)
            if (response?.status === 200) {
                alert.success('Dependente removido.');
                await fetchData()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChangeDependent = (event: React.ChangeEvent<HTMLInputElement>) => {

        if (event.target.name?.includes('cpf_dependente')) {
            let str = event.target.value;
            event.target.value = formatCPF(str)
        }


        setDependent((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    };


    const handleBlurCEP = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)
        try {
            const { value } = event.target;
            const response = await axios.get(`https://viacep.com.br/ws/${value}/json/`)
            const { data } = response;

            setUserData((prevValues) => ({
                ...prevValues,
                rua: data.logradouro,
                cidade: data.localidade,
                uf: data.uf,
                bairro: data.bairro,
            }))
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

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
                const response = await api.post(`/user/create/userData`, { userData, userId: user.id })
                const { data } = response

                if (fileCallback) {
                    const formData = new FormData();
                    formData.append('file', fileCallback?.file, encodeURIComponent(fileCallback?.name || ''));
                    let query = `?usuario_id=${data?.userId}`;
                    if (fileCallback?.campo) query += `&campo=${fileCallback?.campo}`;
                    if (fileCallback?.tipo) query += `&tipo=${fileCallback?.tipo}`;
                    await api.post(`/file/upload${query}`, formData, { headers: { 'Authorization': "bearer " + 'token' } })
                }
                if (filesUser?.length > 0) {
                    for (const uploadedFile of filesUser) {
                        const formData = new FormData();
                        formData.append('file', uploadedFile?.file, encodeURIComponent(uploadedFile?.name || ''));
                        let query = `?usuario_id=${data?.userId}`;
                        if (uploadedFile?.campo) query += `&campo=${uploadedFile?.campo}`;
                        if (uploadedFile?.tipo) query += `&tipo=${uploadedFile?.tipo}`;
                        await api.post(`/file/upload${query}`, formData, { headers: { 'Authorization': "bearer " + 'token' } })
                    }
                }
                if (newUser && filesUser) { await api.patch(`/file/editFiles/${data?.userId}`, { filesUser }); }
                if (permissionPerfil) {
                    const permissionsToAdd = permissionPerfil.split(',').map(id => parseInt(id));
                    if (permissionsToAdd.length > 0) {
                        await api.post(`/permissionPerfil/create/${data?.userId}`, { permissionsToAdd })
                    }
                }
                if (response?.status === 201) {
                    alert.success('Usuário cadastrado com sucesso.');
                    router.push(`/administrative/users/list`)
                }
                if (response?.status === 200) {
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

    const handleEditUserData = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editeUser({ id, userData })
                if (response.status === 422) return alert.error('CPF já cadastrado.')

                if (arrayDependent?.length > 0) {
                    await api.patch(`/user/dependent/update`, { arrayDependent })
                }

                if (response?.status === 201) {
                    alert.success('Dados do Usuário atualizados.');
                    await fetchData()
                    return
                }
                alert.error('Tivemos um problema ao atualizar os dados do usuário.');
            } catch (error) {
                console.log(error)
                alert.error('Tivemos um problema ao atualizar os dados do usuário.');
                return error;
            } finally {
                setLoading(false)
            }
        }

    }

    const handleChangeHistoric = (value: ChangeEvent<HTMLInputElement>) => {

        setHistoricData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
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

        setHistoricData({
            responsavel: null,
            dt_ocorrencia: null,
            ocorrencia: null
        })
    }

    const deleteHistoric = (index: number | null) => {
        if (newUser && index) {
            setArrayHistoric((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const handleDeleteHistoric = async (id_historic?: number | string | null) => {
        if (id_historic) {
            setLoading(true)
            try {
                const response = await api.delete(`/user/historic/delete/${id_historic}`)
                if (response?.status == 201) {
                    alert.success('Historico removido.');
                    setValueIdHistoric(null)
                    await fetchData()
                }
            } catch (error) {
                alert.error('Ocorreu um erro ao remover o Historico selecionado.');
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleAddHistoric = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/user/historic/create/${id}`, { historicData })
            if (response?.status == 201) {
                alert.success('Historico adicionado.');
                setHistoricData({
                    responsavel: null,
                    dt_ocorrencia: null,
                    ocorrencia: null
                })
                await fetchData()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar Historico.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const columnHistoric = [
        { key: 'id_historico', label: 'ID' },
        { key: 'ocorrencia', label: 'Ocorrência' },
        { key: 'dt_ocorrencia', label: 'Data', date: true },
        { key: 'responsavel', label: 'Responsável' }
    ];

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
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
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
                            onSet={(set: boolean) => {
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
                            callback={(file: FilePreview) => {
                                if (file.status === 201 || file.status === 200) {
                                    setFileCallback({
                                        status: file.status,
                                        id_foto_perfil: file.fileId,
                                        preview: file.filePreview
                                    })
                                    if (!newUser) { fetchData() }
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
                            <Avatar src={(userData.foto && userData.foto.location) || fileCallback.preview || ''} sx={{
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
                                <TextInput disabled={!isPermissionEdit && true} placeholder='Nome Completo' name='nome' onChange={handleChange} value={userData?.nome || ''} label='Nome Completo *' sx={{ flex: 1, }} />
                                <TextInput disabled={!isPermissionEdit && true} placeholder='Nome Social' name='nome_social' onChange={isPermissionEdit && handleChange} value={userData?.nome_social || ''} label='Nome Social' sx={{ flex: 1, }} />
                            </Box>
                            <Box sx={{ ...styles.inputSection }}>
                                <TextInput disabled={!isPermissionEdit && true} placeholder='E-mail' name='email' onChange={handleChange} value={userData?.email || ''} label='E-mail *' sx={{ flex: 1, }} />
                                <PhoneInputField
                                    disabled={!isPermissionEdit && true}
                                    label='Telefone *'
                                    name='telefone'
                                    onChange={(phone: string) => setUserData({ ...userData, telefone: phone })}
                                    value={userData?.telefone}
                                    sx={{ flex: 1, }}
                                />
                            </Box>
                            <Box sx={{ ...styles.inputSection }}>

                                {!foreigner &&
                                    <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, cpf: value })}
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
                                    onSet={(set: boolean) => {
                                        setShowEditFiles({ ...showEditFile, cpf: set })
                                    }}
                                    title='CPF - Frente e verso'
                                    text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                    textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                    fileData={filesUser?.filter((file) => file.campo === 'cpf')}
                                    usuarioId={id}
                                    campo='cpf'
                                    tipo='documento usuario'
                                    callback={(file: FilePreview) => {
                                        if (file.status === 201 || file.status === 200) {
                                            if (!newUser) { fetchData() }
                                            else {
                                                handleChangeFilesUser('cpf', file.fileId, file.filePreview)
                                            }
                                        }
                                    }}
                                />
                                <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, cert_nascimento: value })} existsFiles={filesUser?.filter((file) => file.campo === 'nascimento').length > 0}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nascimento' name='nascimento' onChange={handleChange} type="date" value={(userData?.nascimento)?.split('T')[0] || ''} label='Nascimento *' sx={{ flex: 1, }} />
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.cert_nascimento}
                                        newUser={newUser}
                                        onSet={(set: boolean) => {
                                            setShowEditFiles({ ...showEditFile, cert_nascimento: set })
                                        }}
                                        title='Certidão de Nascimento ou de Certidão de Casamento'
                                        text='Faça o upload da sua certidão frente e verso, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'nascimento')}
                                        usuarioId={id}
                                        campo='nascimento'
                                        tipo='documento usuario'
                                        callback={(file: FilePreview) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { fetchData() }
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
                                    valueChecked={userData?.perfil}
                                    boxGroup={groupData.userPerfil}
                                    title="Perfil *"
                                    horizontal={mobile ? false : true}
                                    onSelect={(value: string) => {
                                        setPerfil(value)
                                        setUserData({
                                            ...userData,
                                            perfil: value,
                                            admin_melies: !value.includes('funcionario') ? 0 : 1,
                                        })
                                    }
                                    }
                                    sx={{ flex: 1, }}
                                />

                            </Box>
                            <Box sx={{ ...styles.inputSection, justifyContent: 'start', alignItems: 'center', gap: 25, padding: '0px 0px 20px 15px' }}>
                                {!newUser &&
                                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                        <Text bold small>Observações do {userData?.perfil}:</Text>
                                        <Button small text='observação' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, historic: true })} />
                                    </Box>
                                }

                            </Box>
                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.ativo} group={groupData.typeStatus} title="Status *" horizontal={mobile ? false : true}
                                onSelect={(value: string) => setUserData({
                                    ...userData,
                                    ativo: parseInt(value),
                                    admin_melies: parseInt(value) < 1 ? parseInt(value) : userData?.admin_melies,
                                    portal_aluno: parseInt(value) < 1 ? parseInt(value) : userData?.admin_melies
                                })} />
                        </Box>
                    </Box>
                </Box>

                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 3, padding: showSections?.accessData ? '0px 0px 20px 0px' : '0px', "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        },
                        justifyContent: 'flex-start'
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
                            {userData.perfil && userData?.perfil.includes('funcionario') && <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.admin_melies} group={groupData.typeYesOrNo} title="Acesso ao AdminMéliès *" horizontal={mobile ? false : true}
                                onSelect={(value: string) => setUserData({ ...userData, admin_melies: parseInt(value) })} />}
                            {userData.perfil && (userData?.perfil.includes('aluno') || userData?.perfil.includes('interessado')) && <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.portal_aluno} group={groupData.typeYesOrNo} title="Acesso ao Portal do aluno *" horizontal={mobile ? false : true}
                                onSelect={(value: string) => setUserData({ ...userData, portal_aluno: parseInt(value) })} />}

                            <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'start', marginTop: 2, flexDirection: 'column', padding: '0px 0px 20px 12px' }}>
                                <Button small text='permissões' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, permissions: true })} />
                            </Box>

                            <Backdrop open={showSections.permissions} sx={{ zIndex: 99999, }}>

                                <ContentContainer style={{ maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '1280px' }, overflowY: matches && 'auto', marginLeft: { md: '180px', lg: '280px' } }}>
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
                                                onSelect={(value: string) => {
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
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 3, padding: showSections.registration ? '0px 0px 20px 0px' : '0px', "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        },
                        justifyContent: 'flex-start'
                    }} onClick={() => setShowSections({ ...showSections, registration: !showSections.registration })}>
                        <Text title bold >Cadastro Completo</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_arrow_down})`,
                            transform: showSections.registration ? 'rotate(0deg)' : 'rotate(-90deg)',
                            transition: '.3s',
                        }} />
                    </Box>
                    {showSections?.registration &&
                        <>
                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.professor}
                                group={groupData.typeYesOrNo}
                                title="Professor *"
                                horizontal={mobile ? false : true}
                                onSelect={(value: string) => setUserData({ ...userData, professor: parseInt(value) })} />

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
                                            onSelect={(value: string | number) => setDisciplinesProfessor({ ...disciplinesProfessor, disciplina_id: value })}
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
                                    onSelect={(value: boolean) => {
                                        setForeigner(value)
                                        setUserData({ ...userData, nacionalidade: value === true ? 'Estrangeira' : 'Brasileira Nata' })
                                    }}
                                    sx={{ width: 1 }} />
                            </Box>
                            <Box sx={styles.inputSection}>
                                {!foreigner &&
                                    <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, cpf: value })}
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
                                    onSet={(set: boolean) => {
                                        setShowEditFiles({ ...showEditFile, cpf: set })
                                    }}
                                    title='CPF - Frente e verso'
                                    text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                    textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                    fileData={filesUser?.filter((file) => file.campo === 'cpf')}
                                    usuarioId={id}
                                    campo='cpf'
                                    tipo='documento usuario'
                                    callback={(file: FilePreview) => {
                                        if (file.status === 201 || file.status === 200) {
                                            if (!newUser) { fetchData() }
                                            else {
                                                handleChangeFilesUser('cpf', file.fileId, file.filePreview)
                                            }
                                        }
                                    }}
                                />
                                {foreigner &&
                                    <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, foreigner: value })}
                                        existsFiles={filesUser?.filter((file) => file.campo === 'estrangeiro').length > 0}>
                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Doc estrangeiro' name='doc_estrangeiro' onChange={handleChange} value={userData?.doc_estrangeiro || ''} label='Doc estrangeiro' sx={{ flex: 1, }} />
                                        <EditFile
                                            setFilesUser={setFilesUser}
                                            filesUser={filesUser}
                                            isPermissionEdit={isPermissionEdit}
                                            columnId="id_doc_usuario"
                                            open={showEditFile.foreigner}
                                            newUser={newUser}
                                            onSet={(set: boolean) => {
                                                setShowEditFiles({ ...showEditFile, foreigner: set })
                                            }}
                                            title='Documento estrangeiro - Frente e verso'
                                            text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                            textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                            fileData={filesUser?.filter((file) => file.campo === 'estrangeiro')}
                                            usuarioId={id}
                                            campo='estrangeiro'
                                            tipo='documento usuario'
                                            callback={(file: FilePreview) => {
                                                if (file.status === 201 || file.status === 200) {
                                                    if (!newUser) { fetchData() }
                                                    else {
                                                        handleChangeFilesUser('estrangeiro', file.fileId, file.filePreview)
                                                    }
                                                }
                                            }}
                                        />
                                    </FileInput>
                                }
                                <TextInput disabled={!isPermissionEdit && true} placeholder='Cidade' name='naturalidade' onChange={handleChange} value={userData?.naturalidade || ''} label='Naturalidade *' sx={{ flex: 1, }} />

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={countries} valueSelection={userData?.pais_origem || ''} onSelect={(value: string) => setUserData({ ...userData, pais_origem: value })}
                                    title="Pais de origem *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.userNationality} valueSelection={userData?.nacionalidade || ''} onSelect={(value: string) => setUserData({ ...userData, nacionalidade: value })}
                                    title="Nacionalidade *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />
                            </Box>

                            <Box sx={styles.inputSection}>
                                <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, rg: value })}
                                    existsFiles={filesUser?.filter((file) => file.campo === 'rg').length > 0}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='RG' name='rg' onChange={handleChange} value={userData?.rg || ''} label='RG *' sx={{ flex: 1, }} />
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.rg}
                                        newUser={newUser}
                                        onSet={(set: boolean) => {
                                            setShowEditFiles({ ...showEditFile, rg: set })
                                        }}
                                        title='RG - Frente e verso'
                                        text='Faça o upload do seu documento frente e verso, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'rg')}
                                        usuarioId={id}
                                        campo='rg'
                                        tipo='documento usuario'
                                        callback={(file: FilePreview) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { fetchData() }
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
                                <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, titleDoc: value })}
                                    existsFiles={filesUser?.filter((file) => file.campo === 'titulo').length > 0}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Título de Eleitor' name='titulo' onChange={handleChange} value={userData?.titulo || ''} label='Título de Eleitor' sx={{ flex: 1, }} />
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.titleDoc}
                                        newUser={newUser}
                                        onSet={(set: boolean) => {
                                            setShowEditFiles({ ...showEditFile, titleDoc: set })
                                        }}
                                        title='Título de Eleitor'
                                        text='Faça o upload do seu título, depois clique em salvar.'
                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'titulo')}
                                        usuarioId={id}
                                        campo='titulo'
                                        tipo='documento usuario'
                                        callback={(file: FilePreview) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { fetchData() }
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

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.racaCor} valueSelection={userData.cor_raca || ''} onSelect={(value: string) => setUserData({ ...userData, cor_raca: value })}
                                    title="Cor/raça *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.gender} valueSelection={userData?.genero || ''} onSelect={(value: string) => setUserData({ ...userData, genero: value })}
                                    title="Gênero *" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />

                                <SelectList disabled={!isPermissionEdit && true} fullWidth data={groupData.userDisability} valueSelection={userData?.deficiencia || ''} onSelect={(value: string) => setUserData({ ...userData, deficiencia: value })}
                                    title="Deficiência Física/Necessidade especial educacional*" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                />

                            </Box>

                            {userData?.deficiencia?.includes('Sim') &&
                                <>
                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                        valueChecked={userData?.tipo_deficiencia || ''}
                                        boxGroup={groupData.deficiencyTypes}
                                        title="Tipo de deficiência"
                                        horizontal={mobile ? false : true}
                                        onSelect={(value: string) => setUserData({
                                            ...userData,
                                            tipo_deficiencia: value
                                        })}
                                        sx={{ width: 1 }}
                                    />

                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                        valueChecked={userData?.autista || ''}
                                        boxGroup={groupData.autismTypes}
                                        title="Transtorno global do desenvolvimento/Transtorno do espectro autista"
                                        horizontal={mobile ? false : true}
                                        onSelect={(value: number | null) => setUserData({
                                            ...userData,
                                            autista: value
                                        })}
                                        sx={{ width: 1 }}
                                    />

                                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                                        valueChecked={userData?.superdotado || ''}
                                        boxGroup={groupData.superGifted}
                                        title="Altas habilidades/superdotação"
                                        horizontal={mobile ? false : true}
                                        onSelect={(value: string | null) => setUserData({
                                            ...userData,
                                            superdotado: value
                                        })}
                                        sx={{ width: 1 }}
                                    />
                                </>
                            }

                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.estado_civil} group={groupData.userCivil} title="Estado Cívil *" horizontal={mobile ? false : true} onSelect={(value: string) => setUserData({ ...userData, estado_civil: value })} />
                            <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput fullWidth disabled={!isPermissionEdit && true} placeholder='E-mail Méliès' name='email_melies' onChange={handleChange} value={userData?.email_melies || ''} label='E-mail Méliès' />
                                <TextInput fullWidth disabled={!isPermissionEdit && true} placeholder='E-mail Pessoal' name='email_pessoal' onChange={handleChange} value={userData?.email_pessoal || ''} label='E-mail Pessoal' />
                            </Box>
                            <Box sx={{ maxWidth: '580px', margin: '10px 0px 10px 0px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Text bold style={{ padding: '0px 0px 0px 10px' }}>Dependentes</Text>
                                {arrayDependent && arrayDependent.length > 0 && arrayDependent.map((dep, index) => (
                                    <>

                                        <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                            <FileInput left onClick={() => setShowEditFiles({ ...showEditFile, cpf_dependente: true })}
                                                existsFiles={filesUser?.filter((file) => file.campo === 'cpf_dependente').length > 0}>
                                                <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name={`nome_dependente-${index}`} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeDependentArray(e, 'nome_dependente', dep?.id_dependente)} value={dep.nome_dependente} sx={{ flex: 1 }} />
                                                <TextInput disabled={!isPermissionEdit && true} placeholder='CPF' name={`cpf_dependente-${index}`} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeDependentArray(e, 'cpf_dependente', dep?.id_dependente)} value={dep.cpf_dependente} sx={{ flex: 1 }} />
                                                <TextInput disabled={!isPermissionEdit && true} placeholder='Data de Nascimento' name={`dt_nasc_dependente-${index}`} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeDependentArray(e, 'dt_nasc_dependente', dep?.id_dependente)} type="date" value={(dep.dt_nasc_dependente)?.split('T')[0] || ''} sx={{ flex: 1 }} />
                                            </FileInput>
                                            <EditFile
                                                setFilesUser={setFilesUser}
                                                filesUser={filesUser}
                                                isPermissionEdit={isPermissionEdit}
                                                columnId="id_doc_usuario"
                                                open={showEditFile.cpf_dependente}
                                                newUser={newUser}
                                                onSet={(set: boolean) => {
                                                    setShowEditFiles({ ...showEditFile, cpf_dependente: set })
                                                }}
                                                title='CPF Dependente - Frente e verso'
                                                text='Faça o upload do documento do Dependente frente e verso, depois clique em salvar.'
                                                textDropzone='Arraste ou clique para selecionar a Foto ou Arquivo que deseja'
                                                fileData={filesUser?.filter((file) => file.campo === 'cpf_dependente')}
                                                usuarioId={id}
                                                campo='cpf_dependente'
                                                tipo='documento usuario'
                                                callback={(file: FilePreview) => {
                                                    if (file.status === 201 || file.status === 200) {
                                                        if (!newUser) { fetchData() }
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
                                        onChange={(phone: string) => setUserData({ ...userData, telefone_emergencia: phone })}
                                        value={userData?.telefone_emergencia}
                                        sx={{ flex: 1, }}
                                    />
                                </Box>
                            </ContentContainer>
                            <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, schoolRecord: value })}
                                existsFiles={filesUser?.filter((file) => file.campo === 'historico/diploma').length > 0}>
                                <RadioItem disabled={!isPermissionEdit && true} valueRadio={userData?.escolaridade} group={groupData.userEscolaridade} title="Escolaridade *" horizontal={mobile ? false : true}
                                    onSelect={(value: string) => {
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
                                    onSet={(set: boolean) => {
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
                                    callback={(file: FilePreview) => {
                                        if (file.status === 201 || file.status === 200) {
                                            if (!newUser) { fetchData() }
                                            else {
                                                handleChangeFilesUser('historico/diploma', file.fileId, file.filePreview)
                                            }
                                        }
                                    }}
                                />
                            </FileInput>
                            {userData?.escolaridade === 'Ensino médio' &&
                                <RadioItem disabled={!isPermissionEdit && true}
                                    valueRadio={userData?.tipo_origem_ensi_med}
                                    group={groupData.origemEnsinoMedio}
                                    title="Origem Ensino Médio *"
                                    horizontal={mobile ? false : true}
                                    onSelect={(value: string) => setUserData({ ...userData, tipo_origem_ensi_med: value })}
                                />}

                            <Box sx={styles.inputSection}>
                                <TextInput disabled={!isPermissionEdit && true} placeholder='CEP' name='cep' onChange={handleChange} value={userData?.cep || ''} label='CEP *'
                                    onBlur={handleBlurCEP}
                                    sx={{ flex: 1, }} />
                                <FileInput onClick={(value: boolean) => setShowEditFiles({ ...showEditFile, address: value })}
                                    existsFiles={filesUser?.filter((file) => file.campo === 'comprovante_residencia').length > 0}>
                                    <TextInput disabled={!isPermissionEdit && true} placeholder='Endereço' name='rua' onChange={handleChange} value={userData?.rua || ''} label='Endereço *' sx={{ flex: 1, }} />
                                    <EditFile
                                        setFilesUser={setFilesUser}
                                        filesUser={filesUser}
                                        isPermissionEdit={isPermissionEdit}
                                        columnId="id_doc_usuario"
                                        open={showEditFile.address}
                                        newUser={newUser}
                                        onSet={(set: boolean) => {
                                            setShowEditFiles({ ...showEditFile, address: set })
                                        }}
                                        title='Comprovante de residencia'
                                        text='Faça o upload do seu comprovante de residencia, precisa ser uma conta em seu nome ou comprovar que mora com o titular da conta.'
                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                        fileData={filesUser?.filter((file) => file.campo === 'comprovante_residencia')}
                                        usuarioId={id}
                                        campo='comprovante_residencia'
                                        tipo='documento usuario'
                                        callback={(file: FilePreview) => {
                                            if (file.status === 201 || file.status === 200) {
                                                if (!newUser) { fetchData() }
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
                </Box>
            </Box>


            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end', padding: '20px 20px' }}>
                <Button cancel style={{ borderRadius: 2 }} text="Cancelar" onClick={() => { if (newUser) { router.push('/administrative/users/list') } else { fetchData() } }} />
                <ButtonIcon text="Salvar Alterações" style={{ borderRadius: 2 }} color="#fff" onClick={() => {
                    if (newUser) { handleCreateUser() } else { handleEditUserData() }
                }} />
            </Box>


            <Backdrop open={showSections.historic} sx={{ zIndex: 99999, paddingTop: 5 }}>
                {showSections.historic &&
                    <ContentContainer style={{
                        maxWidth: { md: '800px', lg: '1980px' }, maxHeight: { md: '180px', lg: '650px', xl: '1080px' }, marginLeft: { md: '180px', lg: '280px' },
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
                        <ContentContainer style={{ boxShadow: 'none', overflow: 'auto', }}>
                            <Table_V1 columns={columnHistoric}
                                data={arrayHistoric}
                                columnId="id_historico"
                                columnActive={false}
                                onSelect={(value: string | null) => {
                                    let valueSelected = value ? parseInt(value) : null
                                    setValueIdHistoric(valueSelected)
                                }}
                                routerPush={false}
                            />

                            {!showSections.addHistoric && <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', marginTop: 2 }}>
                                <Button disabled={!isPermissionEdit && true} small text='adicionar' style={{ padding: '5px 6px 5px 6px', width: 100 }} onClick={() => setShowSections({ ...showSections, addHistoric: true })} />
                            </Box>}

                            {showSections.addHistoric &&
                                <>
                                    <ContentContainer style={{ overflow: 'auto', }}>
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
                                            }} onClick={() => setValueIdHistoric(null)} />
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
}

export default UserData