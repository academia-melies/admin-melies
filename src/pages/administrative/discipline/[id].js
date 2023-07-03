import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createContract, createCourse, createDiscipline, createEnrollment, createUser, deleteCourse, deleteDiscipline, editContract, editCourse, editDiscipline, editeEnrollment, editeUser } from "../../../validators/api-requests"
import { emailValidator, formatCEP, formatRg } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditDiscipline(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id, slug } = router.query;
    const newDiscipline = id === 'new';
    const [disciplineData, setDisciplineData] = useState({})
    const [showRegistration, setShowRegistration] = useState(false)
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getDiscipline = async () => {
        try {
            const response = await api.get(`/discipline/${id}`)
            const { data } = response
            setDisciplineData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newDiscipline) {
                return
            }
            await handleItems();
        })();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getDiscipline()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Disciplina')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setDisciplineData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!disciplineData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createDiscipline(disciplineData);
                const { data } = response
                console.group(data)
                if (response?.status === 201) {
                    alert.success('Curso cadastrado com sucesso.');
                    router.push(`/administrative/discipline/${data?.discipline}`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o curso.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await deleteDiscipline(id)
            if (response?.status == 201) {
                alert.success('Disciplina excluído com sucesso.');
                router.push(`/administrative/course/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o Disciplina.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editDiscipline({ id, disciplineData })
                if (response?.status === 201) {
                    alert.success('Disciplina atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Disciplina.');
            } finally {
                setLoading(false)
            }
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
                // perfil={disciplineData?.modalidade_curso}
                title={disciplineData?.nome_disciplina || `Nova Disciplina`}
                saveButton
                saveButtonAction={newDiscipline ? handleCreate : handleEdit}
                deleteButton={!newDiscipline}
                deleteButtonAction={() => handleDelete()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Disciplina</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_disciplina' onChange={handleChange} value={disciplineData?.nome_disciplina || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='Carga Horária' name='carga_hr_dp' onChange={handleChange} value={disciplineData?.carga_hr_dp || ''} label='Carga Horária' sx={{ flex: 1, }} />
                    <TextInput placeholder='Pré-requisitos' name='pre_req' onChange={handleChange} value={disciplineData?.pre_req || ''} label='Pré-requisitos' sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Ementa' name='ementa' onChange={handleChange} value={disciplineData?.ementa || ''} label='Ementa' sx={{ flex: 1, }} />
                    <TextInput placeholder='Objetivo' name='objetivo_dp' onChange={handleChange} value={disciplineData?.objetivo_dp || ''} label='Objetivo' sx={{ flex: 1, }} />
                </Box>
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