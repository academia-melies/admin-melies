import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Backdrop, Tooltip, useMediaQuery, useTheme } from "@mui/material"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../../../atoms"
import { CheckBoxComponent, ContainDropzone, RadioItem, SectionHeader } from "../../../../../organisms"
import { useAppContext } from "../../../../../context/AppContext"
import { SelectList } from "../../../../../organisms/select/SelectList"
import { api } from "../../../../../api/api"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { icons } from "../../../../../organisms/layout/Colors"
import Dropzone from "react-dropzone"
import { getRandomInt } from "../../../../../helpers"
import { useReactToPrint } from "react-to-print"
import Link from "next/link"

export default function RequerimentEnrollmentStudent(props) {
    const { setLoading, alert, colorPalette, user, theme, userPermissions, menuItemsList } = useAppContext()
    const userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const [disciplines, setDisciplines] = useState([])
    const [dispensedDp, setDispensedDp] = useState(0)
    const [disciplinesSelected, setDisciplinesSelected] = useState()
    const [statusRequeriment, setStatusRequeriment] = useState()
    const [disciplinesCourse, setDisciplinesCourse] = useState()
    const [requerimentData, setRequerimentData] = useState({})
    const [fileUser, setFileUser] = useState([])
    const [showDocSection, setShowDocSection] = useState(true)
    const [showDropFile, setShowDropFile] = useState({ active: false, campo: '', tipo: 'documento usuario', title: '' })
    const [showDropFileDiscipline, setShowDropFileDiscipline] = useState({ active: false, fileUrl: '', tipo: 'documento de dispensa', title: '' })


    const getRequeriment = async () => {
        try {
            const response = await api.get(`/requeriment/${id}`)
            setRequerimentData(response?.data)
            return response?.data
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getDocuments = async (userId) => {
        try {
            const response = await api.get(`/requeriment/files/${id}/${userId}`)
            if (response?.data?.length > 0) {
                setFileUser(response?.data)
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async function getDisciplines() {
        setLoading(true)
        try {
            const response = await api.get(`/requeriment/disciplines/${id}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.disciplina_id.toString(),
                id_disc_req_mat: disciplines?.id_disc_req_mat,
                dispensado: disciplines?.dispensado,
                descricao_dp: disciplines?.descricao,
                softwares: disciplines?.softwares,
                aprovado: disciplines?.aprovado,
                motivo_reprovado: disciplines?.motivo_reprovado,
                nt_final_disc: disciplines?.nt_final_disc,
                justificativa_pedido_disp: disciplines?.justificativa_pedido_disp,
                files: disciplines?.files
            }));


            const disciplinesSelect = groupDisciplines.map((discipline) => discipline.value);
            const disciplineSelected = groupDisciplines.filter((discipline) => discipline.dispensado === 0)?.map(item => item.value);

            setDisciplinesSelected(disciplineSelected)
            setDisciplinesCourse(disciplinesSelect)
            setDisciplines(groupDisciplines);

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            const requeriment = await getRequeriment()
            if (requeriment) {
                await getDocuments(requeriment?.usuario_id)
                await getDisciplines()
            }
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Dados')
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        handleItems();
    }, [])

    const handleChangeFiles = (fileId, filePreview, campo) => {
        setFileUser((prevClassDays) => [
            ...prevClassDays,
            {
                id_doc_usuario: fileId,
                location: filePreview,
                name_file: filePreview,
                campo: campo,
                tipo: 'documento usuario'
            }
        ]);
    };


    const handleToggleSelection = (value) => {
        const updatedDisciplines = disciplines.map(discipline => {
            if (discipline.id_disc_req_mat === value) {
                const newDispensed = parseInt(value);
                return {
                    ...discipline,
                    dispensado: newDispensed,
                };
            }
            return discipline;
        });

        setDisciplines(updatedDisciplines);
    };


    const handleRemoveFile = (file) => {
        const arquivosAtualizados = fileUser.filter((uploadedFile) => uploadedFile.id !== file.id);
        setFileUser(arquivosAtualizados);
    };

    const componentPDF = useRef()

    const handleGeneratePdf = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: 'Requerimento de Matrícula',
        onAfterPrint: () => alert.info('Requerimento exportado em PDF.')
    })


    const handleChangeStatusDiscipline = async (disciplineId, result) => {
        const updatedDisciplines = disciplines.map(discipline => {
            if (discipline.id_disc_req_mat === disciplineId) {
                const newAprovado = parseInt(discipline.aprovado) === parseInt(result) ? null : parseInt(result);
                return {
                    ...discipline,
                    aprovado: newAprovado,
                };
            }
            return discipline;
        });

        setDisciplines(updatedDisciplines);
    };

    const handleChangeGradeDiscipline = async (disciplineId, value) => {
        const updatedDisciplines = disciplines.map(discipline => {
            if (discipline.id_disc_req_mat === disciplineId) {
                return {
                    ...discipline,
                    nt_final_disc: value,
                };
            }
            return discipline;
        });

        setDisciplines(updatedDisciplines);
    };


    const handleChangeReasonStatusDiscipline = async (disciplineId, value) => {
        const updatedDisciplines = disciplines.map(discipline => {
            if (discipline.id_disc_req_mat === disciplineId) {
                return {
                    ...discipline,
                    motivo_reprovado: value,
                };
            }
            return discipline;
        });

        setDisciplines(updatedDisciplines);
    };

    const handleChangeReasonStatusDoc = async (fileId, value) => {
        const updatedFiles = fileUser.map(file => {
            if (file.id_doc_req_matr === fileId) {
                return {
                    ...file,
                    motivo_reprovado: value,
                };
            }
            return file;
        });

        setFileUser(updatedFiles);
    };



    const handleChangeStatusFiles = async (fileId, result) => {
        const updatedFiles = fileUser.map((file) => {
            if (file?.id_doc_req_matr === fileId) {
                const newAprovado = file?.aprovado === parseInt(result) ? null : parseInt(result);
                return {
                    ...file,
                    aprovado: parseInt(newAprovado),
                };
            }
            return file;
        });

        setFileUser(updatedFiles);
    };

    const handleUpdateRequeriment = async ({ aprovadoStatus = 'aprovado' }) => {
        setLoading(true)
        setRequerimentData({ ...requerimentData, aprovado: aprovadoStatus === 'aprovado' ? parseInt(1) : parseInt(0) })
        try {
            let status = aprovadoStatus;
            let aprovved = aprovadoStatus === 'aprovado' ? parseInt(1) : parseInt(0);
            if (parseInt(aprovved) === 1) {
                if (disciplines?.some(item => parseInt(item?.aprovado) === 0) || fileUser?.some(file => parseInt(file?.aprovado) === 0)) {
                    status = 'Aprovado com ressalvas';
                } else {
                    status = 'Aprovado';
                }
            } else if (parseInt(aprovved) === 0) {
                status = 'Reprovado';
            }


            requerimentData.status = status;
            requerimentData.aprovado = aprovved;
            const response = await api.patch(`/requeriment/update/${id}`, { requerimentData })
            if (response?.status === 200) {
                if (fileUser?.length > 0) {
                    for (let file of fileUser) {
                        if (!file?.id_doc_usuario) {
                            let fileId = file?.id_doc_req_matr
                            const fileUpdate = await api.patch(`/requeriment/file/update/${fileId}`, { file })
                        }
                    }
                }

                if (disciplines?.length > 0) {
                    for (let discipline of disciplines) {
                        let disciplineId = discipline?.id_disc_req_mat
                        let statusDiscipline = (discipline?.aprovado !== null && discipline?.aprovado !== '' && discipline?.dispensado === 1) ?
                            (parseInt(discipline?.aprovado) === 1 ? 'Dispensa aprovada' : 'Dispensa reprovada') : 'Aprovada'

                        let statusDisciplineNoDispensed = parseInt(discipline?.dispensado) === 0 ? 1 : parseInt(discipline?.aprovado);
                        let disciplineData = {
                            justificativa_pedido_disp: discipline?.justificativa_pedido_disp,
                            status: statusDiscipline,
                            dispensado: discipline?.dispensado,
                            aprovado: statusDisciplineNoDispensed,
                            motivo_reprovado: discipline?.motivo_reprovado,
                            nt_final_disc: discipline?.nt_final_disc
                        }
                        await api.patch(`/requeriment/discipline/update/${disciplineId}`, { disciplineData })
                    }
                }
                alert.success('Requerimento atualizado com sucesso.')
                router.push('/secretary/studentDetails/requeriments/student')
            } else {
                alert.error('Ocorreu um erro ao atualizar o requerimento')
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }




    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]


    const documentsStudent = [
        {
            id: '01', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'cpf', text: 'CPF'
        },
        {
            id: '02', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'rg', text: 'RG'
        },
        {
            id: '03', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'comprovante_residencia', text: 'Comprovante de Residência'
        },
        {
            id: '04', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'nascimento', text: 'Certidão de nascimento'
        },
        {
            id: '05', entryForm: ['Segunda Graduação'],
            icon: '/icons/folder_icon.png', key: 'diploma_historico_graduacao', text: 'Diploma e histórico de graduação'
        },
        {
            id: '05', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'historico_ensino_medio', text: 'Histórico do ensino médio'
        },
        {
            id: '05', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'certificado_ensino_medio', text: 'Certificado do ensino médio'
        },
        {
            id: '07', entryForm: ['Nota do Enem'],
            icon: '/icons/folder_icon.png', key: 'boletim_enem', text: 'Boletim do ENEM'
        },
        {
            id: '08', entryForm: ['Redação Online', 'Nota do Enem', 'Segunda Graduação', 'Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'foto_perfil', text: 'Foto/Selfie (3/4)'
        },
        {
            id: '09', entryForm: ['Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'declaracao_transferencia', text: 'Declaração de transferência'
        },
        {
            id: '10', entryForm: ['Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'solicitacao_vaga', text: 'Solicitação de vaga'
        },
        {
            id: '11', entryForm: ['Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'historico_escolar_graduacao', text: 'Histórico escolar de graduação'
        },
        {
            id: '12', entryForm: ['Trânsferência'],
            icon: '/icons/folder_icon.png', key: 'conteudo_programatico', text: 'Conteúdo programático das disciplinas cursadas'
        },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const currentDate = new Date();
    const options = {
        day: "numeric",
        month: "long",
        year: "numeric",
    };



    const formattedDate = new Intl.DateTimeFormat("pt-BR", options).format(currentDate);

    const statusColor = (status) => (parseInt(status) === 1 && 'green' || parseInt(status) === 0 && 'red' || '')

    return (
        <>
            {!id ?
                <Box>
                    <Text light>
                        Não Foi possivel encontrar o aluno e Turma desejada. Refaça a pesquisa novamente.
                    </Text>
                </Box> :
                <>
                    <SectionHeader
                        title={`Requerimento de Matrícula - ${requerimentData?.nome_curso} ${requerimentData?.modalidade_curso}_${requerimentData?.modulo_matricula}º Módulo/Semestre`}
                    />
                    <div ref={componentPDF}>

                        {(requerimentData?.aprovado !== null || requerimentData?.aprovado !== '') && <Box sx={{
                            position: 'absolute', top: 110, right: 65,
                            display: 'flex', gap: 2, padding: '10px 12px', alignItems: 'center',
                            backgroundColor: statusColor(requerimentData?.aprovado),
                            transition: '.3s',
                            borderRadius: 2,
                        }}>
                            <Text title style={{ color: '#fff' }}>
                                {parseInt(requerimentData?.aprovado) === 1 && 'Aprovado' || parseInt(requerimentData?.aprovado) === 0 && 'Reprovado' || ''}
                            </Text>
                        </Box>}
                        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                                <Text bold large>
                                    Requerimento de Matrícula
                                </Text>
                                <Box sx={styles.paragraph}>
                                    <Text> Eu,</Text>
                                    <Text style={styles.textData}>{requerimentData?.nome},</Text>
                                    <Text> portador do RG nº </Text>
                                    <Text style={styles.textData}>{requerimentData?.rg}</Text>
                                </Box>

                                <Box sx={styles.paragraph}>
                                    <Text> e CPF nº </Text>
                                    <Text style={styles.textData}>{requerimentData?.cpf},</Text>
                                    <Text> por meio deste, venho requerer matrícula no Curso </Text>
                                    <Text style={styles.textData}>{requerimentData?.nome_curso || '______'},</Text>
                                    <Text> modalidade {requerimentData?.modalidade_curso || '______'}.</Text>

                                </Box>

                                <Text> Declaro tambem estar totalmente de acordo com as condições gerais de matrícula constantes do Contrato de
                                    Prestação de Serviços Educacionais e, para formalizar este ato, entrego os documentos exigidos conforme Edital.
                                </Text>
                                <Text> Caso deixe de apresentar algum documento, estou ciente que devo faze-lo até 30 (trinta) dias do inicio do semestre letivo,
                                    pois a não entrega deste(s) documentos acarretará na suspensão do deferimento de matrícula e de todos os atos acadêmicos por razão administrativa
                                    ou pedagógica.
                                </Text>
                                <Text> Nestes termos, peço deferimento. </Text>
                                <Text bold>São Paulo, {formattedDate}</Text>
                            </ContentContainer>

                            <ContentContainer gap={3}>
                                <Box sx={{
                                    display: 'flex', alignItems: 'center', gap: 1, padding: showDocSection ? '0px 0px 20px 0px' : '0px', "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    },
                                    justifyContent: 'space-between'
                                }} onClick={() => setShowDocSection(!showDocSection)}>
                                    <Text title bold>Documentos para Cadastro</Text>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url(${icons.gray_arrow_down})`,
                                        transform: showDocSection ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        transition: '.3s',
                                    }} />
                                </Box>
                                {showDocSection &&
                                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        {documentsStudent?.map((item, index) => {

                                            const filteredEntryForm = item?.entryForm?.includes(requerimentData?.forma_ingresso)
                                            const fileInsert = fileUser?.filter(file => file?.campo === item?.key)?.length > 0;
                                            const associatedFile = fileUser?.find(file => file?.campo === item?.key);

                                            const boxBackgroundColor = associatedFile
                                                ? parseInt(associatedFile?.aprovado) === 1
                                                    ? 'rgba(144, 238, 144, 0.7)'
                                                    : parseInt(associatedFile?.aprovado) === 0
                                                        ? 'rgba(255, 99, 71, 0.7)'
                                                        : colorPalette?.primary
                                                : colorPalette?.primary;

                                            const titleTooltip = associatedFile
                                                ? parseInt(associatedFile?.aprovado) === 1
                                                    ? 'Documento aprovado'
                                                    : parseInt(associatedFile?.aprovado) === 0
                                                        ? 'Documento reprovado'
                                                        : ''
                                                : '';
                                            if (filteredEntryForm) {
                                                return (
                                                    <Box key={index}>
                                                        <Tooltip title={titleTooltip}>
                                                            <div>
                                                                <Box key={index} sx={{
                                                                    display: 'flex', padding: '10px',
                                                                    borderRadius: 2,
                                                                    backgroundColor: boxBackgroundColor,
                                                                    // boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `rgba(35, 32, 51, 0.27) 0px 6px 24px`,
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-start',
                                                                    gap: 2,
                                                                    transition: '.3s',
                                                                    "&:hover": {
                                                                        opacity: 0.8,
                                                                        cursor: 'pointer',
                                                                        transform: 'scale(1.1, 1.1)'
                                                                    }

                                                                }} onClick={() => setShowDropFile({ ...showDropFile, active: true, campo: item?.key, title: item?.text })}>
                                                                    <Box sx={{
                                                                        ...styles.menuIcon,
                                                                        width: 13, height: 13, aspectRatio: '1/1',
                                                                        backgroundImage: `url('${item?.icon}')`,
                                                                        transition: '.3s',
                                                                        filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',

                                                                    }} />
                                                                    <Text small bold>{item?.text}</Text>
                                                                    {fileInsert ? (
                                                                        <CheckCircleIcon style={{ color: 'green', fontSize: 12 }} />
                                                                    ) : (
                                                                        <CancelIcon style={{ color: 'red', fontSize: 12 }} />
                                                                    )}
                                                                </Box>
                                                                <Backdrop open={showDropFile?.active} sx={{ zIndex: 999, backgroundColor: 'transparent' }}>
                                                                    <ContentContainer>
                                                                        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                                                            <Text bold>Documento {showDropFile?.title}</Text>
                                                                            <Box sx={{
                                                                                ...styles.menuIcon,
                                                                                backgroundImage: `url(${icons.gray_close})`,
                                                                                transition: '.3s',
                                                                                width: 14, height: 14, aspectRatio: '1/1',
                                                                                borderRadius: 12,
                                                                                padding: '2px',
                                                                                "&:hover": {
                                                                                    opacity: 0.8,
                                                                                    cursor: 'pointer',
                                                                                    backgroundColor: colorPalette.secondary
                                                                                }
                                                                            }} onClick={() => setShowDropFile({ ...showDropFile, active: false, campo: '', title: '' })} />
                                                                        </Box>
                                                                        <DropZoneDocument setFilesDrop={setFileUser} filesDrop={fileUser} campo={showDropFile?.campo} />

                                                                        {fileUser?.length > 0 &&
                                                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                                                {fileUser?.filter(item => item?.campo === showDropFile?.campo)?.map((item, index) => {
                                                                                    const nameFile = item?.name_file || item?.name;
                                                                                    const typePdf = item?.name?.includes('pdf') || null;
                                                                                    const fileUrl = item?.location || item?.preview || '';
                                                                                    return (
                                                                                        <Box key={index} sx={{
                                                                                            display: 'flex', gap: 1, backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                                                                                        }} >
                                                                                            <Box sx={{ display: 'flex', gap: 1, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                                                                                <Box sx={{
                                                                                                    textAlign: 'center',
                                                                                                    textOverflow: 'ellipsis',
                                                                                                    whiteSpace: 'nowrap',
                                                                                                    overflow: 'hidden',
                                                                                                    maxWidth: '100px',
                                                                                                }}>
                                                                                                    <Text small>{decodeURI(nameFile)}</Text>
                                                                                                </Box>

                                                                                                <Box sx={{
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
                                                                                                }} onClick={() => handleRemoveFile(item)} />
                                                                                            </Box>
                                                                                            <Link href={item?.location || ''} target="_blank">
                                                                                                <Box
                                                                                                    sx={{
                                                                                                        backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : fileUrl}')`,
                                                                                                        backgroundSize: 'cover',
                                                                                                        backgroundRepeat: 'no-repeat',
                                                                                                        backgroundPosition: 'center center',
                                                                                                        width: { xs: '100%', sm: 100, md: 100, lg: 100, xl: 100 },
                                                                                                        aspectRatio: '1/1',
                                                                                                    }} />
                                                                                            </Link>

                                                                                            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', flexDirection: 'column' }}>
                                                                                                <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', }}>
                                                                                                    <Box sx={{
                                                                                                        display: 'flex', gap: 2, padding: '5px 8px', alignItems: 'center', border: '1px solid green',
                                                                                                        backgroundColor: parseInt(item?.aprovado) === 1 ? 'green' : 'transparent',
                                                                                                        borderRadius: 2,
                                                                                                        transition: '.3s',
                                                                                                        "&:hover": {
                                                                                                            opacity: 0.8,
                                                                                                            cursor: 'pointer',
                                                                                                            transform: 'scale(1.1, 1.1)'
                                                                                                        },
                                                                                                    }} onClick={() => handleChangeStatusFiles(item?.id_doc_req_matr, 1)}>
                                                                                                        {parseInt(item?.aprovado) !== 1 && <CheckCircleIcon style={{ color: 'green', fontSize: 12 }} />}
                                                                                                        <Text small style={{ color: parseInt(item?.aprovado) === 1 ? '#fff' : 'green' }}>
                                                                                                            {parseInt(item?.aprovado) === 1 ? 'Aprovado' : 'Aprovar'}
                                                                                                        </Text>

                                                                                                    </Box>
                                                                                                    <Box sx={{
                                                                                                        display: 'flex', gap: 2, padding: '5px 8px', alignItems: 'center', border: '1px solid red',
                                                                                                        backgroundColor: parseInt(item?.aprovado) === 0 ? 'red' : 'transparent',
                                                                                                        transition: '.3s',
                                                                                                        borderRadius: 2, "&:hover": {
                                                                                                            opacity: 0.8,
                                                                                                            cursor: 'pointer',
                                                                                                            transform: 'scale(1.1, 1.1)'
                                                                                                        },
                                                                                                    }} onClick={() => handleChangeStatusFiles(item?.id_doc_req_matr, 0)}>

                                                                                                        {parseInt(item?.aprovado) !== 0 && <CancelIcon style={{ color: 'red', fontSize: 12 }} />}
                                                                                                        <Text small style={{ color: parseInt(item?.aprovado) === 0 ? '#fff' : 'red' }}>
                                                                                                            {parseInt(item?.aprovado) === 0 ? 'Reprovado' : 'Reprovar'}
                                                                                                        </Text>
                                                                                                    </Box>
                                                                                                </Box>

                                                                                                {(parseInt(item?.aprovado) === 0 && showDocSection) &&
                                                                                                    <Box sx={{ display: 'flex', gap: 1, marginTop: 1, zIndex: 9999 }}>
                                                                                                        <TextInput
                                                                                                            placeholder='Documento vencido..'
                                                                                                            name='motivo_reprovado' onChange={(e) => handleChangeReasonStatusDoc(item?.id_doc_req_matr, e.target.value)}
                                                                                                            value={item?.motivo_reprovado || ''}
                                                                                                            label='Motivo:'
                                                                                                            multiline
                                                                                                            maxRows={3}
                                                                                                            rows={2}
                                                                                                        />
                                                                                                    </Box>
                                                                                                }
                                                                                            </Box>
                                                                                        </Box>
                                                                                    )
                                                                                })}
                                                                            </Box>}

                                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                                                            <Button text="Confirmar" small onClick={() => setShowDropFile({ ...showDropFile, active: false, campo: '', title: '' })} style={{
                                                                                borderRadius: 2
                                                                            }} />
                                                                        </Box>

                                                                    </ContentContainer>
                                                                </Backdrop>
                                                            </div>
                                                        </Tooltip>
                                                    </Box>
                                                )
                                            }
                                        })
                                        }
                                    </Box>
                                }
                            </ContentContainer>

                            <RadioItem
                                valueRadio={requerimentData?.dispensou_disciplina}
                                group={[
                                    {
                                        label: 'Sim', value: 1
                                    },
                                    {
                                        label: 'Não', value: 0
                                    }]}
                                title="Vai dispensar disciplina?"
                                horizontal={true} />


                            <ContentContainer row style={{ boxShadow: 'none', backgroundColor: 'none', padding: '0px' }} gap={3}>
                                <ContentContainer fullWidth gap={4}>
                                    <Box sx={{ display: 'flex', gap: 5, }}>
                                        <Text bold title>Disciplinas</Text>
                                        {requerimentData?.dispensou_disciplina === 1 &&
                                            <>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                    <Text light>Cursar</Text>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <CancelIcon style={{ color: 'red', fontSize: 20 }} />
                                                    <Text light>Dispensada</Text>
                                                </Box>
                                            </>
                                        }
                                    </Box>
                                    {requerimentData?.dispensou_disciplina === 1 && <Text style={{ color: 'red' }}>Selecione as disciplinas que serão cursadas. Disciplinas que não forem selecionadas, serão consideradas para análise de dispensa.</Text>}
                                    <Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                            {disciplines.map((item, index) => {
                                                // const selected = disciplinesSelected?.includes(item?.value)
                                                const selected = parseInt(item?.dispensado) === 0 ? true : false;
                                                const softwares = item?.softwares

                                                const boxBackgroundColor = (item?.aprovado === 1 && item?.dispensado === 1)
                                                    ? 'green'
                                                    : (item?.aprovado === 0 && item?.dispensado === 1)
                                                        ? 'red'
                                                        : 'none';

                                                const titleTooltip = (item?.aprovado === 1 && item?.dispensado === 1)
                                                    ? 'Solicitação de Dispensa aprovada'
                                                    : (parseInt(item?.aprovado) === 0 && item?.dispensado === 1)
                                                        ? 'Solicitação de Dispensa reprovada'
                                                        : ''

                                                return (
                                                    <Box key={index} sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                                                        <Box sx={{
                                                            display: 'flex', gap: 2, flexDirection: 'column', borderRadius: 2,
                                                            border: `1px solid ${boxBackgroundColor}`, padding: '15px 20px'
                                                        }}>
                                                            <Text bold style={{ color: boxBackgroundColor }}>{titleTooltip}</Text>
                                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                                                                {requerimentData?.dispensou_disciplina === 1 && <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: 16,
                                                                        height: 16,
                                                                        borderRadius: 16,
                                                                        transition: '.5s',
                                                                        border: !selected ? `1px solid ${colorPalette.textColor}` : '',
                                                                        '&:hover': {
                                                                            opacity: selected ? 0.8 : 0.6,
                                                                            boxShadow: selected ? 'none' : `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                                                                        }
                                                                    }}>
                                                                    {selected ? (
                                                                        <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />
                                                                    ) : (
                                                                        <CancelIcon style={{ color: 'red', fontSize: 20 }} />
                                                                    )}
                                                                </Box>}
                                                                <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                                                    <Text bold>{item?.label}</Text>
                                                                    <Text light small>{item?.descricao_dp}</Text>
                                                                </Box>
                                                            </Box>
                                                            {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                        <Text bold small>Softwares ultilizados:</Text>
                                                                        {
                                                                            softwares?.map((soft, index) => {
                                                                                return (
                                                                                    <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                                                                        {soft?.map((list, index) => {
                                                                                            return (
                                                                                                <Box key={index} sx={{
                                                                                                    display: 'flex', gap: .5, flexDirection: 'row', backgroundColor: colorPalette.primary,
                                                                                                    padding: '5px 12px', borderRadius: 2, alignItems: 'center'
                                                                                                }}>
                                                                                                    <Text small>{list?.nome_software}</Text>
                                                                                                    <Text>-</Text>
                                                                                                    <Text small>{list?.software_fornecedor}</Text>
                                                                                                </Box>
                                                                                            )
                                                                                        })}
                                                                                    </Box>
                                                                                )
                                                                            })
                                                                        }
                                                                    </Box> */}
                                                            {!selected &&

                                                                <>
                                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                                                        {item?.files?.filter(file => file?.disciplina_id === item?.value)?.map((file, index) => {
                                                                            const nameFile = file?.name_file || file?.name;
                                                                            const fileUrl = file?.location || file?.preview
                                                                            return (
                                                                                <Box key={index} sx={{
                                                                                    display: 'flex', gap: 1, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between',
                                                                                }}>
                                                                                    <Text small style={{
                                                                                        textDecoration: 'underline', color: 'blue', flexWrap: 'nowrap',
                                                                                        "&:hover": {
                                                                                            opacity: 0.8,
                                                                                            cursor: 'pointer',
                                                                                        }
                                                                                    }} onClick={() => setShowDropFileDiscipline({ active: true, fileUrl: fileUrl, title: nameFile })}
                                                                                    >{decodeURI(nameFile)}</Text>
                                                                                </Box>
                                                                            )
                                                                        })}
                                                                    </Box>

                                                                    <Box sx={{
                                                                        display: 'flex', gap: 1, marginTop: 1, flexDirection: 'column',
                                                                        padding: '10px 12px', backgroundColor: colorPalette?.primary, borderRadius: 2
                                                                    }}>
                                                                        <Text bold>Justificativa de solicitação de dispensa:</Text>
                                                                        <Text small light>{item?.justificativa_pedido_disp || 'Não quis justificar.'}</Text>
                                                                    </Box>

                                                                    <Box sx={{ display: 'flex', gap: 2, minWidth: 400, justifyContent: 'flex-start', flexDirection: 'column' }}>
                                                                        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-start' }}>
                                                                            <Box sx={{
                                                                                display: 'flex', gap: 2, padding: '5px 8px', alignItems: 'center', border: '1px solid green',
                                                                                backgroundColor: parseInt(item?.aprovado) === 1 ? 'green' : 'transparent',
                                                                                borderRadius: 2,
                                                                                transition: '.3s',
                                                                                "&:hover": {
                                                                                    opacity: 0.8,
                                                                                    cursor: 'pointer',
                                                                                    transform: 'scale(1.1, 1.1)'
                                                                                },
                                                                            }} onClick={() => handleChangeStatusDiscipline(item?.id_disc_req_mat, 1)}>
                                                                                {parseInt(item?.aprovado) !== 1 && <CheckCircleIcon style={{ color: 'green', fontSize: 12 }} />}
                                                                                <Text small style={{ color: parseInt(item?.aprovado) === 1 ? '#fff' : 'green' }}>
                                                                                    {parseInt(item?.aprovado) === 1 ? 'Aprovado' : 'Aprovar'}
                                                                                </Text>

                                                                            </Box>
                                                                            <Box sx={{
                                                                                display: 'flex', gap: 2, padding: '5px 8px', alignItems: 'center', border: '1px solid red',
                                                                                backgroundColor: parseInt(item?.aprovado) === 0 ? 'red' : 'transparent',
                                                                                transition: '.3s',
                                                                                borderRadius: 2, "&:hover": {
                                                                                    opacity: 0.8,
                                                                                    cursor: 'pointer',
                                                                                    transform: 'scale(1.1, 1.1)'
                                                                                },
                                                                            }} onClick={() => handleChangeStatusDiscipline(item?.id_disc_req_mat, '0')}>

                                                                                {parseInt(item?.aprovado) !== 0 && <CancelIcon style={{ color: 'red', fontSize: 12 }} />}
                                                                                <Text small style={{ color: parseInt(item?.aprovado) === 0 ? '#fff' : 'red' }}>
                                                                                    {parseInt(item?.aprovado) === 0 ? 'Reprovado' : 'Reprovar'}
                                                                                </Text>
                                                                            </Box>
                                                                        </Box>
                                                                        {(parseInt(item?.aprovado) === 0) &&
                                                                            <Box sx={{ display: 'flex', gap: 1, marginTop: 1, zIndex: 9999, width: 400 }}>
                                                                                <TextInput
                                                                                    placeholder='Reprovado por falta de aderência das disciplinas cursadas anteriormente...'
                                                                                    name='motivo_reprovado' onChange={(e) => handleChangeReasonStatusDiscipline(item?.id_disc_req_mat, e.target.value)}
                                                                                    value={item?.motivo_reprovado || ''}
                                                                                    label='Motivo:'
                                                                                    multiline
                                                                                    maxRows={4}
                                                                                    rows={2}
                                                                                    sx={{ width: 400 }} />
                                                                            </Box>
                                                                        }
                                                                        {(parseInt(item?.aprovado) === 1) &&
                                                                            <Box sx={{ display: 'flex', gap: 1, marginTop: 1, zIndex: 9999, width: 400 }}>
                                                                                <TextInput
                                                                                    label='Nota Disciplina:'
                                                                                    name='nt_final_disc'
                                                                                    value={item?.nt_final_disc || ''}
                                                                                    onChange={(e) => handleChangeGradeDiscipline(item?.id_disc_req_mat, e.target.value)}
                                                                                />
                                                                            </Box>
                                                                        }
                                                                    </Box>
                                                                </>
                                                            }
                                                        </Box>
                                                        <Divider distance={0} />
                                                    </Box>
                                                );
                                            })}
                                        </Box>
                                    </Box>
                                </ContentContainer>
                            </ContentContainer>

                            <CheckBoxComponent
                                boxGroup={[
                                    { label: 'Aceito os termos desse requerimento', value: 'Sim' },
                                ]}
                                valueChecked={requerimentData?.aceite_termos || ''}
                                horizontal={false}
                                onSelect={(value) => {
                                    setRequerimentData({ ...requerimentData, aceite_termos: value })
                                }}
                                sx={{ width: 1 }}
                            />

                            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                <Box sx={{
                                    display: 'flex', gap: 2, padding: '10px 12px', alignItems: 'center', border: '1px solid green',
                                    backgroundColor: requerimentData?.aprovado === 1 ? 'green' : 'transparent',
                                    borderRadius: 2,
                                    transition: '.3s',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer',
                                        transform: 'scale(1.1, 1.1)'
                                    },
                                }} onClick={() => {
                                    handleUpdateRequeriment({ aprovadoStatus: 'aprovado' })
                                }}>
                                    {parseInt(requerimentData?.aprovado) !== 1 && <CheckCircleIcon style={{ color: 'green', fontSize: 20 }} />}
                                    <Text large style={{ color: parseInt(requerimentData?.aprovado) === 1 ? '#fff' : 'green' }}>
                                        {parseInt(requerimentData?.aprovado) === 1 ? 'Aprovado' : 'Aprovar'}
                                    </Text>

                                </Box>
                                <Box sx={{
                                    display: 'flex', gap: 2, padding: '10px 12px', alignItems: 'center', border: '1px solid red',
                                    backgroundColor: parseInt(requerimentData?.aprovado) === 0 ? 'red' : 'transparent',
                                    transition: '.3s',
                                    borderRadius: 2, "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer',
                                        transform: 'scale(1.1, 1.1)'
                                    },
                                }}
                                    onClick={() => {
                                        handleUpdateRequeriment({ aprovadoStatus: 'reprovado' })
                                    }}>

                                    {parseInt(requerimentData?.aprovado) !== 0 && <CancelIcon style={{ color: 'red', fontSize: 20 }} />}
                                    <Text large style={{ color: parseInt(requerimentData?.aprovado) === 0 ? '#fff' : 'red' }}>
                                        {parseInt(requerimentData?.aprovado) === 0 ? 'Reprovado' : 'Reprovar'}
                                    </Text>
                                </Box>
                            </Box>
                            {parseInt(requerimentData?.aprovado) === 0 &&
                                <TextInput
                                    placeholder='Reprovado por falta de aderência das disciplinas cursadas anteriormente...'
                                    name='obs_status' onChange={(e) => setRequerimentData({ ...requerimentData, obs_status: e.target.value })} value={requerimentData?.obs_status || ''}
                                    label='Motivo:'
                                    multiline
                                    maxRows={5}
                                    rows={3}
                                    sx={{}} />
                            }
                        </Box >
                    </div >
                </>
            }


            <Backdrop open={showDropFileDiscipline?.active} sx={{ zIndex: 99999, backgroundColor: 'transparent' }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text bold>{showDropFileDiscipline?.title}</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            width: 20, height: 20, aspectRatio: '1/1',
                            padding: '5px',
                            borderRadius: 2,
                            borderRadius: 12,
                            padding: '2px',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer',
                                backgroundColor: colorPalette.secondary + '66'
                            }
                        }} onClick={() => setShowDropFileDiscipline({ active: false, fileUrl: '', title: '' })} />
                    </Box>
                    <Box sx={{
                        backgroundImage: `url('${showDropFileDiscipline?.fileUrl}')`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        width: { xs: 200, sm: 200, md: 200, lg: 300, xl: 300 },
                        aspectRatio: '1/1',
                    }} />
                </ContentContainer>
            </Backdrop>

        </>
    )
}


const DropZoneDocument = ({ filesDrop, setFilesDrop, children, campo }) => {

    const { setLoading, colorPalette, theme } = useAppContext()


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
                tipo: 'documento usuario'
            }));

            setFilesDrop(prevFilesDrop => [...prevFilesDrop, ...uploadedFiles]);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    return (
        <Dropzone
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
                            <Text light small>Selecione um arquivo ou foto</Text>
                        </Box>
                    </Box>
                </Box>
            )}
        </Dropzone>
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
        backgroundSize: 'cover',
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
    textData: {
        color: 'red'
    },
    paragraph: {
        display: 'flex',
        gap: .5,
        alignItems: 'center'
    }
}
