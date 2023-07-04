import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import { Avatar, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { icons } from "../../../organisms/layout/Colors"
import { createContract, createCourse, createEnrollment, createUser, deleteCourse, editContract, editCourse, editeEnrollment, editeUser } from "../../../validators/api-requests"
import { emailValidator, formatCEP, formatRg } from "../../../helpers"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditCourse(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id, slug } = router.query;
    const newCourse = id === 'new';
    const [courseData, setCourseData] = useState({})
    const [showRegistration, setShowRegistration] = useState(false)
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const getCourse = async () => {
        try {
            const response = await api.get(`/course/${id}`)
            const { data } = response
            setCourseData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newCourse) {
                return
            }
            await handleItems();
        })();
    }, [id])


    const handleItems = async () => {
        setLoading(true)
        try {
            await getCourse()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar Curso')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setCourseData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!courseData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateCourse = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createCourse(courseData);
                const { data } = response
                console.group(data)
                if (response?.status === 201) {
                    alert.success('Curso cadastrado com sucesso.');
                    router.push(`/administrative/course/${data?.course}`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar o curso.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteCourse = async () => {
        setLoading(true)
        try {
            const response = await deleteCourse(id)
            if (response?.status == 201) {
                alert.success('Curso excluído com sucesso.');
                router.push(`/administrative/course/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o curso.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditCourse = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editCourse({ id, courseData })
                if (response?.status === 201) {
                    alert.success('Curso atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Curso.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Curso.');
            } finally {
                setLoading(false)
            }
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupModal = [
        { label: 'Presencial', value: 'Presencial' },
        { label: 'EAD', value: 'EAD' },
        { label: 'Hibrido', value: 'Hibrido' },
    ]

    const groupNivel = [
        { label: 'Graduação', value: 'Graduação' },
        { label: 'Pós-Graduação', value: 'Pós-Graduação' },
        { label: 'Tecnólogo', value: 'Tecnólogo' },
        { label: 'Curso Tecnico', value: 'Curso Tecnico' },
        { label: 'Curso livre', value: 'Curso livre' },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={courseData?.modalidade_curso}
                title={courseData?.nome_curso || `Novo Curso`}
                saveButton
                saveButtonAction={newCourse ? handleCreateCourse : handleEditCourse}
                deleteButton={!newCourse}
                deleteButtonAction={() => handleDeleteCourse()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados do Curso</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_curso' onChange={handleChange} value={courseData?.nome_curso || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='Duração' name='duracao' onChange={handleChange} value={courseData?.duracao || ''} label='Duração' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={courseData?.modalidade_curso} group={groupModal} title="Modalidade" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, modalidade_curso: value })} sx={{ flex: 1, }} />
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Portaria MEC' name='porta_mec' onChange={handleChange} value={courseData?.porta_mec || ''} label='Portaria MEC' sx={{ flex: 1, }} />
                    <TextInput placeholder='Valor' name='valor' onChange={handleChange} value={courseData?.valor || ''} label='Valor' sx={{ flex: 1, }} />
                    <TextInput placeholder='Carga horária' name='carga_hr_curso' onChange={handleChange} value={courseData?.carga_hr_curso || ''} label='Carga horária' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={courseData?.nivel_curso} group={groupNivel} title="Nível do curso" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, nivel_curso: value })} sx={{ flex: 1, }} />
                <RadioItem valueRadio={courseData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setCourseData({ ...courseData, ativo: parseInt(value)})} />

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