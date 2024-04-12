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


export default function ListPayroll(props) {
    const [expensesData, setExpensesData] = useState([])
    const [personalExpenses, setPersonalExpenses] = useState([])
    const [filters, setFilters] = useState({
        status: 'todos',
        startDate: '',
        endDate: ''
    })
    const [dissidioPorcent, setDissidioPorcent] = useState(0)
    const [baixaData, setBaixaData] = useState({ dt_baixa: '', conta_pagamento: '' })
    const { setLoading, colorPalette, theme, alert, setShowConfirmationDialog, userPermissions, menuItemsList, user } = useAppContext()
    const [expensesSelected, setExpensesSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showDissidioBox, setShowDissidioBox] = useState(false)
    const [showBaixa, setShowBaixa] = useState(false)
    const [accountList, setAccountList] = useState([])
    const [filterData, setFilterData] = useState('')
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
        let date = new Date(item?.dt_pagamento);
        let filteredDate = (filters?.startDate !== '' && filters?.endDate !== '') ?
            rangeDate(date, filters?.startDate, filters?.endDate) :
            item;
        let filterStatus = filters?.status.includes('todos') ? item : filters?.status.includes(item?.status)
        const normalizedFilterData = normalizeString(filterData);

        return (filteredDate && filterStatus && normalizeString(item?.funcionario)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()));
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
        getPersonalExpenses()
        listAccounts()
    }


    const getPersonalExpenses = async () => {
        setLoading(true)
        try {
            const response = await api.get(`/expenses/personal`)
            const { data } = response;
            if (data?.length > 0) {
                setPersonalExpenses(data)

                let allInstallmentSelected = data?.map(item => item?.id_pagamento_folha)
                setAllSelected(allInstallmentSelected?.toString())

                setExpensesData(data.map(item => {
                    const valorDesp = parseFloat(item.vl_pagamento);
                    return {
                        ...item,
                        valor_tipo: isNaN(valorDesp) ? item.vl_pagamento : valorDesp.toFixed(2)
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
            const idsToDelete = expensesSelected.split(',').map(id => parseInt(id.trim(), 10));
            let allStatus200 = true;
            for (const idDelte of idsToDelete) {
                const response = await api.delete(`/expense/personal/delete/${idDelte}`)
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


    const handleBaixa = async () => {
        if (expensesSelected && baixaData?.conta_pagamento !== '' && baixaData?.dt_baixa !== '') {
            setLoading(true)
            const isToUpdate = expensesSelected.split(',').map(id => parseInt(id.trim(), 10));
            try {
                const response = await api.patch(`/expense/personal/baixa`, { isToUpdate, baixaData })
                const { status } = response?.data
                if (status) {
                    alert.success('Todas as Baixas foram realizadas com sucesso.');
                    setExpensesSelected('');
                    setShowBaixa(false)
                    setBaixaData({ dt_baixa: '', conta_pagamento: '' });
                    getPersonalExpenses()
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


    const handleDissidio = async () => {
        setLoading(true)
        const isToUpdate = expensesSelected.split(',').map(id => parseInt(id.trim(), 10));

        try {
            const response = await api.patch(`/expense/personal/reajustment/dissidio`, { isToUpdate, userId: user?.id, dissidioPorcent })
            const { status } = response?.data
            if (status) {
                alert.success('Dissídio aplicado para todos.');
                setExpensesSelected('');
                setShowDissidioBox(false)
                getPersonalExpenses()
                return
            }
            alert.error('Tivemos um problema ao aplicado dissídio.');
        } catch (error) {
            alert.error('Tivemos um problema ao aplicado dissídio.');
            console.log(error)
            return error

        } finally {
            setLoading(false)
        }
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

    const columnPersonal = [
        { key: 'id_pagamento_folha', label: 'id' },
        { key: 'funcionario', label: 'Funcionário' },
        { key: 'funcao', label: 'Cargo/Função' },
        { key: 'nome_cc', label: 'Centro de Custo' },
        { key: 'nome_conta', label: 'Conta' },
        { key: 'dt_pagamento', label: 'Vencimento', date: true },
        { key: 'dt_baixa', label: 'Baixa', date: true },
        { key: 'vl_pagamento', label: 'Salário', price: true },
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

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    let valuePersonal = personalExpenses?.map(item => parseFloat(item.vl_pagamento))?.reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    let totalExpenses = parseFloat(valuePersonal)
    let totalExpensesView = expensesData?.filter(filter)?.map(item => parseFloat(item.valor_tipo)).reduce((acc, currentValue) => acc + (currentValue || 0), 0)
    const percentualExpenses = (parseFloat(totalExpensesView) / totalExpenses) * 100;

    return (
        <>
            <SectionHeader
                title="Folha de Pagamento"
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
                            <Text light>Folha de Pagamento</Text>
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
                    display: 'flex', gap: 1.8, alignItems: 'center', justifyContent: 'center',
                    flexDirection: { xs: 'column', md: 'row', lg: 'row', xl: 'row' }
                }}>
                    <TextInput placeholder="Buscar pelo nome do Funcionário" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                    <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} />
                    <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} />
                    <Button text="Limpar" style={{ borderRadius: 2, height: '100%', width: 110 }} onClick={() => {
                        setFilters({
                            status: 'todos',
                            startDate: '',
                            endDate: ''
                        })
                        setFilterData('')
                    }} />
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

            <Box sx={{ overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap' }}>

                <Box sx={{ display: 'flex', backgroundColor: colorPalette.secondary, flexDirection: 'column', width: '100%', boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`, }}>


                    <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end', paddingTop: '20px', paddingRight: '20px' }}>
                        <Button disabled={!isPermissionEdit && true} small text="Novo" style={{ width: '80px', height: '30px', borderRadius: '6px' }} onClick={() => router.push(`/financial/billsToPay/payroll/new`)} />
                        <Button disabled={!isPermissionEdit && true} small secondary text="Excluir" style={{ width: '80px', height: '30px', borderRadius: '6px' }} onClick={(event) => setShowConfirmationDialog({
                            active: true,
                            event,
                            acceptAction: handleDelete,
                            title: `Excluir Pagamento selecionado?`,
                            message: 'Tem certeza que deseja seguir com a exclusão? Uma vez excluído, não será possível recuperar novamente.'
                        })} />
                        <Button disabled={!isPermissionEdit && true} small secondary text="Dar baixa" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => setShowBaixa(true)} />

                        <Button disabled={!isPermissionEdit && true} small secondary text="aplicar dissídio para todos" style={{ width: '200px', height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                if (expensesSelected) {
                                    setShowDissidioBox(true)
                                } else {
                                    alert.info('Selecione um item para aplicar o dissídio')
                                }

                            }}
                        />
                    </Box>

                    <div style={{ borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap', padding: '40px 40px 20px 40px', width: '100%', }}>
                        {expensesData?.filter(filter).length > 0 ?
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
                                                    if ((expensesSelected?.length < allSelected?.length)) {
                                                        let allInstallmentSelected = expensesData?.map(item => item?.id_pagamento_folha)
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
                                        {columnPersonal?.map((item, index) => (
                                            <th key={index} style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold' }}>{item.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1, }}>
                                    {expensesData?.sort((a, b) => new Date(a.dt_vencimento) - new Date(b.dt_vencimento))?.filter(filter)?.map((item, index) => {
                                        let itemId = item?.id_pagamento_folha
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
                                                {columnPersonal?.map((column, colIndex) => (
                                                    <td key={colIndex} style={{
                                                        textDecoration: column?.label === 'id' ? 'underline' : 'none', padding: '8px 0px', alignItems: 'center', justifyContent: 'center', flex: 1, fontSize: '14px', fontFamily: 'MetropolisRegular', color: column?.label === 'id' ? (theme ? 'blue' : 'red') : colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}`,
                                                        minWidth: column?.label === 'id' ? 60 : 0
                                                    }}
                                                        onClick={(e) => {
                                                            column?.label === 'id' ? router.push(`/financial/billsToPay/payroll/${item?.id_pagamento_folha}`)
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
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
                                <Text large light>Não foi possível encontrar Pagamentos.</Text>
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


            <Backdrop open={showDissidioBox} sx={{ zIndex: 999 }}>
                <ContentContainer sx={{ zIndex: 9999 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Insira a porcentagem do Dissídio</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 99999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setShowDissidioBox(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                        <TextInput placeholder="0.5" name='dissidio' onChange={(event) => setDissidioPorcent(event.target.value)} value={dissidioPorcent} sx={{ flex: 1 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center' }}>
                        <Button disabled={!isPermissionEdit && true} small text="Aplicar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={(event) => setShowConfirmationDialog({
                                active: true,
                                event,
                                acceptAction: handleDissidio,
                                title: `Aplicar Dissídio`,
                                message: 'Tem certeza que deseja seguir com o reajuste?'
                            })} />
                        <Button disabled={!isPermissionEdit && true} small secondary text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => setShowDissidioBox(false)} />
                    </Box>
                </ContentContainer>
            </Backdrop>


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
                                title: `Dar Baixa das pagamento`,
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
