import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import { Backdrop, useMediaQuery, useTheme } from "@mui/material"
import { api } from "../../../api/api"
import { Box, ContentContainer, TextInput, Text, Button, Divider } from "../../../atoms"
import { RadioItem, SectionHeader } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { createClass, deleteClass, editClass } from "../../../validators/api-requests"
import { SelectList } from "../../../organisms/select/SelectList"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import { icons } from "../../../organisms/layout/Colors"
import { formatTimeStamp } from "../../../helpers"

export default function Editaccount(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList, theme } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newAccount = id === 'new';
    const [accountHistoricList, setAccountHistoricList] = useState([])
    const [showDetailsHistoric, setShowDetailsHistoric] = useState({ active: false, id: null })
    const [accountData, setAccountData] = useState({
        nome_conta: null,
        agencia: '',
        conta: ''
    })
    const themeApp = useTheme()
    const mobile = useMediaQuery(themeApp.breakpoints.down('sm'))
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [saldoAccount, setSaldoAccount] = useState({ credit: 0, debit: 0, saldoAccount: 0 })
    const [extractAccount, setSextractAccount] = useState([])
    const [transferData, setTransferData] = useState({ active: false, data: {} })
    const [accountToTransfer, setAccountToTransfer] = useState()
    const [accountList, setAccountList] = useState([])

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    useEffect(() => {
        fetchPermissions()
    }, [])
    const getAccount = async () => {
        try {
            const response = await api.get(`/account/${id}`)
            const { data } = response
            setAccountData(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const getHistoricAccount = async () => {
        try {
            const response = await api.get(`/account/historic/${id}`)
            const { data } = response
            setAccountHistoricList(data)
        } catch (error) {
            console.log(error)
            return error
        }
    }



    useEffect(() => {
        (async () => {
            if (newAccount) {
                return
            }
            await handleItems();

        })();
    }, [id])


    const getExtract = async () => {
        try {
            const response = await api.get(`/account/extract/${id}`)
            const { revenues, expenses, personal } = response?.data
            const mappedRevenues = revenues.map(revenue => ({
                id: revenue.id,
                descricao: revenue.descricao,
                vencimento: revenue.vencimento,
                dt_pagamento: revenue.dt_pagamento,
                status: revenue.status,
                credito: revenue.valor,
                debito: 0,
                n_parcela: revenue.n_parcela,
                forma_pagamento: revenue.forma_pagamento,
                observacao: revenue.observacao,
                c_custo: revenue.c_custo,
                conta: revenue?.conta,
                type: 'revenue'
            }));

            const mappedExpenses = expenses.map(expense => ({
                id: expense.id,
                descricao: expense.descricao,
                vencimento: expense.vencimento,
                dt_pagamento: expense.dt_pagamento,
                status: expense.status,
                credito: 0,
                debito: expense.valor,
                n_parcela: expense.n_parcela,
                forma_pagamento: expense.forma_pagamento,
                observacao: expense.observacao,
                c_custo: expense.c_custo,
                conta_pagamento: expense?.conta_pagamento,
                type: 'expense'
            }));

            const mappedPersonal = personal.map(personalItem => ({
                id: personalItem.id,
                descricao: personalItem.descricao,
                vencimento: personalItem.vencimento,
                dt_pagamento: personalItem.dt_pagamento,
                status: personalItem.status,
                credito: 0,
                debito: personalItem.valor,
                n_parcela: personalItem.n_parcela,
                forma_pagamento: personalItem.forma_pagamento,
                observacao: personalItem.observacao,
                c_custo: personalItem.c_custo,
                conta_pagamento: personalItem?.conta_pagamento,
                type: 'personal'
            }));

            const updatedSetAccountExtractData = [...mappedRevenues, ...mappedExpenses, ...mappedPersonal];
            const totalValuesExpanses = mappedExpenses?.map(item => item.debito)?.reduce((acc, curr) => acc + curr, 0) || 0
            const totalValuesPersonal = mappedPersonal?.map(item => item.debito)?.reduce((acc, curr) => acc + curr, 0) || 0
            const totalValuesRevenues = mappedRevenues?.map(item => item.credito)?.reduce((acc, curr) => acc + curr, 0) || 0

            const totalCredit = parseFloat(totalValuesRevenues) || 0;
            const totalDebit = (parseFloat(totalValuesExpanses) + parseFloat(totalValuesPersonal)) || 0;
            const saldo = (parseFloat(totalCredit) - parseFloat(totalDebit)) || 0;
            setSaldoAccount({ debit: totalDebit.toFixed(2), credit: totalCredit.toFixed(2), saldoAccount: saldo.toFixed(2) })

            setSextractAccount(updatedSetAccountExtractData);
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const mapExpenseData = (data, field) => {
        return data?.map(item => ({
            ...item,
            vencimento: item[field]
        }));
    };

    async function listAccounts() {
        const response = await api.get(`/accounts`)
        const { data } = response
        const groupCostCenter = data?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupCostCenter)
    }



    const handleItems = async () => {
        setLoading(true)
        try {
            await getAccount()
            await getHistoricAccount()
            await getExtract()
            await listAccounts()
        } catch (error) {
            alert.error('Ocorreu um arro ao carregar o Conta')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event) => {

        setAccountData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const checkRequiredFields = () => {
        // if (!accountData.nome) {
        //     alert.error('Usuário precisa de nome')
        //     return false
        // }
        return true
    }

    const handleCreate = async () => {
        setLoading(true)
        if (checkRequiredFields()) {
            try {

                const response = await api.post(`/account/create`, { accountData, userId });
                const { data } = response
                if (response?.status === 201) {
                    alert.success('Conta cadastrada com sucesso.');
                    router.push(`/financial/account/list`)
                }
            } catch (error) {
                alert.error('Tivemos um problema ao cadastrar a Conta.');
                console.log(error)

            } finally {
                setLoading(false)
            }
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            const response = await api.delete(`/account/delete/${id}`);
            if (response?.status === 200) {
                alert.success('Conta excluída.');
                router.push(`/financial/account/list`)
            }

        } catch (error) {
            alert.error('Tivemos um problema ao excluir a Conta.');
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (checkRequiredFields()) {
            setLoading(true)
            try {
                const response = await api.patch(`/account/update/${id}`, { accountData })
                if (response?.status === 201) {
                    alert.success('Conta atualizada com sucesso.');
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao atualizar Conta.');
            } catch (error) {
                alert.error('Tivemos um problema ao atualizar Conta.');
            } finally {
                setLoading(false)
            }
        }
    }


    const handleTrasnferDataAccount = async () => {
        if (accountToTransfer) {
            setLoading(true)
            try {
                let [nameAccountTo] = accountList?.filter(item => item?.value === accountToTransfer)?.map(y => y.label)
                const response = await api.patch(`/account/transfer/update`, {
                    transferData: transferData?.data,
                    accountTo: {
                        id: accountToTransfer,
                        nome_conta: nameAccountTo
                    },
                    accountBy: {
                        id: id,
                        nome_conta: accountData?.nome_conta
                    },
                    userResp: {
                        userId: user?.id,
                        nome: user?.nome
                    }
                })

                if (response?.status === 200) {
                    alert.success('Transferência realizada!');
                    setTransferData({ active: false, data: {} })
                    handleItems()
                    return
                }
                alert.error('Tivemos um problema ao realizar transferência entre contas.');
            } catch (error) {
                alert.error('Tivemos um problema ao realizar transferência entre contas.');
            } finally {
                setLoading(false)
            }
        } else {
            alert.info('Selecione a conta que deseja trasnferir')
        }
    }

    const containerRef = useRef(null);

    useEffect(() => {
        if (showDetailsHistoric?.active) {
            const handleClickOutside = (event) => {
                if (containerRef.current && !containerRef.current.contains(event.target)) {
                    setShowDetailsHistoric({ active: false, id: null });
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showDetailsHistoric?.active]);


    const groupStatus = [
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                perfil={'conta bancária'}
                title={accountData?.nome_conta || `Nova Conta`}
                saveButton={isPermissionEdit}
                saveButtonAction={newAccount ? handleCreate : handleEdit}
                deleteButton={!newAccount && isPermissionEdit}
                deleteButtonAction={(event) => setShowConfirmationDialog({ active: true, event, acceptAction: handleDelete, title: 'Deseja Prosseguir?', message: 'Tem certeza que deseja excluír o Conta? Uma vez excluído, não será possível recupera-lo.' })}
            />

            {/* usuario */}
            <Box sx={{ display: 'flex', gap: 3, width: '100%', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                    <ContentContainer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, padding: 5, width: '65%' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Dados da Conta</Text>
                        </Box>
                        <Box sx={{ ...styles.inputSection, flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Ex: Banco itaú' name='nome_conta' onChange={handleChange} value={accountData?.nome_conta || ''} label='Nome:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='1667' name='agencia' onChange={handleChange} value={accountData?.agencia || ''} label='Agência:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='16770-01' name='conta' onChange={handleChange} value={accountData?.conta || ''} label='Conta:' sx={{ width: '100%', }} />
                        </Box>
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={accountData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setAccountData({ ...accountData, ativo: parseInt(value) })} />
                    </ContentContainer>
                    <ContentContainer style={{ display: 'flex', flexDirection: 'column', gap: 1.8, padding: 5, width: '35%' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Histórico de transferência</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', maxHeight: 280, overflowX: 'auto' }}>
                            {accountHistoricList?.length > 0 ?
                                accountHistoricList?.map((item, index) => {
                                    return (
                                        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'start' }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: 'column' }}>
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    backgroundImage: `url('/icons/bank-transfer.png')`,
                                                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                                    transition: '.3s',
                                                    width: 20, height: 20,
                                                    aspectRatio: '1/1'
                                                }} />
                                                <Box
                                                    sx={{
                                                        borderLeft: "1px dashed #ccc",
                                                        // height: "50px", // Ajuste 
                                                        height: "40px",
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column', position: 'relative' }}>
                                                <Text small light style={{ flexWrap: 'wrap', display: 'flex', maxWidth: 400 }}>{item?.descricao_evento}</Text>
                                                <div ref={containerRef}>
                                                    <Box sx={{
                                                        display: 'flex', gap: 1, alignItems: 'center', display: 'flex', padding: '5px 8px', backgroundColor: colorPalette?.primary,
                                                        borderRadius: 2,
                                                        "&:hover": {
                                                            opacity: 0.8,
                                                            cursor: 'pointer'
                                                        }
                                                    }} onClick={() => {
                                                        if ((showDetailsHistoric?.active && (showDetailsHistoric?.id === item?.id_hist_transf_conta))) {
                                                            setShowDetailsHistoric({ active: false, id: null })
                                                        } else {
                                                            setShowDetailsHistoric({ active: true, id: item?.id_hist_transf_conta })
                                                        }
                                                    }}>
                                                        <Text xsmall>Detalhes</Text>
                                                        <Box sx={{
                                                            ...styles.menuIcon,
                                                            backgroundImage: `url('${icons?.gray_arrow_down}')`,
                                                            filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                                                            transition: '.3s',
                                                            width: 11, height: 11,
                                                            aspectRatio: '1/1'
                                                        }} />

                                                    </Box>
                                                    {(showDetailsHistoric?.active && showDetailsHistoric?.id === item?.id_hist_transf_conta) &&

                                                        <Box sx={{
                                                            display: 'flex', gap: 1, position: 'absolute', top: 95, backgroundColor: colorPalette?.primary, zIndex: 999,
                                                            padding: '8px 12px', borderRadius: 2, gap: 3
                                                        }}>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                                                <Text xsmall bold>Valor:</Text>
                                                                <Text xsmall>{formatter.format(item?.valor_transferencia)}</Text>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                                                <Text xsmall bold>Tipo:</Text>
                                                                <Text xsmall>{item?.tipo_valor}</Text>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                                                <Text xsmall bold>Remetente:</Text>
                                                                <Text xsmall>{item?.conta_remetente}</Text>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
                                                                <Text xsmall bold>Destinatário:</Text>
                                                                <Text xsmall>{item?.conta_destinada}</Text>
                                                            </Box>
                                                        </Box>
                                                    }
                                                </div>
                                            </Box>

                                        </Box>
                                    )
                                })
                                :
                                <Text light>Não foi encontrado histórico de trasnferências</Text>}
                        </Box>
                    </ContentContainer>
                </Box>

                {!newAccount && <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                        <Text bold title>Extrato da conta</Text>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', padding: '10px 15px', backgroundColor: colorPalette.primary }}>
                            <Text bold>Crédito:</Text>
                            <Text>{(formatter.format(saldoAccount?.credit))}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', padding: '10px 15px', backgroundColor: colorPalette.primary }}>
                            <Text bold>Débito:</Text>
                            <Text>{formatter.format(-saldoAccount?.debit)}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', padding: '10px 15px', backgroundColor: colorPalette.primary }}>
                            <Text bold>Saldo:</Text>
                            <Text>{formatter.format(saldoAccount?.saldoAccount)}</Text>
                        </Box>
                    </Box>
                    <TableExtract data={extractAccount} setTransferData={setTransferData} />

                </ContentContainer>}
            </Box>
            <Backdrop open={transferData?.active} sx={{ zIndex: 99 }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Dados da Transferência</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            width: 15, height: 15,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            zIndex: 999999999,
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => setTransferData({ active: false, data: {} })} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <Box>
                            <Text bold>Descrição:</Text>
                            <Text>{transferData?.data?.descricao}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Dt Pagamento:</Text>
                            <Text>{formatTimeStamp(transferData?.data?.dt_pagamento)}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Status:</Text>
                            <Text>{transferData?.data?.status}</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Valor do {transferData?.data?.credito ? 'Crédito:' : 'Débito:'}</Text>
                            <Text>{formatter.format(transferData?.data?.credito ? transferData?.data?.credito : -transferData?.data?.debito)}</Text>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 14,
                                height: 14,
                                aspectRatio: '1/1',
                                backgroundImage: `url('/icons/${transferData?.data?.credito ? 'arrow_up_green_icon' : 'arrow_down_red_icon'}.png')`,
                                transition: '.3s',
                            }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Text bold>Centro de Custo:</Text>
                            <Text>{transferData?.data?.c_custo}</Text>
                        </Box>
                        <Divider />

                        <Box>
                            <Text bold>Conta Atual:</Text>
                            <Text>{accountData?.nome_conta}</Text>
                        </Box>

                        <Text bold>Trasnferir Para:</Text>
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={accountToTransfer} onSelect={(value) => setAccountToTransfer(value)}
                            title="Conta do pagamento" filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <Divider />
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                            <Button text="Transferir" small style={{ height: 35, width: '100%' }} onClick={() => handleTrasnferDataAccount()} />
                            < Button secondary text="Cancelar" small style={{ height: 35, width: '100%' }} onClick={() => setTransferData({ active: false, data: {} })} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>
        </>
    )
}


const TableExtract = ({ data = [], filters = [], onPress = () => { }, setTransferData }) => {
    const { setLoading, colorPalette, theme, user } = useAppContext()

    const columns = [
        { key: 'id', label: '#Id' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'vencimento', label: 'Dt Vencimento', date: true },
        { key: 'dt_pagamento', label: 'Dt Pagamento', date: true },
        { key: 'status', label: 'Status' },
        { key: 'credito', label: 'Crédito' },
        { key: 'debito', label: 'Débito' },
        { key: 'n_parcela', label: 'Nº Parcela' },
        { key: 'forma_pagamento', label: 'Forma Pagamento', },
        { key: 'observacao', label: 'Observação' },
        { key: 'c_custo', label: 'Centro de Custo' },
        { key: '', label: '' },

    ];

    const router = useRouter();
    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]


    const statusColor = (data) => ((data === 'Pendente' && 'yellow') ||
        (data === 'Erro' && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue'))


    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <ContentContainer sx={{ display: 'flex', width: '100%', padding: 0, backgroundColor: colorPalette.primary, boxShadow: 'none', borderRadius: 2 }}>

            <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                <Table sx={{ borderCollapse: 'collapse', width: '100%' }}>
                    <TableHead>
                        <TableRow sx={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                            {columns.map((column, index) => (
                                <TableCell key={index} sx={{ padding: '16px', }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text bold style={{ textAlign: 'center' }}>{column.label}</Text>
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody sx={{ flex: 1, padding: 5, backgroundColor: colorPalette.secondary }}>
                        {
                            data?.map((item, index) => {
                                return (
                                    <TableRow key={`${item}-${index}`} sx={{
                                        "&:hover": {
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
                                            <Text>{item?.descricao || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.vencimento, false) || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{formatTimeStamp(item?.dt_pagamento, false) || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    backgroundColor: colorPalette.primary,
                                                    height: 30,
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    padding: '0px 12px 0px 0px',
                                                    borderRadius: 2,
                                                    justifyContent: 'start',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', backgroundColor: statusColor(item?.status), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                <Text small bold>{item?.status}</Text>
                                            </Box>
                                        </TableCell>
                                        <Tooltip title={item?.credito}>
                                            <TableCell sx={{ padding: '15px 10px', textAlign: 'center', }}>
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        width: 14,
                                                        height: 14,
                                                        aspectRatio: '1/1',
                                                        backgroundImage: `url('/icons/arrow_up_green_icon.png')`,
                                                        transition: '.3s',
                                                    }} />
                                                    <Text>{formatter.format(item?.credito) || '-'}</Text>
                                                </Box>
                                            </TableCell>
                                        </Tooltip>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    width: 14,
                                                    height: 14,
                                                    aspectRatio: '1/1',
                                                    backgroundImage: `url('/icons/arrow_down_red_icon.png')`,
                                                    transition: '.3s',
                                                }} />
                                                <Text>{formatter.format(-item?.debito) || '-'}</Text>
                                            </Box>

                                        </TableCell>
                                        <TableCell sx={{ padding: '15px 10px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                                                <Text>{item?.n_parcela || '-'}</Text>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.forma_pagamento || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.observacao || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.c_custo || '-'}</Text>
                                        </TableCell>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Button small text="Trasnferir" style={{ height: 30, borderRadius: 2 }} onClick={() => setTransferData({ active: true, data: item })} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })

                        }
                    </TableBody>
                </Table>
            </TableContainer>
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