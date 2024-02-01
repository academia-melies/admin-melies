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
    const [disciplines, setDisciplines] = useState([])
    const [showClasses, setShowClasses] = useState(false)
    const [classDaySelected, setClassSelected] = useState({})
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        classId: '',
        disciplineId: '',
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

    // useEffect(() => {
    //     if (firstRender) return setFirstRender(false);
    //     window.localStorage.setItem('list-classes-frequency-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    // }, [filters])

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
        if (!disciplineId) {
            alert.error('Selecione uma Disciplina')
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
            const { classId, disciplineId, moduleSelected } = filters
            try {
                const response = await api.get(`/classDay/discipline/${classId}/${disciplineId}/${moduleSelected}`)
                const { data = [] } = response;
                setIsFind(true)
                setClassDay(data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
    }


    const handleModule = async (turmaId) => {

        setFilters({ ...filters, classId: turmaId, moduleSelected: '', disciplineId: '' })
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


    async function handleDisciplines(modulo_selected) {
        setLoading(true)
        setFilters({ ...filters, moduleSelected: modulo_selected })
        try {
            const response = await api.get(`/classSchedule/disciplines/${filters?.classId}/${modulo_selected}`)
            const { data } = response
            const groupDisciplines = data.map(disciplines => ({
                label: disciplines?.nome_disciplina,
                value: disciplines?.id_disciplina
            }));

            setDisciplines(groupDisciplines);
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
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
                title={`Diário de Aula (${classDayList?.length || '0'})`}
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
                        onSelect={(value) => handleDisciplines(value)}
                        title="Módulo"
                        filterOpition="value"
                        sx={{ flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <SelectList
                        fullWidth
                        data={disciplines}
                        valueSelection={filters?.disciplineId}
                        onSelect={(value) => setFilters({ ...filters, disciplineId: value })}
                        title="Disciplina"
                        filterOpition="value"
                        sx={{ flex: 1 }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                        clean={false}
                    />
                    <Button secondary text="Buscar" small style={{ width: '120px', height: '30px' }} onClick={() => {
                        handleFindClasses()
                    }} />
                </Box>
                {/* <TextInput placeholder="Buscar turma.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} /> */}
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <TablePagination
                        component="div"
                        count={classDayList?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Items por página"
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />
                </Box>
                {(filters?.disciplineId && showClasses && isFind) ?
                    classDayList?.length > 0 ?
                        (
                            // <Table_V1 data={sortClasses()?.filter(filter).slice(startIndex, endIndex)} columns={column} columnId={'id_turma'} query={id ? `=day` : ''} filters={filters} onPress={(value) => setFilters(value)} onFilter />
                            <TableClasses
                                data={classDayList?.slice(startIndex, endIndex)}
                                setShowEditClassDay={setShowEditClassDay}
                                showEditClassDay={showEditClassDay}
                                classDaySelected={classDaySelected}
                                setClassSelected={setClassSelected}
                            />
                        ) : (
                            <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                                <Text light>
                                    {'Não conseguimos encontrar aulas cadastradas da Disciplina Selecionada para esse Módulo.'}</Text>
                            </Box>
                        )
                    : (filters?.classId && showClasses &&
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexDirection: 'column', marginTop: 5 }}>
                            <CircularProgress />
                            <Text bold>Aguardando selecionar disciplina..</Text>
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
        </>
    )
}

const TableClasses = ({ data = [], setShowEditClassDay, showEditClassDay, setClassSelected, classDaySelected }) => {
    const { setLoading, colorPalette, userPermissions, menuItemsList, user } = useAppContext()

    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0, boxShadow: 'none', borderRadius: 2 }}>

            <div style={{ overflow: 'auto', width: '100%' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr style={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                            <th style={{ padding: '16px' }}><Text bold>Data</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Dia</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Resumo</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>link da aula</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>1 Professor</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>2 Professor</Text></th>
                            <th style={{ padding: '16px' }}><Text bold>Status da aula</Text></th>
                            <th style={{ padding: '8px' }}><Text bold></Text></th>
                            {/* <th style={{ padding: '8px' }}><Text bold></Text></th> */}
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, padding: 5, backgroundColor: colorPalette.primary }}>
                        {
                            data?.map((item, index) => {
                                return (
                                    <tr key={`${item}-${index}`}>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_aula) || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{(item?.dia_semana) || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text style={{
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                maxWidth: '180px',
                                            }}>{item?.resumo_aula || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '10px 10px', textAlign: 'center', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                                            {item?.link_aula ?
                                                <Link href={item?.link_aula} target="_blank">
                                                    <Button small text="link" style={{ width: 60, height: 20, borderRadius: 2 }} />
                                                </Link>
                                                : <Text>{'-'}</Text>}
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.primeiro_professor || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text> {item?.segundo_professor || '-'}</Text>
                                        </td>
                                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Box sx={{
                                                display: 'flex', padding: '6px 5px', borderRadius: 2, opacity: 0.8, alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: new Date(item?.dt_aula) > new Date() ? 'red' : 'green'
                                            }}>
                                                <Text small style={{ color: '#fff' }}>
                                                    {new Date(item?.dt_aula) > new Date() ? 'Aula Futura' : 'Assistida'}
                                                </Text>
                                            </Box>
                                        </td>
                                        <td style={{ padding: '8px 8px', }}>
                                            <Button small text="Editar" style={{ padding: '6px 5px', borderRadius: 2 }} onClick={() => {
                                                setClassSelected(item)
                                                setShowEditClassDay(true)
                                            }
                                            } />
                                        </td>
                                        {/* <td style={{ padding: '8px 0px', }}>
                                            <Button secondary small text="chamada" style={{ width: 80, height: 21, borderRadius: 2 }} />
                                        </td> */}
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
