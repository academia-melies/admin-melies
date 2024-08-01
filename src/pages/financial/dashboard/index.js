import { useContext, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms";
import { SectionHeader, SelectList } from "../../../organisms";
import { api } from "../../../api/api";
import { useAppContext } from "../../../context/AppContext";
import dynamic from "next/dynamic";
import { Backdrop, Tooltip } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors";
import { formatTimeStamp, formatTimeStampTimezone } from "../../../helpers";
const GraphChart = dynamic(() => import('../../../organisms/graph/graph'), { ssr: false });


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

const years = [
    { label: 'Todos', value: 'Todos' },
    { label: '2023', value: 2023 },
    { label: '2024', value: 2024 },
    { label: '2025', value: 2025 },
]

export default function ListBillsToPay(props) {

    const { setLoading, colorPalette, theme, alert } = useAppContext()
    const [billstToReceiveData, setBillstToReceiveData] = useState([])
    const [billstToPayData, setBillstToPayData] = useState([])
    const [formPaymentGraph, setFormPaymentGraph] = useState([])
    const [billstToReceiveGraph, setBillstToReceiveGraph] = useState([])
    const [billstToPayDataGraph, setBillstToPayDataGraph] = useState([])
    const [categoryExpenseGraph, setCategoryExpenseGraph] = useState()
    const [barChartLabels, setBarChartLabels] = useState([])
    const [averageTicket, setAverageTicket] = useState(0)
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [totalSales, setTotalSales] = useState(0)
    const [totalFutureSales, setTotalFutureSales] = useState(0)
    const [totalPays, setTotalPays] = useState(0)
    const [totalFuturePays, setTotalFuturePays] = useState(0)
    const [qntSales, setQntSales] = useState(0)
    const [filterOn, setFilterOn] = useState(false)
    const [filters, setFilters] = useState({
        payment: 'Todos',
        month: 'Todos',
        // year: 'Todos',
        startDate: '',
        endDate: ''
    })
    const filterFunctions = {
        payment: (item) => filters.payment !== 'Todos' ? (item?.forma_pagamento === filters?.payment) : item,
        month: (item) => filters.month !== 'Todos' ? (new Date(item?.vencimento)?.getMonth() === Number(filters.month)) : item,
        // year: (item) => filters.year !== 'Todos' ? (new Date(item?.vencimento)?.getFullYear() === filters.year) : item,
        date: (item) => (filters?.startDate !== '' && filters?.endDate !== '') ? rangeDate(item?.vencimento, filters?.startDate, filters?.endDate) : item,
    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };
    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Ajustar as datas para o mesmo horário local
        const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        const localStart = new Date(start.getTime() + start.getTimezoneOffset() * 60000);
        const localEnd = new Date(end.getTime() + end.getTimezoneOffset() * 60000);

        return localDate >= localStart && localDate <= localEnd;
    }

    const getBillsReceive = async () => {
        setLoading(true)

        try {
            const response = await api.get('/student/installments')
            const { data } = response;
            setBillstToReceiveData(data)
            return data;
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const getBillsPay = async () => {
        setLoading(true)
        try {
            const response = await api.get('/expenses/allList')
            const { data } = response;
            const Values = await mapExpenseData(data?.expenses, 'dt_vencimento');
            const personalValues = await mapExpenseData(data?.personal, 'dt_pagamento');

            setBillstToPayData({ expenses: Values, personal: personalValues })
            return { expenses: Values, personal: personalValues }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setShowFilters(false)
    }, [filterOn])

    const fetchData = async () => {
        const billstReceive = await getBillsReceive();
        const billstPay = await getBillsPay();

        if (billstPay) {
            handleCalculationGraph(billstReceive, billstPay);
        }
    }

    const mapExpenseData = (data, field) => {
        return data?.map(item => ({
            ...item,
            vencimento: item[field]
        }));
    };

    useEffect(() => {
        fetchData();
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
    }, []);


    const handleCalculationGraph = async (billstReceive, billstPay) => {
        const currentDate = new Date()
        const start = new Date(filters?.startDate);
        const end = new Date(filters?.endDate);
        const localStart = new Date(start.getTime() + start.getTimezoneOffset() * 60000);
        const localEnd = new Date(end.getTime() + end.getTimezoneOffset() * 60000);

        let billsExpenses = billstPay?.expenses?.filter(filter);
        let billsPersonal = billstPay?.personal?.filter(filter);

        let fixed = billsExpenses?.length > 0 ? billsExpenses?.filter(item => new Date(item?.vencimento) <= currentDate)?.map(item => item.valor_desp) : []
        let personal = billsPersonal?.length > 0 ? billsPersonal?.filter(item => new Date(item?.vencimento) <= currentDate)?.map(item => item.vl_pagamento) : []
        const filteredFixed = fixed?.length > 0 ? fixed?.reduce((acc, curr) => acc + curr, 0) : 0
        const filteredPersonal = personal?.length > 0 ? personal?.reduce((acc, curr) => acc + curr, 0) : 0

        let fixedFuture = billsExpenses?.length > 0 ? billsExpenses?.filter(item => new Date(item?.vencimento) > currentDate)?.map(item => item.valor_desp) : []
        let personalFuture = billsPersonal?.length > 0 ? billsPersonal?.filter(item => new Date(item?.vencimento) > currentDate)?.map(item => item.vl_pagamento) : []
        const filteredFixedFuture = fixedFuture?.length > 0 ? fixed?.reduce((acc, curr) => acc + curr, 0) : 0
        const filteredPersonalFuture = personalFuture?.length > 0 ? personal?.reduce((acc, curr) => acc + curr, 0) : 0

        setTotalPays(filteredFixed + filteredPersonal)
        setTotalFuturePays(filteredFixedFuture + filteredPersonalFuture)


        let data = billstReceive?.filter(filter);
        let dataGraphReceivedAndFuture = data?.filter(item => (item?.status_parcela === 'Pago' || item?.status_parcela === 'Aprovado' ||
            item?.status_parcela === 'Pendente'))

        let qntSalesValue = data?.length;
        let totalSalesValue = data?.filter(item => (item?.status_parcela === 'Pago' || item?.status_parcela === 'Aprovado'))?.map(item => item?.valor_parcela)?.reduce((acc, curr) => acc += curr, 0) || 0;

        let totalSalesFutureValue = data?.filter(item => new Date(item?.vencimento) >= (filters?.startDate !== '' ?
            localStart : currentDate) && item?.status_parcela === 'Pendente')?.map(item => item?.valor_parcela)?.reduce((acc, curr) => acc += curr, 0) || 0;
        let averageTicketValue = (totalSalesValue && totalSalesFutureValue) ? ((totalSalesValue + totalSalesFutureValue) / qntSalesValue).toFixed(2) :
            totalSalesValue ? (totalSalesValue / qntSalesValue).toFixed(2) : 0


        setQntSales(qntSalesValue);
        setTotalSales(totalSalesValue)
        setAverageTicket(averageTicketValue);
        setTotalFutureSales(totalSalesFutureValue)
        setTotalFuturePays

        const { series, labels } = processChartData(dataGraphReceivedAndFuture);
        setFormPaymentGraph({ series, labels });

        let expenseData = [];
        let totalExpenses = 0;
        if (billstPay?.expenses) {
            expenseData = billstPay?.expenses?.filter(filter);
            totalExpenses = expenseData?.reduce((acc, expense) => acc + expense?.valor_desp, 0);
        }

        let personalData = [];
        let totalPersonal = 0;
        if (billstPay?.personal) {
            personalData = billstPay?.personal?.filter(filter);
            totalPersonal = personalData?.reduce((acc, expense) => acc + expense?.vl_pagamento, 0);
        }


        setCategoryExpenseGraph({
            labels: ['Despesas', 'Folha de pagamento'],
            series: [totalExpenses, totalPersonal]
        });


        const monthlyData = processMonthlyData(dataGraphReceivedAndFuture);
        const formattedSeries = monthlyData?.series?.map(valor => (valor).toFixed(2));
        setBillstToReceiveGraph(formattedSeries);
        setBarChartLabels(monthlyData.labels);
    }


    useEffect(() => {
        handleCalculationGraph(billstToReceiveData, billstToPayData)
        setShowFilterMobile(false)

    }, [filters])

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const getFormattedValue = (value) => {
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
        return formatter.format(value);
    };


    const data = {
        series: formPaymentGraph?.series || [],
        options: {
            labels: formPaymentGraph?.labels || [],
            tooltip: {
                y: {
                    formatter: function (value) {
                        return getFormattedValue(value);
                    }
                }
            }
        },

    };

    const dataPay = {
        series: categoryExpenseGraph?.series || [],
        options: {
            labels: categoryExpenseGraph?.labels || [],
            tooltip: {
                y: {
                    formatter: function (value) {
                        return getFormattedValue(value);
                    }
                }
            }
        },

    };

    const revenueXexpense = {
        series: [totalSales, totalPays] || [],
        options: {
            labels: ['Receita', 'Despesa'] || [],
            colors: ['#008435', '#ff4d4d'],
            tooltip: {
                y: {
                    formatter: function (value) {
                        return getFormattedValue(value);
                    }
                }
            }
        },

    };


    const processChartData = (data) => {
        const paymentMethods = {};

        data.forEach(item => {
            const { forma_pagamento, valor_parcela } = item;
            if (!paymentMethods[forma_pagamento]) {
                paymentMethods[forma_pagamento] = 0;
            }
            paymentMethods[forma_pagamento] += valor_parcela;
        });

        const series = Object.values(paymentMethods);
        const labels = Object.keys(paymentMethods);

        return { series, labels };
    };

    const processMonthlyData = (data) => {
        const monthlyData = {};

        data.forEach(item => {
            const { vencimento, valor_parcela } = item;
            const date = new Date(vencimento);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const key = `${year}-${month.toString().padStart(2, '0')}`;

            if (!monthlyData[key]) {
                monthlyData[key] = 0;
            }

            monthlyData[key] += valor_parcela;
        });

        const sortedMonthlyData = Object.entries(monthlyData)
            .sort((a, b) => a[0].localeCompare(b[0]));

        const series = sortedMonthlyData.map(([_, value]) => value);
        const labels = sortedMonthlyData.map(([key, _]) => {
            const [year, month] = key.split('-');
            const monthNames = [
                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
            ];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        });

        return { series, labels };
    };


    const listPaymentType = [
        { label: 'Todos', value: 'Todos' },
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Cartão', value: 'Cartão' },
        { label: 'Pix', value: 'Pix' },
    ]


    return (
        <>
            <SectionHeader
                title="Resumo Financeiro"
            />


            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{
                        display: 'flex', gap: 1
                    }}>
                        <Box sx={{
                            display: 'flex', padding: '8px 18px', borderRadius: 5, border: `1px solid lightgray`, backgroundColor: colorPalette?.secondary, gap: 1,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowFilters(!showFilters)}>
                            <Text bold>Filtros</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 20,
                                height: 20,
                                aspectRatio: '1/1',
                                backgroundColor: '#fff',
                                backgroundImage: `url('/icons/${!showFilters ? 'add_icon' : 'gray_arrow_down'}.png')`,
                                // transition: '.3s',
                            }} />

                        </Box>

                        <Box sx={{
                            display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowFilters(!showFilters)}>
                            {(filters?.endDate && filters?.startDate) && <Box sx={{
                                display: 'flex', padding: '8px 18px', borderRadius: 5, border: `1px solid lightgray`, backgroundColor: colorPalette?.secondary, gap: 1
                            }}>
                                <Text small>{formatTimeStampTimezone(filters?.startDate)}</Text>
                                <Text small bold>até:</Text>
                                <Text small>{formatTimeStampTimezone(filters?.endDate)}</Text>
                            </Box>}


                            {(filters?.payment && filters?.payment.toLocaleLowerCase() !== 'todos') && <Box sx={{
                                display: 'flex', padding: '8px 18px', borderRadius: 5, border: `1px solid lightgray`, backgroundColor: colorPalette?.secondary, gap: 1
                            }}>
                                <Text small bold>Pagamento:</Text>
                                <Text small>{filters?.payment}</Text>
                            </Box>}

                            {(filters?.year && filters?.payment.toLocaleLowerCase() !== 'todos') && <Box sx={{
                                display: 'flex', padding: '8px 18px', borderRadius: 5, border: `1px solid lightgray`, backgroundColor: colorPalette?.secondary, gap: 1
                            }}>
                                <Text bold small>Ano:</Text>
                                <Text small>{filters?.year}</Text>
                            </Box>}
                        </Box>
                    </Box>


                    <Box sx={{ display: 'flex' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {

                            setFilters({
                                payment: 'Todos',
                                month: 'Todos',
                                // year: 'Todos',
                                startDate: ``,
                                endDate: ``
                            })
                        }} />
                    </Box>
                </Box>
                {showFilters &&
                    <ContentContainer sx={{
                        display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' },
                        position: 'absolute', top: 45
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>

                                <SelectList
                                    data={listPaymentType}
                                    valueSelection={filters?.payment || ''}
                                    onSelect={(value) => {
                                        setFilters({ ...filters, payment: value })
                                    }}
                                    filterOpition="value"
                                    sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                                    title="Pagamento"
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    clean={false}
                                />
                                {/* <SelectList
                                    data={years}
                                    title="Ano"
                                    valueSelection={filters?.year}
                                    onSelect={(value) => {
                                        setFilters({ ...filters, year: value })
                                    }}
                                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                    filterOpition="value"
                                    sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                                    clean={false}
                                /> */}

                                <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                                <TextInput label="Até:" name='endDate' onChange={(e) => {
                                    setFilters({ ...filters, endDate: e.target.value })
                                }} type="date" value={(filters?.endDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />

                                <Box sx={{ display: 'flex' }}>
                                    <Button text="Filtrar" style={{ width: '120px', borderRadius: 2 }} onClick={() => setFilterOn(!filterOn)} />
                                </Box>
                            </Box>
                        </Box>
                    </ContentContainer>}
            </Box>

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
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
                        <Box sx={{
                            display: 'flex', gap: 2, alignItems: 'start', flexDirection: 'column', width: '100%',
                        }}>
                            <SelectList
                                fullWidth
                                data={listPaymentType}
                                valueSelection={filters?.payment || ''}
                                onSelect={(value) => setFilters({ ...filters, payment: value })}
                                filterOpition="value"
                                sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                                title="Pagamento"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                clean={false}
                            />
                            {/* <SelectList
                                fullWidth
                                data={years}
                                title="Ano"
                                valueSelection={filters?.year}
                                onSelect={(value) => setFilters({ ...filters, year: value })}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                filterOpition="value"
                                sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                                clean={false}
                            /> */}
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>


            <Box sx={{ display: 'flex', gap: 2, flex: 1, flexDirection: 'column' }}>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'row', xl: 'row' }, flex: 1 }}>

                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold style={{ color: 'green' }}>{formatter.format(totalSales)}</Text>
                            </Box>
                            <Box sx={{ display: 'flex', gap: .5 }}>
                                <Text large light>Total Recebido</Text>
                                <Tooltip title={"Valores Recebidos e em processamento"}>
                                    <div>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 12,
                                            height: 12,
                                            aspectRatio: '1/1',
                                            backgroundColor: '#fff',
                                            backgroundImage: `url('/icons/about.png')`,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                opacity: 0.8
                                            }
                                        }} />
                                    </div>
                                </Tooltip>
                            </Box>
                        </Box>
                    </ContentContainer>


                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold style={{ color: 'green' }}>{formatter.format(totalFutureSales)}</Text>
                            </Box>

                            <Box sx={{ display: 'flex', gap: .5 }}>
                                <Text large light>Total á Receber</Text>
                                <Tooltip title={`Valores com status "Pendente"`}>
                                    <div>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 12,
                                            height: 12,
                                            aspectRatio: '1/1',
                                            backgroundColor: '#fff',
                                            backgroundImage: `url('/icons/about.png')`,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                opacity: 0.8
                                            }
                                        }} />
                                    </div>
                                </Tooltip>
                            </Box>
                        </Box>
                    </ContentContainer>

                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold>{qntSales || 0}</Text>
                            </Box>
                            <Text large light>Venda Realizadas</Text>
                        </Box>
                    </ContentContainer>

                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold style={{ color: 'green' }}>{formatter.format(averageTicket)}</Text>
                            </Box>
                            <Text large light>Ticket médio</Text>
                        </Box>
                    </ContentContainer>


                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title style={{ color: 'red' }}>{formatter.format(totalPays)}</Text>
                            </Box>
                            <Text large light>Saídas</Text>
                        </Box>
                    </ContentContainer>

                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title style={{ color: 'red' }}>{formatter.format(totalFuturePays)}</Text>
                            </Box>
                            <Text large light>Saídas futuras</Text>
                        </Box>
                    </ContentContainer>

                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'row', xl: 'row' }, flex: 1 }}>
                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3 }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 25,
                                height: 25,
                                aspectRatio: '1/1',
                                backgroundColor: '#fff',
                                backgroundImage: `url('/icons/graph_icon.png')`,
                                transition: '.3s',
                            }} />
                            <Text bold large>Valores recebidos e á receber</Text>
                        </Box>

                        <GraphChart
                            options={{
                                fill: {
                                    type: 'gradient / solid / pattern / image'
                                },
                                xaxis: {
                                    categories: barChartLabels,
                                },
                                tooltip: {
                                    y: {
                                        formatter: function (value) {
                                            return getFormattedValue(value);
                                        }
                                    }
                                }
                            }}

                            type="bar"
                            series={[{
                                data: billstToReceiveGraph,
                            }]}
                            height={300}
                        />
                    </ContentContainer>
                    {/* 
                    <ContentContainer style={{ borderRadius: 2, border: `solid 1px lightgray` }}>

                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold style={{ color: 'green' }}>{formatter.format(totalSales)}</Text>
                            </Box>
                            <Text large light>Total Recebido</Text>
                        </Box>
                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold style={{ color: 'green' }}>{formatter.format(totalSales)}</Text>
                            </Box>
                            <Text large light>Total Recebido</Text>
                        </Box>
                        <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                            <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                <Text title bold style={{ color: 'green' }}>{formatter.format(totalSales)}</Text>
                            </Box>
                            <Text large light>Total Recebido</Text>
                        </Box>
                    </ContentContainer> */}

                </Box>

                <Box sx={{ display: 'flex', gap: 2, flex: 1, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'column', xl: 'row' }, }}>

                    <ContentContainer fullWidth style={{ borderRadius: 2, border: `solid 1px lightgray` }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 25,
                                height: 25,
                                aspectRatio: '1/1',
                                backgroundColor: '#fff',
                                transition: 'background-color 1s',
                                backgroundImage: `url('/icons/financial_icon.png')`,
                                transition: '.3s',
                            }} />
                            <Text bold large>Receita X Despesa</Text>
                        </Box>
                        <div style={{ justifyContent: 'center', width: '80%', alignItems: 'center', margin: 'auto' }}>

                            <GraphChart
                                options={revenueXexpense?.options}
                                series={revenueXexpense?.series}
                                type="pie"
                                height={280}
                                width={300}
                            />
                        </div>
                    </ContentContainer>


                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', flex: 1 }}>
                        <ContentContainer fullWidth sx={{
                            flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'column', xl: 'row' }, borderRadius: 2, border: `solid 1px lightgray`
                        }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 25,
                                    height: 25,
                                    aspectRatio: '1/1',
                                    backgroundColor: '#fff',
                                    backgroundImage: `url('/icons/wallet_icon.png')`,
                                    transition: '.3s',
                                }} />
                                <Text bold large>Formas de pagamento</Text>
                            </Box>
                            <div style={{ justifyContent: 'center', width: '80%', alignItems: 'center', margin: 'auto' }}>

                                <GraphChart
                                    options={data?.options}
                                    series={data?.series}
                                    type="pie"
                                    height={280}
                                    width={300}
                                />
                            </div>
                        </ContentContainer>

                        <ContentContainer style={{ borderRadius: 2, border: `solid 1px lightgray` }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', }}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    width: 25,
                                    height: 25,
                                    aspectRatio: '1/1',
                                    backgroundColor: '#fff',
                                    backgroundImage: `url('/icons/wallet_icon.png')`,
                                    transition: '.3s',
                                }} />
                                <Text bold large>Despesas (Por categoria)</Text>
                            </Box>
                            <div style={{ justifyContent: 'center', width: '80%', alignItems: 'center', margin: 'auto' }}>

                                <GraphChart
                                    options={dataPay?.options}
                                    series={dataPay?.series}
                                    type="pie"
                                    height={280}
                                    width={300}
                                />
                            </div>
                        </ContentContainer>

                    </Box>
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