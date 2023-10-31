import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatDate, formatTimeStamp } from "../../../helpers"
import { Avatar, TablePagination } from "@mui/material"
import Link from "next/link"

const monthFilter = [
    { month: 'Jan', value: 0 },
    { month: 'Fev', value: 1 },
    { month: 'Mar', value: 2 },
    { month: 'Abr', value: 3 },
    { month: 'Mai', value: 4 },
    { month: 'Jun', value: 5 },
    { month: 'Jul', value: 6 },
    { month: 'Ago', value: 7 },
    { month: 'Set', value: 8 },
    { month: 'Out', value: 9 },
    { month: 'Nov', value: 10 },
    { month: 'Dez', value: 11 },
]

const menusFilters = [
    { id: '01', text: 'Despesas Fixas', value: 'Despesas Fixas', key: 'fixed' },
    { id: '02', text: 'Despesas Variáveis', value: 'Despesas Variáveis', key: 'variable' },
    { id: '03', text: 'Folha de Pagamento', value: 'Folha de Pagamento', key: 'personal' },
]

export default function ListBillsToPay(props) {
    const [fixedExpenses, setFixedExpenses] = useState([])
    const [expensesData, setExpensesData] = useState([])
    const [variableExpenses, setVariableExpenses] = useState([])
    const [personalExpenses, setPersonalExpenses] = useState([])
    const { setLoading, colorPalette, theme, alert, setShowConfirmationDialog } = useAppContext()
    const [filterYear, setFilterYear] = useState(2023)
    const [filterMonth, setFilterMonth] = useState(9)
    const [expensesSelected, setExpensesSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [billstToReceive, setBillstToReceive] = useState([]);
    const [menuSelected, setMenuSelected] = useState('Despesas Fixas')
    const [columnTable, setColumnTable] = useState([])

    const filter = (item) => {
        let dateFilter = menuSelected === 'Folha de Pagamento' ? item?.dt_pagamento : item?.dt_vencimento;
        let date = new Date(dateFilter)
        let monthSelect = date.getMonth()
        return monthSelect === filterMonth;
    }

    useEffect(() => {
        handleLoadData()
    }, [])

    const handleLoadData = () => {
        getFixedExpenses('fixed')
        getVariableExpenses('variable')
        getPersonalExpenses('personal')
    }

    useEffect(() => {
        if (menuSelected === 'Despesas Fixas') getFixedExpenses('fixed');
        if (menuSelected === 'Despesas Variáveis') { getVariableExpenses('variable') }
        if (menuSelected === 'Folha de Pagamento') { getPersonalExpenses('personal') }
    }, [menuSelected]);



    useEffect(() => {
        if (menuSelected === 'Despesas Fixas') {

            setColumnTable([
                { key: 'id_despesa_f', label: 'id' },
                { key: 'dt_vencimento', label: 'Vencimento', date: true },
                { key: 'descricao_desp_f', label: 'Descrição' },
                { key: 'valor_desp_f', label: 'Valor', price: true },
                { key: 'empresa_paga', label: 'Fornecedor/Empresa' },
                { key: 'status', label: 'Status' },
            ])
        }
        const dateNow = new Date()
        let monthNow = dateNow.getMonth()
        setFilterMonth(monthNow)
        getBillsToReceive()
    }, []);


    const getFixedExpenses = async (typeExpense) => {
        setLoading(true)
        try {
            const response = await api.get(`/expenses/${typeExpense}`)
            const { data } = response;
            // const groupIds = data?.map(ids => ids?.id_parcela_matr).join(',');
            // setAllSelected(groupIds)
            setFixedExpenses(data)
            if (data.length > 0) {

                setExpensesData(data.map(item => {
                    const valorDespF = parseFloat(item.valor_desp_f);
                    return {
                        ...item,
                        valor_tipo: isNaN(valorDespF) ? item.valor_desp_f : valorDespF.toFixed(2)
                    };
                }));
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getVariableExpenses = async (typeExpense) => {
        setLoading(true)
        try {
            const response = await api.get(`/expenses/${typeExpense}`)
            const { data } = response;
            setVariableExpenses(data)
            if (data.length > 0) {

                setExpensesData(data.map(item => {
                    const valorDespF = parseFloat(item.valor_desp_v);
                    return {
                        ...item,
                        valor_tipo: isNaN(valorDespF) ? item.valor_desp_v : valorDespF.toFixed(2)
                    };
                }));
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getPersonalExpenses = async (typeExpense) => {
        setLoading(true)
        try {
            const response = await api.get(`/expenses/${typeExpense}`)
            const { data } = response;
            setPersonalExpenses(data)
            if (data.length > 0) {

                setExpensesData(data.map(item => {
                    const valorDespF = parseFloat(item.vl_pagamento);
                    return {
                        ...item,
                        valor_tipo: isNaN(valorDespF) ? item.vl_pagamento : valorDespF.toFixed(2)
                    };
                }));
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getBillsToReceive = async () => {
        setLoading(true)
        try {
            const response = await api.get('/student/installments')
            const { data } = response;
            setBillstToReceive(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const handleChangeValueListData = (setValue, installmentId, field, value) => {
        setValue(prevInstallments => {
            return prevInstallments?.map(installment => {
                if (installment.id_parcela_matr === installmentId) {
                    return { ...installment, [field]: value };
                }
                return installment;
            });
        });
    };

    const handleDelete = async () => {
        setLoading(true)
        try {
            const queryType = await menusFilters?.filter(item => item.value === menuSelected)?.map(item => item.key);
            const idsToDelete = expensesSelected.split(',').map(id => parseInt(id.trim(), 10));
            let allStatus200 = true;
            for (const idDelte of idsToDelete) {
                const response = await api.delete(`/expenses/${queryType}/delete/${idDelte}`)
                if (response.status !== 200) {
                    allStatus200 = false;
                }
            }
            if (allStatus200) {
                alert.success('Items excluídos.');
                setExpensesSelected('');
                handleLoadData()
            } else {
                alert.error('Erro ao excluir itens.');
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const pusNewBill = async () => {
        const routePush = await menusFilters?.filter(item => item.value === menuSelected)?.map(item => item.id);
        let queryRoute = `/financial/billsToPay/new?bill=${routePush}`
        router.push(queryRoute)
    }

    const pusBillId = async (item) => {
        let itemId = 'new';
        if (menuSelected === 'Despesas Fixas') itemId = item?.id_despesa_f;
        if (menuSelected === 'Despesas Variáveis') itemId = item?.id_despesa_v
        if (menuSelected === 'Folha de Pagamento') itemId = item?.id_pagamento_folha
        const routePush = await menusFilters?.filter(item => item.value === menuSelected)?.map(item => item.id);
        let queryRoute = `/financial/billsToPay/${itemId}?bill=${routePush}`
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

    const columnFixed = [
        { key: 'id_despesa_f', label: 'id' },
        { key: 'dt_vencimento', label: 'Vencimento', date: true },
        { key: 'descricao_desp_f', label: 'Descrição' },
        { key: 'valor_desp_f', label: 'Valor', price: true },
        { key: 'empresa_paga', label: 'Fornecedor/Empresa' },
        { key: 'status', label: 'Status', status: true },
    ];

    const columnVariable = [
        { key: 'id_despesa_v', label: 'id' },
        { key: 'dt_vencimento', label: 'Vencimento', date: true },
        { key: 'descricao_desp_v', label: 'Descrição' },
        { key: 'valor_desp_v', label: 'Valor', price: true },
        { key: 'empresa_paga_v', label: 'Fornecedor/Empresa' },
        { key: 'status_desp_v', label: 'Status', status: true },
    ];

    const columnPersonal = [
        { key: 'id_pagamento_folha', label: 'id' },
        { key: 'funcionario', label: 'Funcionário' },
        { key: 'funcao', label: 'Cargo/Função' },
        { key: 'dt_pagamento', label: 'Pagamento', date: true },
        { key: 'vl_pagamento', label: 'Salário', price: true },
        { key: 'status_pagamento', label: 'Status', status: true },
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Inativa', value: 'Inativa' },
        { label: 'Aprovado', value: 'Aprovado' },
        { label: 'Pago', value: 'Pago' },
        { label: 'Cancelada', value: 'Cancelada' },
        { label: 'Pagamento reprovado', value: 'Pagamento reprovado' },
        { label: 'Em processamento', value: 'Em processamento' },
        { label: 'Estornada', value: 'Estornada' },
        { label: 'Não Autorizado', value: 'Não Autorizado' },

    ]

    const listPayment = [
        { label: 'Todos', value: 'todos' },
        { label: 'Cartão de crédito', value: 'Cartão' },
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Pix', value: 'Pix' },
    ]

    const groupSelect = (id) => [
        {
            value: id?.toString()
        },
    ]

    const groupProstated = [
        { label: 'sim', value: 1 },
        { label: 'não', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const years = [
        { label: '2023', value: 2023 },
        { label: '2024', value: 2024 },
        { label: '2025', value: 2025 },
    ]


    let valueFixed = fixedExpenses?.map(item => parseFloat(item.valor_desp_f))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let valueVariable = variableExpenses?.map(item => parseFloat(item.valor_desp_v))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let valuePersonal = personalExpenses?.map(item => parseFloat(item.vl_pagamento))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    let totalExpenses = parseFloat(valueFixed) + parseFloat(valueVariable) + parseFloat(valuePersonal)
    let totalExpensesView = expensesData?.filter(filter)?.map(item => parseFloat(item.valor_tipo)).reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    let saldoAtual = billstToReceive?.filter(item => (item.status_parcela === 'Pago' || item.status_parcela === 'Aprovado'))
        .map(item => parseFloat(item?.valor_parcela))
        ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    let caixaResult = parseFloat(saldoAtual) - totalExpenses;
    const percentualExpenses = (parseFloat(totalExpensesView) / totalExpenses) * 100;

    return (
        <>
            <SectionHeader
                title="Contas a pagar"
                perfil={menuSelected}
            />
            <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <ContentContainer row style={{ justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 18,
                                    height: 18,
                                    aspectRatio: '1/1',
                                    backgroundImage: `url('/icons/arrow_up_green_icon.png')`,
                                    transition: '.3s',
                                }} />
                                <Text bold title style={{ color: 'green' }}>{formatter.format(parseFloat(saldoAtual))}</Text>
                            </Box>
                            <Text light>Receita</Text>
                        </Box>
                    </ContentContainer>
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
                    <ContentContainer row style={{ justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>

                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 18,
                                    height: 18,
                                    aspectRatio: '1/1',
                                    backgroundImage: caixaResult < 0 ? `url('/icons/arrow_down_red_icon.png')` : `url('/icons/arrow_up_green_icon.png')`,
                                    transition: '.3s',
                                }} />
                                <Text bold title style={{ color: caixaResult < 0 ? 'red' : 'green' }}>{formatter.format(caixaResult)}</Text>
                            </Box>
                            <Text light>Saldo Caixa</Text>
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
            <Box sx={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                <SelectList
                    data={years}
                    valueSelection={filterYear}
                    onSelect={(value) => setFilterYear(value)}
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary }}
                    clean={false}
                />
                <Box sx={{ display: 'flex', }}>
                    {monthFilter?.map((item, index) => {
                        const monthSelected = item?.value === filterMonth;
                        return (
                            <Box key={index} sx={{
                                display: 'flex',
                                padding: { xs: '7px 17px', sm: '7px 17px', md: '7px 17px', lg: '7px 17px', xl: '7px 28px' },
                                backgroundColor: monthSelected ? colorPalette.buttonColor : colorPalette.secondary,
                                border: `1px solid ${colorPalette.primary}`,
                                "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer'
                                },
                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                            }} onClick={() => setFilterMonth(item?.value)}>
                                <Text large style={{ color: monthSelected ? '#fff' : colorPalette.textColor }}>{item?.month}</Text>
                            </Box>
                        )
                    })}
                </Box>
            </Box>

            <Box sx={{ overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap' }}>
                <Box sx={{ display: 'flex', }}>
                    {menusFilters?.map((item, index) => {
                        const menu = item?.value === menuSelected;
                        return (
                            <Box key={index} sx={{
                                display: 'flex',
                                padding: '5px 28px',
                                backgroundColor: menu ? colorPalette.secondary : colorPalette.primary,
                                borderTop: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                                borderRight: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                                borderLeft: `1px solid ${!menu && (!theme ? colorPalette.secondary : 'lightgray')}`,
                                "&:hover": {
                                    opacity: !menu && 0.8,
                                    cursor: 'pointer'
                                },
                                borderRadius: '5px 5px 0px 0px',
                                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                            }} onClick={() => {
                                setMenuSelected(item?.value)
                                setColumnTable(
                                    (item?.value === 'Despesas Fixas' && columnFixed) ||
                                    (item?.value === 'Despesas Variáveis' && columnVariable) ||
                                    (item?.value === 'Folha de Pagamento' && columnPersonal)
                                )
                            }}>
                                <Text large style={{ color: colorPalette.textColor }}>{item?.text}</Text>
                            </Box>
                        )
                    })}
                </Box>
                <Box sx={{ display: 'flex', backgroundColor: colorPalette.secondary, position: 'relative', width: '100%', boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, }}>
                    <Box sx={{ display: 'flex', gap: 1, height: 30, position: 'absolute', top: 30, left: 40 }}>
                        <Button small text="Novo" style={{ width: '80px', height: '30px', borderRadius: '6px' }} onClick={() => pusNewBill()} />
                        <Button small secondary text="Excluir" style={{ width: '80px', height: '30px', borderRadius: '6px' }} onClick={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete })} />
                    </Box>
                    <div style={{ borderRadius: '8px', overflow: 'auto', marginTop: '50px', flexWrap: 'nowrap', padding: '40px 40px 20px 40px', width: '100%', }}>
                        {expensesData?.filter(filter).length > 0 ?
                            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                                <thead>
                                    <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                        <th style={{ display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                            <CheckBoxComponent
                                                boxGroup={[{ value: 'allSelect' }]}
                                                valueChecked={'select'}
                                                horizontal={true}
                                                onSelect={() => {
                                                    if (expensesSelected?.length < allSelected?.length) {
                                                        let allInstallmentSelected = expensesData?.filter(filter)?.map(item => item?.id_despesa_f)
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
                                        {columnTable?.map((item, index) => (
                                            <th key={index} style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold' }}>{item.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1, }}>
                                    {expensesData?.filter(filter)?.map((item, index) => {
                                        let itemId;
                                        if (menuSelected === 'Despesas Fixas') itemId = item?.id_despesa_f;
                                        if (menuSelected === 'Despesas Variáveis') itemId = item?.id_despesa_v
                                        if (menuSelected === 'Folha de Pagamento') itemId = item?.id_pagamento_folha
                                        const isSelected = expensesSelected?.includes(itemId) || null;

                                        return (
                                            <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary, }}>
                                                <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                    <CheckBoxComponent
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
                                                {columnTable?.map((column, colIndex) => (
                                                    <td key={colIndex} style={{ textDecoration: column?.label === 'id' ? 'underline' : 'none', padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: column?.label === 'id' ? (theme ? 'blue' : 'red') : colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}
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
                                                                                border: `1px solid ${colorPalette?.primary}`
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
                            <Box sx={{ display: 'flex', flex: 1 }}>
                                <Text light>Não existem dados para o mês selecionado</Text>
                            </Box>
                        }
                        <Box sx={{ marginTop: 2 }}>

                            <TablePagination
                                component="div"
                                count={expensesData?.length}
                                page={page}
                                onPageChange={handleChangePage}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                style={{ color: colorPalette.textColor }}
                                backIconButtonProps={{ style: { color: colorPalette.textColor } }}
                                nextIconButtonProps={{ style: { color: colorPalette.textColor } }}
                            />
                        </Box>
                    </div>
                </Box>
            </Box>
        </>
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
