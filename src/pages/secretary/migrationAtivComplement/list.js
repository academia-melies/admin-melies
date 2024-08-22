import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms";
import { CheckBoxComponent, ConfirmModal, PaginationTable, SectionHeader, SelectList } from "../../../organisms";
import { api } from "../../../api/api";
import { useAppContext } from "../../../context/AppContext";
import { checkUserPermissions } from "../../../validators/checkPermissionUser";

export default function ListActivityComplement() {
    const [filters, setFilters] = useState({
        status: 'todos',
        startDate: '',
        endDate: '',
        centro_custo: '',
        tipo: '',
        search: ''
    });
    const [filterData, setFilterData] = useState('');
    const [classesSelected, setClassesSelected] = useState(null);
    const [data, setData] = useState([]);
    const [isPermissionEdit, setIsPermissionEdit] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [classes, setClasses] = useState([]);

    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();
    const { setLoading, colorPalette, alert, setShowConfirmationDialog, userPermissions, menuItemsList, user } = useAppContext();

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList);
            setIsPermissionEdit(actions);
        } catch (error) {
            console.log(error);
            return error;
        }
    };

    useEffect(() => {
        fetchPermissions();
        getComplementarActivity();
    }, [page, limit]);

    async function getComplementarActivity() {
        try {
            const response = await api.get(`/enrollment/list/students/complementary-activity?page=${page}&limit=${limit}`);
            const { data, totalPages } = response.data;
            setData(data);

            const groupClasses = Array.from(
                new Set(data.map(classes => classes.turma_id))
            ).map(turma_id => {
                const turma = data.find(classes => classes.turma_id === turma_id);
                return {
                    label: turma.nome_turma,
                    value: turma.turma_id
                };
            });
            setClasses(groupClasses);
            setTotalPages(totalPages);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    const sortUsers = () => {
        const { filterName, filterOrder } = filters;
        const filteredUsers = data.filter((user) => {
            const matchNameOrId = user.nome.toLowerCase().includes(filterData.toLowerCase()) || String(user.id).includes(filterData);
            const matchClass = !classesSelected || user.turma_id === classesSelected;

            return matchNameOrId && matchClass;
        });
        const sortedUsers = filteredUsers.sort((a, b) => {
            const valueA = filterName === 'id' ? Number(a[filterName]) : (a[filterName] || '').toLowerCase();
            const valueB = filterName === 'id' ? Number(b[filterName]) : (b[filterName] || '').toLowerCase();

            if (filterName === 'id') {
                return filterOrder === 'asc' ? valueA - valueB : valueB - valueA;
            }

            return filterOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });

        return sortedUsers;
    };

    const handleChangeActivityData = (usuarioId, field, value) => {
        setData(data =>
            data.map(aluno =>
                aluno.usuario_id === usuarioId.usuario_id
                    ? { ...aluno, carga_hr_total: value }
                    : aluno
            )
        );
    };

    const handlerSend = async (item) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        const activityPayload = {
            nome: item.nome,
            turma: item.nome_turma,
            curso: item.nome_curso,
            modulo_semestre: item.modulo,
            turma_id: item.turma_id,
            usuario_id: item.usuario_id,
            titulo: 'Migração portal antigo para novo',
            carga_hr: item.carga_hr_total,
            aprovado: 1,
            dt_atividade: formattedDate,
        };

        try {
            const response = await api.post(`/enrollment/list/students/complementary-activity/create`, { activityData: activityPayload });

            if (response?.status === 201) {
                alert.success('Atividade inserida com sucesso.');
                setData(data =>
                    data.map(aluno =>
                        aluno.usuario_id === item.usuario_id
                            ? { ...aluno, carga_hr_total: '' }
                            : aluno
                    )
                );
            }
        } catch (error) {
            console.log(error);
            return error;
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setLoading(true);
        setPage(newPage);
        getComplementarActivity();
    };

    return (
        <>
            <SectionHeader title="Migração de Atividades Complementares" />
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    gap: 2,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}
            >
            </Box>
            <Box sx={{ display: 'flex', gap: 1, width: '50%' }}>
                <TextInput
                    fullWidth
                    placeholder="Buscar pelo nome ou pelo ID.."
                    name='filterData'
                    type="search"
                    onChange={(event) => setFilterData(event.target.value)}
                    value={filterData}
                    InputProps={{ style: { backgroundColor: colorPalette?.secondary } }}
                />
                <SelectList
                    fullWidth
                    data={classes}
                    valueSelection={classesSelected}
                    onSelect={(value) => setClassesSelected(value)}
                    title="Turma"
                    filterOpition="value"
                    style={{ backgroundColor: colorPalette?.secondary }}
                    clean={false}
                />
                <Box sx={{ ...styles.filterButton, backgroundColor: colorPalette?.secondary, gap: .5 }} onClick={() => {
                    setFilterData('')
                    setClassesSelected(null)
                }}>
                    <Box sx={{ ...styles.iconFilter, backgroundImage: `url(/icons/clear-filter.png)` }} />
                    <Text light bold={(classesSelected || filterData)} style={{ color: (classesSelected || filterData) > 0 && colorPalette?.buttonColor }}>Limpar</Text>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    overflow: 'auto',
                    padding: '15px 10px',
                    backgroundColor: colorPalette?.secondary,
                    flexDirection: 'column'
                }}
            >
                <div
                    style={{
                        borderRadius: '8px',
                        flexWrap: 'nowrap',
                        width: '100%',
                    }}
                >
                    {data?.length > 0 ? (
                        <table
                            style={{
                                borderCollapse: 'collapse',
                                width: '100%',
                                overflow: 'auto',
                                border: `1px solid ${colorPalette.primary}`,
                            }}
                        >
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Nome</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Turma</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Curso</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Módulo </Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>carga_hr_total</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Ação</Text></th>
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1 }}>
                                {sortUsers()?.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text>{item.nome}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text>{item.nome_turma}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text> {item.nome_curso}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text>{item.modulo}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <TextInput
                                                disabled={!isPermissionEdit && true}
                                                name='carga_hr_total'
                                                value={item.carga_hr_total}
                                                onChange={(e) => handleChangeActivityData(item, e.target.name, e.target.value)}
                                                InputProps={{
                                                    style: {
                                                        fontSize: '11px',
                                                        height: 30,
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'center',
                                                padding: '5px',
                                                borderBottom: `1px solid ${colorPalette.primary}`,
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Button text="Inserir" style={{ borderRadius: 2, height: '100%', width: 110 }} onClick={() => handlerSend(item)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                marginTop: 4,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text large light>Não foi possível encontrar Despesas para o período selecionado.</Text>
                            <Box
                                sx={{
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    width: 350,
                                    height: 250,
                                    backgroundImage: `url('/background/no_results.png')`,
                                }}
                            />
                        </Box>
                    )}
                </div>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                    <Button
                        text="Anterior"
                        onClick={() => page > 1 && handlePageChange(page - 1)}
                        disabled={page === 1}
                    />
                    <Text sx={{ margin: '0 1rem' }}>Pagina {page} de {totalPages}</Text>
                    <Button
                        text="Proximo"
                        onClick={() => page < totalPages && handlePageChange(page + 1)}
                        disabled={page === totalPages}
                    />
                </Box>
            </Box>
        </>
    );
}

const styles = {
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
    iconFilter: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ascpectRatio: '1/1',
        width: 16,
        height: 16,
        backgroundImage: `url(/icons/filter.png)`,
    },
}