import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditInstitution(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newInstitution = id === 'new';
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
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getInstitution = async () => {
        try {
            const response = await api.get(`/institution/${id}`)
            const { data } = response
            setInstitutionData(data)
        } catch (error) {
            console.log(error)
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


    const handleItems = async () => {
        setLoading(true)
        try {
            await getInstitution()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar A instituição')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

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
                const response = await api.post(`/institution/create`, { institutionData });
                const { data } = response
                console.group(data)
                if (response?.status === 201) {
                    alert.success('Instituição cadastrada com sucesso.');
                    router.push(`/administrative/institution/${data?.institution}`)
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
            const response = await api.patch(`/institution/update/:${id}`, { institutionData })
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
                title={institutionData?.nome_curso || `Novo Curso`}
                saveButton
                saveButtonAction={newInstitution ? handleCreateInstitution : handleEditInstitution}
                deleteButton={!newInstitution}
                deleteButtonAction={() => handleDeleteInstitution()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Instituição</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_instituicao' onChange={handleChange} value={institutionData?.nome_instituicao || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='CNPJ' name='cnpj' onChange={handleChange} value={institutionData?.cnpj || ''} label='CNPJ' sx={{ flex: 1, }} />
                </Box>
                <Text bold>Presencial</Text>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Portaria MEC/Credenciamento' name='pt_cred_pres' onChange={handleChange} value={institutionData?.pt_cred_pres || ''} label='Portaria MEC/Reconhecimento' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data' name='dt_cred_pres' onChange={handleChange} value={(institutionData?.dt_cred_pres)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                    <TextInput placeholder='Portaria MEC/Reconhecimento' name='pt_rec_pres' onChange={handleChange} value={institutionData?.pt_rec_pres || ''} label='Portaria MEC/Autorização' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data' name='dt_rec_pres' onChange={handleChange} value={(institutionData?.dt_rec_pres)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <Text bold>EAD</Text>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Portaria MEC/Credenciamento' name='pt_cred_ead' onChange={handleChange} value={institutionData?.pt_cred_ead || ''} label='Portaria MEC/Autorização' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data' name='dt_cred_ead' onChange={handleChange} value={(institutionData?.dt_cred_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                    <TextInput placeholder='Portaria MEC/Reconhecimento' name='pt_rec_ead' onChange={handleChange} value={institutionData?.pt_rec_ead || ''} label='Portaria MEC/Reconhecimento' sx={{ flex: 1, }} />
                    <TextInput placeholder='Data' name='dt_rec_ead' onChange={handleChange} value={(institutionData?.dt_rec_ead)?.split('T')[0] || ''} type="date" sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={institutionData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setInstitutionData({ ...institutionData, ativo: parseInt(value) })} />
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
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}