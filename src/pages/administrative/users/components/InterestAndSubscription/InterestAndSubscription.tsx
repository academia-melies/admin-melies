import { ChangeEvent, useEffect, useState } from "react";
import { Box, Text, ContentContainer, Button, Divider, TextInput, ButtonIcon } from "../../../../../atoms";
import { Backdrop, CircularProgress, Tooltip } from "@mui/material";
import { icons } from "../../../../../organisms/layout/Colors";
import { CheckBoxComponent, RadioItem, SelectList } from "../../../../../organisms";
import { EditFile } from "../../[id]";
import Link from "next/link";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { FilePreview, FileUser, UserDataObjectProps } from "../UserData/UserData"
import { groupData } from "../../../../../helpers/groupData";
import { useAppContext } from "../../../../../context/AppContext";
import { api } from "../../../../../api/api";
import { useRouter } from "next/router";
import { handleModules } from "../../../../../helpers";

export interface Course {
    label: string,
    value: string,
}

export interface Classes {
    label: string,
    value: string,
}

export interface Period {
    label: string,
    value: string,
    idClass: string | number | null
}

interface InterestSubscriptionProps {
    id: string | number | null
    isPermissionEdit: boolean
    newUser: boolean,
    mobile: boolean
    userData: UserDataObjectProps
    classes: Classes[]
    courses: Course[]
    period: Period[]
}

interface Subscription {
    id_inscricao?: string | number | null
    id_redacao?: string | number | null
    interesse_id: string | number | null,
    usuario_id: string | number | null,
    turma_id: string | number | null,
    forma_ingresso?: string | number | null,
    forma_contato: string | number | null,
    dt_agendamento_prova: string | number | null
    nt_redacao: string | number | null,
    nt_enem: string | number | null,
    status_processo_sel: string | number | null
    forma_pagamento: string | number | null
    agendamento_processo: string | number | null
}

interface Requeriment {
    id_req_matricula: string | number | null
    turma_id: string | number | null
    status: string | null
    obs_status: string | null
    aceite_termos: string | number | null
    aprovado?: number | null
    analisado_por: string | null
}

interface ArrayInterest {
    id_interesse: string | number | null
    curso_id: string | number | null
    turma_id: string | number | null
    usuario_id: string | number | null
    periodo_interesse: string | number | null
    observacao_int: string | null
    modulo_curso: number
    nome_curso: string | null
    nome_turma: string | null
    id_redacao: string | number | null
    corrigido: string | number | null
    requeriments: (Requeriment | null)[];
    inscricao: (Subscription | null);
}

interface Interest {
    curso_id: string | number | null
    turma_id: string | number | null
    usuario_id: string | number | null
    periodo_interesse: string | number | null
    observacao_int: string | null
    modulo_curso: number
    nome_curso: string | null
    nome_turma: string | null
    id_redacao: string | number | null
    corrigido: string | number | null
    requeriments: (Requeriment | null)[];
    inscricao: (Subscription | null);
}

type SelectiveProcessTableState = {
    [key: number]: boolean;
};

interface ChangeSubscriptionData {
    interestId: string | number | null
    field: string
    value: string | number | null
}

interface SendRequeriment {
    classId: string | number | null
    courseId: string | number | null,
    entryForm: string | number | null,
    moduleCourse: number
}

interface ShowSections {
    interest: boolean,
    addInterest: boolean,
    viewInterest: boolean,
}

interface ClassesInterestGet {
    ativo: number
    duracao: string | null
    nome_turma: string
    id_turma: string | number
    periodo: string | null
}

interface GroupSelectClass {
    label: string | null
    value: string | number | null
    modules?: { label: string; value: number }[] | null
}

interface InterestSelected {
    turma_id: string | number | null,
    curso_id: string | number | null,
    periodo_interesse: string | null,
    observacao_int: string | null,
    id_interesse: string | number | null
}

