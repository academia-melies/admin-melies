import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { Forbidden } from "../../../forbiddenPage/forbiddenPage"
import { Colors, IconTheme, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { getDisciplines, getdisciplines, getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import axios from "axios"
import { Backdrop, CircularProgress, TablePagination, listClasses } from "@mui/material"
import { icons } from "../../../organisms/layout/Colors"
import { formatTimeStamp } from "../../../helpers"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import Link from "next/link"

export default function ClassDay(props) {
    const [classDayList, setClassDay] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, alert, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [showEditClassDay, setShowEditClassDay] = useState(false)
    const [isFind, setIsFind] = useState(false)
    const [page, setPage] = useState(0);
    const [classes, setClasses] = useState([])
    const [modules, setModules] = useState([]);
    const [listGradesByDisciplines, setListGradesByDisciplines] = useState([])
    const [showClasses, setShowClasses] = useState(false)
    const [classDaySelected, setClassSelected] = useState({})
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        classId: '',
        moduleSelected: ''
    })
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)


    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            // setIsPermissionEdit(actions)
            setIsPermissionEdit(true)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const router = useRouter()
    const id = router?.query?.id || null
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    useEffect(() => {
        fetchPermissions()
        handleClasses()
        setShowFilterMobile(false)
    }, [filterAtive])

    const checkField = () => {
        const { classId, disciplineId, moduleSelected } = filters

        if (!classId) {
            alert.error('Selecione uma Turma')
            return false
        }
        if (!moduleSelected) {
            alert.error('Selecione um Módulo')
            return false
        }
        return true
    }

    const handleChange = (value) => {

        setClassSelected((prevValues) => ({
            ...prevValues,
            [value.target.name]: value.target.value,
        }))
    }

    const handleClasses = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/classes`)
            const { data = [] } = response;
            const groupClasses = data.map(classes => ({
                label: classes?.nome_turma,
                value: classes?.id_turma
            }));
            setClasses(groupClasses)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleFindClasses = async () => {
        if (checkField()) {
            setLoading(true)
            const { classId, moduleSelected } = filters
            try {
                const response = await api.get(`/student/grades/disciplines/${moduleSelected}/${classId}`)

                console.log(response)
                const { data = [] } = response;
                setIsFind(true)
                setListGradesByDisciplines(data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleModule = async (turmaId) => {

        setFilters({ ...filters, classId: turmaId, moduleSelected: '' })
        setShowClasses(true)
        setIsFind(false)
        if (turmaId) {
            setLoading(true)
            try {
                const response = await api.get(`/class/modules/${turmaId}`)
                const { data } = response
                if (response.status === 201) {
                    const [module] = data.map((item) => item?.modulos)
                    const modulesList = handleModules(module);
                    setModules(modulesList);
                }
                return response
            } catch (error) {
                return error
            } finally {
                setLoading(false)
            }
        } else {
            setModules([])
        }
    }

    const handleModules = (module) => {
        const moduleArray = [];
        for (let i = 1; i <= module; i++) {
            moduleArray.push({
                label: `${i}º Módulo`,
                value: i,
            });
        }
        return moduleArray;
    }

    const handleEditClassDay = async () => {
        setLoading(true)
        try {
            const response = await api.patch(`/classDay/update/classDiary`, { classDaySelected })
            if (response?.status === 201) {
                alert.success('Aula atualizada com sucesso.');
                handleFindClasses()
                setShowEditClassDay(false)
                return
            }
            alert.error('Tivemos um problema ao atualizar Aula.');
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao atualizar Aula.');
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_turma', label: 'ID' },
        { key: 'nome_turma', label: 'Nome' },
        { key: 'periodo', label: 'Periodo' },
        { key: 'dt_criacao', label: 'Criado em', date: true }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listUser = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Funcionario', value: 'funcionario' },
        { label: 'Interessado', value: 'interessado' },
    ]

    return (
        <>
            <SectionHeader
                title={`Notas por Disciplinas (${listGradesByDisciplines?.length || '0'})`}
            />

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar turma.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />

                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={classDayList?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Items"
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />
                </Box>
                <Divider distance={0} />
            </Box>


            <Backdrop open={showFilterMobile} sx={{ zIndex: 999, width: '100%' }}>
                <ContentContainer sx={{ height: '100%', position: 'absolute', marginTop: 18, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999 }}>
                        <Text bold large>Filtros</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowFilterMobile(false)} />
                    </Box>
                    <Divider padding={0} />
                    <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-start', alignItems: 'start', flexDirection: 'column', position: 'relative', }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, alignItems: 'start', flexDirection: 'column' }}>
                            <SelectList
                                data={listAtivo}
                                valueSelection={filterAtive}
                                onSelect={(value) => setFilterAtive(value)}
                                title="status"
                                filterOpition="value"
                                sx={{ flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilterAtive('todos')
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{classDayList?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{classDayList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>aulas</Text>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                    <SelectList
                        fullWidth
                        data={classes}
                        valueSelection={filters?.classId}
                        onSelect={(value) => handleModule(value)}
                        title="Turma"
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={modules}
                        valueSelection={filters?.moduleSelected}
                        onSelect={(value) => setFilters({ ...filters, moduleSelected: value })}
                        title="Módulo"
                        filterOpition="value"
                        sx={{ flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <Button secondary text="Buscar" small style={{ width: '120px', height: '30px' }} onClick={() => {
                        handleFindClasses()
                    }} />
                </Box>

                {(showClasses && isFind) ?
                    listGradesByDisciplines?.length > 0 ?
                        (
                            <TableClasses
                                data={listGradesByDisciplines}
                                setListGradesByDisciplines={setListGradesByDisciplines}
                                showEditClassDay={showEditClassDay}
                                classDaySelected={classDaySelected}
                                setClassSelected={setClassSelected}
                            />
                        ) : (
                            <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                                <Text light>
                                    {'Não conseguimos encontrar Alunos e Disciplinas para o Módulo selecionado.'}</Text>
                            </Box>
                        )
                    : (filters?.classId && showClasses &&
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column', marginTop: 5 }}>
                            <CircularProgress />
                            <Text bold>Aguardando selecionar módulo..</Text>
                        </Box>
                    )
                }
            </ContentContainer>

            <Backdrop open={showEditClassDay} sx={{ zIndex: 999, width: '100%' }}>
                <ContentContainer style={{ padding: '20px 30px', minWidth: 400 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Editar Aula</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowEditClassDay(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 2, marginTop: 2, }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', width: 400 }}>
                            <Box sx={{
                                display: 'flex', padding: '8px 12px', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: new Date(classDaySelected?.dt_aula) > new Date() ? 'red' : 'green'
                            }}>
                                <Text style={{ color: '#fff' }}>
                                    {new Date(classDaySelected?.dt_aula) > new Date() ? 'Aula Futura' : 'Assistida'}
                                </Text>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Text bold>Data da aula: </Text>
                                <Text>{classDaySelected?.dia_semana} - {formatTimeStamp(classDaySelected?.dt_aula)}</Text>
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                <Text bold>Professores: </Text>
                                <Text>{classDaySelected?.primeiro_professor}</Text>
                                <Text>{classDaySelected?.segundo_professor}</Text>
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                <Text bold>Resumo da Aula: </Text>
                                <TextInput disabled={!isPermissionEdit && true}
                                    placeholder='A aula de hoje, vai abordar...'
                                    name='resumo_aula'
                                    onChange={handleChange}
                                    value={classDaySelected?.resumo_aula || ''}
                                    // label='Metodologia'
                                    multiline
                                    maxRows={4}
                                    rows={3}
                                    sx={{ flex: 1, }}
                                />
                            </Box>
                            <Divider distance={0} />
                            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                                <Text bold>Link da Aula: </Text>
                                <TextInput disabled={!isPermissionEdit && true}
                                    placeholder='Link da reunião do Teams por exemplo.'
                                    onChange={handleChange}
                                    name='link_aula'
                                    value={classDaySelected?.link_aula || ''}
                                    sx={{ flex: 1, }}
                                />
                            </Box>
                            <Divider distance={2} />
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Button small text="Salvar" style={{ width: 120, height: 30 }} onClick={() => handleEditClassDay()} />
                                <Button secondary small text="Cancelar" style={{ width: 120, height: 30 }} onClick={() => setShowEditClassDay(false)} />
                            </Box>
                        </Box>
                    </Box>

                </ContentContainer>

            </Backdrop>

            <Box sx={{
                display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                position: 'fixed', right: 50, bottom: 50,
                padding: '6px 12px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor,
                transition: '.3s',
                cursor: 'pointer',
                '&:hover': {
                    opacity: .7,
                    transform: 'scale(1.03, 1.03)'
                }
            }} >
                <Box sx={{
                    ...styles.menuIcon,
                    width: 28, height: 28, aspectRatio: '1/1',
                    backgroundImage: `url('/icons/grade_icon.png')`,
                    transition: '.3s',
                }} />
                <Text large bold style={{ color: '#fff' }}>Processar notas</Text>
            </Box>
        </>
    )
}

const TableClasses = ({ data = [], setListGradesByDisciplines, showEditClassDay, setClassSelected, classDaySelected }) => {
    const { setLoading, colorPalette, theme } = useAppContext()


    const handleChangeGradesDisciplines = (disciplineId, userId, value) => {

        setListGradesByDisciplines((prevValues) =>
            prevValues?.map(item => {
                if (item?.usuario_id === userId) {
                    return {
                        ...item,
                        disciplinas: item?.disciplinas?.map(disc =>
                            disc?.id_disciplina === disciplineId ? { ...disc, nt_final: value } : disc)
                    }
                }
                return item
            }))
    }

    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0, boxShadow: 'none', borderRadius: 1.5 }}>

            <div style={{ overflow: 'auto', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', border: `1px solid ${theme ? '#eaeaea' : '#404040'}`, borderRadius: 2 }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                            <th style={{ padding: '8px 10px' }}><Text small bold>Aluno</Text></th>
                            <th style={{ padding: '8px 10px' }}><Text small bold>Dt Matrícula</Text></th>
                            <th style={{ padding: '8px 10px', borderRight: `2px solid ${theme ? '#eaeaea' : '#404040'}` }}><Text small bold>Status da Matrícula</Text></th>
                            {data?.length > 0 && data[0]?.disciplinas?.map((disciplina, index) => (
                                <th key={index} style={{ padding: '8px', maxWidth: 120 }}>
                                    <Text small bold >{disciplina?.nome_disciplina}</Text>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, padding: 5, backgroundColor: colorPalette.primary }}>
                        {
                            data?.map((item, index) => {
                                return (
                                    <tr key={`${item}-${index}`}>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{(item?.nome) || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_matricula) || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center', borderRight: `2px solid ${theme ? '#eaeaea' : '#404040'}` }}>
                                            <Text style={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                maxWidth: '180px',
                                            }}>{item?.status || '-'}</Text>
                                        </td>
                                        {item?.disciplinas?.map((disc, index) => {
                                            return (
                                                <td key={index} style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                    <TextInput
                                                        name='nt_final'
                                                        value={disc?.nt_final || ''}
                                                        sx={{ width: '60px' }}
                                                        onChange={(e) => handleChangeGradesDisciplines(disc?.id_disciplina, item?.usuario_id, e.target.value)}
                                                    // onChange={(e) => handleChange(item.usuario_id, 'nt_exame', e.target.value)}
                                                    />
                                                </td>
                                            )
                                        })}
                                    </tr>
                                );
                            })

                        }
                    </tbody>
                </table>
            </div>
        </ContentContainer>
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
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 15,
        height: 15,
    },
}
