import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditClass(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newClass = id === 'new';
    const [classData, setClassData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [courses, setCourses] = useState([])
    const [grids, setGrids] = useState([])


    const getClass = async () => {
        try {
            const response = await api.get(`/class/${id}`)
            const { data } = response
            setClassData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        listCourses()
        listGrids()
    }, [id])

    useEffect(() => {
        (async () => {
            if (newClass) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getClass()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Turma')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setClassData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!classData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateClass = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createClass(classData);
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Turma cadastrado com sucesso.');
                    router.push(`/administrative/class/${data?.class}`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar turma.');
            } finally {
                setLoading(false)
            }
        }
    }

    const handleDeleteClass = async () => {
        setLoading(true)
        try {
            const response = await deleteClass(id)
            if (response?.status == 201) {
                alert.success('Turma excluído com sucesso.');
                router.push(`/administrative/class/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a turma.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClass = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editClass({ id, classData })
                if (response?.status === 201) {
                    alert.success('Turma atualizado com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Turma.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Turma.');
            } finally {
                setLoading(false)
            }
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

    async function listGrids() {
        try {
            const response = await api.get(`/grids`)
            const { data } = response
            const groupGrids = data.map(grid => ({
                label: grid.nome_grade,
                value: grid?.id_grade
            }));

            setGrids(groupGrids);
        } catch (error) {
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]


    const grouperiod = [
        { label: 'Manhã', value: 'Manhã' },
        { label: 'Tarde', value: 'Tarde' },
        { label: 'Noite', value: 'Noite' }
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={'turma'}
                title={classData?.nome_turma || `Nova Turma`}
                saveButton
                saveButtonAction={newClass ? handleCreateClass : handleEditClass}
                deleteButton={!newClass}
                deleteButtonAction={() => handleDeleteClass()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Turma</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_turma' onChange={handleChange} value={classData?.nome_turma || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='Inicio' name='inicio' onChange={handleChange} value={(classData?.inicio)?.split('T')[0] || ''} type="date" label='Inicio' sx={{ flex: 1, }} />
                    <TextInput placeholder='Fim' name='fim' onChange={handleChange} value={(classData?.fim)?.split('T')[0] || ''} label='Fim' type="date" sx={{ flex: 1, }} />
                    <SelectList data={grouperiod} valueSelection={classData?.periodo} onSelect={(value) => setClassData({ ...classData, periodo: value })}
                        title="Periodo" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1, }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                </Box>
                <Box sx={styles.inputSection}>
                    <SelectList fullWidth data={courses} valueSelection={classData?.curso_id} onSelect={(value) => setClassData({ ...classData, curso_id: value })}
                        title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={grids} valueSelection={classData?.grade_id} onSelect={(value) => setClassData({ ...classData, grade_id: value })}
                        title="Grade" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <TextInput placeholder='Quantidade de alunos' name='qnt_alunos' onChange={handleChange} type="number" value={classData?.qnt_alunos || ''} label='Quantidade de alunos' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={classData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setClassData({ ...classData, ativo: parseInt(value) })} />
            </ContentContainer>
        </>
    )
}

const styles = {
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