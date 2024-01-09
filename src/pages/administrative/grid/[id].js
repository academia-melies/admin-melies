import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SectionHeader, SelectList } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createGrid, deleteGrid, editGrid } from "../../../validators/api-requests"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function EditGrid(props) {
    const { setLoading, alert, colorPalette, setShowConfirmationDialog, userPermissions, menuItemsList } = useAppContext()
    const router = useRouter()
    const { id, slug } = router.query;
    const newGrid = id === 'new';
    const [gridData, setGridData] = useState([])
    const [planGridData, setPlanGridData] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const [courses, setCourses] = useState([])
    const [moduleData, setModuleData] = useState([])
    const [disciplineModuleChange, setDisciplineModuleChange] = useState({})
    const [gridList, setGrids] = useState([])
    const [copyGrid, setCopyGrid] = useState(0)
    const [copyGridId, setCopyGridId] = useState()
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
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

    useEffect(() => {
        fetchPermissions()
    }, [])

    const fetchData = async () => {
        try {
            await Promise.all([listDisciplines(), listCourses(), handleItems()]);
        } catch (error) {
            alert.error('Ocorreu um erro ao carregar as informações iniciais.');
            return error
        }
    };



    const addPlanGrid = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/gridplan/create/${id}`, { moduleData })
            if (response?.status === 201) {
                alert.success('Disciplina adicionada.');
                await setModuleData([])
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar a disciplina selecionada.');
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    };

    const updatePlanGrid = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/gridplan/update`, { disciplineModuleChange })
            if (response?.status === 201) {
                alert.success('Disciplina atualizada.');
                await setDisciplineModuleChange({})
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao atualizada a disciplina selecionada.');
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    };


    const deletePlanGrid = async (idPlan) => {
        setLoading(true)
        try {
            const response = await api.delete(`/gridplan/delete/${idPlan}`)
            if (response?.status == 201) {
                alert.success('Disciplina removida.');
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao remover a disciplina selecionada.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (Object.keys(moduleData).length > 0) {
            addPlanGrid()
        }
    }, [moduleData])

    useEffect(() => {
        if (Object.keys(disciplineModuleChange).length > 0) {
            updatePlanGrid()
        }
    }, [disciplineModuleChange])



    const getGrid = async () => {
        try {
            const response = await api.get(`/grid/${id}`)
            const { data } = response
            setGridData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getPlanGrids = async () => {
        try {
            const response = await api.get(`/gridplan/${id}`)
            const { data } = response
            setPlanGridData(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getGrids = async () => {
        try {
            const response = await api.get('/grids')
            const { data = [] } = response;
            const groupGrids = data.map(grid => ({
                ...grid,
                label: grid.nome_grade,
                value: grid?.id_grade
            }));

            setGrids(groupGrids)
        } catch (error) {
            console.log(error)
        }
    }

    const handleChangeCourse = async (value) => {

        let nameCourse = courses.filter((course) => course?.value === value).map((item) => item.label)
        let nameGrid = `Grade - ${nameCourse}`
        let [modulesQnt] = courses.filter((course) => course?.value === value).map((item) => item.duration)

        setGridData({
            ...gridData,
            curso_id: value,
            nome_grade: nameGrid,
            modulos: modulesQnt
        })
    }

    useEffect(() => {
        fetchData();
    }, [id, newGrid]);


    async function listDisciplines() {
        try {
            const response = await api.get(`/disciplines/active`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            const sortedDisciplines = groupDisciplines.sort((a, b) => a.label.localeCompare(b.label, 'pt', { sensitivity: 'base' }));

            setDisciplines(sortedDisciplines);
        } catch (error) {
            return error
        }
    }

    async function listCourses() {
        try {
            const response = await api.get(`/courses`)
            const { data } = response
            const groupCourses = data.map(course => ({
                label: `${course.nome_curso}_${course?.modalidade_curso}`,
                value: course?.id_curso,
                duration: course?.duracao
            }));

            setCourses(groupCourses);
        } catch (error) {
        }
    }

    const handleItems = async () => {
        setLoading(true)
        try {
            await getGrid()
            await getPlanGrids()
            await getGrids()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar a Grade')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (value) => {

        setGridData((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    let [gridCopyData] = gridList.filter(item => item.id_grade === copyGridId);

    const handleCreateGrid = async () => {
        setLoading(true)
        try {
            const response = await createGrid(gridData, copyGrid, gridCopyData);
            const { data } = response
            if (response?.status === 201) {
                alert.success('Curso cadastrado com sucesso.');
                router.push(`/administrative/grid/${data?.grid}`)
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar o curso.');
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteGrid = async () => {
        setLoading(true)
        try {
            const response = await deleteGrid(id)
            if (response?.status == 201) {
                alert.success('Curso excluído com sucesso.');
                router.push(`/administrative/grid/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir o curso.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditGrid = async () => {
        setLoading(true)
        try {
            const response = await editGrid({ id, gridData })
            if (response?.status === 201) {
                alert.success('Grade atualizado com sucesso.');
                handleItems()
                return
            }
            alert.error('Tivemos um problema ao atualizar Grade.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Grade.');
        } finally {
            setLoading(false)
        }
    }

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const groupCopy = [
        { label: 'Sim', value: 1 },
        { label: 'Não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                title={gridData?.nome_grade || `Nova grade`}
                saveButton={isPermissionEdit}
                saveButtonAction={newGrid ? handleCreateGrid : handleEditGrid}
                deleteButton={!newGrid && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDeleteGrid })}
            />
            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Grade</Text>
                </Box>
                <SelectList disabled={!isPermissionEdit && true} fullWidth data={courses} valueSelection={gridData?.curso_id} onSelect={(value) => handleChangeCourse(value)}
                    title="Curso" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                />
                < Box sx={{ ...styles.inputSection }}>
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Nome' name='nome_grade' onChange={handleChange} value={gridData?.nome_grade || ''} label='Nome da grade' sx={{ flex: 1, }} />
                    <TextInput disabled={!isPermissionEdit && true} placeholder='Módulos' name='semestres' onChange={handleChange} value={gridData?.modulos || ''} label='Módulos' sx={{ flex: 1, }} />
                </Box>
                <RadioItem disabled={!isPermissionEdit && true}
                    valueRadio={copyGrid}
                    group={groupCopy}
                    title="Copiar grade"
                    horizontal={mobile ? false : true}
                    onSelect={(value) => setCopyGrid(parseInt(value))}
                />

                {copyGrid === 1 &&
                    <SelectList disabled={!isPermissionEdit && true} fullWidth data={gridList} valueSelection={copyGridId} onSelect={(value) => setCopyGridId(value)}
                        title="Grades" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                }

                <RadioItem disabled={!isPermissionEdit && true} valueRadio={gridData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setGridData({ ...gridData, ativo: parseInt(value) })} />
                {!newGrid &&
                    Array.from({ length: gridData?.modulos }).map((_, index) => (
                        <SemesterFields
                            isPermissionEdit={isPermissionEdit}
                            key={index}
                            semesterNumber={index + 1}
                            planGridData={planGridData}
                            deletePlanGrid={deletePlanGrid}
                            disciplines={disciplines}
                            colorPalette={colorPalette}
                            moduleData={moduleData}
                            setModuleData={setModuleData}
                            setDisciplineModuleChange={setDisciplineModuleChange}
                        />
                    ))}

            </ContentContainer >
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

export const SemesterFields = (props) => {
    const {
        semesterNumber,
        planGridData,
        deletePlanGrid,
        disciplines,
        colorPalette,
        moduleData,
        setModuleData,
        setDisciplineModuleChange,
        isPermissionEdit
    } = props

    const filteredPlanGridData = planGridData.filter(planGrid => planGrid.modulo_grade === semesterNumber);

    const handleChangeDisciplinePlanGrid = (planGridId, value) => {

        setDisciplineModuleChange({
            disciplina_id: value,
            id_plano_grade: planGridId
        });
    }



    return (

        <ContentContainer>
            <Box>
                <Text title bold style={{ padding: "0px 0px 20px 0px" }}>
                    {`${semesterNumber}º Módulo`}
                </Text>
            </Box>
            {filteredPlanGridData?.map((planGrid, index) => {
                return (
                    <Box sx={{ ...styles.inputSection, alignItems: "center" }} key={planGrid.modulo_grade}>
                        <SelectList disabled={!isPermissionEdit && true}
                            clean={false}
                            fullWidth={true}
                            data={disciplines}
                            valueSelection={planGrid?.id_disciplina}
                            onSelect={(value) => handleChangeDisciplinePlanGrid(planGrid?.id_plano_grade, value)}
                            title="Disciplina"
                            filterOpition="value"
                            sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{
                                color: colorPalette.textColor,
                                fontSize: "15px",
                                fontFamily: "MetropolisBold",
                            }}
                        />
                        {isPermissionEdit && <Box
                            sx={{
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center",
                                width: 25,
                                height: 25,
                                backgroundImage: `url(/icons/remove_icon.png)`,
                                transition: ".3s",
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: "pointer",
                                },
                            }}
                            onClick={() => deletePlanGrid(planGrid?.id_plano_grade)}
                        />}
                    </Box>
                )
            })}
            <Box sx={{ ...styles.inputSection, alignItems: "center" }}>
                <SelectList disabled={!isPermissionEdit && true}
                    fullWidth
                    data={disciplines}
                    valueSelection={moduleData[`disciplina_id-${semesterNumber}`] || ''}
                    onSelect={(value) =>
                        setModuleData({
                            ...moduleData,
                            [`disciplina_id-${semesterNumber}`]: value,
                            [`modulo_grade`]: semesterNumber
                        })
                    }
                    title="Disciplina"
                    filterOpition="value"
                    sx={{ color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{
                        color: colorPalette.textColor,
                        fontSize: "15px",
                        fontFamily: "MetropolisBold",
                    }}
                />
            </Box>
        </ContentContainer>
    )
}


