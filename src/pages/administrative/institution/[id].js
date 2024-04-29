import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, FileInput, Divider } from "../../../atoms"
import { RadioItem, SectionHeader, CustomDropzone } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { formatCEP, formatCNPJ } from "../../../helpers"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import axios from "axios"
import { IconStatus } from "../../../organisms/Table/table"
import { icons } from "../../../organisms/layout/Colors"
import Dropzone from "react-dropzone"
import Link from "next/link"

export default function EditInstitution(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newInstitution = id === 'new';
    const [arrayRecognitionP, setArrayRecognitionP] = useState([])
    const [arrayRecognitionEad, setArrayRecognitionEad] = useState([])
    const [recognitionP, setRecognitionP] = useState({})
    const [recognitionEad, setRecognitionEad] = useState({})
    const [institutionData, setInstitutionData] = useState({
        nome_instituicao: '',
        cnpj: '',
        mantenedora: '',
        mantida: '',
        pt_cred_ead: '',
        dt_cred_ead: '',
        pt_rec_ead: '',
        dt_rec_ead: '',
        pt_rec_pres: '',
        dt_rec_pres: '',
        pt_cred_pres: '',
        dt_cred_pres: '',
        ativo: 1,
        endereco_pres: '',
        endereco_ead: '',
        cod_inep_ead: '',
        cod_inep_pres: '',
    })
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showFileContainer, setShowFileContainer] = useState({
        pt_cred_ead: false,
        pt_rec_ead: false,
        pt_rec_pres: false,
        pt_cred_pres: false,
        ren_reconhecimento_ead: false,
        ren_reconhecimento_p: false
    })
    const [files, setFiles] = useState([])

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    console.log(showFileContainer)

    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getInstitution = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/institution/${id}`)
            const { data } = response
            setInstitutionData(data)
        } catch (error) {
            console.log(error)
            return error
        } finally { }
        setLoading(false)
    }


    const getFiles = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/institution/files/${id}`)
            const { data } = response
            if (data?.length > 0) {
                setFiles(data)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally { }
        setLoading(false)
    }

    const getRecognition = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/recognitions/${id}`)
            const { recognitionEad, recognitionP } = response?.data
            if (recognitionEad) setArrayRecognitionEad(recognitionEad)
            if (recognitionP) setArrayRecognitionP(recognitionP)
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        (async () => {
            if (newInstitution) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        fetchPermissions()
    }, [])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getInstitution()
            await getFiles()
            getRecognition()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar A instituição')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        if (value.target.name == 'cnpj') {
            let str = value.target.value;
            value.target.value = formatCNPJ(str)
        }

        if (value.target.name?.includes('cep')) {
            let str = value.target.value;
            value.target.value = formatCEP(str)
        }

        setInstitutionData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!institutionData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateInstitution = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await api.post(`/institution/create/${userId}`, { institutionData, arrayRecognitionP, arrayRecognitionEad });
                const { data } = response

                if (response?.status === 201) {
                    alert.success('Instituição cadastrada com sucesso.');
                    router.push(`/administrative/institution/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar Instituição.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteInstitution = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/institution/delete/${id}`)
            if (response?.status == 201) {
                alert.success('Instituição excluída com sucesso.');
                router.push(`/administrative/institution/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir Instituição.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditInstitution = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/institution/update/${id}`, { institutionData })
            if (response?.status === 201) {
                alert.success('Instituição atualizada com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Instituição.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Instituição.');
        } finally {
            setLoading(false)
        }
    }

    const handleChangeRecognitionP = (value) => {
        setRecognitionP((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const addRecognitionP = () => {
        setArrayRecognitionP((prevArray) => [...prevArray, { ren_reconhecimento_p: recognitionP.ren_reconhecimento_p, dt_renovacao_rec_p: recognitionP.dt_renovacao_rec_p }])
        setRecognitionP({ ren_reconhecimento_p: '', dt_renovacao_rec_p: '' })
    }

    const deleteRecognitionP = (index) => {

        if (newInstitution) {
            setArrayRecognitionP((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };


    //EAD
    const handleChangeRecognitionEad = (value) => {
        setRecognitionEad((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    };

    const addRecognitionEad = () => {
        setArrayRecognitionEad((prevArray) => [...prevArray, { ren_reconhecimento_ead: recognitionEad.ren_reconhecimento_ead, dt_renovacao_rec_ead: recognitionEad.dt_renovacao_rec_ead }])
        setRecognitionEad({ ren_reconhecimento_ead: '', dt_renovacao_rec_ead: '' })
    }

    const deleteRecognitionEad = (index) => {

        if (newInstitution) {
            setArrayRecognitionEad((prevArray) => {
                const newArray = [...prevArray];
                newArray.splice(index, 1);
                return newArray;
            });
        }
    };

    const handleAddRecognition = async () => {
        setLoading(true)
        let recognitionData = {};

        try {
            if (Object.keys(recognitionEad).length > 0) {
                recognitionData = recognitionEad;
                const response = await api.post(`/institution/recognition/create/${id}/${userId}?modality=ead`, { recognitionData })
                if (response?.status === 201) {
                    alert.success('Renovação adicionada')
                    setRecognitionEad({ ren_reconhecimento_ead: '', dt_renovacao_rec_ead: '' })
                    handleItems()
                }
            };
            if (Object.keys(recognitionP).length > 0) {
                recognitionData = recognitionP;
                const response = await api.post(`/institution/recognition/create/${id}/${userId}?modality=presencial`, { recognitionData })
                if (response?.status === 201) {
                    alert.success('Renovação adicionada')
                    setRecognitionP({ ren_reconhecimento_p: '', dt_renovacao_rec_p: '' })
                    handleItems()
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRecognition = async (id_renovacao_rec) => {
        setLoading(true)
        try {
            if (recognitionEad) {
                const response = await api.delete(`/institution/recognition/delete/${id_renovacao_rec}?modality=ead`)
                if (response?.status === 200) {
                    alert.success('Renovação excluida.');
                    handleItems()
                }
            }
            if (recognitionP) {
                const response = await api.delete(`/institution/recognition/delete/${id_renovacao_rec}?modality=presencial`)
                if (response?.status === 200) {
                    alert.success('Renovação excluida.');
                    handleItems()
                }
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a Habilidade selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleBlurCEP = (event) => {
        const { value, name } = event.target;
        findCEP(value, name);
    };

    async function findCEP(cep, name) {
        setLoading(true)
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            const { data } = response;

            let fields = {}

            if (name === 'cep_pres') {
                fields = {
                    rua_pres: data.logradouro,
                    cidade_pres: data.localidade,
                    uf_pres: data.uf,
                    bairro_pres: data.bairro
                }
            } else {
                fields = {
                    rua_ead: data.logradouro,
                    cidade_ead: data.localidade,
                    uf_ead: data.uf,
                    bairro_ead: data.bairro
                }
            }
            setInstitutionData((prevValues) => ({
                ...prevValues,
                ...fields
            }))
        } catch (error) {
        } finally {
            setLoading(false)
        }

    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });




    return (
        <>
            <SectionHeader
                perfil={institutionData?.modalidade_curso}
                title={institutionData?.nome_curso || `Instituição`}
                saveButton={isPermissionEdit}
                saveButtonAction={newInstitution ? handleCreateInstitution : handleEditInstitution}
                inativeButton={!newInstitution && isPermissionEdit}
                inativeButtonAction={(event) => setShowConfirmationDialog({
                    active: true,
                    event,
                    acceptAction: handleDeleteInstitution,
                    title: 'Inativar Instituição',
                    message: 'A Instituição será inativada, e ficará por um tempo no banco de dados, até que seja excluída.'
                })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                    <Text title bold>Dados da Instituição</Text>
                    <IconStatus
                        style={{ backgroundColor: institutionData.ativo >= 1 ? 'green' : 'red', boxShadow: institutionData.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Mantenedora' name='mantenedora' onChange={handleChange} value={institutionData?.mantenedora || ''} label='Mantenedora' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Mantida' name='mantida' onChange={handleChange} value={institutionData?.mantida || ''} label='Mantida' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='CNPJ' name='cnpj' onChange={handleChange} value={institutionData?.cnpj || ''} label='CNPJ' sx={{ flex: 1, }} />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={institutionData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setInstitutionData({ ...institutionData, ativo: parseInt(value) })} />

            </ContentContainer>

            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Text title bold >Presencial</Text>
                <TextInput disabled={!isPermissionEdit && true} placeholder='Código Inep' name='cod_inep_pres' onChange={handleChange} value={institutionData?.cod_inep_pres || ''} label='Código Inep' sx={{ width: 256, }} />
                <Box sx={{
                    display: 'flex', gap: 1,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <FileInput
                        onClick={(value) => setShowFileContainer({ ...showFileContainer, pt_cred_pres: value })}
                        existsFiles={files?.filter((file) => file?.campo === 'pt_cred_pres' && file?.tipo === 'presencial').length > 0}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Credenciamento' name='pt_cred_pres' onChange={handleChange} value={institutionData?.pt_cred_pres || ''} label='Portaria de Credenciamento' sx={{ flex: 1, }} />

                        <UploadedFiles
                            setFiles={setFiles}
                            files={files}
                            isPermissionEdit={isPermissionEdit}
                            open={showFileContainer?.pt_cred_pres}
                            newInstitution={newInstitution}
                            onSet={(set) => {
                                setShowFileContainer({ ...showFileContainer, pt_cred_pres: set })
                            }}
                            title='Portaria de Credenciamento'
                            institutionId={id}
                            campo='pt_cred_pres'
                            tipo='presencial'
                            callback={(file) => {
                                if (file.status === 201 || file.status === 200) {
                                    handleItems()
                                }
                            }}
                        />
                    </FileInput>
                    <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name='dt_cred_pres' onChange={handleChange} value={(institutionData?.dt_cred_pres)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={{
                    display: 'flex', gap: 1,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>

                    <FileInput
                    onClick={(value) => setShowFileContainer({ ...showFileContainer, pt_rec_pres: value })}
                        existsFiles={files?.filter((file) => file?.campo === 'pt_rec_pres' && file?.tipo === 'presencial').length > 0}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Recredenciamento' name='pt_rec_pres' onChange={handleChange} value={institutionData?.pt_rec_pres || ''} label='Portaria de Recredenciamento' sx={{ flex: 1, }} />

                        <UploadedFiles
                            setFiles={setFiles}
                            files={files}
                            isPermissionEdit={isPermissionEdit}
                            open={showFileContainer?.pt_rec_pres}
                            newInstitution={newInstitution}
                            onSet={(set) => {
                                setShowFileContainer({ ...showFileContainer, pt_rec_pres: set })
                            }}
                            title='Portaria de Recredenciamento'
                            institutionId={id}
                            campo='pt_rec_pres'
                            tipo='presencial'
                            callback={(file) => {
                                if (file.status === 201 || file.status === 200) {
                                    handleItems()
                                }
                            }}
                        />
                    </FileInput>
                    <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name='dt_rec_pres' onChange={handleChange} value={(institutionData?.dt_rec_pres)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>

                <Box sx={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                    {arrayRecognitionP.map((rec, index) => (
                        <>
                            <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput disabled={!isPermissionEdit && true} label="Portaria de Renovação do Recredenciamento" placeholder='Portaria de Renovação do Recredenciamento' name={`ren_reconhecimento_p-${index}`} onChange={handleChangeRecognitionP} value={rec.ren_reconhecimento_p} sx={{ flex: 1 }} />
                                <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name={`dt_renovacao_rec_p-${index}`} onChange={handleChangeRecognitionP} value={(rec?.dt_renovacao_rec_p)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
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
                                    newInstitution ? deleteRecognitionP(index) : handleDeleteRecognition(rec?.id_renovacao_rec_p)
                                }} />
                            </Box>
                        </>
                    ))}
                    <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                        <TextInput disabled={!isPermissionEdit && true} label="Portaria de Renovação do Recredenciamento" placeholder='Portaria de Renovação do Recredenciamento' name={`ren_reconhecimento_p`} onChange={handleChangeRecognitionP} value={recognitionP.ren_reconhecimento_p} sx={{ flex: 1 }} />
                        <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name='dt_renovacao_rec_p' onChange={handleChangeRecognitionP} value={(recognitionP?.dt_renovacao_rec_p)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                        {isPermissionEdit && <Box sx={{
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
                            newInstitution ? addRecognitionP() : handleAddRecognition()
                        }} />}
                    </Box>
                </Box>
                <Text bold >Endereço</Text>

                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='CEP' name='cep_pres' onChange={handleChange} value={institutionData?.cep_pres || ''} label='CEP *' onBlur={handleBlurCEP} sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Endereço' name='rua_pres' onChange={handleChange} value={institutionData?.rua_pres || ''} label='Endereço *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nº' name='numero_pres' onChange={handleChange} value={institutionData?.numero_pres || ''} label='Nº *' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Cidade' name='cidade_pres' onChange={handleChange} value={institutionData?.cidade_pres || ''} label='Cidade *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='UF' name='uf_pres' onChange={handleChange} value={institutionData?.uf_pres || ''} label='UF *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Bairro' name='bairro_pres' onChange={handleChange} value={institutionData?.bairro_pres || ''} label='Bairro *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Complemento' name='complemento_pres' onChange={handleChange} value={institutionData?.complemento_pres || ''} label='Complemento' sx={{ flex: 1, }} />
                </Box>
            </ContentContainer>
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Text title bold >EAD</Text>

                <TextInput disabled={!isPermissionEdit && true} placeholder='Código Inep' name='cod_inep_ead' onChange={handleChange}
                    value={institutionData?.cod_inep_ead || ''} label='Código Inep' sx={{ width: 256, }} />

                <Box sx={styles.inputSection}>
                    <FileInput
                    onClick={(value) => setShowFileContainer({ ...showFileContainer, pt_cred_ead: value })}
                        existsFiles={files?.filter((file) => file?.campo === 'pt_cred_ead' && file?.tipo === 'ead').length > 0}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Credenciamento' name='pt_cred_ead' onChange={handleChange} value={institutionData?.pt_cred_ead || ''} label='Portaria de Credenciamento' sx={{ flex: 1, }} />

                        <UploadedFiles
                            setFiles={setFiles}
                            files={files}
                            isPermissionEdit={isPermissionEdit}
                            open={showFileContainer?.pt_cred_ead}
                            newInstitution={newInstitution}
                            onSet={(set) => {
                                setShowFileContainer({ ...showFileContainer, pt_cred_ead: set })
                            }}
                            title='Portaria de Credenciamento - EAD'
                            institutionId={id}
                            campo='pt_cred_ead'
                            tipo='ead'
                            callback={(file) => {
                                if (file.status === 201 || file.status === 200) {
                                    handleItems()
                                }
                            }}
                        />
                    </FileInput>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_cred_ead' onChange={handleChange} value={(institutionData?.dt_cred_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>

                    <FileInput
                     onClick={(value) => setShowFileContainer({ ...showFileContainer, pt_rec_ead: value })}
                        existsFiles={files?.filter((file) => file?.campo === 'pt_rec_ead' && file?.tipo === 'ead').length > 0}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Recredenciamento' name='pt_rec_ead' onChange={handleChange} value={institutionData?.pt_rec_ead || ''} label='Portaria de Recredenciamento' sx={{ flex: 1, }} />


                        <UploadedFiles
                            setFiles={setFiles}
                            files={files}
                            isPermissionEdit={isPermissionEdit}
                            open={showFileContainer?.pt_rec_ead}
                            newInstitution={newInstitution}
                            onSet={(set) => {
                                setShowFileContainer({ ...showFileContainer, pt_rec_ead: set })
                            }}
                            title='Portaria de Recredenciamento - EAD'
                            institutionId={id}
                            campo='pt_rec_ead'
                            tipo='ead'
                            callback={(file) => {
                                if (file.status === 201 || file.status === 200) {
                                    handleItems()
                                }
                            }}
                        />
                    </FileInput>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_rec_ead' onChange={handleChange} value={(institutionData?.dt_rec_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                    {arrayRecognitionEad.map((rec, index) => (
                        <>
                            <Box key={index} sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput disabled={!isPermissionEdit && true} label="Portaria de Renovação do Recredenciamento" placeholder='Portaria de Renovação do Recredenciamento' name={`ren_reconhecimento_ead-${index}`} onChange={handleChangeRecognitionEad} value={rec.ren_reconhecimento_ead} sx={{ flex: 1 }} />
                                <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name={`dt_renovacao_rec_ead-${index}`} onChange={handleChangeRecognitionEad} value={(rec?.dt_renovacao_rec_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
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
                                    newInstitution ? deleteRecognitionEad(index) : handleDeleteRecognition(rec?.id_renovacao_rec_ead)
                                }} />}
                            </Box>
                        </>
                    ))}
                    <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                        <TextInput disabled={!isPermissionEdit && true} label="Portaria de Renovação do Recredenciamento" placeholder='Portaria de Renovação do Recredenciamento' name={`ren_reconhecimento_ead`} onChange={handleChangeRecognitionEad} value={recognitionEad.ren_reconhecimento_ead} sx={{ flex: 1 }} />
                        <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name='dt_renovacao_rec_ead' onChange={handleChangeRecognitionEad} value={(recognitionEad?.dt_renovacao_rec_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                        {isPermissionEdit && <Box sx={{
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
                            newInstitution ? addRecognitionEad() : handleAddRecognition()
                        }} />}
                    </Box>
                </Box>
                <Text bold >Endereço Polo Sede</Text>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='CEP' name='cep_ead' onChange={handleChange} value={institutionData?.cep_ead || ''} label='CEP *' onBlur={handleBlurCEP} sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Endereço' name='rua_ead' onChange={handleChange} value={institutionData?.rua_ead || ''} label='Endereço *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nº' name='numero_ead' onChange={handleChange} value={institutionData?.numero_ead || ''} label='Nº *' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Cidade' name='cidade_ead' onChange={handleChange} value={institutionData?.cidade_ead || ''} label='Cidade *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='UF' name='uf_ead' onChange={handleChange} value={institutionData?.uf_ead || ''} label='UF *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Bairro' name='bairro_ead' onChange={handleChange} value={institutionData?.bairro_ead || ''} label='Bairro *' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Complemento' name='complemento_ead' onChange={handleChange} value={institutionData?.complemento_ead || ''} label='Complemento' sx={{ flex: 1, }} />
                </Box>
            </ContentContainer>
        </>
    )
}



export const UploadedFiles = (props) => {
    const {
        open = false,
        onSet = () => { },
        callback = () => { },
        title = '',
        campo = '',
        tipo = '',
        newInstitution,
        isPermissionEdit,
        setFiles,
        files,
        institutionId
    } = props

    const { alert, setLoading, matches, theme } = useAppContext()

    const handleDeleteFile = async (files) => {
        setLoading(true)
        let query = `?key=${files?.key_file}`;

        const response = await api.delete(`/institution/file/delete/${files?.id_doc_instituicao}${query}`)
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
                institutionId: institutionId
            }));

            setFiles(prevFilesDrop => [...prevFilesDrop, ...uploadedFiles]);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleRemoveFile = (file) => {
        const arquivosAtualizados = files.filter((uploadedFile) => uploadedFile.id !== file.id);
        setFiles(arquivosAtualizados);
    };

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
                        <Text>
                            Faça o upload do seu documento frente e verso, depois clique em salvar.
                        </Text>
                    </Box>
                    {isPermissionEdit &&
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            {!newInstitution ?
                                <CustomDropzone
                                    txt={'Arraste ou clique para selecionar o arquivo desejado.'}
                                    callback={(file) => {
                                        if (file.status === 201) {
                                            callback(file)
                                        }
                                    }}
                                    institutionId={institutionId}
                                    campo={campo}
                                    tipo={tipo}
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
                                                    <Text light small>
                                                        Arraste ou clique para selecionar o arquivo desejado.
                                                    </Text>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Dropzone>}

                        </Box>}

                    {campo != 'foto_perfil' && files?.filter(item => item?.campo === campo)?.length > 0 &&
                        <ContentContainer>
                            <Text bold>Arquivos</Text>
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflow: 'auto', padding: '15px 10px' }}>
                                {files?.filter(item => item?.campo === campo)?.map((file, index) => {
                                    const typePdf = file?.name_file
                                        ?.includes('pdf') || null;
                                    const fileName = file?.name_file || file?.name
                                    const fileLocation = file?.location || file?.preview
                                    return (
                                        <Box key={`${file}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: '160px' }}>

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
                                                    if (newInstitution) {
                                                        handleRemoveFile(file)
                                                    } else {
                                                        handleDeleteFile(file)
                                                    }
                                                }} />}
                                            </Link>
                                            <Text sx={{ fontWeight: 'bold', fontSize: 'small', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {decodeURIComponent(fileName)}
                                            </Text>
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
        gap: 1,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}