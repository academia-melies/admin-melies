import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createGrid, deleteGrid, editGrid } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"

export default function EditGrid(props) {
    const { setLoading, alert, colorPalette } = useAppContext()
    const router = useRouter()
    const { id, slug } = router.query;
    const newGrid = id === 'new';
    const [gridData, setGridData] = useState([])
    const [planGridData, setPlanGridData] = useState([])
    const [disciplines, setDisciplines] = useState([])
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))

    const addPlanGrid = async () => {
        setLoading(true)
        try {
            const response = await api.post(`/gridplan/create`, { gridData })
            if (response?.status == 201) {
                alert.success('Disciplina adicionada.');
                handleItems()
            }
        } catch (error) {
            alert.error('Ocorreu um erro ao adicionar a disciplina selecionada.');
            console.log(error)
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


    const getGrids = async () => {
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

    useEffect(() => {
        (async () => {
            if (newGrid) {
                return
            }
            await handleItems();
        })();
    }, [id])

    useEffect(() => {
        listDisciplines()
    }, [id])

    async function listDisciplines() {
        try {
            const response = await api.get(`/disciplines`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
        }
    }


    const handleItems = async () => {
        setLoading(true)
        try {
            await getGrids()
            await getPlanGrids()
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

    const handleCreateGrid = async () => {
        setLoading(true)
        try {
            const response = await createGrid(gridData);
            const { data } = response
            console.log(data)
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

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                // perfil={'bimestre'}
                title={gridData?.nome_grade || `Nova grade`}
                saveButton
                saveButtonAction={newGrid ? handleCreateGrid : handleEditGrid}
                deleteButton={!newGrid}
                deleteButtonAction={() => handleDeleteGrid()}
            />

            {/* usuario */}
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Grade</Text>
                </Box>
                <TextInput placeholder='Nome' name='nome_grade' onChange={handleChange} value={gridData?.nome_grade || ''} label='Nome da grade' sx={{ flex: 1, }} />
                <RadioItem valueRadio={gridData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setGridData({ ...gridData, ativo: parseInt(value) })} />
                {!newGrid &&
                    <>
                        {planGridData && (Array.isArray(planGridData) ?
                            planGridData.map((planGrid, index) => (
                                <Box sx={{ ...styles.inputSection, alignItems: 'center' }} key={`${planGrid}-${index}`}>
                                    <TextInput placeholder='Disciplina' name="discipline" value={planGrid?.nome_disciplina || ''} label='Disciplina' sx={{ flex: 1 }} />
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
                                    }} onClick={() => deletePlanGrid(planGrid?.id_plano_grade)} />
                                </Box>
                            )) :
                            <Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                                <TextInput placeholder='Disciplina' name="discipline" value={planGridData?.nome_disciplina || ''} label='Disciplina' sx={{ flex: 1 }} />
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
                                }} onClick={() => deletePlanGrid(planGridData?.id_plano_grade)} />
                            </Box>
                        )}

                        < Box sx={{ ...styles.inputSection, alignItems: 'center' }}>
                            <SelectList fullWidth data={disciplines} valueSelection={gridData?.disciplina_id} onSelect={(value) => setGridData({ ...gridData, disciplina_id: value })}
                                title="Disciplina" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />
                            <Box sx={{
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                width: 25,
                                height: 25,
                                backgroundImage: `url(/icons/include_icon.png)`,
                                transition: '.3s',
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                }
                            }} onClick={() => addPlanGrid()} />
                        </Box>
                    </>
                }
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