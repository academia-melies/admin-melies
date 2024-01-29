import { useContext, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../../../atoms";
import { SectionHeader, SelectList } from "../../../organisms";
import { api } from "../../../api/api";
import { useAppContext } from "../../../context/AppContext";
import dynamic from "next/dynamic";
import { Backdrop } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors";
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
    const [totalSales, setTotalSales] = useState(0)
    const [totalPays, setTotalPays] = useState(0)
    const [qntSales, setQntSales] = useState(0)
    const [filters, setFilters] = useState({
        payment: 'Todos',
        month: 'Todos',
        year: 'Todos'
    })
    const filterFunctions = {
        payment: (item) => filters.payment !== 'Todos' ? (item?.forma_pagamento === filters?.payment) : item,
        month: (item) => filters.month !== 'Todos' ? (new Date(item?.vencimento)?.getMonth() === Number(filters.month)) : item,
        year: (item) => filters.year !== 'Todos' ? (new Date(item?.vencimento)?.getFullYear() === filters.year) : item,
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
            const fixedValues = await mapExpenseData(data?.fixed, 'dt_vencimento');
            const variableValues = await mapExpenseData(data?.variable, 'dt_vencimento');
            const personalValues = await mapExpenseData(data?.personal, 'dt_pagamento');

            setBillstToPayData({ fixed: fixedValues, variable: variableValues, personal: personalValues })
            return { fixed: fixedValues, variable: variableValues, personal: personalValues }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

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
    }, []);


    const handleCalculationGraph = async (billstReceive, billstPay) => {
        let billsFixed = billstPay?.fixed?.filter(filter);
        let billsVariable = billstPay?.variable?.filter(filter);
        let billsPersonal = billstPay?.personal?.filter(filter);

        let fixed = billsFixed?.map(item => parseFloat(item.valor_desp_f))?.reduce((acc, curr) => acc + curr, 0)
        let variable = billsVariable?.map(item => parseFloat(item.valor_desp_v))?.reduce((acc, curr) => acc + curr, 0)
        let personal = billsPersonal?.map(item => parseFloat(item.vl_pagamento))?.reduce((acc, curr) => acc + curr, 0)
        setTotalPays(fixed + variable + personal)

        let data = billstReceive?.filter(filter);
        let qntSalesValue = data?.length;
        let totalSalesValue = data?.map(item => item?.valor_parcela)?.reduce((acc, curr) => acc += curr, 0) || 0;
        let averageTicketValue = totalSalesValue ? (totalSalesValue / qntSalesValue).toFixed(2) : 0

        setQntSales(qntSalesValue);
        setTotalSales(totalSalesValue)
        setAverageTicket(averageTicketValue);


        const { series, labels } = processChartData(data);
        setFormPaymentGraph({ series, labels });

        let fixedData = [];
        let totalFixed = 0;
        if (billstPay?.fixed) {
            fixedData = billstPay?.fixed?.filter(filter);
            totalFixed = fixedData?.reduce((acc, expense) => acc + expense?.valor_desp_f, 0);
        }

        let variableData = [];
        let totalVariable = 0;
        if (billstPay?.variable) {
            variableData = billstPay?.variable?.filter(filter);
            totalVariable = variableData?.reduce((acc, expense) => acc + expense?.valor_desp_v, 0);
        }

        let personalData = [];
        let totalPersonal = 0;
        if (billstPay?.personal) {
            personalData = billstPay?.personal?.filter(filter);
            totalPersonal = personalData?.reduce((acc, expense) => acc + expense?.vl_pagamento, 0);
        }


        setCategoryExpenseGraph({
            labels: ['Fixa', 'Variável', 'Folha de pagamento'],
            series: [totalFixed, totalVariable, totalPersonal]
        });


        const monthlyData = processMonthlyData(data);
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

            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>

                        <SelectList
                            data={listPaymentType}
                            valueSelection={filters?.payment || ''}
                            onSelect={(value) => setFilters({ ...filters, payment: value })}
                            filterOpition="value"
                            sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                            title="Pagamento"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            clean={false}
                        />
                        <SelectList
                            data={years}
                            title="Ano"
                            valueSelection={filters?.year}
                            onSelect={(value) => setFilters({ ...filters, year: value })}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            filterOpition="value"
                            sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: 30 }} onClick={() => setFilters({
                            payment: 'Todos',
                            month: 'Todos',
                            year: 'Todos'
                        })} />
                    </Box>
                </Box>
            </ContentContainer>


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
                            <SelectList
                                fullWidth
                                data={years}
                                title="Ano"
                                valueSelection={filters?.year}
                                onSelect={(value) => setFilters({ ...filters, year: value })}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                filterOpition="value"
                                sx={{ color: colorPalette.textColor, maxWidth: 300 }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => setFilters({
                                payment: 'Todos',
                                month: 'Todos',
                                year: 'Todos'
                            })} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>


            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'center', gap: 5, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'row', xl: 'row' } }}>
                <Box sx={{
                    display: 'flex', justifyContent: { xs: 'center', sm: 'center', md: 'center', lg: 'center', xl: 'center' },
                    flexWrap: { xs: 'wrap', sm: 'nowrap', md: 'nowrap', lg: 'nowrap', xl: 'nowrap' }
                }}>
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


            <Box sx={{ display: 'flex', gap: 2, flex: 1, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'row', xl: 'row' }, flex: 1 }}>
                    <ContentContainer fullWidth>
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
                            <Text bold large>Balanço Financeiro</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, }}>

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', padding: '0px 40px' }}>

                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text large bold style={{ color: 'green' }}>{formatter.format(totalSales)}</Text>
                                    </Box>
                                    <Text light>Receita</Text>
                                </Box>
                                <Divider distance={0} />
                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text large bold style={{ color: totalSales < totalPays ? 'red' : 'green' }}>{formatter.format(totalPays)}</Text>
                                    </Box>
                                    <Text light>Despesa</Text>
                                </Box>
                                <Divider distance={0} />
                                <Box sx={{
                                    display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    gap: .5, flex: 1
                                }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            ...styles.menuIcon,
                                            width: 18,
                                            height: 18,
                                            aspectRatio: '1/1',
                                            backgroundImage: totalSales < totalPays ? `url('/icons/arrow_down_red_icon.png')` : `url('/icons/arrow_up_green_icon.png')`,
                                            transition: '.3s',
                                        }} />
                                        <Text title bold style={{ color: totalSales < totalPays ? 'red' : 'green' }}>{formatter.format(totalSales - totalPays)}</Text>
                                    </Box>
                                    <Text light>Diferença líquida</Text>
                                </Box>
                            </Box>
                        </Box>
                    </ContentContainer>

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

                            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', padding: '0px 40px' }}>

                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text large bold>{qntSales || 0}</Text>
                                    </Box>
                                    <Text light>Quantidade de vendas</Text>
                                </Box>
                                <Divider distance={0} />
                                <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', gap: .5 }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text large bold>{formatter.format(averageTicket)}</Text>
                                    </Box>
                                    <Text light>Ticket médio</Text>
                                </Box>
                                <Divider distance={0} />
                                <Box sx={{
                                    display: 'flex', transition: '.5s', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    gap: .5, flex: 1
                                }}>
                                    <Box sx={{ display: 'flex', transition: '.5s', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                                        <Text bold title>{formatter.format(totalSales)}</Text>
                                    </Box>
                                    <Text light>Total em vendas</Text>
                                </Box>
                            </Box>
                        </Box>
                    </ContentContainer>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flex: 1, flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'column', xl: 'row' }, }}>
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
                            height={600}
                        />
                    </ContentContainer>
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', flex: 1 }}>
                        <ContentContainer fullWidth sx={{
                            flexDirection: { xs: 'column', sm: 'column', md: 'column', lg: 'column', xl: 'row' }
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