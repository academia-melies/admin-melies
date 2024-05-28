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
import { IconStatus } from "../../../organisms/Table/table"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Editaccount(props) {
    const { setLoading, alert, colorPalette, user, setShowConfirmationDialog, userPermissions, menuItemsList, theme } = useAppContext()
    let userId = user?.id;
    const router = useRouter()
    const { id } = router.query;
    const newAccount = id === 'new';
    const [accountHistoricList, setAccountHistoricList] = useState([])
    const [startSearch, setStartSearch] = useState(false)
    const [showDetailsHistoric, setShowDetailsHistoric] = useState({ active: false, id: null })
    const [newBalanceData, setNewBalanceData] = useState({})
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
    const [accountExtractData, setEditAccount] = useState({ active: false, data: {} })
    const [newBalance, setNewBalance] = useState(false)
    const [accountToTransfer, setAccountToTransfer] = useState()
    const [costCenterList, setCostCenterList] = useState([])
    const [accountTypesList, setAccountTypesList] = useState([])
    const [accountList, setAccountList] = useState([])
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: ''
    })
    const filterFunctions = {
        date: (item) => (filters?.startDate !== '' && filters?.endDate !== '') ? rangeDate(item?.vencimento, filters?.startDate, filters?.endDate) : item,
        search: (item) => {
            const normalizedSearchTerm = removeAccents(filters?.search.toLowerCase());
            const normalizedItemName = item?.pagante ? removeAccents(item?.pagante?.toLowerCase()) : removeAccents(item?.aluno?.toLowerCase());
            return normalizedItemName && normalizedItemName?.includes(normalizedSearchTerm)
        },
    };

    console.log(accountExtractData)

    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return date >= start && date <= end;
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


    async function listCostCenter() {
        const response = await api.get(`/costCenters`)
        const { data } = response
        const groupCostCenter = data?.filter(item => item)?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));
        setCostCenterList(groupCostCenter)
    }



    async function listAccountTypes() {
        const response = await api.get(`/account/types`)
        const { data } = response
        const groupCostCenter = data?.filter(item => item)?.map(cc => ({
            label: cc.nome_tipo,
            value: cc?.id_tipo
        }));

        setAccountTypesList(groupCostCenter)
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
            const response = await api.get(`/account/extract/${id}?startDate=${filters?.startDate}&endDate=${filters?.endDate}`)
            const statmentAccountList = response?.data;
            const totalValuesDebit = statmentAccountList?.map(item => item.debito)?.reduce((acc, curr) => acc + curr, 0) || 0
            const totalValuesCredit = statmentAccountList?.map(item => item.credito)?.reduce((acc, curr) => acc + curr, 0) || 0

            const totalCredit = parseFloat(totalValuesCredit) || 0;
            const totalDebit = parseFloat(totalValuesDebit) || 0;
            const saldo = (parseFloat(totalCredit) - parseFloat(totalDebit)) || 0;
            setSaldoAccount({ debit: totalDebit.toFixed(2), credit: totalCredit.toFixed(2), saldoAccount: saldo.toFixed(2) })

            setSextractAccount(statmentAccountList);
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const handleSearchExtractAccounts = async () => {
        if (filters?.startDate && filters?.endDate) {
            try {
                setLoading(true)
                await getExtract()
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
                setStartSearch(true)
            }
        } else {
            alert.info('Preencha as datas de Ínicio e Fim, antes de buscar.')
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
            await listAccounts()
            await listCostCenter()
            await listAccountTypes()
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

    const handleChangeNewBalance = async (event) => {

        if (event.target.name === 'credito') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                event.target.value = formattedValue;

            }

            setNewBalanceData((prevValues) => ({
                ...prevValues,
                [event.target.name]: event.target.value,
            }));

            return;
        }

        setNewBalanceData((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }


    const handleChangeEditExtractAccount = async (event) => {

        if (event.target.name === 'credito' || event.target.name === 'debito') {
            const rawValue = event.target.value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                event.target.value = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValue = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                event.target.value = formattedValue;

            }
        }

        setEditAccount((prevValues) => ({
            ...prevValues,
            data: {
                ...prevValues.data,
                [event.target.name]: event.target.value,
            }
        }));
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
                    await handleItems()
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



    const addBalanceAccount = async () => {
        setLoading(true)
        try {

            const response = await api.post(`/account/extract/create`, {
                newBalanceData: {
                    ...newBalanceData,
                    status: 'Baixa realizada',
                    observacao: 'Saldo adicionado',
                    usuario_resp: user?.id,
                    transferido: 0,
                    dt_baixa: new Date(),
                    conta_id: id
                }
            });
            const { data } = response
            if (data?.success) {
                alert.success('Saldo adicionado.');
                setNewBalance(false)
                setNewBalanceData({})
                await handleItems()
            } else {
                alert.error('Tivemos um problema ao adicionar Saldo.')
            }
        } catch (error) {
            alert.error('Tivemos um problema ao adicionar Saldo.');
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const handleEditAccountExtract = async () => {
        setLoading(true)
        try {

            const response = await api.patch(`/account/extract/update`, { accountExtractData: accountExtractData?.data });
            const { data } = response
           
            if (data?.success) {
                alert.success('Conta atualizada.');
                setEditAccount({ active: false, data: {} })
                await getExtract()
                await handleItems()
            } else {
                alert.error('Tivemos um problema ao atualizar Conta.')
            }
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Conta.');
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }

    const handleTrasnferDataAccount = async () => {
        if (accountToTransfer) {
            setLoading(true)
            try {
                let [nameAccountTo] = accountList?.filter(item => item?.value === accountToTransfer)?.map(y => y.label)
                const response = await api.patch(`/account/transfer/update`, {
                    accountExtractData: accountExtractData?.data,
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
                    setEditAccount({ active: false, data: {} })
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
            alert.info('Selecione a conta que deseja transferir')
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
                saveButton={newAccount && isPermissionEdit}
            >
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {(!newAccount && isPermissionEdit) && <Button text="Salvar" style={{ borderRadius: 2 }} onClick={() => { if (newAccount) { handleCreate() } else { handleEdit() } }} />}
                    {(!newAccount && isPermissionEdit) && <Button cancel text="Excluir Conta" style={{ borderRadius: 2 }} onClick={
                        (event) => setShowConfirmationDialog({
                            active: true,
                            event,
                            acceptAction: handleDelete,
                            title: 'Deseja excluír a Conta?',
                            message: 'A Conta será excluída do sistema, sem chance de recuperação.'
                        })} />}
                </Box>
            </SectionHeader>

            {/* usuario */}
            <Box sx={{ display: 'flex', gap: 3, width: '100%', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                    <ContentContainer style={{
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', gap: 1.8, padding: 5, width: '65%'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', padding: '0px 0px 20px 0px' }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold >Dados da Conta</Text>
                            <IconStatus
                                style={{ backgroundColor: accountData.ativo >= 1 ? 'green' : 'red', boxShadow: accountData.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                            />
                        </Box>
                        <Box sx={{ ...styles.inputSection, flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <TextInput disabled={!isPermissionEdit && true} placeholder='Ex: Banco itaú' name='nome_conta' onChange={handleChange} value={accountData?.nome_conta || ''} label='Nome:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='1667' name='agencia' onChange={handleChange} value={accountData?.agencia || ''} label='Agência:' sx={{ width: '100%', }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='16770-01' name='conta' onChange={handleChange} value={accountData?.conta || ''} label='Conta:' sx={{ width: '100%', }} />
                        </Box>
                        <RadioItem disabled={!isPermissionEdit && true} valueRadio={accountData?.ativo} group={groupStatus} title="Status" horizontal={mobile ? false : true} onSelect={(value) => setAccountData({ ...accountData, ativo: parseInt(value) })} />

                        <Box sx={{
                            display: 'flex', width: '100%',
                            padding: '5px'
                        }}>
                            <Button style={{ borderRadius: 2 }} text="Adicionar Saldo Inicial" onClick={() => setNewBalance(true)} />
                        </Box>
                    </ContentContainer>
                    <ContentContainer style={{
                        display: 'flex', flexDirection: 'column', gap: 1.8, padding: 5, width: '35%',
                        position: 'relative'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                            <Text title bold style={{ padding: '0px 0px 20px 0px' }}>Histórico de transferência</Text>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', maxHeight: 280, minHeight: 280 }}>
                            {accountHistoricList?.length > 0 ?
                                accountHistoricList?.map((item, index) => {
                                    return (
                                        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'start', position: 'relative' }}>
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

                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start', flexDirection: 'column' }}>
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
                            <Box sx={{
                                display: 'flex', width: '100%', position: 'absolute', bottom: 20,
                                justifyContent: 'flex-end', right: 20,
                                padding: '5px'
                            }}>
                                <Button style={{ borderRadius: 2 }} text="Nova Transferência" />
                            </Box>
                        </Box>
                    </ContentContainer>
                </Box>

                {!newAccount && <ContentContainer>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ height: '30px', width: 6, backgroundColor: colorPalette.buttonColor }} />
                        <Text bold title>Extrato da conta</Text>
                    </Box>

                    <Box sx={{ ...styles.inputSection, gap: 1, padding: '20px 0px' }}>
                        <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                        <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                        <Button text="Buscar" style={{ borderRadius: 2, width: 130 }} onClick={() => handleSearchExtractAccounts()} />
                    </Box>
                    {startSearch &&
                        <>
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
                            {extractAccount?.length > 0 ?
                                <TableExtract data={extractAccount} setEditAccount={setEditAccount} />
                                :
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text large light>Não foi possível encontrar movimentações na conta.</Text>
                                    <Box sx={{
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        width: 350, height: 250,
                                        backgroundImage: `url('/background/no_results.png')`,
                                    }} />
                                </Box>}
                        </>}

                </ContentContainer>}
            </Box>
            <Backdrop open={accountExtractData?.active} sx={{ zIndex: 99 }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Dados do Pagamento</Text>
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
                        }} onClick={() => setEditAccount({ active: false, data: {} })} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                        <TextInput disabled={!isPermissionEdit && true} placeholder='Ex: Blusa de frio' name='descricao'
                            onChange={handleChangeEditExtractAccount} value={accountExtractData?.data?.descricao || ''}
                            label='Descrição:' sx={{ width: '100%', }} />

                        <TextInput disabled={!isPermissionEdit && true} type="date" name='dt_baixa'
                            onChange={handleChangeEditExtractAccount} value={(accountExtractData?.data?.dt_baixa)?.split('T')[0] || ''}
                            label='Dt Pagamento:' sx={{ width: '100%', }} />

                        <Box sx={{ display: 'flex', gap: .5, width: '100%' }}>
                            <Box sx={{
                                ...styles.menuIcon,
                                width: 14,
                                height: 14,
                                aspectRatio: '1/1',
                                backgroundImage: `url('/icons/${accountExtractData?.data?.credito ? 'arrow_up_green_icon' : 'arrow_down_red_icon'}.png')`,
                                transition: '.3s',
                            }} />
                            <TextInput disabled={!isPermissionEdit && true} placeholder='R$ 5,00' type="coin"
                                name={accountExtractData?.data?.credito ? 'credito' : 'debito'}
                                onChange={handleChangeEditExtractAccount}
                                value={accountExtractData?.data?.credito ? accountExtractData?.data?.credito : accountExtractData?.data?.debito}
                                label={`Valor do ${accountExtractData?.data?.credito ? 'Crédito' : 'Débito'}:`} sx={{ width: '100%', }} />
                        </Box>

                        <SelectList fullWidth disabled={!isPermissionEdit && true}
                            data={accountTypesList}
                            valueSelection={accountExtractData?.data?.tipo}
                            onSelect={(value) => setEditAccount({
                                ...accountExtractData, data: {
                                    ...accountExtractData?.data,
                                    tipo: value
                                }
                            })}
                            title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList fullWidth disabled={!isPermissionEdit && true}
                            data={costCenterList}
                            valueSelection={accountExtractData?.data?.centro_custo}
                            onSelect={(value) => setEditAccount({
                                ...accountExtractData, data: {
                                    ...accountExtractData?.data,
                                    centro_custo: value
                                }
                            })}
                            title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={accountExtractData?.data?.conta_id}
                            onSelect={(value) => setEditAccount({
                                ...accountExtractData, data: {
                                    ...accountExtractData?.data,
                                    conta_id: value
                                }
                            })}
                            title="Conta do pagamento:" filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <Divider />

                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                            <Button text="Salvar" small style={{ height: 35, width: '100%' }} onClick={() => handleEditAccountExtract()} />
                            < Button secondary text="Cancelar" small style={{ height: 35, width: '100%' }} onClick={() => setEditAccount({ active: false, data: {} })} />
                        </Box>
                        {/* <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                            <Button text="Salvar" small style={{ height: 35, width: '100%' }} />
                            < Button secondary text="Cancelar" small style={{ height: 35, width: '100%' }} onClick={() => setEditAccount({ active: false, data: {} })} />
                        </Box> */}
                    </Box>
                </ContentContainer>
            </Backdrop>


            <Backdrop open={newBalance} sx={{ zIndex: 99 }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 999999999, gap: 4, alignItems: 'center' }}>
                        <Text bold large>Adicionar Saldo</Text>
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
                        }} onClick={() => setNewBalance(false)} />
                    </Box>
                    <Divider distance={0} />
                    <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>

                        <TextInput disabled={!isPermissionEdit && true} placeholder='Ex: Saldo inicial' name='descricao' onChange={handleChangeNewBalance}
                            value={newBalanceData?.descricao || ''} label='Descrição:' sx={{ width: '100%' }} />

                        <TextInput disabled={!isPermissionEdit && true}
                            label='Saldo'
                            placeholder='0.00'
                            name='credito'
                            type="coin"
                            onChange={handleChangeNewBalance}
                            value={(newBalanceData?.credito) || ''}
                        />
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountTypesList}
                            valueSelection={newBalanceData?.tipo}
                            onSelect={(value) => setNewBalanceData({ ...newBalanceData, tipo: value })}
                            title="Tipo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={costCenterList} valueSelection={newBalanceData?.centro_custo}
                            onSelect={(value) => setNewBalanceData({ ...newBalanceData, centro_custo: value })}
                            title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <Divider />

                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                            <Button text="Adicionar" small style={{ height: 35, width: '100%' }} onClick={() => addBalanceAccount()} />
                            < Button secondary text="Cancelar" small style={{ height: 35, width: '100%' }} onClick={() => setNewBalance(false)} />
                        </Box>
                        {/* <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                            <Button text="Salvar" small style={{ height: 35, width: '100%' }} />
                            < Button secondary text="Cancelar" small style={{ height: 35, width: '100%' }} onClick={() => setEditAccount({ active: false, data: {} })} />
                        </Box> */}
                    </Box>
                </ContentContainer>
            </Backdrop>
        </>
    )
}


const TableExtract = ({ data = [], filters = [], onPress = () => { }, setEditAccount }) => {
    const { setLoading, colorPalette, theme, user } = useAppContext()

    const columns = [
        { key: 'id_extrato', label: '#Id' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'dt_baixa', label: 'Dt baixa', date: true },
        { key: 'status', label: 'Status' },
        { key: 'credito', label: 'Crédito' },
        { key: 'debito', label: 'Débito' },
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
        (data === 'Baixa realizada' && 'green') ||
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
                                        backgroundColor: item?.transferido === 1 && colorPalette?.buttonColor + '44',
                                        "&:hover": {
                                            backgroundColor: item?.transferido === 1 ? colorPalette?.buttonColor + '22' : colorPalette.primary + '88'
                                        },
                                    }}>
                                        <TableCell sx={{ padding: '8px 10px', textAlign: 'center' }}>
                                            <Text>{item?.id_extrato || '-'}</Text>
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
                                            <Text>{formatTimeStamp(item?.dt_baixa, false) || '-'}</Text>
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
                                                <Text xsmall bold style={{ padding: '5px 5px' }}>{item?.status}</Text>
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
                                                <Text>{formatter.format(item?.debito) || '-'}</Text>
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
                                        <TableCell sx={{ padding: '8px 5px', textAlign: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Button small text="Editar" style={{ height: 30, borderRadius: 2 }} onClick={() => setEditAccount({ active: true, data: item })} />
                                                <Button small cancel text="Excluir" style={{ height: 30, borderRadius: 2, backgroundColor: 'red' }} onClick={() => setEditAccount({ active: true, data: item })} />
                                            </Box>
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