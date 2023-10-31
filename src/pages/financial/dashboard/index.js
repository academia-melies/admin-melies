import { useContext, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Text } from "../../../atoms";
import { SectionHeader, SelectList } from "../../../organisms";
import { api } from "../../../api/api";
import { useAppContext } from "../../../context/AppContext";
import dynamic from "next/dynamic";
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
    const [formPaymentGraph, setFormPaymentGraph] = useState([])
    const [billstToReceiveGraph, setBillstToReceiveGraph] = useState([])
    const [barChartLabels, setBarChartLabels] = useState([])
    const [averageTicket, setAverageTicket] = useState(0)
    const [totalSales, setTotalSales] = useState(0)
    const [qntSales, setQntSales] = useState(0)
    const [filters, setFilters] = useState({
        payment: 'Todos',
        month: 'Todos',
        year: 'Todos'
    })
    const filterFunctions = {
        payment: (item) => filters.payment !== 'Todos' ? (item.forma_pagamento === filters?.payment) : item,
        month: (item) => filters.month !== 'Todos' ? (new Date(item.vencimento).getMonth() === Number(filters.month)) : item,
        year: (item) => filters.year !== 'Todos' ? (new Date(item.vencimento).getFullYear() === filters.year) : item,

    };

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };

    const getBillsReceive = async () => {
        setLoading(true)
        try {
            const response = await api.get('/student/installments')
            const { data } = response;
            setBillstToReceiveData(data)
            handleCalculationGraph()
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getBillsReceive()
        setFilters({
            payment: 'Todos',
            month: 'Todos',
            year: 'Todos'
        })
    }, [])

    const handleCalculationGraph = async () => {
        let data = billstToReceiveData?.filter(filter);
        let qntSalesValue = data?.length;
        let totalSalesValue = data?.map(item => item.valor_parcela)?.reduce((acc, curr) => acc += curr, 0) || 0;
        let averageTicketValue = totalSalesValue ? (totalSalesValue / qntSalesValue).toFixed(2) : 0

        setQntSales(qntSalesValue);
        setTotalSales(totalSalesValue)
        setAverageTicket(averageTicketValue);

        const { series, labels } = processChartData(data);
        setFormPaymentGraph({ series, labels });

        const monthlyData = processMonthlyData(data);
        const formattedSeries = monthlyData?.series?.map(valor => (valor).toFixed(2));
        setBillstToReceiveGraph(formattedSeries);
        setBarChartLabels(monthlyData.labels);
    }

    useEffect(() => {
        handleCalculationGraph()
    }, [filters, billstToReceiveData])

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
                title="Dashboard"
            />

            <ContentContainer>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SelectList data={listPaymentType} valueSelection={filters?.payment || ''} onSelect={(value) => setFilters({ ...filters, payment: value })}
                        filterOpition="value" sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                        title="Pagamento"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        clean={false}
                    />

                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: 30 }} onClick={() => setFilters({
                            payment: 'Todos',
                            month: 'Todos',
                            year: 'Todos'
                        })} />
                    </Box>
                </Box>
            </ContentContainer>

            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', gap: 5 }}>
                <SelectList
                    data={years}
                    valueSelection={filters?.year}
                    onSelect={(value) => setFilters({ ...filters, year: value })}
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary }}
                    clean={false}
                />
                <Box sx={{ display: 'flex', }}>
                    {monthFilter?.map((item, index) => {
                        const monthSelected = item?.value === filters?.month;
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
                            }} onClick={() => setFilters({ ...filters, month: item?.value })}>
                                <Text large style={{ color: monthSelected ? '#fff' : colorPalette.textColor }}>{item?.month}</Text>
                            </Box>
                        )
                    })}
                </Box>
            </Box>



            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', flex: 1 }}>
                    <ContentContainer>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 3 }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 25,
                                height: 25,
                                aspectRatio: '1/1',
                                backgroundColor: '#fff',
                                backgroundImage: `url('/icons/sale_icon.png')`,
                                transition: '.3s',
                            }} />
                            <Text bold large>Vendas</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, }}>

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', }}>

                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text large bold>{qntSales || 0}</Text>
                                    </Box>
                                    <Text light>Quantidade de vendas</Text>
                                </Box>
                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text large bold>{formatter.format(averageTicket)}</Text>
                                    </Box>
                                    <Text light>Ticket médio</Text>
                                </Box>
                            </Box>
                            <Box sx={{
                                display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'end', justifyContent: 'end',
                                gap: .5, flex: 1
                            }}>
                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                    <Text bold title>{formatter.format(totalSales)}</Text>
                                </Box>
                                <Text light>Total em vendas</Text>
                            </Box>
                        </Box>
                    </ContentContainer>
                    <ContentContainer fullWidth>

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
                            <Text bold large>Valores a receber</Text>
                        </Box>

                        <GraphChart
                            options={{

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
                            height={350}
                        />
                    </ContentContainer>

                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', flex: 1 }}>
                    <ContentContainer>
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
                        <div style={{ justifyContent: 'center', width: '100%', alignItems: 'center', display: 'flex' }}>

                            <GraphChart
                                options={data?.options}
                                series={data?.series}
                                type="pie"
                                height={350}
                                width={370}
                            />
                        </div>
                    </ContentContainer>
                    <ContentContainer fullWidth>
                        <Text bold large>Despesas (Por categoria)</Text>
                    </ContentContainer>

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