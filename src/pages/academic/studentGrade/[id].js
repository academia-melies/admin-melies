import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function StudentGradeEdit(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id } = router.query;
    const newStudentGrade = id === 'new';
    const [studentGradeData, setStudentGradeData] = useState({})
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))


    const getStudentGrade = async () => {
        try {
            const response = await api.get(`/studentGrade/${id}`)
            const { data } = response
            setStudentGradeData(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        (async () => {
            if (newStudentGrade) {
                return
            }
            await handleItems();

        })();
    }, [id])



    const handleItems = async () => {
        setLoading(true)
        try {
            await getStudentGrade()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Turma')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setStudentGradeData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!studentGradeData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreateStudentGrade = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {
                const response = await createClass(studentGradeData);
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

    const handleDeleteStudentGrade = async () => {
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

    const handleEditStudentGrade = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await editClass({ id, studentGradeData })
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

    // async function liststudentGrade() {
    //     try {
    //         const response = await api.get(`/studentGrade`)
    //         const { data } = response
    //         const groupstudentGrade = data.map(course => ({
    //             label: course.nome_curso,
    //             value: course?.id_curso
    //         }));

    //         setStudentGrade(groupstudentGrade);
    //     } catch (error) {
    //     }
    // }

    // async function listGrids() {
    //     try {
    //         const response = await api.get(`/grids`)
    //         const { data } = response
    //         const groupGrids = data.map(grid => ({
    //             label: grid.nome_grade,
    //             value: grid?.id_grade
    //         }));

    //         setGrids(groupGrids);
    //     } catch (error) {
    //     }
    // }

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
                perfil={'turma'}
                title={studentGradeData?.nome_turma || `Nova Turma`}
                saveButton
                saveButtonAction={newStudentGrade ? handleCreateStudentGrade : handleEditStudentGrade}
                deleteButton={!newStudentGrade}
                deleteButtonAction={() => handleDeleteStudentGrade()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Avaliação Semestral</Text>
                </Box>
                <Box sx={styles.inputSection}>
                    <TextInput placeholder='Nome' name='nome_turma' onChange={handleChange} value={studentGradeData?.nome_turma || ''} label='Nome' sx={{ flex: 1, }} />
                    <TextInput placeholder='Inicio' name='inicio' onChange={handleChange} value={(studentGradeData?.inicio)?.split('T')[0] || ''} type="date" label='Inicio' sx={{ flex: 1, }} />
                    <TextInput placeholder='Fim' name='fim' onChange={handleChange} value={(studentGradeData?.fim)?.split('T')[0] || ''} label='Fim' type="date" sx={{ flex: 1, }} />
                </Box>
                <Box sx={styles.inputSection}>
                    {/* <SelectList fullWidth data={studentGrade} valueSelection={studentGradeData?.curso_id} onSelect={(value) => setStudentGradeData({ ...studentGradeData, curso_id: value })}
                        title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList fullWidth data={grids} valueSelection={studentGradeData?.grade_id} onSelect={(value) => setStudentGradeData({ ...studentGradeData, grade_id: value })}
                        title="Grade" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    /> */}
                    <TextInput placeholder='Quantidade de alunos' name='qnt_alunos' onChange={handleChange} type="number" value={studentGradeData?.qnt_alunos || ''} label='Quantidade de alunos' sx={{ flex: 1, }} />
                </Box>
                <RadioItem valueRadio={studentGradeData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setStudentGradeData({ ...studentGradeData, ativo: parseInt(value) })} />
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