import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { formatCNPJ } from "../../../helpers"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

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
        ativo: 1
    })
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)


    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

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
                deleteButton={!newInstitution && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteInstitution })}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Instituição</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name='nome_instituicao' onChange={handleChange} value={institutionData?.nome_instituicao || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='CNPJ' name='cnpj' onChange={handleChange} value={institutionData?.cnpj || ''} label='CNPJ' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Mantenedora' name='mantenedora' onChange={handleChange} value={institutionData?.mantenedora || ''} label='Mantenedora' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Mantida' name='mantida' onChange={handleChange} value={institutionData?.mantida || ''} label='Mantida' sx={{ flex: 1, }} />
                </Box>
                <Text bold>Presencial</Text>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Credenciamento' name='pt_cred_pres' onChange={handleChange} value={institutionData?.pt_cred_pres || ''} label='Portaria de Credenciamento' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} label="Data" placeholder='Data' name='dt_cred_pres' onChange={handleChange} value={(institutionData?.dt_cred_pres)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Recredenciamento' name='pt_rec_pres' onChange={handleChange} value={institutionData?.pt_rec_pres || ''} label='Portaria de Recredenciamento' sx={{ flex: 1, }} />
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
                <Text bold>EAD</Text>
                <Box sx={styles.inputSection}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Credenciamento' name='pt_cred_ead' onChange={handleChange} value={institutionData?.pt_cred_ead || ''} label='Portaria de Credenciamento' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Data' name='dt_cred_ead' onChange={handleChange} value={(institutionData?.dt_cred_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Portaria de Recredenciamento' name='pt_rec_ead' onChange={handleChange} value={institutionData?.pt_rec_ead || ''} label='Portaria de Recredenciamento' sx={{ flex: 1, }} />
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
                <RadioItem disabled={!isPermissionEdit && true} valueRadio={institutionData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setInstitutionData({ ...institutionData, ativo: parseInt(value) })} />
            </ContentContainer>
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