const InterestAndSubscription = ({
    id,
    isPermissionEdit,
    newUser,
    mobile,
    userData,
    classes,
    courses,
    period
}: InterestSubscriptionProps) => {

    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [arrayInterests, setArrayInterests] = useState<ArrayInterest[]>([])
    const [classesInterest, setClassesInterest] = useState<GroupSelectClass[]>([])
    const [periodSelected, setPeriodSelected] = useState<GroupSelectClass[]>([])
    const [showSelectiveProcessTable, setShowSelectiveProcessTable] = useState<SelectiveProcessTableState>({})
    const [showEditFile, setShowEditFiles] = useState({
        enem: false
    })
    const [filesUser, setFilesUser] = useState<FileUser[]>([])
    const [showSections, setShowSections] = useState<ShowSections>({
        interest: false,
        addInterest: false,
        viewInterest: false,
    })
    const [interests, setInterests] = useState<Interest>({
        curso_id: '',
        turma_id: '',
        usuario_id: '',
        periodo_interesse: '',
        observacao_int: '',
        modulo_curso: 1,
        nome_curso: '',
        nome_turma: '',
        id_redacao: '',
        corrigido: '',
        requeriments: [],
        inscricao: null
    });
    const [interestSelected, setInterestSelected] = useState<InterestSelected>({
        turma_id: 'null',
        curso_id: 'null',
        periodo_interesse: 'null',
        observacao_int: 'null',
        id_interesse: 'null'
    })
    const { setLoading, user, alert, matches, colorPalette } = useAppContext()
    const router = useRouter()


    const getInterest = async () => {
        setLoadingData(true)
        try {
            const response = await api.get(`/user/interests/${id}`)
            const { data } = response
            setArrayInterests(data)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    useEffect(() => {
        getInterest()
    }, [id])

    const toggleProcessSectiveTable = (index: number) => {
        setShowSelectiveProcessTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const handleChangeSubscriptionData = ({ interestId, field, value }: ChangeSubscriptionData) => {
        setArrayInterests((prevClassDays) =>
            prevClassDays.map((item) => {
                if (item.id_interesse === interestId) {
                    // Certifique-se de que `inscricao` não é null e crie um objeto se necessário
                    const updatedItem = { ...item };

                    // Verifique se `inscricao` é null e inicialize se necessário
                    if (updatedItem.inscricao === null) {
                        return updatedItem
                    }

                    // Atualize o campo específico com o valor
                    const subscriptionField = field as keyof Subscription;
                    updatedItem.inscricao[subscriptionField] = value;

                    return updatedItem;
                } else {
                    return item;
                }
            })
        );
    };


    const handleSendRequeriment = async ({ classId, courseId, entryForm = null, moduleCourse = 1 }: SendRequeriment) => {
        setLoading(true)
        try {
            const response = await api.post(`/requeriment/subscription/create`, { classId, courseId, entryForm, userData, moduleEnrollment: moduleCourse, userResp: user?.id })
            if (response?.status === 201) {
                alert.success('Requerimento enviado com sucesso.')
                // await handleEditUser()
            } else {
                alert.error('Ocorreu um erro interno ao enviar o requerimento. Tente novamente ou consulte o Suporte.')
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }

    }

    const verifyDataToGetway = () => {

        if (!userData?.nome) {
            alert.error('Preencha o campo nome para seguirmos com a matrícula.')
            return false
        }
        if (!userData?.email) {
            alert.error('Preencha o campo e-mail para seguirmos com a matrícula.')
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

    // const verifyEnrollment = (interest) => {
    //     const isRegistered = enrollmentData?.filter(item => item.turma_id === interest?.turma_id)

    //     if (isRegistered?.length > 0) {
    //         alert.info('O aluno já está matrículado na turma selecionada. Analíse bem antes de prosseguir, para não "duplicar" matrículas ativas.')
    //         return false
    //     }
    //     return true
    // }

    const handleValidateGetway = async () => {
        setLoading(true)
        try {
            let response = {
                status: 400,
                ok: false
            }
            const result = await api.post(`/user/validate/getway`, { userId: id })
            if (result.status) {
                response.status = result.status
                response.ok = (result.status === 201 || result.status === 200)
            }
            return response
        } catch (error) {
            alert.error('Ocorreu um erro. Valide os seus dados (Verifique se seu CPF está correto) e tente novamente.')
            console.log(error)
            return {
                status: 400,
                ok: false
            }
        } finally {
            setLoading(false)
        }
    }

    const handleEnrollment = async (interest: ArrayInterest, subscription: Subscription | null) => {
        if (verifyDataToGetway()) {
            setLoading(true)
            try {
                const result = await handleValidateGetway()
                if (result && result.ok) {
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

    const handleBlurNota = (event: ChangeEvent<HTMLInputElement>, subscription: Subscription) => {

        let nota = event.target.value;

        if (parseInt(nota) > 50) {
            handleChangeSubscriptionData({ interestId: subscription?.interesse_id, field: 'status_processo_sel', value: 'Classificado' })
            return
        }
        if (parseInt(nota) <= 50) {
            handleChangeSubscriptionData({ interestId: subscription?.interesse_id, field: 'status_processo_sel', value: 'Desclassificado' })
            return
        }
    }

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

    const handleSendSelectiveEssayWriting = async (interest: ArrayInterest) => {
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
                // await handleEditUser()
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const addInterest = () => {
        if (!interests.curso_id) {
            alert.error('Por favor, selecione o curso de interesse.')
            return
        }

        const defaultSubscription: Subscription = {
            interesse_id: null,
            usuario_id: null,
            turma_id: null,
            forma_ingresso: null,
            forma_contato: null,
            dt_agendamento_prova: null,
            nt_redacao: null,
            nt_enem: null,
            status_processo_sel: null,
            forma_pagamento: null,
            agendamento_processo: null
        };

        setArrayInterests((prevArray) => [
            ...prevArray,
            {
                id_interesse: null,
                curso_id: interests.curso_id,
                turma_id: interests.turma_id,
                nome_curso: interests.nome_curso,
                nome_turma: interests.nome_turma,
                periodo_interesse: interests.periodo_interesse,
                observacao_int: interests.observacao_int || '',
                inscricao: defaultSubscription, // Utilize o objeto padrão ou null se apropriado
                requeriments: [],
                usuario_id: '',
                modulo_curso: 1,
                id_redacao: '',
                corrigido: '',
            }
        ]);

        setInterests({
            curso_id: '',
            turma_id: '',
            usuario_id: '',
            periodo_interesse: '',
            observacao_int: '',
            modulo_curso: 1,
            nome_curso: '',
            nome_turma: '',
            id_redacao: '',
            corrigido: '',
            requeriments: [],
            inscricao: null
        })
    }

    const deleteInterest = (index: number) => {
        if (newUser) {
            setArrayInterests((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };


    const handleAddInterest = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/user/interest/create/${id}`, { interests, userId: id })
            if (response?.status == 201) {
                alert.success('Interesse adicionado.');
                setInterests({
                    curso_id: '',
                    turma_id: '',
                    usuario_id: '',
                    periodo_interesse: '',
                    observacao_int: '',
                    modulo_curso: 1,
                    nome_curso: '',
                    nome_turma: '',
                    id_redacao: '',
                    corrigido: '',
                    requeriments: [],
                    inscricao: null
                })
                getInterest()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar Interesse.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function listClassesInterest(id_course: string | number) {

        try {
            const response = await api.get<ClassesInterestGet[]>(`/class/course/${id_course}`)

            const { data = [] } = response
            const groupClass: GroupSelectClass[] = data.filter(item => item.ativo === 1).map(turma => ({
                label: turma.nome_turma || '',
                value: turma?.id_turma || '',
                modules: turma?.duracao ? handleModules(turma?.duracao) : null
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

    const getInterestEdit = async (interestId: string | number | null) => {
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


    const handleChangeInterest = async (value: string | number, field: string) => {

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
            [field]: value,
        }))
    }

    const handleChangeInterestSelected = (value: ChangeEvent<HTMLInputElement>) => {

        setInterestSelected((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleEditInterest = async (id_interest: string | number | null) => {
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

    const handleDeleteInterest = async (id_interesse: string | number | null) => {
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

    const handleSubscription = async () => {
        setLoading(true)
        try {
            let success = true
            if (arrayInterests?.length > 0) {
                for (let interest of arrayInterests) {
                    const subscription = { ...interest?.inscricao, id_redacao: interest?.id_redacao || null };
                    if (subscription) {
                        if (subscription?.id_inscricao) {
                            const response = await api.patch(`/subscription/update/${subscription?.id_inscricao}`, { subscriptionData: subscription, userResp: user?.id })
                            if (response.status !== 200) {
                                success = false
                            }
                        } else if (subscription?.forma_ingresso) {
                            const createSub = await api.post(`/subscription/create`, {
                                subscriptionData: {
                                    ...subscription,
                                    turma_id: interest?.turma_id,
                                    usuario_id: id,
                                    interesse_id: interest?.id_interesse
                                }
                            })

                            if (createSub.status !== 201) {
                                success = false
                            }
                        }

                    }
                }
            }
            if (success) {
                alert.success('Interesses e inscrições atualizados com sucesso.');
                await getInterest()
                return
            }
            alert.error('Tivemos um problema ao atualizar Interesses e inscrições.');
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao atualizar Interesses e inscrições.');
            return error;
        } finally {
            setLoading(false)
        }
    }



    return (
        <Box>
            {loadingData &&
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', heigth: '100%', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                    <CircularProgress />
                </Box>
            }
            <ContentContainer style={{ ...styles.containerContract, opacity: loadingData ? .6 : 1, padding: '25px' }}>
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1, "&:hover": {
                        opacity: 0.8,
                        cursor: 'pointer'
                    },
                    justifyContent: 'space-between'
                }}>
                    <Text title bold>Inscrições</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_arrow_down})`,
                        transition: '.3s',
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} />
                </Box>
                <>
                    <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>
                        {
                            arrayInterests?.map((interest, index) => {
                                const requeriments = interest?.requeriments && interest?.requeriments?.some(item => item?.aprovado && item.aprovado === 1);
                                const [isHaveRequeriment] = interest?.requeriments && interest?.requeriments?.map(item => item?.id_req_matricula) || [];
                                const [isRequerimentoAproved] = interest?.requeriments && interest?.requeriments?.map(item => item?.aprovado === 1) || [];
                                const [isRequerimentoReproved] = interest?.requeriments && interest?.requeriments?.map(item => item?.aprovado === 0) || [];
                                const approvedRequeriment = requeriments ? true : false;
                                const subscription = interest?.inscricao;
                                const disable = (interest?.turma_id && approvedRequeriment && isPermissionEdit && (subscription?.forma_ingresso !== 'Trânsferência' && subscription?.forma_ingresso !== 'Destrancamento de matrícula')) ? false : true;
                                const interestTitle = `${interest?.nome_curso}_${interest?.nome_turma}_${interest?.periodo_interesse}_${interest?.modulo_curso}º módulo`;
                                const [respAnalisar] = interest?.requeriments.length > 0 && interest.requeriments.map(req => req && req.analisado_por) || [];
                                let linkRequeriment;
                                if (isHaveRequeriment) {
                                    linkRequeriment = `/secretary/studentDetails/requeriments/student/${isHaveRequeriment}`
                                } else {
                                    linkRequeriment = `/secretary/studentDetails/requeriments?userId=${id}&classId=${interest?.turma_id}&moduleEnrollment=1&courseId=${interest?.curso_id}&formaIngresso=${subscription?.forma_ingresso}`;
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

                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={subscription?.forma_ingresso} group={groupData.formaIngresso} title="Forma de Ingresso:" horizontal={mobile ? false : true}
                                                onSelect={(value: number) => handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'forma_ingresso', value })} />


                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={subscription?.forma_pagamento} group={groupData.paymentForm} title="Forma Pagamento:" horizontal={mobile ? false : true}
                                                onSelect={(value: number) => handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'forma_pagamento', value })} />

                                            <CheckBoxComponent disabled={!isPermissionEdit && true}
                                                valueChecked={subscription?.forma_contato || ''}
                                                boxGroup={groupData.contactForm}
                                                title="Forma de contato:"
                                                horizontal={mobile ? false : true}
                                                onSelect={(value: string) =>
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
                                                        onSet={(set: boolean) => {
                                                            setShowEditFiles({ ...showEditFile, enem: set })
                                                        }}
                                                        title='Boletim de resultados do ENEM'
                                                        text='Faça o upload do seu Boletim, depois clique em salvar.'
                                                        textDropzone='Arraste ou clique para selecionar o arquivo desejado.'
                                                        fileData={filesUser?.filter((file) => file.campo === 'enem')}
                                                        usuarioId={id}
                                                        campo='enem'
                                                        tipo='documento usuario'
                                                        callback={(file: FilePreview) => {
                                                            if (file.status === 201 || file.status === 200) {
                                                                if (!newUser) { getInterest() }
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
                                                        <TextInput disabled={!isPermissionEdit && true} name='agendamento_processo' onChange={(e: ChangeEvent<HTMLInputElement>) =>
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

                                                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flex: 1, padding: '0px 0px 0px 5px' }}>
                                                        <Text bold>Prova - Redação:</Text>
                                                        {interest?.id_redacao &&
                                                            <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>
                                                                <Link href={`${process.env.NEXT_PUBLIC_REDACAO_URL}?key_writing_user=${interest?.id_redacao}`} target="_blank">
                                                                    <Box sx={{
                                                                        ...styles.menuIcon,
                                                                        backgroundImage: `url('${icons.file}')`,
                                                                        transition: '.3s',
                                                                        "&:hover": {
                                                                            opacity: 0.8,
                                                                            cursor: 'pointer'
                                                                        }
                                                                    }} />
                                                                </Link>
                                                            </Box>
                                                        }

                                                    </Box>
                                                    <Divider padding={0} />
                                                    <Box sx={styles.inputSection}>
                                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Nota da prova' name='nt_redacao' onBlur={(e: ChangeEvent<HTMLInputElement>) => handleBlurNota(e, subscription)}
                                                            type="number" onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                                handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: e.target.name, value: e.target.value })}
                                                            value={subscription?.nt_redacao || ''} label='Nota da prova' sx={{ flex: 1, }} />
                                                    </Box>
                                                </>}
                                            <>
                                                {subscription?.forma_ingresso === 'Nota do Enem'
                                                    && <Box sx={styles.inputSection}>
                                                        <TextInput disabled={!isPermissionEdit && true} placeholder='Nota da prova' name='nt_enem'
                                                            type="number" onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                                handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: e.target.name, value: e.target.value })}
                                                            value={subscription?.nt_enem || ''} label='Nota da prova' sx={{ flex: 1, }} />
                                                    </Box>
                                                }
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Box sx={{
                                                        display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                        border: `1px solid green`,
                                                        transition: '.3s',
                                                        backgroundColor: subscription?.status_processo_sel === 'Classificado' ? 'green' : 'trasnparent', borderRadius: 2,
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer',
                                                            transform: 'scale(1.03, 1.03)'
                                                        },
                                                    }} onClick={() => {
                                                        if (subscription?.status_processo_sel !== 'Classificado') {
                                                            handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'status_processo_sel', value: 'Classificado' })
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
                                                            opacity: 0.8,
                                                            cursor: 'pointer',
                                                            transform: 'scale(1.03, 1.03)'
                                                        },
                                                    }} onClick={() => {
                                                        if (subscription?.status_processo_sel !== 'Desclassificado') {
                                                            handleChangeSubscriptionData({ interestId: interest?.id_interesse, field: 'status_processo_sel', value: 'Desclassificado' })
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
                                                                                        handleSendRequeriment({
                                                                                            classId: interest?.turma_id, courseId: interest?.curso_id, entryForm: subscription?.forma_ingresso,
                                                                                            moduleCourse: interest?.modulo_curso
                                                                                        })
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

                    <Button disabled={!isPermissionEdit && true} text="Nova inscrição/Interesse" style={{ width: 250, marginTop: 3 }}
                        onClick={() => setShowSections({ ...showSections, interest: true })} />
                </>
            </ContentContainer>



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
                                                const [isRequerimentoAproved] = interest?.requeriments && interest?.requeriments?.map(item => item?.aprovado === 1);
                                                const approvedRequeriment = requeriments ? true : false;
                                                const disable = (interest?.turma_id && approvedRequeriment && isPermissionEdit) ? false : true;
                                                const subscription = interest?.inscricao;
                                                let linkRequeriment;
                                                if (isHaveRequeriment) {
                                                    linkRequeriment = `/secretary/studentDetails/requeriments/student/${isHaveRequeriment}`
                                                } else {
                                                    linkRequeriment = `/secretary/studentDetails/requeriments?userId=${id}&classId=${interest?.turma_id}&moduleEnrollment=1&courseId=${interest?.curso_id}`;
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
                                                                                    }} onClick={() => handleEnrollment(interest, subscription)} />
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
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={courses} valueSelection={interests?.curso_id}
                                            onSelect={(value: number | string) => {
                                                handleChangeInterest(value, 'curso_id')
                                                listClassesInterest(value)
                                            }}
                                            title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={classesInterest} valueSelection={interests?.turma_id}
                                            onSelect={(value: number | string) => handleChangeInterest(value, 'turma_id')}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth
                                            data={interests?.turma_id ? period?.filter(item => item.idClass === interests?.turma_id) : []} valueSelection={interests?.periodo_interesse}
                                            onSelect={(value: number | string | null) => setInterests({ ...interests, periodo_interesse: value })}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} fullWidth data={
                                            interests?.turma_id ? classesInterest?.filter(item => item.value === interests?.turma_id)?.map(item => item.modules)[0] : []} valueSelection={interests?.modulo_curso}
                                            onSelect={(value: number) => setInterests({ ...interests, modulo_curso: value })}
                                            title="Módulo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                        />

                                    </Box>
                                    <TextInput disabled={!isPermissionEdit && true}
                                        placeholder='Observação'
                                        name='observacao_int'
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChangeInterest(e.target.value, 'observacao_int')}
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
                                            onSelect={(value: string | number) => {
                                                setInterestSelected({ ...interestSelected, curso_id: value })
                                                listClassesInterest(value)
                                            }}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} data={classesInterest} valueSelection={interestSelected?.turma_id}
                                            title="Turma" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value: string | number) => setInterestSelected({ ...interestSelected, turma_id: value })}
                                        />
                                        <SelectList disabled={!isPermissionEdit && true} data={periodSelected} valueSelection={interestSelected?.periodo_interesse}
                                            title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                            onSelect={(value: string) => setInterestSelected({ ...interestSelected, periodo_interesse: value })}
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
            </Backdrop>


            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end', padding: '20px 20px' }}>
                <Button cancel style={{ borderRadius: 2 }} text="Cancelar" onClick={() => { if (newUser) { router.push('/administrative/users/list') } else { getInterest() } }} />
                <ButtonIcon text="Salvar Alterações" style={{ borderRadius: 2 }} color="#fff" onClick={() => handleSubscription()} />
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

export default InterestAndSubscription