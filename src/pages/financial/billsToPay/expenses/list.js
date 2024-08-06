import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, ConfirmModal, PaginationTable, SectionHeader } from "../../../../organisms"
import { api } from "../../../../api/api"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { Backdrop, Tooltip } from "@mui/material"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { icons } from "../../../../organisms/layout/Colors"


export default function ListBillsToPay(props) {
    const [expensesData, setExpensesData] = useState([])
    const [monthReleaseSelected, setMonthReleaseSelected] = useState()
    const [showMonths, setShowMonths] = useState(false)
    const [filters, setFilters] = useState({
        status: 'todos',
        startDate: '',
        endDate: '',
        centro_custo: '',
        tipo: '',
        search: ''
    })
    const [recurrencyExpenses, setRecurrencyExpenses] = useState([])
    const [baixaData, setBaixaData] = useState({ dt_baixa: '', conta_pagamento: '' })
    const { setLoading, colorPalette, theme, alert, setShowConfirmationDialog, userPermissions, menuItemsList, user } = useAppContext()
    const [expensesSelected, setExpensesSelected] = useState([]);
    const [expenseRecurrencySelected, setExpenseRecurrencySelected] = useState([]);
    const [allSelected, setAllSelected] = useState();
    const [allSelectedRecurrency, setAllSelectedRecurrency] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(50);
    const [showBaixa, setShowBaixa] = useState(false)
    const [showRecurrencyExpense, setShowRecurrencyExpense] = useState(false)
    const [accountList, setAccountList] = useState([])
    const [totalValue, setTotalValue] = useState(0)
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

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const filter = (item) => {
        let filterStatus = filters?.status.includes('todos') ? item : filters?.status.includes(item?.status)
        const normalizedFilterData = normalizeString(filters?.search);
        const filterSearch = filters?.search ? normalizeString(item?.descricao)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) : item
        let costCenter = filters?.centro_custo ? filters?.centro_custo === item?.centro_custo : item
        let accountType = filters?.tipo ? filters?.tipo === item?.tipo : item

        return (filterStatus && filterSearch && costCenter && accountType);
    }

    const normalizeString = (str) => {
        return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

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
            await listAccounts();
            await getRecurrencyExpenses();

        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }

    }


    const getExpenses = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/expenses/forDate?startDate=${filters?.startDate}&endDate=${filters?.endDate}`)
            const { expenses, totalValue } = response?.data;
            if (expenses?.length > 0) {
                setExpensesData(expenses?.sort((a, b) => new Date(a.dt_vencimento) - new Date(b.dt_vencimento)).map(item => {
                    const valorDesp = parseFloat(item.valor_desp);
                    return {
                        ...item,
                        valor_desp: isNaN(valorDesp) ? item.valor_desp : formattedReal(formatter.format(valorDesp))
                    };
                }));
            } else {
                setExpensesData(expenses)
            }
            setTotalValue(totalValue)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const getRecurrencyExpenses = async () => {
        try {
            const response = await api.get(`/expenses/recurrency/list`)
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

    const formattedReal = (value) => {
        let formattedValue = value
        if (value) {
            const rawValue = value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                formattedValue = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValueCoin = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                formattedValue = formattedValueCoin;

            }
            return formattedValue
        } else {
            return value
        }
    }

    const handleChangeExpenseData = (expenseId, field, value) => {

        let formattedValue = value
        if (field === 'valor_desp') {
            const rawValue = value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                formattedValue = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValueCoin = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                formattedValue = formattedValueCoin;

            }
        }
        setExpensesData(epxensesData => {
            return epxensesData?.map(expense => {
                if (expense.id_despesa === expenseId) {
                    return { ...expense, [field]: formattedValue };
                }
                return expense;
            });
        });
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
                setExpensesSelected([]);
                await getExpenses()
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
            try {
                const response = await api.patch(`/expense/baixa`, { expensesSelected, baixaData, userRespId: user?.id })
                const { status } = response?.data
                if (status) {
                    alert.success('Todas as Baixas foram realizadas com sucesso.');
                    setExpensesSelected([]);
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


    const handleCreateRecurrencyExpense = async () => {
        try {
            setLoading(true)
            let successStatus = true;
            for (let recurrency of expenseRecurrencySelected) {

                const response = await api.post(`/expense/recurrency/release/padronizado/create`,
                    { recurrencyId: recurrency?.recurrencyId, monthSelected: monthReleaseSelected, userResp: user?.id })

                const { success } = response.data
                if (!success) { successStatus = false }
            }

            if (successStatus) {
                alert.success('Despesas recorrentes cadastradas.');
                setShowRecurrencyExpense(false)
                setExpenseRecurrencySelected([])
                setAllSelectedRecurrency(false)
                setShowMonths(false)
                setMonthReleaseSelected(null)
                await getExpenses()
            } else {
                alert.error('Erro ao lançar despesas recorrentes.');
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleDeleteRecurrencyExpense = async (expenseId) => {
        setLoading(true)
        try {
            const response = await api.delete(`/expense/recurrency/delete/${expenseId}`)
            if (response.status === 200) {
                alert.success('Items excluídos.');
                setShowRecurrencyExpense(false)
                await getExpenses()
            } else {
                alert.error('Erro ao excluir itens.');
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const groupStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pago', value: 'Pago' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Cancelado', value: 'Cancelado' }
    ]

    const groupMonths = [
        { label: 'Janeiro', value: '0' },
        { label: 'Fevereiro', value: '1' },
        { label: 'Março', value: '2' },
        { label: 'Abril', value: '3' },
        { label: 'Maio', value: '4' },
        { label: 'Junho', value: '5' },
        { label: 'Julho', value: '6' },
        { label: 'Agosto', value: '7' },
        { label: 'Setembro', value: '8' },
        { label: 'Outubro', value: '9' },
        { label: 'Novembro', value: '10' },
        { label: 'Dezembro', value: '11' }
    ]

    const selectedMonths = (value) => {
        const alreadySelected = monthReleaseSelected === value;
        if (alreadySelected) {
            setMonthReleaseSelected(null);
        } else {
            setMonthReleaseSelected(value);
        }
    };

    const toggleSelectAllExpenses = () => {
        if (allSelected) {
            setExpensesSelected([]);
        } else {
            const allExpenses = expensesData?.reduce((acc, item) => {
                if (!expensesSelected.some(expense => expense.expenseId === item.id_despesa)) {
                    acc.push({ expenseId: item.id_despesa });
                }
                return acc;
            }, [...expensesSelected]);

            setExpensesSelected(allExpenses);
        }
        setAllSelected(!allSelected);
    };

    const selectedExpense = (value) => {

        const alreadySelected = expensesSelected.some(expense => expense.expenseId === value);

        const updatedSelected = alreadySelected ? expensesSelected.filter(expense => expense.expenseId !== value)
            : [...expensesSelected, { expenseId: value }];

        setExpensesSelected(updatedSelected);
        if (updatedSelected?.length === expensesData?.length) {
            setAllSelected(true);
        } else if (alreadySelected) {
            setAllSelected(false);
        }
    };

    const handleUpdateExpenses = async () => {
        if (expensesSelected) {
            setLoading(true)
            const installmentSelect = expensesData?.filter(item =>
                expensesSelected?.some(selected => selected.expenseId === item?.id_despesa))
            let statusOk = true

            try {
                for (let expense of installmentSelect) {
                    const response = await api.patch(`/expense/update/processData`, { expenseData: expense })
                    const { success } = response?.data
                    if (!success) {
                        statusOk = false
                    }
                }

                if (statusOk) {
                    alert.success('Todas as despesas foram atualizadas.');
                    setExpensesSelected([]);
                    getExpenses()
                    setAllSelected(false)
                    return
                }
                alert.error('Tivemos um problema ao atualizar despesas.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar despesas.');
                console.log(error)
                return error

            } finally {
                setLoading(false)
            }
            setLoading(false)
        } else {
            alert.info('Selecione as despesas que desejam atualizar.')
        }
    }

    let totalExpensesView = expensesData?.filter(filter)?.map(item => parseFloat(item.valor_tipo)).reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    const percentualExpenses = (parseFloat(totalExpensesView) / totalValue) * 100;

    return (
        <>
            <SectionHeader
                title="Despesas"
            />
            <Box sx={{
                display: 'flex', width: '100%', gap: 2,
                flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
            }}>

                {(expensesSelected?.length > 0) && <>
                    <Box sx={{ display: 'flex', position: 'fixed', right: 60, bottom: 20, display: 'flex', gap: 2, zIndex: 9999 }}>
                        <Button text="Processar alterações" style={{ width: '200px', height: '40px' }} onClick={() => handleUpdateExpenses()} />
                    </Box>
                </>
                }
            </Box>

            {/* <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column', padding: '30px 30px', backgroundColor: colorPalette?.secondary, borderRadius: 2 }}>
                <Text bold large>Filtros:</Text>
                <Box sx={{
                    display: 'flex', gap: 1.8, alignItems: 'start', justifyContent: 'center',
                }}>
                    <TextInput placeholder="Buscar pela descrição da despesa.." name='filterData' type="search" onChange={(event) => setFilters({ ...filters, search: event.target.value })} value={filters?.search} sx={{ width: '100%' }} />
                    <SelectList disabled={!isPermissionEdit && true} data={accountTypesList} valueSelection={filters?.tipo} onSelect={(value) => setFilters({ ...filters, tipo: value })}
                        title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <SelectList minWidth={200} disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={filters?.centro_custo} onSelect={(value) => setFilters({ ...filters, centro_custo: value })}
                        title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                    />
                    <Button text="Limpar" style={{ borderRadius: 2, height: '100%', width: 180 }} onClick={() =>
                        setFilters({
                            status: 'todos',
                            startDate: '',
                            endDate: '',
                            centro_custo: '',
                            tipo: ''
                        })} />
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

            </Box> */}

            <Box sx={{
                display: 'flex', overflow: 'auto', padding: '15px 10px', backgroundColor: colorPalette?.secondary,
                flexDirection: 'column'
            }}>

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

                <Box sx={{ display: 'flex', gap: 1, padding: '15px' }}>
                    <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} />
                    <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} />
                    <Button text="Buscar" style={{ borderRadius: 2, height: '100%', width: 110 }} onClick={() => getExpenses()} />
                </Box>

                <div style={{
                    borderRadius: '8px', flexWrap: 'nowrap', width: '100%',
                }}>
                    {expensesData?.length > 0 ?
                        <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', border: `1px solid ${colorPalette.primary}` }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <th style={{ padding: '8px 0px', display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                            <Box sx={{
                                                display: 'flex', gap: 1, width: 20, height: 20, border: '1px solid', borderRadius: '2px',
                                                backgroundColor: 'lightgray', alignItems: 'center', justifyContent: 'center',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => toggleSelectAllExpenses()}>
                                                {(allSelected) &&
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
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Descrição</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Valor</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Vencimento</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Pagamento</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Tipo</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>C.Custo</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '55px' }}><Text bold small>Conta.</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Status</Text></th>
                                    <th style={{ padding: '8px 0px', minWidth: '65px' }}><Text bold small>Baixado</Text></th>
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1, }}>
                                {expensesData?.slice(startIndex, endIndex)?.map((item, index) => {
                                    const expenseId = item?.id_despesa;
                                    const selected = expensesSelected.some(recurrency => recurrency.expenseId === expenseId);
                                    const baixado = item?.dt_pagamento && item?.conta_pagamento
                                    return (
                                        <tr key={index} style={{
                                            backgroundColor: selected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary
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
                                                    }} onClick={() => selectedExpense(expenseId)}>
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

                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <TextInput disabled={!isPermissionEdit && true}
                                                    name='descricao'
                                                    onChange={(e) =>
                                                        handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                                    value={item?.descricao || ''}
                                                    small fullWidth
                                                    sx={{ minWidth: 200 }}
                                                    InputProps={{
                                                        style: {
                                                            fontSize: '11px', height: 30
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <TextInput disabled={!isPermissionEdit && true}
                                                    name='valor_desp'
                                                    onChange={(e) =>
                                                        handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                                    value={item?.valor_desp || ''}
                                                    small
                                                    sx={{ padding: '0px 8px', width: 120 }}
                                                    InputProps={{
                                                        style: {
                                                            fontSize: '11px', height: 30
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                {/* <Text light>{formatTimeStampTimezone(item?.dt_vencimento)}</Text> */}
                                                <TextInput disabled={!isPermissionEdit && true}
                                                    name='dt_vencimento'
                                                    onChange={(e) =>
                                                        handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                                    value={(item?.dt_vencimento)?.split('T')[0] || ''}
                                                    small type="date"

                                                    InputProps={{
                                                        style: {
                                                            fontSize: '11px', height: 30
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <TextInput disabled={!isPermissionEdit && true}
                                                    name='dt_pagamento'
                                                    onChange={(e) =>
                                                        handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                                    value={(item?.dt_pagamento)?.split('T')[0] || ''}
                                                    small type="date"

                                                    InputProps={{
                                                        style: {
                                                            fontSize: '11px', height: 30
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>

                                                <SelectList
                                                    clean={false}
                                                    disabled={!isPermissionEdit && true}
                                                    data={accountTypesList}
                                                    valueSelection={item?.tipo}
                                                    onSelect={(value) => handleChangeExpenseData(expenseId, 'tipo', value)}
                                                    filterOpition="value" sx={{ color: colorPalette.textColor }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                    style={{ fontSize: '11px', height: 30, width: 120 }}
                                                />
                                            </td>

                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <SelectList
                                                    fullWidth
                                                    clean={false}
                                                    disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={item?.centro_custo}
                                                    onSelect={(value) => handleChangeExpenseData(expenseId, 'centro_custo', value)}
                                                    filterOpition="value" sx={{ color: colorPalette.textColor }}
                                                    inputStyle={{
                                                        color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold',
                                                        height: 30
                                                    }}
                                                    style={{ fontSize: '11px', height: 30, width: 120 }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <SelectList
                                                    fullWidth
                                                    clean={false}
                                                    disabled={!isPermissionEdit && true}
                                                    data={costCenterList}
                                                    valueSelection={item?.conta_pagamento}
                                                    onSelect={(value) => handleChangeExpenseData(expenseId, 'conta_pagamento', value)}
                                                    filterOpition="value" sx={{ color: colorPalette.textColor }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                                    style={{ fontSize: '11px', height: 30, width: 120 }}
                                                />
                                            </td>

                                            <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <SelectList
                                                    fullWidth
                                                    clean={false}
                                                    disabled={!isPermissionEdit && true}
                                                    data={groupStatus}
                                                    valueSelection={item?.status}
                                                    onSelect={(value) => handleChangeExpenseData(expenseId, 'status', value)}
                                                    filterOpition="value" sx={{ color: colorPalette.textColor }}
                                                    inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                                    style={{ fontSize: '11px', height: 30, width: 120 }}
                                                />
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '5px', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Tooltip title={baixado ? 'Despesa com baixa' : "Despesa aguardando baixa"}>
                                                        <div>
                                                            <Box sx={{
                                                                ...styles.menuIcon,
                                                                width: 13,
                                                                height: 13,
                                                                aspectRatio: '1/1',
                                                                backgroundImage: baixado ? `url('/icons/check_around_icon.png')` : `url('/icons/remove_icon.png')`,
                                                                transition: '.3s',
                                                            }} />
                                                        </div>
                                                    </Tooltip>
                                                </Box>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        :
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
                            <Text large light>Não foi possível encontrar Despesas para o período selecionado.</Text>
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
                            setShowMonths(false)
                            setMonthReleaseSelected(null)
                        }} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{
                        display: 'flex', gap: 1.75, alignItems: 'start',
                        maxHeight: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '580px' },
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
                        {expenseRecurrencySelected?.length > 0 &&
                            <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text>Selecione o mês de lancamento:</Text>
                                <Button secondary disabled={!isPermissionEdit && true} text="Selecionar" style={{ height: '30px', borderRadius: '6px' }}
                                    onClick={() => setShowMonths(true)} />
                            </Box>}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {(monthReleaseSelected?.length > 0 && expenseRecurrencySelected?.length > 0) ?
                                <Button disabled={!isPermissionEdit && true} text="Lançar"
                                    style={{ height: '30px', borderRadius: '6px' }} onClick={() => handleCreateRecurrencyExpense()} />
                                :
                                <Button disabled={!isPermissionEdit && true} text="Cadastrar" style={{ height: '30px', borderRadius: '6px' }}
                                    onClick={() => router.push(`/financial/billsToPay/expenses/recurrency/new`)} />}
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>


            <Backdrop open={showMonths} sx={{ zIndex: 999, paddingTop: 5 }}>
                <ContentContainer sx={{ zIndex: 9999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Selecione o Mês de lançamento</Text>
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
                            setShowMonths(false)
                        }} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{
                        display: 'flex', gap: 1.75, alignItems: 'start',
                        flexWrap: 'wrap',
                        maxHeight: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '580px' },
                        maxWidth: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '580px' },
                    }}>
                        {groupMonths?.map((item, index) => {
                            const selected = item?.value === monthReleaseSelected;
                            return (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box sx={{
                                            display: 'flex', gap: 1, width: 15, height: 15, border: '1px solid', borderRadius: '15px',
                                            backgroundColor: 'lightgray', alignItems: 'center', justifyContent: 'center',
                                            "&:hover": {
                                                opacity: 0.8,
                                                cursor: 'pointer'
                                            }
                                        }} onClick={() => selectedMonths(item?.value)}>
                                            {selected &&
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    width: 17, height: 17,
                                                    backgroundImage: `url('/icons/check_around_icon.png')`,
                                                    transition: '.3s',
                                                }} />
                                            }
                                        </Box>
                                    </Box>
                                    <Text>{item?.label}</Text>
                                </Box>
                            )
                        })}
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Button disabled={!isPermissionEdit && true} text="Salvar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => setShowMonths(false)} />

                        <Button cancel disabled={!isPermissionEdit && true} text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowMonths(false)
                                setMonthReleaseSelected(null)
                            }} />
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
