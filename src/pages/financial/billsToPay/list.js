import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatDate, formatTimeStamp } from "../../../helpers"
import { Avatar, TablePagination } from "@mui/material"

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
    { id: '01', text: 'Despesas Fixas', value: 'Despesas Fixas' },
    { id: '02', text: 'Despesas Variáveis', value: 'Despesas Variáveis' },
    { id: '03', text: 'Folha de Pagamento', value: 'Folha de Pagamento' },
]

export default function ListBillsToPay(props) {
    const [fixedExpenses, setFixedExpenses] = useState([])
    const [expensesData, setExpensesData] = useState([])
    const [variableExpenses, setVariableExpenses] = useState([])
    const [personalExpenses, setPersonalExpenses] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, theme } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterYear, setFilterYear] = useState(2023)
    const [filterMonth, setFilterMonth] = useState(9)
    const [filterPayment, setFilterPayment] = useState('todos')
    const [installmentsSelected, setInstallmentsSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [menuSelected, setMenuSelected] = useState('Despesas Fixas')
    const [columnTable, setColumnTable] = useState([])
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]

    // const filter = (item) => {
    //     const normalizeString = (str) => {
    //         return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //     };
    //     const normalizedFilterData = normalizeString(filterData);

    //     const matchesFilterData = (
    //         normalizeString(item?.aluno)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) ||
    //         normalizeString(item?.pagante)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
    //     );

    //     const matchesFilterActive = (
    //         filterAtive === 'todos' ||
    //         normalizeString(item?.status_parcela) === filterAtive
    //     );

    //     const matchesFilterPayment = (
    //         filterPayment === 'todos' ||
    //         item.forma_pagamento === filterPayment
    //     );

    //     return matchesFilterData && matchesFilterActive && matchesFilterPayment;
    // };

    const filter = (item) => {
        let date = new Date(item?.dt_vencimento)
        let monthSelect = date.getMonth()
        return monthSelect === filterMonth;
    }

    useEffect(() => {
        if (menuSelected === 'Despesas Fixas') getFixedExpenses('fixed');
        if (menuSelected === 'Despesas Variáveis') { getVariableExpenses('fixed') }
        if (menuSelected === 'Folha de Pagamento') { getPersonalExpenses('personal') }
    }, [menuSelected]);



    useEffect(() => {
        setColumnTable([
            { key: 'id_despesa_f', label: 'id' },
            { key: 'dt_vencimento', label: 'Vencimento', date: true },
            { key: 'descricao_desp_f', label: 'Descrição' },
            { key: 'valor_desp_f', label: 'Valor', price: true },
            { key: 'empresa_paga', label: 'Fornecedor/Empresa' },
            { key: 'status', label: 'Status' },
        ])
        const dateNow = new Date()
        let monthNow = dateNow.getMonth()
        setFilterMonth(monthNow)
    }, []);

    const getFixedExpenses = async (typeExpense) => {
        setLoading(true)
        try {
            const response = await api.get(`/expenses/${typeExpense}`)
            const { data } = response;
            const groupIds = data?.map(ids => ids?.id_parcela_matr).join(',');
            setAllSelected(groupIds)
            setFixedExpenses(data)
            setExpensesData(data.map(item => {
                const valorDespF = parseFloat(item.valor_desp_f);
                return {
                    ...item,
                    valor_tipo: isNaN(valorDespF) ? item.valor_desp_f : valorDespF.toFixed(2)
                };
            }));
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
            setExpensesData(data.map(item => {
                const valorDespF = parseFloat(item.valor_desp_v);
                return {
                    ...item,
                    valor_tipo: isNaN(valorDespF) ? item.valor_desp_v : valorDespF.toFixed(2)
                };
            }));
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
            setExpensesData(data.map(item => {
                const valorDespF = parseFloat(item.vl_pagamento);
                return {
                    ...item,
                    valor_tipo: isNaN(valorDespF) ? item.vl_pagamento : valorDespF.toFixed(2)
                };
            }));
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

    const pusNewBill = async () => {
        const routePush = await menusFilters?.filter(item => item.value === menuSelected)?.map(item => item.id);
        let queryRoute = `/financial/billsToPay/new?bill=${routePush}`
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
        { key: 'status', label: 'Status' },
    ];

    const columnVariable = [
        { key: 'id_despesa_v', label: 'id' },
        { key: 'dt_vencimento', label: 'Vencimento', date: true },
        { key: 'descricao_desp_v', label: 'Descrição' },
        { key: 'valor_desp_v', label: 'Valor', price: true },
        { key: 'empresa_paga_v', label: 'Fornecedor/Empresa' },
        { key: 'status_desp_v', label: 'Status' },
    ];

    const columnPersonal = [
        { key: 'id_pagamento_folha', label: 'id' },
        { key: 'funcionario', label: 'Funcionário' },
        { key: 'cargo', label: 'Cargo/Função' },
        { key: 'dt_pagamento', label: 'Curso', date: true },
        { key: 'vl_pagamento', label: 'Salário', price: true },
        { key: 'status_pagamento', label: 'Status' },
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

    // const sortedInstallments = [...installmentsList].sort((a, b) => {
    //     const dateA = new Date(a.vencimento);
    //     const dateB = new Date(b.vencimento);

    //     return dateA - dateB;
    // });

    // const totalValueToReceive = (status) => installmentsList
    //     ?.filter(item => item?.status_parcela === status)
    //     ?.map(item => item?.valor_parcela)
    //     ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);


    // const totalValueCanceled = installmentsList
    //     ?.filter(item => (item?.status_parcela === 'Cancelada') || (item?.status_parcela === 'Inativa'))
    //     ?.map(item => item?.valor_parcela)
    //     ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);


    let valueFixed = fixedExpenses?.map(item => parseFloat(item.valor_desp_f))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let valueVariable = variableExpenses?.map(item => parseFloat(item.valor_desp_v))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let valuePersonal = personalExpenses?.map(item => parseFloat(item.vl_pagamento))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    let totalExpenses = parseFloat(valueFixed) + parseFloat(valueVariable) + parseFloat(valuePersonal)
    let totalExpensesView = expensesData?.filter(filter)?.map(item => parseFloat(item.valor_tipo)).reduce((acc, currentValue) => acc + (currentValue || 0), 0)

    let saldoAtual = '130000.500'
    const percentualExpenses = (parseFloat(totalExpensesView) / totalExpenses) * 100;


    return (
        <>
            <SectionHeader
                title="Contas a pagar"
                perfil={menuSelected}
            />
            <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>

                <ContentContainer fullWidth row style={{ justifyContent: 'space-around' }}>
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
                            <Text bold title style={{ color: 'red' }}>{formatter.format(parseFloat('5800.90'))}</Text>
                        </Box>
                        <Text light>XXX</Text>
                    </Box>
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
                        <Text light>Saldo Atual</Text>
                    </Box>
                </ContentContainer>

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
            <Box sx={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                                padding: '7px 28px',
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
                        <Button small secondary text="Excluir" style={{ width: '80px', height: '30px', borderRadius: '6px' }} />
                        <Button small text="Novo Fornecedor/Empresa" style={{ width: '200px', height: '30px', borderRadius: '6px' }} />
                    </Box>
                    <div style={{ borderRadius: '8px', overflow: 'auto', marginTop: '50px', flexWrap: 'nowrap', padding: '40px 40px 20px 40px', width: '100%', }}>
                        <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                            <thead>
                                <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                    {columnTable?.map((item, index) => (
                                        <th key={index} style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: item.label === 'id' ? '20px' : '100px' }}>{item.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody style={{ flex: 1, }}>
                                {expensesData?.filter(filter)?.map((item, index) => {
                                    return (
                                        <tr key={index} style={{ backgroundColor: colorPalette?.secondary }}>
                                            {columnTable?.map((column, colIndex) => (
                                                <td key={colIndex} style={{ padding: '8px 0px', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                    {item[column?.key] ? (
                                                        <Box>
                                                            {column.avatar && <Avatar sx={{ width: 27, height: 27, fontSize: 14 }} src={item[column?.avatarUrl || '']} />}

                                                            {typeof item[column.key] === 'object' && item[column?.key || '-'] instanceof Date ? (
                                                                formatTimeStamp(item[column?.key || '-'])
                                                            ) :
                                                                (column.date ? formatDate(item[column?.key]) : column.price ? formatter.format(parseFloat((item[column?.key]))) : item[column?.key || '-'])
                                                            }
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


            {installmentsSelected && <>
                <Box sx={{ display: 'flex', position: 'fixed', left: 280, bottom: 20, display: 'flex', gap: 2 }}>
                    <Button text="Baixar" style={{ width: '120px', height: '40px' }} />
                    <Button secondary text="Restaurar parcelas" style={{ width: '200px', height: '40px', backgroundColor: colorPalette.primary }} />
                    <Button secondary text="Excluir" style={{ width: '120px', height: '40px', backgroundColor: colorPalette.primary }} />
                </Box>
                <Box sx={{ display: 'flex', position: 'fixed', right: 60, bottom: 20, display: 'flex', gap: 2 }}>
                    <Button text="Salvar" style={{ width: '120px', height: '40px' }} />
                </Box>
            </>
            }
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
