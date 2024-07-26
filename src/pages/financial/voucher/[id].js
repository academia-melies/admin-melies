import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader, Table_V1, PaginationTable } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors"
import { formatTimeStamp } from "../../../helpers"
import { IconStatus } from "../../../organisms/Table/table"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Irish_Grover } from "next/font/google"
import DeleteIcon from '@mui/icons-material/Delete';


export default function VoucherEdit(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList, theme } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newCupom = id === 'new';
    const [firstRender, setFirstRender] = useState(true)
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('todos')
    const [alunoSelected, setalunoSelected] = useState([])  
    const [coupom, setCoupomData] = useState({
        nome_cupom: "",
        descricao: '',
        valor: 0,
        status: false
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: ''
    })
    const [filtersField, setFiltersField] = useState({
        enrollmentSituation: 'todos',
        status: 1,
        userPerfil: 'todos',
    })
    const [showAlunos, setShowSearchAlunos] = useState(false)
    const [cupomList, setCupomList] = useState([])
    const [enrollment, setEnrollment] = useState({ open: false, class: [], })
    const [alunoCupom, setAlunoCupom] = useState([])
    const [selectedAlunoId, setSelectedAlunoId] = useState(null);
    const userFilterFunctions = {
        ativo: (item) => filtersField?.status === 'todos' || item.ativo === filtersField?.status,
        enrollmentSituation: (item) => filtersField?.enrollmentSituation === 'todos' || item?.total_matriculas_em_andamento === filtersField?.enrollmentSituation,
        perfilUser: (item) => item?.perfil?.includes('aluno'),

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

    useEffect(() => {
        fetchPermissions()
        if (window.localStorage.getItem('list-users-filters')) {
            const meliesLocalStorage = JSON.parse(window.localStorage.getItem('list-users-filters') || null);
            setFilters({
                filterName: meliesLocalStorage?.filterName,
                filterOrder: meliesLocalStorage?.filterOrder
            })
        }
    }, [])

    useEffect(() => {
        (async () => {
            if (newCupom) {
                return
            }
            await handleItems();
            if (firstRender) return setFirstRender(false);
            window.localStorage.setItem('list-users-filters', JSON.stringify({ filterName: filters.filterName, filterOrder: filters.filterOrder }));

        })();
    }, [id])
    const getUsers = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/users/perfil?perfil=aluno`)
            const { data = [] } = response;
            setUsers(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    const getEnrollment = async (id_user) => {
        setLoading(true)
        try {
            const response = await api.get(`/enrollment/${id_user}`)
            const { data = [] } = response;
            //const [enrollment, setEntollment] = useState({open: false, class: null, module: [1,2,3,4]}) 
            const classe = data.map((item) => ({
                label: item.nome_turma + '_' + item.modulo,
                value: item.turma_id + ',' + item.modulo
            }));
            setEnrollment((prevEnrollment) => ({
                ...prevEnrollment,
                open: true,
                class: classe
            }));
            setShowSearchAlunos(false)

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    const getCupom = async () => {
        try {
            const response = await api.get(`/cupom/${id}`)
            const { data } = response
            setCoupomData(data)
            await getUsers()
        } catch (error) {
            console.log(error)
            return error
        }
    }
    const getCupomAluno = async () => {
        try {
            const response = await api.get(`/cupom/cupomAluno/${id}`)
            const { data } = response
            setCupomList(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const handleItems = async () => {
        setLoading(true)
        try {
            await getCupom()
            await getCupomAluno()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar o Cupom')
        } finally {
            setLoading(false)
        }
    }
    const handleChange = (event) => {

        setCoupomData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }
    const formatCurrency = (value) => {
        if (!value) return '';
        // Remove tudo que não for dígito
        const cleanValue = value.replace(/\D/g, '');
        // Converte para número
        const numberValue = Number(cleanValue) / 100;
        // Formata para moeda
        return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    const parseCurrency = (value) => {
        if (!value) return 0;

        // Garantir que o valor é uma string
        const stringValue = String(value).trim();

        // Remover 'R$' se presente
        let cleanValue = stringValue;

        if (cleanValue.includes('R$')) {
            cleanValue = cleanValue.replace('R$', '').trim();
        }

        if (cleanValue.includes(',')) {
            cleanValue = cleanValue.replace(',', '.');
        }

        return parseFloat(cleanValue);
    }

    const handleChangeValue = (e) => {
        const rawValue = e.target.value;
        setCoupomData((prevValues) => ({
            ...prevValues,
            [event.target.name]: formatCurrency(rawValue),
        }))

    };
    const handleCreate = async () => {
        try {
            setLoading(true)
            if (typeof coupom.porcetagem == undefined || typeof coupom.porcetagem == 'undefined') {
                alert.error('Campo porcetagem, inválido.');
                setLoading(false)
                return
            }
            if (typeof coupom.nome_cupom == undefined || coupom.nome_cupom == "") {
                alert.error('Campo nome, inválido.');
                setLoading(false)
                return
            }
            if (typeof coupom.valor == undefined || coupom.valor == "") {
                alert.error('Campo valor, inválido.');
                setLoading(false)
                return
            }
            if (typeof coupom.status == undefined) {
                alert.error('Campo status, inválido.');
                setLoading(false)
                return
            }

            if (!coupom.porcetagem) {
                const valor = coupom.valor; // Exemplo: 'R$ 1.234,56' ou '1234.56'
                const valorFloat = parseCurrency(valor);
                coupom.valor = valorFloat
            }

            const response = await api.post(`/cupom/create`, { coupom });
            const { data } = response

            if (response?.status === 201) {
                alert.success('Cupom cadastrado com sucesso.');
                router.push(`/financial/voucher/list`)
            }
        } catch (error) {
            alert.error('Tivemos um problema ao cadastrar o Cupom.');
            console.log(error)

        } finally {
            setLoading(false)
        }

    }
    const handleEdit = async () => {
        try {
            setLoading(true)

            if (typeof coupom.porcetagem == undefined || typeof coupom.porcetagem == 'undefined') {
                setLoading(false)
                return
            }
            if (typeof coupom.nome_cupom == undefined || coupom.nome_cupom == "") {
                alert.error('Campo nome, inválido.');
                setLoading(false)
                return
            }
            if (typeof coupom.valor == undefined || coupom.valor == "") {
                alert.error('Campo valor, inválido.');
                setLoading(false)
                return
            }
            if (typeof coupom.status == undefined) {
                alert.error('Campo status, inválido.');
                setLoading(false)
                return
            }
            if (!coupom.porcetagem) {
                coupom.valor = parseFloat(coupom.valor.replace(',', '.').replace('R$', '').trim())
            }


            const response = await api.post(`/cupom/update/${id}`, { coupom });
            const { data } = response
            if (response?.status === 201) {
                alert.success('Cupom editado com sucesso.');
                // router.push(`/financial/voucher/list`)
            }
        } catch (error) {
            alert.error('Tivemos um problema ao editar o Cupom.');
            console.log(error)

        } finally {
            setLoading(false)
        }

    }
   
    const handleDelete = async () => {
        try {

            const response = await api.delete(`/cupom/delete/${id}`);
            const { data } = response
            if (response?.status === 201) {
                alert.success('Cupom Apagado com sucesso');
                router.push(`/financial/voucher/list`)
            }
        } catch (error) {
            const { data } = error.response
            alert.error(`${data.msg}`);
            console.log(error)

        } finally {
            setLoading(false)
        }

    }
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
    const handleSelectedAluno = async (material) => {
        let searchMaterialSelected = alunoSelected?.filter(item => item.id === material?.id);
        if (searchMaterialSelected.length > 0) {
            alert.info('Aluno já adicionado ao cupom');
        } else {
            setalunoSelected((prevValues) => [
                ...prevValues,
                {
                    id_material: material?.id,
                    titulo: material?.nome,
                }
            ]);

            await getEnrollment(material?.id);
            setAlunoCupom((prevAlunoCupom) => [
                ...prevAlunoCupom,
                { id_cupom: id, id_aluno: material.id }
            ]);
            setSelectedAlunoId(material.id);
            alert.success('Aluno adicionado ao cupom');
        }
    };

    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]
    const listUser = [
        { label: 'Aluno', value: 'aluno' },
    ]


    const handleDeleteAluno = async (id) => {
       
        let newArray = await alunoSelected?.filter(item => item.id_material !== id)
        const updatedAlunoCupom = alunoCupom.filter(aluno => aluno.id_aluno !== id);
        setAlunoCupom(updatedAlunoCupom)
        setalunoSelected(newArray)
        alert.success('Aluno retirado da lista de Cupom.')
        return
    }

    const handleRowClick = async () => {
        if(alunoCupom.length == 0){
            alert.error("Selecione ao menos um aluno");
            return
        }
        // Filtrar alunos que possuem id_turma indefinido
        const alunosCompletos = alunoCupom.filter(aluno => typeof aluno.id_turma !== 'undefined');    
        // Usar um Set para armazenar IDs únicos
        const seenIds = new Set();
        const alunosUnicos = alunosCompletos.filter((item) => {
            if (seenIds.has(item.id_aluno)) {
                return false; 
            } else {
                seenIds.add(item.id_aluno);
                return true; 
            }
        });
        const alunosComModulo = alunosUnicos.map((item) => {
            let turmaModule = item.id_turma?.split(",");
            return {
                ...item,
                id_turma: parseInt(turmaModule[0]),
                modulo: parseInt(turmaModule[1]),
                id_usuario: parseInt(item.id_aluno)
            };
        });
        setAlunoCupom(alunosComModulo);
    
       
    
        setLoading(true);
        try {
            const response = await api.post(`/cupom/insertDesconto`, { alunoCupom: alunosComModulo });
            const { data } = response;
    
            if (response?.status === 200) {
                setAlunoCupom([]);
                setalunoSelected([]);
                alert.success('Cupom de desconto aplicado ao aluno');
                setTimeout(() => {
                    location.reload();
                }, 5000);
            }
        } catch (error) {
            const { data } = error.response;
    
            setAlunoCupom([]);
            setalunoSelected([]);
            console.log(error);
            alert.error(`${data.msg}`);
            setTimeout(() => {
                location.reload();
            }, 5000);
        } finally {
            setLoading(false);
        }
    };
    

    const updateAlunoCupom = (id_aluno, newInfo) => {
       
        setAlunoCupom((prevAlunoCupom) => {
            return prevAlunoCupom.map(aluno => {
                if (aluno.id_aluno === id_aluno) {
                    return { ...aluno, ...newInfo };
                }
                return aluno;
            });
        });
        setEnrollment({open: false});
    }

    return (
        <>
            <SectionHeader
                title={newCupom ? `Novo Cupom` : `Editar Cupom`}
                saveButton={newCupom && isPermissionEdit}
            >

            </SectionHeader>

            <Box sx={{ display: 'flex', gap: 3, width: '100%', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                    <ContentContainer style={{
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', gap: 1.8, padding: 5, width: '100%',
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold >Dados do Cupom  </Text>
                            <IconStatus
                                style={{ backgroundColor: coupom.status >= 1 ? 'green' : 'red', boxShadow: coupom.status >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                            />
                        </Box>
                        <Box sx={{ ...styles.inputSection, flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Nome do cupom' name='nome_cupom' onChange={handleChange} value={coupom?.nome_cupom || ''} label='Nome do cupom:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição' name='descricao' onChange={handleChange} value={coupom?.descricao || ''} label='Descricao:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder={coupom?.porcetagem ? `Porcetagem` : `Valor`} name='valor' onChange={coupom?.porcetagem ? handleChange : handleChangeValue} value={coupom?.valor || ''} label={coupom?.porcetagem ? `Porcetagem` : `Valor`} n sx={{ width: '100%', }} />
                        </Box>
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={coupom?.porcetagem} group={groupStatus} title="Porcetagem" horizontal={mobile ? false : true} onSelect={(value) => setCoupomData({ ...coupom, porcetagem: parseInt(value), valor: 0 })} />
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={coupom?.status} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setCoupomData({ ...coupom, status: parseInt(value) })} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button text="Salvar " style={{ borderRadius: 2 }} onClick={() => { if (newCupom) { handleCreate() } else { handleEdit() } }} />
                            {!newCupom &&
                                <Button cancel text="Excluir Cupom" style={{ borderRadius: 2 }} onClick={
                                    (event) => setShowConfirmationDialog({
                                        active: true,
                                        event,
                                        acceptAction: handleDelete,
                                        title: 'Deseja excluír O Cupom?',
                                        message: 'O Cupom será excluída do sistema, sem chance de recuperação.'
                                    })} />
                            }
                        </Box>
                    </ContentContainer>
                  
                </Box>
            </Box>
           {!newCupom &&  
            <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, }}>
                <Box>
                    <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Adicionar Aluno</Text>
                </Box>
                <Divider distance={0} />
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Text bold>Selecionar Aluno: </Text>
                    <Button disabled={!isPermissionEdit && true} small text="pesquisar" style={{ height: 22, }} onClick={() => setShowSearchAlunos(true)} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: .5 }}>
                    <Text small>Selecionados:</Text>
                    {alunoSelected?.map((item, index) => {
                        let turma = alunoCupom.filter((aluno) => aluno.id_aluno == item.id_material)[0]                   
                        return (
                            <Box key={index} sx={{ display: 'flex', gap: 1, maxWidth: 300, backgroundColor: colorPalette.primary, padding: '5px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between' }} >
                                <Text small>{item?.titulo} <br/>Turma: {turma?.nome_turma?.split("_")[0]} <br/>Modulo: {turma?.nome_turma?.split("_")[1]}</Text>                             
                                {isPermissionEdit && <Box sx={{
                                    ...styles.menuIcon,
                                    width: 12,
                                    height: 12,
                                    aspectRatio: '1:1',
                                    backgroundImage: `url(${icons.gray_close})`,
                                    transition: '.3s',
                                    zIndex: 999,
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => handleDeleteAluno(item?.id_material)} />}

                            </Box>

                        )
                    })}
                  
                </Box>
                <Divider distance={0} />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button disabled={!isPermissionEdit && true} small text="Adicionar" style={{ height: 30 }} onClick={() => handleRowClick()} />
                    <Button disabled={!isPermissionEdit && true} small secondary text="limpar" style={{ height: 30 }} onClick={() => {
                        setalunoSelected([])
                        setAlunoCupom([])
                        alert.success('Lista de alunos límpa.')
                    }} />
                </Box>

            </ContentContainer>
            }
            <Backdrop open={enrollment.open} sx={{ zIndex: 999 }}>
                <ContentContainer>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                    <Text bold large>Selecione a turma e o modulo</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_close})`,
                        transition: '.3s',
                        zIndex: 99999,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => setEnrollment({ ...enrollment, open: false })} />
                </Box>
                 
                    {enrollment.class?.length > 0 ?

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: 2, alignItems: 'center', justifyContent: 'center', height: 100, width: 300, overflow: 'auto', }}>
                            <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                                <SelectList
                                    data={enrollment.class}
                                    valueSelection={alunoCupom.find(aluno => aluno.id_aluno === selectedAlunoId)?.id_turma || ''}
                                    onSelect={(value,label) => updateAlunoCupom(selectedAlunoId, { id_turma: value, nome_turma: label })}
                                    title="Turma/Modulo"
                                    filterOpition="value"
                                    sx={{ flex: 1 }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                    clean={false}
                                />                               
                            </Box>

                        </Box>
                        : <Text ligth style={{ textAlign: 'center' }}>Sem resultado</Text>}
                </ContentContainer>
            </Backdrop>
            <Backdrop open={showAlunos} sx={{ zIndex: 999 }}>
                <ContentContainer sx={{ zIndex: 9999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Selecione o Aluno</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 99999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowSearchAlunos(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>

                        <TextInput placeholder="Buscar pelo nome ou pelo ID.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
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
                    </Box>
                    {usersList?.filter(filter).length > 0 ?
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', marginTop: 2, alignItems: 'center', justifyContent: 'center', maxHeight: 500, maxWidth: 1024, overflow: 'auto' }}>
                            {usersList?.filter(filter)?.map((item, index) => {
                                const selected = alunoSelected?.filter(mat => mat.id === item?.id)
                                return (
                                    <Box key={index} sx={{
                                        display: 'flex',
                                        backgroundColor: colorPalette.primary,
                                        padding: '8px 5px',
                                        alignItems: 'center',
                                        width: '100%',
                                        justifyContent: 'center',
                                        gap: 2,
                                        cursor: 'pointer',
                                        transition: '.5s',
                                        "&:hover": {
                                            // opacity: 0.7,
                                            cursor: 'pointer',
                                            backgroundColor: colorPalette.primary + '22'
                                        }
                                    }} onClick={() =>
                                        handleSelectedAluno(item)
                                    }>
                                        {selected?.length > 0 && <CheckCircleIcon style={{ color: 'green', fontSize: 15 }} />}
                                        <Text bold small>{item?.nome}</Text>
                                    </Box>
                                )
                            })}
                        </Box>
                        : <Text ligth style={{ textAlign: 'center' }}>Sem resultado</Text>}
                </ContentContainer>
            </Backdrop>
              {!newCupom &&  
              
                cupomList?.length > 0 ?
                <Box>
                    <TableCupom data={cupomList} handleItems={handleItems}  />
                </Box>
                    :
                  
                    <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                        <Text bold>Não foi encontrado usuarios {perfil}</Text>
                    </Box>
            }

        </>
    )
}
const TableCupom = ({ data = [], filters = [], onPress = () => { },handleItems }) => {

    const router = useRouter()
    const { setLoading, colorPalette, theme, user, alert } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { id } = router.query;
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;


console.log('aqui',data)

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location', matricula: true },
        { key: 'nome_social', label: 'Nome Social' },
        { key: 'email', label: 'E-mail' },
        { key: 'dt_aplicacao', label: 'Aplicado em' },
        { key: 'dt_ultilizacao', label: 'Utilizado em' },
        { key: 'remover cupom', label: 'Remover cupom' },
    ];



   

    const removerAlunoCupom = async (dataCupom) => {
        try {
            const response = await api.post(`/cupom/removeCupomAluno`, { dataCupom });
            const { data } = response
            if (response?.status === 201) {
                await handleItems()
                alert.success('Aluno removido do cupom.');
            }
        } catch (error) {
            alert.error('Tivemos um problema ao remover o Cupom.');
            console.log(error)

        } finally {
            setLoading(false)
        }

    }

    return (
        <ContentContainer sx={{
            display: 'flex', width: '100%', padding: 0, boxShadow: 'none', borderRadius: 2,
            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
        }}>

            <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                <Table sx={{ borderCollapse: 'collapse', width: '100%' }}>
                    <TableHead>
                        <TableRow sx={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                            {columns.map((column, index) => (
                                <TableCell key={index} sx={{ padding: '16px', }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text bold style={{ textAlign: 'center' }}>{column.label}</Text>
                                        {/* <Box sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                            transform: filters?.filterName === column.key ? filters?.filterOrder === 'asc' ? 'rotate(-0deg)' : 'rotate(-180deg)' : 'rotate(-0deg)',
                                            transition: '.3s',
                                            width: 17,
                                            height: 17,

                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            },
                                        }}
                                            onClick={() => onPress({
                                                filterName: column.key,
                                                filterOrder: filters?.filterOrder === 'asc' ? 'desc' : 'asc'
                                            })} /> */}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ flex: 1, padding: 5, backgroundColor: colorPalette.secondary }}>
                        {
                            data?.slice(startIndex, endIndex)?.map((item, index) => {
                                return (
                                    <TableRow key={`${item}-${index}`}  sx={{
                                        "&:hover": {
                                            cursor: 'pointer',
                                            backgroundColor: colorPalette.primary + '88'
                                        },
                                    }}>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.id || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{
                                            padding: '8px 10px', textAlign: 'center',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            maxWidth: '160px',
                                        }}>
                                            <Text>{item?.nome || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    width: 14,
                                                    height: 14,
                                                    aspectRatio: '1/1',
                                                    backgroundImage: `url('/icons/arrow_up_green_icon.png')`,
                                                    transition: '.3s',
                                                }} />
                                                <Text>{item?.nome_social || '-'}</Text>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{item?.email || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{formatTimeStamp(item?.dt_aplicacao) || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{formatTimeStamp(item?.dt_ultilizacao) || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{padding: '15px 10px', textAlign: 'center' }}>
                                             <DeleteIcon onClick={() => removerAlunoCupom(item)}  /> 
                                        </TableCell>
                                    </TableRow>
                                );
                            })

                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <PaginationTable data={data}
                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
            />
        </ContentContainer >
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
        justifyContent: 'flex-start',
        gap: 1.8,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}