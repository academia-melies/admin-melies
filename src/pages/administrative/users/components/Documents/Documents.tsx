import { CircularProgress, Tooltip } from "@mui/material";
import { Box, Text } from "../../../../../atoms";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAppContext } from "../../../../../context/AppContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../../../../api/api";

export interface FileUser {
    id_doc_usuario: string | null;
    location: string;
    campo: string;
    aprovado: string
    motivo_reprovado: string | null
    name_file?: string | null
    name?: string | null
    preview?: string | null
}

interface DocumentsProps {
    id: number | string
}

const Documents = ({ id }: DocumentsProps) => {
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [filesUser, setFilesUser] = useState<FileUser[]>([])
    const { colorPalette, theme } = useAppContext()

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

    useEffect(() => {
        getFileUser()
    }, [id])

    const getFileUser = async () => {
        setLoadingData(true)
        try {
            const response = await api.get(`/files/${id}`)
            const { data } = response
            setFilesUser(data)
        } catch (error) {
            console.log(error)
        } finally{
            setLoadingData(false)
        }
    }


    return (
        <Box>
            {loadingData &&
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', heigth: '100%', position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}>
                    <CircularProgress />
                </Box>}
            <Box sx={{opacity: loadingData ? .6 : 1, display: 'flex', gap: 2, flexDirection: 'column' }}>
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
                                                                    <Tooltip title={nameFile ? decodeURI(nameFile) : nameFile}>
                                                                        <div>
                                                                            <Box sx={{ display: 'flex', gap: 1, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                                                                <Text small style={{
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    maxWidth: 100
                                                                                }}>{nameFile ? decodeURI(nameFile) : nameFile}</Text>
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

export default Documents