import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { api } from "../../../../api/api"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatDate, formatTimeStamp } from "../../../../helpers"
import { Avatar, Backdrop, TablePagination } from "@mui/material"
import Link from "next/link"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { icons } from "../../../../organisms/layout/Colors"

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


export default function ListBillsReceived(props) {
    const [filters, setFilters] = useState({
        status: 'todos'
    })
    const [baixaData, setBaixaData] = useState({ dt_baixa: '', conta_recebimento: '', forma_pagamento: '' })
    const { setLoading, colorPalette, theme, alert, setShowConfirmationDialog, userPermissions, menuItemsList, user } = useAppContext()
    const [filterYear, setFilterYear] = useState(2024)
    const [filterMonth, setFilterMonth] = useState()
    const [receivedSelected, setReceivedSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [receiveds, setReceiveds] = useState([]);
    const [showBaixa, setShowBaixa] = useState(false)
    const [accountList, setAccountList] = useState([])
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)

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
        let dateFilter = item?.dt_pagamento;
        let date = new Date(dateFilter);
        let monthSelect = date.getMonth();
        let yearSelect = date.getFullYear();
        let filterYearNumber = parseInt(filterYear, 10);
        let filterData = filterMonth === 'todos' ? item : monthSelect === filterMonth;
        let filterStatus = filters?.status.includes('todos') ? item : filters?.status.includes(item?.status)


        return (filterData && yearSelect === filterYearNumber && filterStatus);
    }

    useEffect(() => {
        fetchPermissions()
        handleLoadData()
    }, [])

    async function listAccounts() {
        const response = await api.get(`/accounts`)
        const { data } = response
        const groupCostCenter = data?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupCostCenter)
    }

    const handleLoadData = () => {
        getReceiveds()
        listAccounts()
    }


    useEffect(() => {
        const dateNow = new Date()
        let monthNow = dateNow.getMonth()
        setFilterMonth(monthNow)
    }, []);


    const getReceiveds = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/receiveds`)
            const { data } = response;
            if (data?.length > 0) {
                setReceiveds(data?.map(item => {
                    const valorDesp = parseFloat(item.valor);
                    return {
                        ...item,
                        valor: isNaN(valorDesp) ? item.valor : valorDesp.toFixed(2)
                    };
                }));
            }
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

    const handleDelete = async () => {
        setLoading(true)
        try {
            const idsToDelete = receivedSelected.split(',').map(id => parseInt(id.trim(), 10));
            let allStatus200 = true;
            for (const idDelte of idsToDelete) {
                const response = await api.delete(`/received/delete/${idDelte}`)
                if (response.status !== 200) {
                    allStatus200 = false;
                }
            }
            if (allStatus200) {
                alert.success('Items excluídos.');
                setReceivedSelected('');
                getReceiveds()
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
        if (receivedSelected && baixaData?.conta_recebimento !== '' && baixaData?.dt_baixa !== '') {
            setLoading(true)
            const isToUpdate = receivedSelected.split(',').map(id => parseInt(id.trim(), 10));

            try {
                const response = await api.patch(`/received/baixa`, { isToUpdate, baixaData, userRespId: user?.id })
                const { status } = response?.data
                if (status) {
                    alert.success('Todas as Baixas foram realizadas com sucesso.');
                    setReceivedSelected('');
                    setShowBaixa(false)
                    setBaixaData({ dt_baixa: '', conta_recebimento: '', forma_pagamento: '' });
                    getReceiveds()
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

    const pusBillId = async (item) => {
        let itemId = item?.id_recebiveis;
        let queryRoute = `/financial/billsToReceive/billsReceived/${itemId}`
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

    const columnReceived = [
        { key: 'id_recebiveis', label: 'id' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'valor', label: 'Valor', price: true },
        { key: 'nome_cc', label: 'Centro de Custo' },
        { key: 'nome_conta', label: 'Conta' },
        { key: 'dt_pagamento', label: 'Dt Baixa', date: true },
        { key: 'status', label: 'Status', status: true },
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

    const groupFormPayment = [
        { label: 'Transferência Bancária', value: 'Transferência Bancária' },
        { label: 'Dinheiro', value: 'Dinheiro' },
        { label: 'Cartão de crédito', value: 'Cartão de crédito' },
        { label: 'Cheque', value: 'Cheque' },
        { label: 'Pix', value: 'Pix' },
        { label: 'Boleto', value: 'Boleto' },
        { label: 'Outros', value: 'Outros' }
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

    const years = [
        { label: '2023', value: 2023 },
        { label: '2024', value: 2024 },
        { label: '2025', value: 2025 },
    ]


    let valueReceiveds = receiveds?.map(item => parseFloat(item.valor))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let totalReceived = parseFloat(valueReceiveds)
    let totalReceivedView = receiveds?.filter(filter)?.map(item => parseFloat(item.valor)).reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    const percentualReceived = (totalReceivedView / totalReceived) * 100;

    return (
        <>
            <SectionHeader
                title="Lançamento de Recebíveis"
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
                                    backgroundImage: `url('/icons/arrow_up_green_icon.png')`,
                                    transition: '.3s',
                                }} />
                                <Text bold title style={{ color: 'green' }}>{formatter.format(parseFloat(totalReceived))}</Text>
                            </Box>
                            <Text light>Receita</Text>
                        </Box>
                    </ContentContainer>

                </Box>

                <ContentContainer fullWidth>
                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
                            <Box sx={{ width: '100%', display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text bold large>Receitas</Text>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', transition: '.5s', }}>
                                    <Text bold style={{ color: colorPalette.buttonColor }}>{formatter.format(parseFloat(totalReceivedView))}</Text>
                                    <Text>de</Text>
                                    <Text light style={{ color: 'rgb(75 85 99)' }}>{formatter.format(parseFloat(totalReceived))}</Text>
                                </Box>
                            </Box>
                            <div style={{ marginTop: '10px', width: '100%', height: '10px', borderRadius: '10px', background: '#ccc', transition: '.5s', }}>
                                <div style={{ width: `${percentualReceived}%`, height: '100%', borderRadius: '10px', background: colorPalette.buttonColor, transition: '.5s', }} />
                            </div>
                        </Box>
                    </Box>
                </ContentContainer>
            </Box>
            <Box sx={{
                display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
                flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
            }}>
                <TextInput
                    name="year"
                    value={filterYear || ''}
                    label='Ano:'
                    onChange={(event) => setFilterYear(event.target.value)}
                    sx={{ width: 200 }}
                    InputProps={{
                        style: {
                            backgroundColor: colorPalette.secondary
                        }
                    }}
                    type="number"
                />

                <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap', lg: 'nowrap', xl: 'nowrap' } }}>
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
                            }} onClick={() => {
                                if (monthSelected) {
                                    setFilterMonth('todos')
                                }
                                else {
                                    setFilterMonth(item?.value)
                                }
                            }}>
                                <Text large style={{ color: monthSelected ? '#fff' : colorPalette.textColor }}>{item?.month}</Text>
                            </Box>
                        )
                    })}
                </Box>
            </Box>

            <Box sx={{ overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap' }}>
                <Box sx={{ display: 'flex', backgroundColor: colorPalette.secondary, flexDirection: 'column', width: '100%', boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, }}>
                    <Box sx={{ display: 'flex', padding: '20px 40px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CheckBoxComponent disabled={!isPermissionEdit && true}
                            boxGroup={groupStatus}
                            valueChecked={filters?.status}
                            horizontal={true}
                            onSelect={(value) => {
                                setFilters({ ...filters, status: value })
                            }}
                            sx={{ width: 1 }} />

                        <Box sx={{ display: 'flex', gap: 1, }}>
                            <Button disabled={!isPermissionEdit && true} small text="Lançar Recebimento" style={{ height: '30px', borderRadius: '6px' }} onClick={() => router.push(`/financial/billsToReceive/billsReceived/new`)} />
                            <Button disabled={!isPermissionEdit && true} small secondary text="Excluir" style={{ height: '30px', borderRadius: '6px' }} onClick={(event) => setShowConfirmationDialog({
                                active: true,
                                event,
                                acceptAction: handleDelete,
                                title: `Excluir Recebído?`,
                                message: 'Tem certeza que deseja seguir com a exclusão? Uma vez excluído, não será possível recuperar novamente.'
                            })} />
                            <Button disabled={!isPermissionEdit && true} small secondary text="Dar baixa" style={{ height: '30px', borderRadius: '6px' }}
                                onClick={() => setShowBaixa(true)} />
                        </Box>

                    </Box>
                    <div style={{ borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap', padding: '40px 40px 20px 40px', width: '100%', }}>
                        {receiveds?.filter(filter).length > 0 ?
                            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                                <thead>
                                    <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                        <th style={{ display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                            <CheckBoxComponent
                                                disabled={!isPermissionEdit && true}
                                                boxGroup={[{ value: 'allSelect' }]}
                                                valueChecked={'select'}
                                                horizontal={true}
                                                onSelect={() => {
                                                    if (receivedSelected?.length < allSelected?.length) {
                                                        let allReceivedSelected = receiveds?.filter(filter)?.map(item => item?.id_recebiveis)
                                                        setReceivedSelected(allReceivedSelected?.toString())
                                                    } else {
                                                        setReceivedSelected(null)
                                                    }
                                                }}
                                                padding={0}
                                                gap={0}
                                                sx={{ display: 'flex', maxWidth: 15 }}
                                            />
                                        </th>
                                        {columnReceived?.map((item, index) => (
                                            <th key={index} style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold' }}>{item.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1, }}>
                                    {receiveds?.filter(filter)?.map((item, index) => {
                                        let itemId = item?.id_recebiveis;
                                        const isSelected = receivedSelected?.includes(itemId) || null;

                                        return (
                                            <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary, }}>
                                                <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                                    <CheckBoxComponent
                                                        disabled={!isPermissionEdit && true}
                                                        boxGroup={
                                                            groupSelect(itemId)
                                                        }
                                                        valueChecked={receivedSelected}
                                                        horizontal={true}
                                                        onSelect={(value) => {
                                                            if (itemId) {
                                                                setReceivedSelected(value);
                                                            }
                                                        }}
                                                        padding={0}
                                                        gap={0}
                                                        sx={{ display: 'flex', maxWidth: 15 }}
                                                    />
                                                </td>
                                                {columnReceived?.map((column, colIndex) => (
                                                    <td key={colIndex} style={{
                                                        textDecoration: column?.label === 'id' ? 'underline' : 'none', padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: column?.label === 'id' ? (theme ? 'blue' : 'red') : colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}`,
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
                                count={receiveds?.length}
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
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={baixaData?.conta_recebimento} onSelect={(value) => setBaixaData({ ...baixaData, conta_recebimento: value })}
                            title="Conta do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={groupFormPayment} valueSelection={baixaData?.forma_pagamento} onSelect={(value) => setBaixaData({ ...baixaData, forma_pagamento: value })}
                            title="Forma de Pagamento:" filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                        <Button disabled={!isPermissionEdit && true} small text="Dar baixa" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={(event) => setShowConfirmationDialog({
                                active: true,
                                event,
                                acceptAction: handleBaixa,
                                title: `Dar Baixa dos Recebimentos`,
                                message: 'Tem certeza que deseja seguir com a as baixas?'
                            })} />
                        <Button disabled={!isPermissionEdit && true} small secondary text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowBaixa(false)
                                setBaixaData({ dt_baixa: '', conta_recebimento: '', forma_pagamento: '' });
                            }} />
                    </Box>
                </ContentContainer>
            </Backdrop>
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
