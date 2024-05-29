import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, ConfirmModal, PaginationTable, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { api } from "../../../../api/api"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatDate, formatTimeStamp } from "../../../../helpers"
import { Avatar, Backdrop, TablePagination } from "@mui/material"
import Link from "next/link"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { icons } from "../../../../organisms/layout/Colors"


export default function ListBillsToPay(props) {
    const [expensesData, setExpensesData] = useState([])
    const [filters, setFilters] = useState({
        status: 'todos',
        startDate: '',
        endDate: '',
        centro_custo: '',
        tipo: '',
        search: ''
    })

    const [expensesList, setExpensesList] = useState([])
    const [recurrencyExpenses, setRecurrencyExpenses] = useState([])
    const [baixaData, setBaixaData] = useState({ dt_baixa: '', conta_pagamento: '' })
    const { setLoading, colorPalette, theme, alert, setShowConfirmationDialog, userPermissions, menuItemsList, user } = useAppContext()
    const [expensesSelected, setExpensesSelected] = useState(null);
    const [expenseRecurrencySelected, setExpenseRecurrencySelected] = useState([]);
    const [allSelected, setAllSelected] = useState();
    const [allSelectedRecurrency, setAllSelectedRecurrency] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showBaixa, setShowBaixa] = useState(false)
    const [showRecurrencyExpense, setShowRecurrencyExpense] = useState(false)
    const [accountList, setAccountList] = useState([])
    const [filterData, setFilterData] = useState('')
    const [accountTypesList, setAccountTypesList] = useState([])
    const [costCenterList, setCostCenterList] = useState([])
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showExclude, setShowExclude] = useState({ active: false, data: null, event: () => { } })


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
        let date = new Date(item?.dt_vencimento);
        let filteredDate = (filters?.startDate && filters?.endDate) ?
            rangeDate(date, filters?.startDate, filters?.endDate) :
            item;
        let filterStatus = filters?.status.includes('todos') ? item : filters?.status.includes(item?.status)
        const normalizedFilterData = normalizeString(filters?.search);
        const filterSearch = filters?.search ? normalizeString(item?.descricao)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) : item
        let costCenter = filters?.centro_custo ? filters?.centro_custo === item?.centro_custo : item
        let accountType = filters?.tipo ? filters?.tipo === item?.tipo : item

        return (filteredDate && filterStatus && filterSearch && costCenter && accountType);
    }

    const normalizeString = (str) => {
        return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return date >= start && date <= end;
    }

    useEffect(() => {
        fetchPermissions()
        handleLoadData()
        listCostCenter()
        listAccountTypes()
    }, [])

    async function listAccounts() {
        try {
            const response = await api.get(`/accounts`)
            const { data } = response
            const groupCostCenter = data?.map(cc => ({
                label: cc.nome_conta,
                value: cc?.id_conta
            }));

            setAccountList(groupCostCenter)
        } catch (error) {
            console.log(error)
            return error
        }
    }



    async function listCostCenter() {
        const response = await api.get(`/costCenters`)
        const { data } = response
        const groupCostCenter = data?.filter(item => item.ativo === 1)?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));

        setCostCenterList(groupCostCenter)
    }



    async function listAccountTypes() {
        const response = await api.get(`/account/types`)
        const { data } = response
        const groupCostCenter = data?.filter(item => item.ativo === 1)?.map(cc => ({
            label: cc.nome_tipo,
            value: cc?.id_tipo
        }));

        setAccountTypesList(groupCostCenter)
    }

    const handleLoadData = async () => {
        setLoading(true)
        try {
            await getExpenses()
            await listAccounts()
            await getRecurrencyExpenses()
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }

    }


    const getExpenses = async () => {
        try {
            const response = await api.get(`/expenses`)
            const { data } = response;
            if (data.length > 0) {
                setExpensesList(data)
                setExpensesData(data.map(item => {
                    const valorDesp = parseFloat(item.valor_desp);
                    return {
                        ...item,
                        valor_tipo: isNaN(valorDesp) ? item.valor_desp : valorDesp.toFixed(2)
                    };
                }));
            }
        } catch (error) {
            console.log(error)
        }
    }


    const getRecurrencyExpenses = async () => {
        try {
            const response = await api.get(`/expenses/recurrency/list`)
            console.log(response)
            const { data } = response;
            if (data?.length > 0) {
                setRecurrencyExpenses(data?.map(item => {
                    const valorDesp = parseFloat(item.valor);
                    return {
                        ...item,
                        valor: isNaN(valorDesp) ? item.valor : valorDesp.toFixed(2)
                    };
                }));
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async () => {
        setLoading(true)
        try {
            const idsToDelete = expensesSelected.split(',').map(id => parseInt(id.trim(), 10));
            let allStatus200 = true;
            for (const idDelte of idsToDelete) {
                const response = await api.delete(`/expense/delete/${idDelte}`)
                if (response.status !== 200) {
                    allStatus200 = false;
                }
            }
            if (allStatus200) {
                alert.success('Items excluídos.');
                setExpensesSelected(null);
                await handleLoadData()
            } else {
                alert.error('Erro ao excluir itens.');
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleBaixa = async () => {
        if (expensesSelected && baixaData?.conta_pagamento !== '' && baixaData?.dt_baixa !== '') {
            setLoading(true)
            const isToUpdate = expensesSelected.split(',').map(id => parseInt(id.trim(), 10));
            try {
                const response = await api.patch(`/expense/baixa`, { isToUpdate, baixaData, userRespId: user?.id })
                const { status } = response?.data
                if (status) {
                    alert.success('Todas as Baixas foram realizadas com sucesso.');
                    setExpensesSelected(null);
                    setShowBaixa(false)
                    setBaixaData({ dt_baixa: '', conta_pagamento: '' });
                    getExpenses()
                    return
                }
                alert.error('Tivemos um problema ao efetivar as Baixa.');
            } catch (error) {
                alert.error('Tivemos um problema ao efetivar as Baixa.');
                console.log(error)
                return error

            } finally {
                setLoading(false)
            }
        } else {
            alert.info('Selecione um item antes de dar baixa e preencha todos os campos corretamente.')
        }
    }


    const handleDeleteRecurrencyExpense = async (expenseId) => {
        setLoading(true)
        try {
            console.log(expenseId)
            // const response = await api.delete(`/expense/recurrency/delete/${expenseId}`)
            // if (response.status === 200) {
            //     alert.success('Items excluídos.');
            //     setShowRecurrencyExpense(false)
            //     await handleLoadData()
            // } else {
            //     alert.error('Erro ao excluir itens.');
            // }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const pusBillId = async (item) => {
        let itemId = item?.id_despesa || 'new';
        let queryRoute = `/financial/billsToPay/expenses/${itemId}`
        router.push(queryRoute)
    }

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Pagamento reprovado' || data === 'Não Autorizado') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Estornada' && '#f0f0f0'))


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const columnExpense = [
        { key: 'id_despesa', label: 'id' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'valor_desp', label: 'Valor', price: true },
        { key: 'dt_vencimento', label: 'Vencimento', date: true },
        { key: 'nome_cc', label: 'Centro de Custo' },
        { key: 'nome_conta', label: 'Conta' },
        { key: 'dt_pagamento', label: 'Dt Baixa', date: true },
        { key: 'status', label: 'Status', status: true },
    ];

    const groupSelect = (id) => [
        {
            value: id?.toString()
        },
    ]

    const groupStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pago', value: 'Pago' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Cancelado', value: 'Cancelado' }
    ]

    const groupProstated = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    let valueExpenses = expensesList?.map(item => parseFloat(item.valor_desp))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let totalExpenses = parseFloat(valueExpenses);
    let totalExpensesView = expensesData?.filter(filter)?.map(item => parseFloat(item.valor_tipo)).reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    const percentualExpenses = (parseFloat(totalExpensesView) / totalExpenses) * 100;

    return (
        <>
            <SectionHeader
                title="Despesas"
            />
            <Box sx={{
                display: 'flex', width: '100%', gap: 2,
                flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
            }}>

                <Box sx={{
                    display: 'flex', gap: 2,
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <ContentContainer row style={{ justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 18,
                                    height: 18,
                                    aspectRatio: '1/1',
                                    backgroundImage: `url('/icons/arrow_down_red_icon.png')`,
                                    transition: '.3s',
                                }} />
                                <Text bold title style={{ color: 'red' }}>{formatter.format(parseFloat(totalExpenses))}</Text>
                            </Box>
                            <Text light>Despesa</Text>
                        </Box>
                    </ContentContainer>
                </Box>

                <ContentContainer fullWidth>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                            <Box sx={{ width: '100%', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text bold large>Despesas</Text>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', transition: '.5s', }}>
                                    <Text bold style={{ color: colorPalette.buttonColor }}>{formatter.format(parseFloat(totalExpensesView))}</Text>
                                    <Text>de</Text>
                                    <Text light style={{ color: 'rgb(75 85 99)' }}>{formatter.format(parseFloat(totalExpenses))}</Text>
                                </Box>
                            </Box>
                            <div style={{ marginTop: '10px', width: '100%', height: '10px', borderRadius: '10px', background: '#ccc', transition: '.5s', }}>
                                <div style={{ width: `${percentualExpenses}%`, height: '100%', borderRadius: '10px', background: colorPalette.buttonColor, transition: '.5s', }} />
                            </div>
                        </Box>
                    </Box>
                </ContentContainer>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column', padding: '30px 30px', backgroundColor: colorPalette?.secondary, borderRadius: 2 }}>
                <Text bold large>Filtros:</Text>
                <Box sx={{
                    display: 'flex', gap: 1.8, alignItems: 'start', justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <TextInput placeholder="Buscar pela descrição da despesa.." name='filterData' type="search" onChange={(event) => setFilters({ ...filters, search: event.target.value })} value={filters?.search} sx={{ width: '100%' }} />
                    <Box sx={{
                        display: 'flex', gap: 1.8, alignItems: 'center', justifyContent: 'center',
                        flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                    }}>
                        <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} />
                        <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} />
                        <SelectList disabled={!isPermissionEdit && true} data={accountTypesList} valueSelection={filters?.tipo} onSelect={(value) => setFilters({ ...filters, tipo: value })}
                            title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={filters?.centro_custo} onSelect={(value) => setFilters({ ...filters, centro_custo: value })}
                            title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <Button text="Limpar" style={{ borderRadius: 2, height: '100%', width: 110 }} onClick={() =>
                            setFilters({
                                status: 'todos',
                                startDate: '',
                                endDate: '',
                                centro_custo: '',
                                tipo: ''
                            })} />
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <CheckBoxComponent disabled={!isPermissionEdit && true}
                        boxGroup={groupStatus}
                        valueChecked={filters?.status}
                        horizontal={true}
                        onSelect={(value) => {
                            setFilters({ ...filters, status: value })
                        }}
                        sx={{ width: 1 }} />
                </Box>

            </Box>


            <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'space-between', }}>
                <Box sx={{ display: 'flex' }}>
                    <Button disabled={!isPermissionEdit && true} small text="Cadastrar Recorrência" style={{ height: '30px', borderRadius: '6px' }} onClick={() => setShowRecurrencyExpense(true)} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button disabled={!isPermissionEdit && true} small text="Novo" style={{ width: '80px', height: '30px', borderRadius: '6px' }} onClick={() => router.push(`/financial/billsToPay/expenses/new`)} />
                    <Button disabled={!isPermissionEdit && true} small secondary text="Excluir" style={{ width: '80px', height: '30px', borderRadius: '6px' }} onClick={(event) => setShowConfirmationDialog({
                        active: true,
                        event,
                        acceptAction: handleDelete,
                        title: `Excluir Despesa?`,
                        message: 'Tem certeza que deseja seguir com a exclusão? Uma vez excluído, não será possível recuperar novamente.'
                    })} />
                    <Button disabled={!isPermissionEdit && true} small secondary text="Dar baixa" style={{ height: '30px', borderRadius: '6px' }}
                        onClick={() => setShowBaixa(true)} />
                </Box>
            </Box>

            <Box sx={{
                display: 'flex', backgroundColor: colorPalette.secondary, flexDirection: 'column', width: '100%', boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                border: `1px solid ${theme ? '#eaeaea' : '#404040'}`, overflow: 'auto', borderRadius: 2
            }}>

                <div style={{
                    borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap', width: '100%',
                }}>
                    {expensesData?.filter(item => filter(item)).length > 0 ?
                        <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', border: `1px solid ${colorPalette.primary}` }}>
                            <thead>
                                <tr style={{ backgroundColor: colorPalette.secondary, borderBottom: `1px solid ${colorPalette?.primary}` }}>
                                    <th style={{ display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px', }}>
                                        <CheckBoxComponent
                                            disabled={!isPermissionEdit && true}
                                            boxGroup={[{ value: 'allSelect' }]}
                                            valueChecked={'select'}
                                            horizontal={true}
                                            onSelect={() => {
                                                if (expensesSelected?.length === allSelected?.length) {
                                                    let allInstallmentSelected = expensesData?.filter(filter)?.map(item => item?.id_despesa)
                                                    setExpensesSelected(allInstallmentSelected?.toString())
                                                } else {
                                                    setExpensesSelected(null)
                                                }
                                            }}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 15 }}
                                        />
                                    </th>
                                    {columnExpense?.map((item, index) => (
                                        <th key={index} style={{ padding: '8px 0px' }}><Text bold>{item.label}</Text></th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1, }}>
                                {expensesData?.sort((a, b) => new Date(a.dt_vencimento) - new Date(b.dt_vencimento))?.filter(filter)?.map((item, index) => {
                                    let itemId = item?.id_despesa
                                    const isSelected = expensesSelected?.includes(itemId) || null;

                                    return (
                                        <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary, }}>
                                            <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                <CheckBoxComponent
                                                    disabled={!isPermissionEdit && true}
                                                    boxGroup={
                                                        groupSelect(itemId)
                                                    }
                                                    valueChecked={expensesSelected}
                                                    horizontal={true}
                                                    onSelect={(value) => {
                                                        if (itemId) {
                                                            setExpensesSelected(value);
                                                        }
                                                    }}
                                                    padding={0}
                                                    gap={0}
                                                    sx={{ display: 'flex', maxWidth: 15 }}
                                                />
                                            </td>
                                            {columnExpense?.map((column, colIndex) => (
                                                <td key={colIndex} style={{
                                                    textDecoration: column?.label === 'id' ? 'underline' : 'none', padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular',
                                                    color: column?.label === 'id' ? (theme ? 'blue' : 'red') : colorPalette.textColor, textAlign: 'center', borderBottom: `1px solid ${colorPalette?.primary}`,
                                                    minWidth: column?.label === 'id' ? 60 : 0
                                                }}
                                                    onClick={(e) => {
                                                        column?.label === 'id' ? pusBillId(item)
                                                            :
                                                            e.preventDefault()
                                                        e.stopPropagation()
                                                    }}>
                                                    {item[column?.key] ? (
                                                        <Box sx={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: column?.label === 'id' && 'pointer', '&:hover': {
                                                                opacity: column?.label === 'id' && 0.7
                                                            }
                                                        }} >
                                                            {column.avatar && <Avatar sx={{ width: 27, height: 27, fontSize: 14 }} src={item[column?.avatarUrl || '']} />}

                                                            {typeof item[column.key] === 'object' && item[column?.key || '-'] instanceof Date ? (
                                                                formatTimeStamp(item[column?.key || '-'])
                                                            ) : (
                                                                column.status ? (
                                                                    <Box
                                                                        sx={{
                                                                            display: 'flex',
                                                                            height: 30,
                                                                            gap: 2,
                                                                            alignItems: 'center',
                                                                            borderRadius: 2,
                                                                            justifyContent: 'center',
                                                                            borderBottom: `1px solid ${colorPalette?.primary}`
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', backgroundColor: priorityColor(item[column.key]), width: '10px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                                        <Text small bold style={{ padding: '0px 15px 0px 0px' }}>{item[column.key]}</Text>
                                                                    </Box>
                                                                ) :
                                                                    (column.date ? formatDate(item[column?.key]) : column.price ? formatter.format(parseFloat((item[column?.key]))) : item[column?.key || '-'])
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Text sx={{ border: 'none', padding: '2px', transition: 'background-color 1s', color: colorPalette.textColor }}>-</Text>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        :
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Text large light>Não foi possível encontrar Despesas.</Text>
                            <Box sx={{
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                width: 350, height: 250,
                                backgroundImage: `url('/background/no_results.png')`,
                            }} />
                        </Box>
                    }
                    <Box sx={{ marginTop: 2 }}>

                        <PaginationTable data={expensesData?.filter(filter)}
                            page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                        />
                    </Box>
                </div>
            </Box>


            <Backdrop open={showBaixa} sx={{ zIndex: 999 }}>
                <ContentContainer sx={{ zIndex: 9999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Dados da Baixa</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 99999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowBaixa(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                        <TextInput disabled={!isPermissionEdit && true}
                            name='dt_baixa'
                            onChange={(event) => setBaixaData({ ...baixaData, dt_baixa: event.target.value })}
                            value={(baixaData?.dt_baixa)?.split('T')[0] || ''}
                            type="date"
                            label='Data da Baixa'
                            sx={{ width: 250 }} />
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={baixaData?.conta_pagamento} onSelect={(value) => setBaixaData({ ...baixaData, conta_pagamento: value })}
                            title="Conta do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                        <Button disabled={!isPermissionEdit && true} small text="Dar baixa" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={(event) => setShowConfirmationDialog({
                                active: true,
                                event,
                                acceptAction: handleBaixa,
                                title: `Seguir com a baixa na Despesa?`,
                                message: 'Tem certeza que deseja seguir com a as baixas?'
                            })} />
                        <Button disabled={!isPermissionEdit && true} small secondary text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowBaixa(false)
                                setBaixaData({ dt_baixa: '', conta_pagamento: '' });
                            }} />
                    </Box>
                </ContentContainer>
            </Backdrop>



            <Backdrop open={showRecurrencyExpense} sx={{ zIndex: 999, paddingTop: 5 }}>
                <ContentContainer sx={{ zIndex: 9999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Despesas Recorrentes</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 99999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => {
                            setShowRecurrencyExpense(false)
                            setExpenseRecurrencySelected([])
                            setAllSelectedRecurrency(false)
                        }} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{
                        display: 'flex', gap: 1.75, alignItems: 'start',
                        maxHeight: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '1280px' },
                        overflow: 'auto',
                    }}>
                        {recurrencyExpenses?.length > 0 ?
                            <TableRecurrencyExpenses
                                data={recurrencyExpenses}
                                handleDeleteRecurrencyExpense={handleDeleteRecurrencyExpense}
                                setShowExclude={setShowExclude}
                                expenseRecurrencySelected={expenseRecurrencySelected}
                                setExpenseRecurrencySelected={setExpenseRecurrencySelected}
                                allSelectedRecurrency={allSelectedRecurrency}
                                setAllSelectedRecurrency={setAllSelectedRecurrency}
                            />
                            :
                            <Text light>Não existem despesas recorrentes.</Text>}
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Button disabled={!isPermissionEdit && true} text="Lançar" style={{ height: '30px', borderRadius: '6px' }} />

                        <Button disabled={!isPermissionEdit && true} text="Cadastrar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => router.push(`/financial/billsToPay/expenses/recurrency/new`)} />
                    </Box>
                </ContentContainer>
            </Backdrop>


            <ConfirmModal
                showExclude={showExclude}
                onConfirm={handleDeleteRecurrencyExpense}
                onCancel={() => setShowExclude({ active: false, data: null, event: () => { } })}
            />
        </>
    )
}


const TableRecurrencyExpenses = ({ data = [], handleDeleteRecurrencyExpense, setShowExclude,
    expenseRecurrencySelected, setExpenseRecurrencySelected, allSelectedRecurrency, setAllSelectedRecurrency }) => {

    const { setLoading, theme, colorPalette } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const toggleSelectAll = () => {
        if (allSelectedRecurrency) {
            setExpenseRecurrencySelected([]);
        } else {
            const allRecurrencies = data?.reduce((acc, item) => {
                if (!expenseRecurrencySelected.some(recurrency => recurrency.recurrencyId === item.id_desp_recorrente)) {
                    acc.push({ recurrencyId: item.id_desp_recorrente });
                }
                return acc;
            }, [...expenseRecurrencySelected]);

            setExpenseRecurrencySelected(allRecurrencies);
        }
        setAllSelectedRecurrency(!allSelectedRecurrency);
    };

    const selectedRecurrency = (value) => {

        const alreadySelected = expenseRecurrencySelected.some(recurrency => recurrency.recurrencyId === value);

        const updatedRecurrencySelected = alreadySelected ? expenseRecurrencySelected.filter(recurrency => recurrency.recurrencyId !== value)
            : [...expenseRecurrencySelected, { recurrencyId: value }];

        setExpenseRecurrencySelected(updatedRecurrencySelected);
        if (updatedRecurrencySelected?.length === data?.length) {
            setAllSelectedRecurrency(true);
        } else if (alreadySelected) {
            setAllSelectedRecurrency(false);
        }
    };


    return (
        <div style={{
            borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap',
            backgroundColor: colorPalette?.secondary,
            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
        }}>
            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                        <th style={{ padding: '8px 5px', minWidth: '50px' }}>
                            <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column', alignItems: 'center' }}>
                                <Text xsmall>Selecionar tudo</Text>
                                <Box sx={{
                                    display: 'flex', gap: 1, width: 20, height: 20, border: '1px solid', borderRadius: '2px',
                                    backgroundColor: 'lightgray', alignItems: 'center', justifyContent: 'center',
                                    "&:hover": {
                                        opacity: 0.8,
                                        cursor: 'pointer'
                                    }
                                }} onClick={() => toggleSelectAll()}>
                                    {allSelectedRecurrency &&
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 20, height: 20,
                                            backgroundImage: `url('/icons/checkbox-icon.png')`,
                                            transition: '.3s',
                                        }} />
                                    }
                                </Box>
                            </Box>
                        </th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Descrição</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Dia de Vencimento</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold></Text></th>
                    </tr>
                </thead>
                <tbody style={{ flex: 1, }}>
                    {data?.slice(startIndex, endIndex).map((item, index) => {
                        const recurrencyId = item?.id_desp_recorrente;
                        const selected = expenseRecurrencySelected.some(recurrency => recurrency.recurrencyId === recurrencyId);
                        return (
                            <tr key={index} style={{
                                backgroundColor: colorPalette?.secondary
                            }}>
                                <td style={{ textAlign: 'center', padding: '5px 5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                        <Box sx={{
                                            display: 'flex', gap: 1, width: 20, height: 20, border: '1px solid', borderRadius: '2px',
                                            backgroundColor: 'lightgray', alignItems: 'center', justifyContent: 'center',
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => selectedRecurrency(recurrencyId)}>
                                            {selected &&
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    width: 20, height: 20,
                                                    backgroundImage: `url('/icons/checkbox-icon.png')`,
                                                    transition: '.3s',
                                                }} />
                                            }
                                        </Box>
                                    </Box>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light>
                                        {item?.descricao}
                                    </Text>
                                </td>

                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light >
                                        {item?.dia_vencimento}
                                    </Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light >{formatter.format(item?.valor)}</Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '10px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }} >
                                        <Button small style={{ borderRadius: 2 }} text="Editar" onClick={() => router.push(`/financial/billsToPay/expenses/recurrency/${item?.id_desp_recorrente}`)} />
                                        <Button cancel small style={{ borderRadius: 2 }} text="Excluir"
                                            onClick={(e) =>
                                                setShowExclude({
                                                    active: true,
                                                    data: item?.id_desp_recorrente,
                                                    title: 'Excluir Conta',
                                                    description: 'Tem certeza que deseja excluir a conta? Uma vez excluído, não será possível recupera-la, e não aparecerá no relatório final.',
                                                    event: handleDeleteRecurrencyExpense
                                                })
                                            } />
                                    </Box>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>

            <PaginationTable data={data}
                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
            />

        </div >
    )
}

const styles = {
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    },
}
