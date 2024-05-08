import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, PaginationTable, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { api } from "../../../../api/api"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../helpers"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { icons } from "../../../../organisms/layout/Colors"

export default function ListReceipts(props) {
    const [installmentsList, setInstallmentsList] = useState([])
    const [filterData, setFilterData] = useState('')
    const [filters, setFilters] = useState({
        parcel: 'todos',
        typePayment: 'todos',
        search: '',
        startDate: '',
        endDate: ''
    })
    const { setLoading, colorPalette, userPermissions, menuItemsList, user, alert, setShowConfirmationDialog,
        theme } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterPayment, setFilterPayment] = useState('todos')
    const [installmentsSelected, setInstallmentsSelected] = useState(null);
    const [newInstallment, setNewInstallment] = useState({
        vencimento: '',
        valor_parcela: '',
        n_parcela: 0,
        c_custo: '',
        forma_pagamento: '',
        conta: ''
    })
    const [showNewParcel, setShowNewParcel] = useState(false)
    const [responsiblePayerData, setResponsiblePayerData] = useState({})
    const [costCenterList, setCostCenterList] = useState([])
    const [accountList, setAccountList] = useState([])
    const [usersList, setUsersList] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showBaixa, setShowBaixa] = useState(false)
    const [baixaData, setBaixaData] = useState({ dt_baixa: '', conta_recebimento: '' })
    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }
    const filterFunctions = {
        parcel: (item) => filters.parcel === 'todos' || item?.status_parcela === filters.parcel,
        typePayment: (item) => filters.typePayment === 'todos' || item?.forma_pagamento === filters.typePayment,
        date: (item) => (filters?.startDate !== '' && filters?.endDate !== '') ? rangeDate(item?.vencimento, filters?.startDate, filters?.endDate) : item,
        search: (item) => {
            const searchTerm = filters?.search;
            if (typeof searchTerm === 'string') {
                const normalizedSearchTerm = removeAccents(searchTerm?.toLowerCase());
                const normalizedItemName = removeAccents(item?.aluno?.toLowerCase());
                return normalizedItemName && normalizedItemName.includes(normalizedSearchTerm);
            }
            return true;
        },
    };

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const rangeDate = (dateString, startDate, endDate) => {
        const date = new Date(dateString);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return date >= start && date <= end;
    }

    const filter = (item) => {
        return Object.values(filterFunctions).every(filterFunction => filterFunction(item));
    };;


    async function listCostCenter() {
        const response = await api.get(`/costCenters`)
        const { data } = response
        const groupCostCenter = data?.map(cc => ({
            label: cc.nome_cc,
            value: cc?.id_centro_custo
        }));

        setCostCenterList(groupCostCenter)
    }


    async function listAccounts() {
        const response = await api.get(`/accounts`)
        const { data } = response
        const groupCostCenter = data?.map(cc => ({
            label: cc.nome_conta,
            value: cc?.id_conta
        }));

        setAccountList(groupCostCenter)
    }


    async function listUsers() {
        try {
            const response = await api.get(`/users`)
            const { data } = response
            const groupUserBy = data?.filter(item => item.perfil?.includes('aluno'))?.map(responsible => ({
                label: responsible.nome,
                value: responsible?.id,
                area: responsible?.area
            }));

            const sortedUsers = groupUserBy?.sort((a, b) => a.label.localeCompare(b.label));
            setUsersList(sortedUsers)
        } catch (error) {
            return error
        }
    }


    async function listEnrollments(userId) {
        try {
            let resp_pagante_id = userId

            const response = await api.get(`/student/enrrolments/${userId}`)
            const { data } = response
            const groupEneollment = data?.map(enrollment => ({
                label: `${enrollment?.nome_curso}_${enrollment?.modalidade_curso}-${enrollment?.nome_turma} ${enrollment?.modulo}º Módulo`,
                value: enrollment?.id_matricula
            }));

            const responsiblePayer = await api.get(`/responsible/${userId}`)
            if (responsiblePayer?.data) {
                resp_pagante_id = responsiblePayer?.data?.id_resp_pag;
            }

            const sortedEnrollments = groupEneollment?.sort((a, b) => a.label.localeCompare(b.label));
            setEnrollments(sortedEnrollments)
            setNewInstallment({ ...newInstallment, usuario_id: userId, resp_pagante_id })
        } catch (error) {
            return error
        }
    }

    useEffect(() => {
        fetchPermissions()
        getInstallments();
        listCostCenter()
        listAccounts()
        listUsers()
    }, []);

    const getInstallments = async () => {
        setLoading(true)
        try {
            const response = await api.get('/student/installments')
            const { data } = response;

            const groupIds = data?.map(ids => ids?.id_parcela_matr).join(',');
            setAllSelected(groupIds)

            setInstallmentsList(data)
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


    const handleChangeInstallmentDate = (installmentId, field, value) => {
        setInstallmentsList(prevInstallments => {
            return prevInstallments?.map(installment => {
                if (installment.id_parcela_matr === installmentId) {
                    return { ...installment, [field]: value };
                }
                return installment;
            });
        });
    };

    const checkValuesNewInstallment = async () => {

        if (newInstallment?.vencimento === '' || newInstallment?.vencimento === null) {
            alert.info(`A data do vencimento da parcela deve ser preenchido. Por favor, preencha o campo antes de prosseguir.`)
            return false
        }
        if (newInstallment?.valor_parcela === '' || newInstallment?.valor_parcela === null) {
            alert.info(`O valor da Parcela deve ser preenchido. Por favor, preencha o campo antes de prosseguir.`)
            return false
        }
        if (newInstallment?.c_custo === '' || newInstallment?.c_custo === null) {
            alert.info(`O centro de custo deve ser preenchido. Por favor, preencha o campo antes de prosseguir.`)
            return false
        }
        if (newInstallment?.n_parcela === '' || newInstallment?.n_parcela === null) {
            alert.info(`O número da parcela deve ser preenchido. Por favor, preencha o campo antes de prosseguir.`)
            return false
        }
        if (newInstallment?.forma_pagamento === '' || newInstallment?.forma_pagamento === null) {
            alert.info(`A forma de pagamento deve ser preenchido. Por favor, preencha o campo antes de prosseguir.`)
            return false
        }
        if (newInstallment?.conta === '' || newInstallment?.conta === null) {
            alert.info(`O conta de recebimento deve ser preenchido. Por favor, preencha o campo antes de prosseguir.`)
            return false
        }

        return true
    }

    const handleAddInstallment = async () => {
        if (await checkValuesNewInstallment()) {
            try {
                setLoading(true)
                const alunoName = await usersList?.filter(item => item.id === newInstallment?.usuario_id)?.map(item => item?.label)
                const installmentData = {
                    usuario_id: newInstallment?.usuario_id,
                    matricula_id: newInstallment?.matricula_id,
                    cartao_credito_id: '',
                    resp_pagante_id: newInstallment?.resp_pagante_id,
                    aluno: alunoName,
                    vencimento: newInstallment?.vencimento,
                    valor_parcela: newInstallment?.valor_parcela,
                    n_parcela: newInstallment?.n_parcela,
                    c_custo: newInstallment?.c_custo,
                    forma_pagamento: newInstallment?.forma_pagamento,
                    conta: newInstallment?.conta,
                    obs_pagamento: 'Nova parcela lançada.',
                    status_parcela: 'Pendente',
                    usuario_resp: user?.id
                }
                const response = await api.post(`/student/installment/add/new`, { installmentData, userData })
                if (response.status === 201) {
                    alert.success('Parcela lançada.')
                    return
                }

                alert.error('Ocorreu um erro ao lançar parcela.')
                return
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        setShowFilterMobile(false)
    }, [filterPayment, filterAtive])


    const handleChange = async (event) => {

        if (event.target.name === 'valor_parcela') {
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

        setNewInstallment((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }))
    }

    const handleBaixa = async () => {
        if (installmentsSelected && baixaData?.conta_recebimento !== '' && baixaData?.dt_baixa !== '') {
            setLoading(true)
            const isToUpdate = installmentsSelected.split(',').map(id => parseInt(id.trim(), 10));

            try {
                const response = await api.patch(`/student/installment/baixa`, { isToUpdate, baixaData, userRespId: user?.id })
                const { status } = response?.data
                if (status) {
                    alert.success('Todas as Baixas foram realizadas com sucesso.');
                    setInstallmentsSelected('');
                    setShowBaixa(false)
                    setBaixaData({ dt_baixa: '', conta_recebimento: '' });
                    getInstallments()
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


    const handleCancelValue = async () => {
        console.log('entrou aqui')
        setLoading(true)
        try {
            const isToUpdate = installmentsSelected.split(',').map(id => parseInt(id.trim(), 10));

            const response = await api.patch(`/student/installment/cancel`, { isToUpdate })
            const { status } = response?.data
            if (status) {
                alert.success('Parcelas canceladas com sucesso.');
                setInstallmentsSelected('');
                setShowBaixa(false)
                setBaixaData({ dt_baixa: '', conta_recebimento: '' });
                getInstallments()
                return
            }
            alert.error('Tivemos um problema ao canceladas as parcelas.');
        } catch (error) {
            console.log(error)
            alert.error('Tivemos um problema ao canceladas as parcelas.');
        } finally {
            setLoading(false)
        }

    }

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Erro com o pagamento' && 'red') ||
        (data === 'Estornada' && '#f0f0f0'))


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const column = [
        { key: 'id_parcela_matr', label: 'ID' },
        { key: 'nivel_curso', label: '' },
        { key: 'curso', label: 'Curso' },
        { key: 'valor_total_curso', label: 'Valor Total', price: true },
        { key: 'n_parcelas', label: 'Parcelas' },
        { key: 'valor_parcelado_curso', label: 'Valor parcelado', price: true },
        { key: 'valor_avista_curso', label: 'á vista (desconto 5%)', price: true }
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
        { label: 'Erro com o pagamento', value: 'Erro com o pagamento' },
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

    const sortedInstallments = [...installmentsList].sort((a, b) => {
        const dateA = new Date(a.vencimento);
        const dateB = new Date(b.vencimento);

        return dateA - dateB;
    });

    const totalValueToReceive = (status) => installmentsList
        ?.filter(item => item?.status_parcela === status)
        ?.map(item => item?.valor_parcela)
        ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);


    const totalValueCanceled = installmentsList
        ?.filter(item => (item?.status_parcela === 'Cancelada') || (item?.status_parcela === 'Inativa') || (item?.status_parcela === 'Estornada'))
        ?.map(item => item?.valor_parcela)
        ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);

    return (
        <>
            <SectionHeader
                title={`Parcelas do Curso (${installmentsList.filter(filter)?.length || '0'})`}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                </Box>
                <TextInput placeholder="Buscar pelo pagante ou aluno" name='filterData' type="search" onChange={(e) => setFilters({ ...filters, search: e.target.value })} value={filters?.search} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        <SelectList
                            data={listAtivo}
                            valueSelection={filters?.parcel}
                            onSelect={(value) => setFilters({ ...filters, parcel: value })}
                            title="Status Parcela"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <SelectList
                            data={listPayment}
                            valueSelection={filters?.typePayment}
                            onSelect={(value) => setFilters({ ...filters, typePayment: value })}
                            title="tipo de pagamento"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                        <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />

                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFilterPayment('todos')
                            setFilterAtive('todos')
                            setFilterData('')
                        }} />
                    </Box>
                </Box>
            </ContentContainer>

            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar pelo pagante ou aluno" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={installmentsList?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Items"
                        style={{ color: colorPalette.textColor }} // Define a cor do texto
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de voltar
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }} // Define a cor do ícone de avançar
                    />
                </Box>
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
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, alignItems: 'start', flexDirection: 'column', width: '100%' }}>
                            <SelectList
                                fullWidth
                                data={listAtivo}
                                valueSelection={filterAtive}
                                onSelect={(value) => setFilterAtive(value)}
                                title="status"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList
                                fullWidth
                                data={listPayment}
                                valueSelection={filterPayment}
                                onSelect={(value) => setFilterPayment(value)}
                                title="tipo de pagamento"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilterPayment('todos')
                                setFilterAtive('todos')
                                setFilterData('')
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            <Box sx={{
                display: 'flex', flexDirection: 'row', gap: 4,
                overflowY: 'auto',
                scrollbarColor: 'transparent transparent',
            }}>
                <Box sx={{
                    display: 'flex',
                    backgroundColor: colorPalette.secondary,
                    gap: 2,
                    alignItems: 'center',
                    maxWidth: 250,
                    padding: '5px 10px 5px 10px',
                    borderRadius: 2,
                    justifyContent: 'start',
                }}
                >
                    <Box sx={{ display: 'flex', backgroundColor: 'green', padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                    <Text>Total Recebido:</Text>
                    <Text bold style={{ color: 'green' }}>{formatter.format(totalValueToReceive('Pago')) || 'R$ 0,00'}</Text>
                </Box>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    backgroundColor: colorPalette.secondary,
                    alignItems: 'center',
                    padding: '5px 10px 5px 10px',
                    borderRadius: 2,
                    justifyContent: 'start',

                }}
                >
                    <Box sx={{ display: 'flex', backgroundColor: 'blue', padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />

                    <Text>Pagamentos em Processamento:</Text>
                    <Text bold>{formatter.format(totalValueToReceive('Aprovado')) || 'R$ 0,00'}</Text>

                </Box>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    backgroundColor: colorPalette.secondary,
                    alignItems: 'center',
                    padding: '5px 10px 5px 10px',
                    borderRadius: 2,
                    justifyContent: 'start',

                }}
                >
                    <Box sx={{ display: 'flex', backgroundColor: 'yellow', padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />

                    <Text>Total a receber:</Text>
                    <Text bold>{formatter.format(totalValueToReceive('Pendente')) || 'R$ 0,00'}</Text>

                </Box>

                <Box sx={{
                    display: 'flex',
                    padding: '5px 10px 5px 10px',
                    backgroundColor: colorPalette.secondary,
                    gap: 2,
                    height: 50,
                    alignItems: 'center',
                    borderRadius: 2,
                    justifyContent: 'start',

                }}
                >
                    <Box sx={{ display: 'flex', backgroundColor: 'red', padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                    <Text>Total cancelado/Estornado:</Text>
                    <Text bold>{formatter.format(totalValueCanceled) || 'R$ 0,00'}</Text>
                </Box>

            </Box>

            <Box sx={{
                display: 'flex',
                display: 'flex', gap: 2, flexWrap: 'wrap'
            }}>
                <Box sx={{
                    width: '180px', height: '35px', borderRadius: 2, backgroundColor: colorPalette?.buttonColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: '.3s',
                    cursor: 'pointer',
                    "&:hover": {
                        transform: 'scale(1.1, 1.1)',
                        opacity: .8,

                    }
                }} onClick={() => setShowNewParcel(true)}>
                    <Text bold small style={{ color: '#fff' }}>Lançar nova parcela</Text>
                </Box>
            </Box>

            {installmentsList.length > 0 ?
                <div style={{
                    borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap',
                    backgroundColor: colorPalette?.secondary,
                    border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
                }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                                <th style={{ padding: '8px 0px', display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                    Tudo
                                    <CheckBoxComponent
                                        disabled={!isPermissionEdit && true}
                                        boxGroup={[{ value: 'allSelect' }]}
                                        valueChecked={'select'}
                                        horizontal={true}
                                        onSelect={() => {
                                            if (installmentsSelected?.length < allSelected?.length) {
                                                let allInstallmentSelected = installmentsList?.filter(filter)?.map(item => item?.id_parcela_matr)
                                                setInstallmentsSelected(allInstallmentSelected?.toString())
                                            } else {
                                                setInstallmentsSelected(null)
                                            }
                                        }}
                                        padding={0}
                                        gap={0}
                                        sx={{ display: 'flex', maxWidth: 25 }}
                                    />
                                </th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Pagante</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Aluno</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Vencimento</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Pagamento</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '55px' }}><Text bold>Parc.</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>C. Custo</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Forma</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Conta</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Obs</Text></th>
                                {/* <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Status BemPaggo</Text></th> */}
                                <th style={{ padding: '8px 0px', minWidth: '120px' }}><Text bold>Status</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>ID BemP</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '180px' }}><Text bold>Protestada</Text></th>
                            </tr>
                        </thead>
                        <tbody style={{ flex: 1, }}>
                            {sortedInstallments?.filter(filter)?.slice(startIndex, endIndex).map((item, index) => {
                                const isSelected = installmentsSelected?.includes(item?.id_parcela_matr) || null;
                                return (
                                    <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary }}>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <CheckBoxComponent
                                                disabled={!isPermissionEdit && true}
                                                boxGroup={groupSelect(item?.id_parcela_matr)}
                                                valueChecked={installmentsSelected}
                                                horizontal={true}
                                                onSelect={(value) => {
                                                    if (item?.id_parcela_matr) {
                                                        setInstallmentsSelected(value);
                                                    }
                                                }}
                                                padding={0}
                                                gap={0}
                                                sx={{ display: 'flex', maxWidth: 25 }}
                                            />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.pagante || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.aluno || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <TextInput disabled={!isPermissionEdit && true} name='vencimento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.vencimento)?.split('T')[0] || ''} small type="date" sx={{ padding: '0px 8px' }} />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <TextInput disabled={!isPermissionEdit && true} name='dt_pagamento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.dt_pagamento)?.split('T')[0] || ''} small type="date" sx={{ padding: '0px 8px' }} />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {formatter.format(item?.valor_parcela)}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.n_parcela || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.c_custo || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.forma_pagamento || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.conta || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <TextInput
                                                disabled={!isPermissionEdit && true}
                                                name='obs_pagamento'
                                                onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)}
                                                value={item?.obs_pagamento || ''}
                                                sx={{ padding: '0px 8px' }}
                                            />
                                        </td>
                                        {/* <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.status_gateway || '-'}
                                        </td> */}
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    height: 35,
                                                    backgroundColor: colorPalette.primary,
                                                    gap: 1,
                                                    alignItems: 'center',
                                                    borderRadius: 2,
                                                    justifyContent: 'start',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.status_parcela), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                <Text small bold style={{ textAlign: 'center', flex: 1 }}>{item?.status_parcela || ''}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.referenceId || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <RadioItem disabled={!isPermissionEdit && true} valueRadio={item?.parc_protestada} group={groupProstated} horizontal={true} onSelect={(value) => handleChangeInstallmentDate(item?.id_parcela_matr, 'parc_protestada', parseInt(value))} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>

                    <PaginationTable data={sortedInstallments?.filter(filter)}
                        page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                    />

                </div>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não existem parcelas a receber</Text>
                </Box>
            }

            {(installmentsSelected && isPermissionEdit) && <>
                <Box sx={{
                    display: 'flex', position: 'fixed',
                    left: { xs: 20, sm: 20, md: 280, lg: 280, xl: 280 }, bottom: 20, display: 'flex', gap: 2, flexWrap: 'wrap'
                }}>
                    <Button text="Dar baixa" style={{ width: '120px', height: '40px' }} onClick={() => setShowBaixa(true)} />
                    <Button secondary text="Cancelar" style={{ width: '120px', height: '40px', backgroundColor: colorPalette.primary }}
                        onClick={(event) => setShowConfirmationDialog({
                            active: true,
                            event,
                            acceptAction: handleCancelValue,
                            title: `Cancelar Parcelas?`,
                            message: 'Tem certeza que deseja seguir com o cancelamento?'
                        })} />
                </Box>
                <Box sx={{ display: 'flex', position: 'fixed', right: 60, bottom: 20, display: 'flex', gap: 2 }}>
                    <Button text="Salvar" style={{ width: '120px', height: '40px' }} />
                </Box>
            </>
            }

            <Backdrop open={showNewParcel} sx={{ zIndex: 999, overflow: 'auto', }}>
                <ContentContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text bold large>Lançar nova parcela</Text>
                        <Box sx={{
                            ...styles.menuIcon,
                            backgroundImage: `url(${icons.gray_close})`,
                            transition: '.3s',
                            "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} onClick={() => {
                            setShowNewParcel(false)
                            setNewInstallment({})
                        }} />
                    </Box>
                    <Divider padding={0} />
                    <Box sx={{ display: 'flex', gap: 1.8, flexDirection: 'column' }}>

                        <SelectList onFilter={true} filterValue="label" disabled={!isPermissionEdit && true}
                            fullWidth data={usersList} valueSelection={newInstallment?.usuario_id}
                            onSelect={(value) => listEnrollments(value)}
                            title="Busque pelo aluno" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />

                        {newInstallment?.usuario_id &&
                            <SelectList disabled={!isPermissionEdit && true}
                                fullWidth data={enrollments} valueSelection={newInstallment?.matricula_id}
                                onSelect={(value) => setNewInstallment({ ...newInstallment, matricula_id: value })}
                                title="Seleciona em qual matrícula irá lançar:" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            />}



                        <Box sx={{ display: 'flex', gap: 1.8 }}>
                            <TextInput placeholder='Dt Vencimento' name='vencimento' type="date" onChange={handleChange} value={newInstallment?.vencimento || ''}
                                label='Dt Vencimento' sx={{ flex: 1, }} />
                            <TextInput placeholder='Valor' name='valor_parcela' type="coin" onChange={handleChange} value={newInstallment?.valor_parcela || ''}
                                label='Valor' sx={{ flex: 1, }} />
                            <TextInput placeholder='Nº Parcela' name='n_parcela' type="number" onChange={handleChange} value={newInstallment?.n_parcela || ''}
                                label='Nº Parcela' sx={{ flex: 1, }} />
                        </Box>
                        <SelectList fullWidth data={costCenterList} valueSelection={newInstallment?.c_custo}
                            onSelect={(value) => setNewInstallment({ ...newInstallment, c_custo: value })}
                            title="Centro de Custo: " filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <SelectList fullWidth data={listPayment} valueSelection={newInstallment?.forma_pagamento || ''} onSelect={(value) => setNewInstallment({ ...newInstallment, forma_pagamento: value })}
                            filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                            title="Selecione a forma de pagamento *"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                            clean={false}
                        />
                        <SelectList fullWidth data={accountList} valueSelection={newInstallment?.conta} onSelect={(value) => setNewInstallment({ ...newInstallment, conta: value })}
                            title="Conta do recebimento" filterOpition="value" sx={{ color: colorPalette.textColor }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />
                        <TextInput placeholder='Observações' name='obs_pagamento' onChange={handleChange}
                            value={newInstallment?.obs_pagamento || ''}
                            multiline
                            maxRows={5}
                            rows={3}
                            label='Observações' sx={{ flex: 1, }} />
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Button text="Lançar" small style={{ width: 120, height: 35 }} onClick={handleAddInstallment} />
                        <Button text="Cancelar" secondary small onClick={() => {
                            setShowNewParcel(false)
                            setNewInstallment({})
                        }} style={{ width: 120, height: 35 }} />
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
                        <SelectList fullWidth disabled={!isPermissionEdit && true} data={accountList} valueSelection={baixaData?.conta_recebimento} onSelect={(value) => setBaixaData({ ...baixaData, conta_recebimento: value })}
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
                                title: `Dar Baixa das parcelas`,
                                message: 'Tem certeza que deseja seguir com a as baixas?'
                            })} />
                        <Button disabled={!isPermissionEdit && true} small secondary text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => {
                                setShowBaixa(false)
                                setBaixaData({ dt_baixa: '', conta_recebimento: '' });
                            }} />
                    </Box>
                </ContentContainer>
            </Backdrop>

        </>
    )
}

const styles = {
    containerRegister: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.5,
        padding: '40px'
    },
    menuIcon: {
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 15,
        height: 15,
    },
}
