import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Box, Button, ButtonIcon, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { PaginationTable, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { getUsersPerfil } from "../../../validators/api-requests"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { api } from "../../../api/api"
import { icons } from "../../../organisms/layout/Colors"

export default function ListUsers(props) {
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('todos')
    const { setLoading, colorPalette, menuItemsList, userPermissions } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterEnrollStatus, setFilterEnrollStatus] = useState('todos')
    const [firstRender, setFirstRender] = useState(true)
    const [filters, setFilters] = useState({
        filterName: 'nome',
        filterOrder: 'asc'
    })
    const [filtersField, setFiltersField] = useState({
        enrollmentSituation: 'todos',
        status: 1,
        userPerfil: 'todos',
    })
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showFieldsFilter, setShowFieldsFilter] = useState(false)
    const [fieldersSelected, setFieldersSelected] = useState([]);

    const userFilterFunctions = {
        ativo: (item) => filtersField?.status === 'todos' || item.ativo === filtersField?.status,
        enrollmentSituation: (item) => filtersField?.enrollmentSituation === 'todos' || item?.total_matriculas_em_andamento === filtersField?.enrollmentSituation,
        perfilUser: (item) => filtersField?.userPerfil === 'todos' || item?.perfil?.includes(filtersField?.userPerfil),
    };
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const containerRef = useRef()
    const handleFieldClick = (fieldValue) => {
        setFieldersSelected((prevSelected) => {
            // Verifica se o filtro já está selecionado
            const isSelected = prevSelected.includes(fieldValue);
            if (isSelected) {
                // Remove o filtro se já estiver selecionado
                return prevSelected.filter(item => item !== fieldValue);
            } else {
                // Adiciona o filtro se não estiver selecionado
                return [...prevSelected, fieldValue];
            }
        });
    };

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);
        const normalizedUserId = item?.id?.toString();

        return (
            Object.values(userFilterFunctions).every(userFilterFunction => userFilterFunction(item)) &&
            (
                normalizeString(item?.nome)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) ||
                normalizeString(item?.nome_social)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) ||
                // normalizeString(item?.cpf)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) ||
                normalizedUserId?.includes(filterData.toString())

            )
        );
    };



    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]

    useEffect(() => {
        getUsers();
        fetchPermissions()
        if (window.localStorage.getItem('list-users-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-users-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, []);

    const getUsers = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/users`)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!showFieldsFilter) {

            const handleClickOutside = (event) => {
                if (containerRef.current && !containerRef.current.contains(event.target)) {
                    setShowFieldsFilter(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, []);


    useEffect(() => {
        setShowFilterMobile(false)
    }, [filtersField])

    useEffect(() => {
        if (firstRender) return setFirstRender(false);
        window.localStorage.setItem('list-users-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));
    }, [filters])


    const sortUsers = () => {
        const { filterName, filterOrder } = filters;

        const sortedUsers = [...usersList].sort((a, b) => {
            const valueA = filterName === 'id' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedUsers;
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const column = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location', matricula: true },
        { key: 'nome_social', label: 'Nome Social' },
        { key: 'email', label: 'E-mail' },
        { key: 'email_melies', label: 'E-mail Méliès' },
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]

    const listEnrollStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Matriculado', value: 1 },
    ]

    const listUser = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Funcionário', value: 'funcionario' },
        { label: 'Interessado', value: 'interessado' },
    ]

    const fields = [
        { label: 'Nome ou Nome Social', value: 'name' },
        { label: 'Tipo de Usuário', value: 'tipo_usuario' },
        { label: 'Status', value: 'status' },
        { label: 'Situação Matrícula', value: 'situacao_matricula' }
    ]

    return (
        <>
            <SectionHeader
                title={`${perfil === 'todos' ? 'Usuários' : (perfil.charAt(0).toUpperCase() + perfil.slice(1))} (${usersList.filter(filter)?.length})`}
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', position: 'relative', width: '70%', gap: 2 }}>
                    <Box sx={{ ...styles.filterButton, backgroundColor: colorPalette?.secondary }}
                        onClick={() => setShowFieldsFilter(!showFieldsFilter)}>
                        <Text bold>Filtros</Text>
                        <Box sx={styles.iconFilter} />
                    </Box>

                    {showFieldsFilter &&
                            <div ref={containerRef}>
                                <Box sx={{ ...styles.containerFilter, backgroundColor: colorPalette?.secondary }}>
                                    {fields?.map((item, index) => {
                                        const isSelected = fieldersSelected.find(f => f.includes(item?.value))
                                        return (
                                            <Box key={index} sx={{
                                                display: 'flex', gap: 1, alignItems: 'center', transition: '.3s',
                                                color: isSelected && colorPalette?.buttonColor,
                                                '&:hover': {
                                                    color: colorPalette?.buttonColor,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => {
                                                if (isSelected) {
                                                    handleFieldClick(item?.value)
                                                } else {
                                                    handleFieldClick(item?.value)
                                                }
                                            }}>
                                                <Box sx={{ ...styles.iconFilter, backgroundImage: `url(/icons/${isSelected ? 'remove_icon' : 'add_icon'}.png)` }} />
                                                <Text style={{ color: 'inherit' }}>{item?.label}</Text>
                                            </Box>
                                        )
                                    })}
                                </Box>
                            </div>
                    }

                    <Box sx={{ display: fieldersSelected?.length > 0 ? 'flex' : 'none', gap: 1 }}>
                        {fieldersSelected.map((field, index) => (
                            <Box key={index}>
                                {/* <Text bold>{fields.find(f => f.value === field)?.label}:</Text> */}
                                {field === 'name' &&
                                    <TextInput placeholder="Buscar pelo nome ou pelo ID.."
                                        name='filterData'
                                        type="search"
                                        onChange={(event) => setFilterData(event.target.value)} value={filterData}
                                        InputProps={{ style: { backgroundColor: colorPalette?.secondary } }}
                                    />
                                }
                                {field === 'tipo_usuario' &&
                                    <SelectList
                                        data={listUser}
                                        valueSelection={filtersField?.userPerfil}
                                        onSelect={(value) => setFiltersField({ ...filtersField, userPerfil: value })}
                                        title="usuário"
                                        filterOpition="value"
                                        style={{ backgroundColor: colorPalette?.secondary }}
                                        clean={false}
                                    />
                                }
                                {field === 'status' &&
                                    <SelectList
                                        data={listAtivo}
                                        valueSelection={filtersField?.status}
                                        onSelect={(value) => setFiltersField({ ...filtersField, status: value })}
                                        title="status"
                                        filterOpition="value"
                                        style={{ backgroundColor: colorPalette?.secondary }}
                                        clean={false}
                                    />
                                }
                                {field === 'situacao_matricula' &&
                                    <SelectList
                                        data={listEnrollStatus}
                                        valueSelection={filtersField?.enrollmentSituation}
                                        onSelect={(value) => setFiltersField({ ...filtersField, enrollmentSituation: value })}
                                        title="situação/matrícula"
                                        filterOpition="value"
                                        style={{ backgroundColor: colorPalette?.secondary }}
                                        clean={false}
                                    />
                                }
                            </Box>
                        ))}
                    </Box>

                </Box>
                {isPermissionEdit && <ButtonIcon text="Novo Usuário" icon={'/icons/add-friend.png'} color="#fff" onClick={() => router.push(`/administrative/${pathname}/new`)} />}
            </Box>



            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar pelo nome ou pelo ID.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{
                    flex: 1,
                }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={sortUsers()?.filter(filter)?.length}
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
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                                <SelectList
                                    data={listUser}
                                    valueSelection={filtersField?.userPerfil}
                                    onSelect={(value) => setFiltersField({ ...filtersField, userPerfil: value })}
                                    title="usuário"
                                    filterOpition="value"
                                    sx={{ flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                    clean={false}
                                />

                                <SelectList
                                    data={listAtivo}
                                    valueSelection={filtersField?.status}
                                    onSelect={(value) => setFiltersField({ ...filtersField, status: value })}
                                    title="status"
                                    filterOpition="value"
                                    sx={{ flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                    clean={false}
                                />
                            </Box>

                            <SelectList
                                data={listEnrollStatus}
                                valueSelection={filtersField?.enrollmentSituation}
                                onSelect={(value) => setFiltersField({ ...filtersField, enrollmentSituation: value })}
                                title="situação/matrícula"
                                filterOpition="value"
                                sx={{ width: '100%' }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setPerfil('todos')
                                setFilterAtive('todos')
                                setFilterEnrollStatus('todos')
                                setFiltersField({
                                    enrollmentSituation: 'todos',
                                    status: 'todos',
                                    userPerfil: 'todos'
                                })
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {
                usersList?.filter(filter)?.length > 0 ?
                    <Box>
                        <Table_V1 data={sortUsers()?.filter(filter)} columns={column} columnId={'id'} enrollmentsCount={true} filters={filters} onPress={(value) => setFilters(value)} onFilter />
                    </Box>
                    :
                    <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                        <Text bold>Não foi encontrado usuarios {perfil}</Text>
                    </Box>
            }
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
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 15,
        height: 15,
    },
    iconFilter: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ascpectRatio: '1/1',
        width: 16,
        height: 16,
        backgroundImage: `url(/icons/filter.png)`,
    },
    filterButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 15px',
        borderRadius: 2,
        border: '1px solid lightgray',
        transition: '.3s',
        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        }
    },
    containerFiltered: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 15px',
        borderRadius: 2,
        border: '1px solid lightgray',
    },
    containerFilter: {
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
        padding: '12px 20px',
        border: `1px solid lightgray`,
        position: 'absolute', top: 45, left: 0,
        zIndex: 9999
    }
}
