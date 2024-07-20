import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader,Table_V1,PaginationTable } from "../../../organisms"
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
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export default function VoucherEdit(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList, theme } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newCupom = id === 'new';
    const [firstRender, setFirstRender] = useState(true)
    const containerRef = useRef(null);
    const [usersList, setUsers] = useState([])
    const [filterData, setFilterData] = useState('')
    const [perfil, setPerfil] = useState('todos')
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
    const [accountHistoricList, setAccountHistoricList] = useState([])
    const userFilterFunctions = {
        ativo: (item) => filtersField?.status === 'todos' || item.ativo === filtersField?.status,
        enrollmentSituation: (item) => filtersField?.enrollmentSituation === 'todos' || item?.total_matriculas_em_andamento === filtersField?.enrollmentSituation,
        perfilUser: (item) => filtersField?.userPerfil === 'todos' || item?.perfil?.includes(filtersField?.userPerfil),
    };
    const filterFunctions = {
        date: (item) => (filters?.startDate !== '' && filters?.endDate !== '') ? rangeDate(item?.vencimento, filters?.startDate, filters?.endDate) : item,
        search: (item) => {
            const normalizedSearchTerm = removeAccents(filters?.search.toLowerCase());
            const normalizedItemName = item?.pagante ? removeAccents(item?.pagante?.toLowerCase()) : removeAccents(item?.aluno?.toLowerCase());
            return normalizedItemName && normalizedItemName?.includes(normalizedSearchTerm)
        },
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

    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return date >= start && date <= end;
    }

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
            const response = await api.get(`/users`)
            const { data = [] } = response;          
            setUsers(data)
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
            setAccountHistoricList(data)
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
            alert.error('Ocorreu um arro ao carregar o Conta')
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
        try{
        setLoading(true)
        if(typeof coupom.porcetagem == undefined ||typeof coupom.porcetagem == 'undefined'){
            alert.error('Campo porcetagem, inválido.');
            setLoading(false)
            return
        }
        if(typeof coupom.nome_cupom == undefined || coupom.nome_cupom  == ""){
            alert.error('Campo nome, inválido.');
            setLoading(false)
            return
        }
        if(typeof coupom.valor == undefined || coupom.valor  == ""){
            alert.error('Campo valor, inválido.');
            setLoading(false)
            return
        }
        if(typeof coupom.status == undefined){
            alert.error('Campo status, inválido.');
            setLoading(false)
            return
        }
        
        if(!coupom.porcetagem){
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
        try{
        setLoading(true)    
        
        if(typeof coupom.porcetagem == undefined ||typeof coupom.porcetagem == 'undefined'){
            setLoading(false)
            return
        }
        if(typeof coupom.nome_cupom == undefined || coupom.nome_cupom  == ""){
            alert.error('Campo nome, inválido.');
            setLoading(false)
            return
        }
        if(typeof coupom.valor == undefined || coupom.valor  == ""){
            alert.error('Campo valor, inválido.');
            setLoading(false)
            return
        }
        if(typeof coupom.status == undefined){
            alert.error('Campo status, inválido.');
            setLoading(false)
            return
        }
        if(!coupom.porcetagem){
            coupom.valor = parseFloat(coupom.valor.replace(',','.').replace('R$','').trim())
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
    const removerAlunoCupom = async (dataCupom) =>{        
        try {
            const response = await api.post(`/cupom/removeCupomAluno`, { dataCupom });
            const { data } = response           
            if (response?.status === 201) {
                await handleItems()
                alert.success('Aluno removido do cupom.');                
            }
        } catch (error) {
            alert.error('Tivemos um problema ao editar o Cupom.');
            console.log(error)

        } finally {
            setLoading(false)
        }

    }
    const handleDelete = async () =>{
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



    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    const listUser = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aluno', value: 'aluno' },
        { label: 'Funcionário', value: 'funcionario' },
        { label: 'Interessado', value: 'interessado' },
    ]
    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Ativo', value: 1 },
        { label: 'Inativo', value: 0 },
    ]
    const listEnrollStatus = [
        { label: 'Todos', value: 'todos' },
        // { label: 'Pendente de nota', value: 'Pendente de nota' },
        // { label: 'Reprovado', value: 'Reprovado' },
        // { label: 'Aprovado - Pendente de pré-matrícula', value: 'Aprovado - Pendente de pré-matrícula' },
        // { label: 'Aprovado - Em análise', value: 'Aprovado - Em análise' },
        { label: 'Matriculado', value: 1 },
    ]
   
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
                        justifyContent: 'space-between', gap: 1.8, padding: 5, width: '65%',
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold >Dados do Cupom aqui </Text>
                            <IconStatus
                                style={{ backgroundColor: coupom.status >= 1 ? 'green' : 'red', boxShadow: coupom.status >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                            />
                        </Box>
                        <Box sx={{ ...styles.inputSection, flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Nome do cupom' name='nome_cupom' onChange={handleChange} value={coupom?.nome_cupom || ''} label='Nome do cupom:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Descrição' name='descricao' onChange={handleChange} value={coupom?.descricao || ''} label='Descricao:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder={coupom?.porcetagem ? `Porcetagem` : `Valor`} name='valor' onChange={coupom?.porcetagem ? handleChange : handleChangeValue} value={coupom?.valor || ''} label={coupom?.porcetagem ? `Porcetagem` : `Valor`} n sx={{ width: '100%', }} />
                        </Box>
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={coupom?.porcetagem} group={groupStatus} title="Porcetagem" horizontal={mobile ? false : true} onSelect={(value) => setCoupomData({ ...coupom, porcetagem: parseInt(value),valor: 0 })} />
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={coupom?.status} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setCoupomData({ ...coupom, status: parseInt(value) })} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button text="Salvar " style={{ borderRadius: 2 }} onClick={() => { if (newCupom) { handleCreate() } else { handleEdit() } }} />
                            {!newCupom &&  
                            <Button cancel text="Excluir Conta" style={{ borderRadius: 2 }} onClick={
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
                    <ContentContainer style={{
                        display: 'flex', flexDirection: 'column', gap: 1.8, padding: 5, width: '35%',
                        position: 'relative',
                        overflow: 'auto'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Alunos com cupom</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', maxHeight: 280, minHeight: 280 }}>
                            {accountHistoricList?.length > 0 ?
                                accountHistoricList?.map((item, index) => {
                                    return (
                                        <Box key={index} sx={{ display: 'flex',  alignItems: 'start', }}>                                                                                        
                                                                                             
                                                    {

                                                        <Box sx={{
                                                            display: 'flex', gap: 2, top: 95, backgroundColor: colorPalette?.primary, zIndex: 999,
                                                            padding: '8px 12px', borderRadius: 2, position: 'relative' 
                                                        }}>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                                                <Text xsmall bold>Nome:</Text>
                                                                <Text xsmall>{item?.nome}</Text>
                                                                <HighlightOffIcon onClick={() => removerAlunoCupom(item)} sx={{ top: 1,position: 'absolute', right: 0, width: 18, height:18, cursor: 'pointer'}}/>
                                                            </Box>                                                          
                                                        </Box>
                                                    }
                                                  
                                        </Box>
                                    )
                                })
                                :
                                <Text light>Não foi encontrado histórico de trasnferências</Text>}
                            <Box sx={{
                                display: 'flex', width: '100%', position: 'absolute', bottom: '-92px',
                                justifyContent: 'flex-end', right: 20,
                                padding: '5px'
                            }}>
                                <Button style={{ borderRadius: 2 }} text="Nova Transferência" onClick={() => setShowTransfer(true)} />
                            </Box>
                        </Box>
                    </ContentContainer>

                </Box>
            </Box>
            { !newCupom &&  
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{usersList.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{usersList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>usuários</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar pelo nome ou pelo ID.." name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
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
                        <SelectList

                            data={listEnrollStatus}
                            valueSelection={filtersField?.enrollmentSituation}
                            onSelect={(value) => setFiltersField({ ...filtersField, enrollmentSituation: value })}
                            title="situação/matrícula"
                            filterOpition="value"
                            sx={{ flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
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
                    {/* <TablePagination
                        component="div"
                        count={sortUsers()?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    /> */}
                </Box>
            </ContentContainer>
            }
            {
                usersList?.filter(filter)?.length > 0 ?
                <Box>
                    <TableAccount data={sortUsers()?.filter(filter)}  />
                </Box>
                    :
                    !newCupom &&  
                    <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                        <Text bold>Não foi encontrado usuarios {perfil}</Text>
                    </Box>
            }

        </>
    )
}
const TableAccount = ({ data = [], filters = [], onPress = () => { } }) => {
    
    const router = useRouter()
    const { setLoading, colorPalette, theme, user,alert } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const { id } = router.query;
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

  


    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'nome', avatar: true, label: 'Nome', avatarUrl: 'location', matricula: true },
        { key: 'nome_social', label: 'Nome Social' },
        { key: 'email', label: 'E-mail' },
        { key: 'email_melies', label: 'E-mail Méliès' },
    ];
   
   
    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const handleRowClick = async (id_aluno) => {
        setLoading(true)
        let dataCupom = {
            id_cupom: parseInt(id),
            id_usuario: id_aluno
        }
        try {
            const response = await api.post(`/cupom/insertDesconto`, { dataCupom });
            const { data } = response

            if (response?.status === 201) {               
                alert.success('Cupom de desconto aplicado ao aluno');
                location.reload()
               
            }
        } catch (error) {
            const { data } = error.response
            console.log(error)
            alert.error(`${data.msg}`);

        } finally {
            setLoading(false)
        }
    };
 
   
    const valuesColor = (data) => ((data > 0 ? 'green' : 'red'));

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

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
                                    <TableRow key={`${item}-${index}`} onClick={() => handleRowClick(item?.id)} sx={{
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
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.email_melies || '-'}</Text>
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