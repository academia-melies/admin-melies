import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, PaginationTable, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { api } from "../../../../api/api"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatTimeStamp, formatTimeStampTimezone } from "../../../../helpers"
import { Backdrop, TablePagination } from "@mui/material"
import Link from "next/link"
import { checkUserPermissions } from "../../../../validators/checkPermissionUser"
import { icons } from "../../../../organisms/layout/Colors"

export default function ListInvoices(props) {
    const [invoicesList, setInvoicesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette, user, setShowConfirmationDialog, alert, userPermissions, menuItemsList,
        theme } = useAppContext()
    const [filters, setFilters] = useState({
        parcel: 'todos',
        nfse: 'todos',
        search: '',
        startDate: '',
        endDate: ''
    })
    const [filterPayment, setFilterPayment] = useState('todos')
    const [invoicesSelected, setInvoicesSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const [showFilterMobile, setShowFilterMobile] = useState(false)

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
        nfse: (item) => filters.nfse === 'todos' || item?.status_nfse === filters.nfse,
        date: (item) => (filters?.startDate !== '' && filters?.endDate !== '') ? rangeDate(item?.vencimento, filters?.startDate, filters?.endDate) : item,
        search: (item) => {
            const normalizedSearchTerm = removeAccents(filters?.search.toLowerCase());
            const normalizedItemName = item?.pagante ? removeAccents(item?.pagante?.toLowerCase()) : removeAccents(item?.aluno?.toLowerCase());
            return normalizedItemName && normalizedItemName?.includes(normalizedSearchTerm)
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

    useEffect(() => {
        fetchPermissions()
        getInstallments();
    }, []);

    const getInstallments = async () => {
        setLoading(true)
        try {
            const response = await api.get('/student/installments/invoices')
            const { data } = response;
            const groupIds = data?.map(ids => ids?.id_parcela_matr).join(',');
            setAllSelected(groupIds)
            setInvoicesList(data)
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
        setInvoicesList(prevInstallments => {
            return prevInstallments?.map(installment => {
                if (installment.id_parcela_matr === installmentId) {
                    return { ...installment, [field]: value };
                }
                return installment;
            });
        });
    };

    const handleGenerateInvoice = async () => {
        if (verifyExistsNfse()) {
            try {
                setLoading(true)
                const selectedIds = invoicesSelected?.split(',').map(id => parseInt(id.trim(), 10));
                let installmentData = invoicesList?.filter(item => selectedIds?.includes(item?.id_parcela_matr));
                const response = await api.post(`/nfse/create/${user?.id}`, { installmentData })
                const { data } = response;
                if (response?.status === 201) {
                    alert.success('Notas enviadas para processamento.')
                    await getInstallments()
                    setInvoicesSelected(null)
                } else {
                    alert.error('Ocorreu um erro ao enviar notas para processamento. Tente novamente mais tarde.')
                    return
                }
            } catch (error) {
                console.log(error)
                alert.error('Ocorreu um erro ao enviar notas para processamento. Tente novamente mais tarde.')
                return error
            } finally {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        setShowFilterMobile(false)
    }, [filters])

    const verifyExistsNfse = () => {
        const selectedIds = invoicesSelected?.split(',').map(id => parseInt(id.trim(), 10));
        let installmentData = invoicesList?.filter(item => selectedIds?.includes(item?.id_parcela_matr));
        let [verifyNfseExists] = installmentData?.map(item => item.url_nfse_pdf !== null)
        if (verifyNfseExists) {
            alert.error('Você selecionou alguma nota que já possui NFSe gerada. Selecione apenas notas que ainda não foram emitidas. ')
            return false
        }
        return true
    }

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento' || '') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        ((data === 'Pago' || data === 'Emitida/Autorizada') && 'green') ||
        ((data === 'Aprovado' || data === 'Documento substituido') && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        ((data === 'Erro com o pagamento' || data === 'Erro na autorização') && 'red') ||
        (data === 'Não emitida' && 'gray') ||
        (data === 'Estornada' && '#f0f0f0'))


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Inativa', value: 'Inativa' },
        { label: 'Pago', value: 'Pago' },
        { label: 'Aprovado/Liquidado', value: 'Aprovado' },
        { label: 'Cancelada', value: 'Cancelada' },
        { label: 'Pagamento reprovado', value: 'Pagamento reprovado' },
        { label: 'Erro com o pagamento', value: 'Erro com o pagamento' },
    ]


    const listStatusNF = [
        { label: 'Todos', value: 'todos' },
        { label: 'Em processamento', value: 'Em processamento' },
        { label: 'Não emitida', value: 'Não emitida' },
        { label: 'Emitida/Autorizada', value: 'Emitida/Autorizada' },
        { label: 'Cancelada', value: 'Cancelada' },
        { label: 'Erro na autorização', value: 'Erro na autorização' },
        { label: 'Documento substituido', value: 'Documento substituido' },
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

    const sortedInstallments = [...invoicesList].sort((a, b) => {
        const dateA = new Date(a.vencimento);
        const dateB = new Date(b.vencimento);

        return dateA - dateB;
    });

    const totalValueToReceive = invoicesList?.filter(filter)
        ?.filter(item => item?.status_parcela === 'Pendente')
        ?.map(item => item?.valor_parcela)
        ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);



    return (
        <>
            <SectionHeader
                title={`Emissão NF-e (${invoicesList.filter(filter)?.length || '0'})`}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Text style={{ color: '#d6d6d6' }} light>Mostrando</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{invoicesList?.filter(filter)?.length || '0'}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>de</Text>
                        <Text bold style={{ color: '#d6d6d6' }} light>{invoicesList?.length || 0}</Text>
                        <Text style={{ color: '#d6d6d6' }} light>parcelas</Text>
                    </Box>
                </Box>
                <TextInput placeholder="Buscar pelo nome.." name='filters' type="search" onChange={(event) => setFilters({ ...filters, search: event.target.value })} value={filters?.search} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 1, alignItems: 'center', flexDirection: 'row' }}>
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
                            data={listStatusNF}
                            valueSelection={filters?.nfse}
                            onSelect={(value) => setFilters({ ...filters, nfse: value })}
                            title="Status NFSe"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                        <Box sx={{ ...styles.inputSection, gap: 1, padding: '20px 0px' }}>
                            <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                            <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} sx={{ flex: 1, }} />
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                                setFilters({
                                    parcel: 'todos',
                                    nfse: 'todos',
                                    search: '',
                                    startDate: '',
                                    endDate: ''
                                })
                            }} />
                        </Box>
                    </Box>
                </Box>
            </ContentContainer>


            <Box sx={{ display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' }, flexDirection: 'column', gap: 2 }}>
                <TextInput placeholder="Buscar pelo nome.." name='filters' type="search" onChange={(event) => setFilters({ ...filters, search: event.target.value })} value={filters?.search} sx={{ flex: 1 }} />
                <Button secondary style={{ height: 35, borderRadius: 2 }} text="Editar Filtros" onClick={() => setShowFilterMobile(true)} />
                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <TablePagination
                        component="div"
                        count={invoicesList?.filter(filter)?.length}
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
                                valueSelection={filters?.parcel}
                                onSelect={(value) => setFilters({ ...filters, parcel: value })}
                                title="Status Parcela"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <SelectList
                                fullWidth
                                data={listStatusNF}
                                valueSelection={filters?.nfse}
                                onSelect={(value) => setFilters({ ...filters, nfse: value })}
                                title="Status NFSe"
                                filterOpition="value"
                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                                clean={false}
                            />
                            <Box sx={{ ...styles.inputSection, gap: 1, padding: '20px 0px', display: 'flex' }}>
                                <TextInput label="De:" name='startDate' onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} type="date" value={(filters?.startDate)?.split('T')[0] || ''} sx={{ width: '100%' }} />
                                <TextInput label="Até:" name='endDate' onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} type="date" value={(filters?.endDate)?.split('T')[0] || ''} sx={{ width: '100%' }} />
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, display: 'flex', position: 'absolute', bottom: 50, width: '100%' }}>
                            <Button secondary text="Limpar filtros" small style={{ width: '100%', height: '40px' }} onClick={() => {
                                setFilters({
                                    parcel: 'todos',
                                    nfse: 'todos',
                                    search: '',
                                    startDate: '',
                                    endDate: ''
                                })
                            }} />
                        </Box>
                    </Box>
                </ContentContainer>
            </Backdrop>

            {invoicesList.length > 0 ?
                <div style={{
                    borderRadius: '8px', overflowX: 'auto', marginTop: '10px', flexWrap: 'nowrap',
                    backgroundColor: colorPalette?.secondary,
                    border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
                }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', overflowX: 'auto', }}>
                        <thead>
                            <tr style={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                                <th style={{ padding: '4px 0px', display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                    Selecionar
                                    <CheckBoxComponent
                                        disabled={!isPermissionEdit && true}
                                        boxGroup={[{ value: 'allSelect' }]}
                                        valueChecked={'select'}
                                        horizontal={true}
                                        onSelect={() => {
                                            if (invoicesSelected?.length < allSelected?.length) {
                                                let allInstallmentSelected = invoicesList?.filter(filter)?.map(item => item?.id_parcela_matr)
                                                setInvoicesSelected(allInstallmentSelected?.toString())
                                            } else {
                                                setInvoicesSelected(null)
                                            }
                                        }}
                                        padding={0}
                                        gap={0}
                                        sx={{ display: 'flex', maxWidth: 25 }}
                                    />
                                </th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Pagante</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>CPF</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Vencimento</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Pagamento</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '55px' }}><Text bold>Nº parc.</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>C. Custo</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Parcela Paga</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Emissão NFSe</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '80px' }}><Text bold>NFSe PDF</Text></th>
                                <th style={{ padding: '4px 0px', minWidth: '80px' }}><Text bold>NFSe XML</Text></th>
                            </tr>
                        </thead>
                        <tbody style={{ flex: 1, }}>
                            {sortedInstallments?.filter(filter)?.slice(startIndex, endIndex).map((item, index) => {
                                const isSelected = invoicesSelected?.includes(item?.id_parcela_matr) || null;
                                const parcelPaying = (item?.status_parcela === 'Cancelada' || item?.status_parcela === 'Inativa') ? item?.status_parcela : (item?.dt_pagamento ? 'Sim' : 'Não');
                                const address = `${item?.rua}, ${item?.numero} - ${item?.bairro}, ${item?.cidade}-${item?.uf}`
                                return (
                                    <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary }}>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', borderBottom: '1px solid lightgray' }}>
                                            <CheckBoxComponent
                                                disabled={!isPermissionEdit && true}
                                                boxGroup={groupSelect(item?.id_parcela_matr)}
                                                valueChecked={invoicesSelected}
                                                horizontal={true}
                                                onSelect={(value) => {
                                                    if (item?.id_parcela_matr) {
                                                        setInvoicesSelected(value);
                                                    }
                                                }}
                                                padding={0}
                                                gap={0}
                                                sx={{ display: 'flex', maxWidth: 25 }}
                                            />
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.pagante == null ? item?.aluno : item?.pagante || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.cpf}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {formatter.format(item?.valor_parcela)}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            <TextInput disabled={!isPermissionEdit && true} fullWidth name='vencimento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.vencimento)?.split('T')[0] || ''} small type="date" sx={{ flex: 1 }} />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            <Text small light>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.n_parcela || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.c_custo || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    height: 30,
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
                                        <td style={{ fontSize: '13px', flex: 1, padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
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
                                                <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.status_nfse || 'Não emitida'), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                <Text small bold style={{ textAlign: 'center', flex: 1 }}>{item?.status_nfse || 'Não emitida'}</Text>
                                            </Box>
                                        </td>

                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.url_nfse_pdf ?
                                                <Link href={item?.url_nfse_pdf || ''} target="_blank">
                                                    <Button bold small style={{ height: 25, borderRadius: 2 }} text="Abrir pdf" />
                                                </Link> : '-'
                                            }
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.url_nfse_xml ? <Link href={item?.url_nfse_xml || ''} target="_blank" underline="hover" color="primary">
                                                <Button bold small style={{ height: 25, borderRadius: 2 }} text="Abrir XML" />
                                            </Link>
                                                : '-'
                                            }
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
                    <Text bold>Não existem parcelas para emitir nota</Text>
                </Box>
            }
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', }}>
                <Text large>Valor a receber :</Text>
                <Text title bold>{formatter.format(totalValueToReceive)}</Text>
            </Box>

            {invoicesSelected && <>
                <Box sx={{
                    display: 'flex', position: 'fixed',
                    left: { xs: 150, sm: 150, md: 280, lg: 280, xl: 280 }, bottom: 20, display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center'
                }}>
                    <Text>Linhas selecionadas: </Text>
                    <Text bold>{invoicesSelected?.split(',')?.length}</Text>
                </Box>

                <Box sx={{ display: 'flex', position: 'fixed', right: { xs: 10, sm: 10, md: 60, lg: 60, xl: 60 }, bottom: 55, display: 'flex', gap: 2 }}>
                    <Button text="Emitir NF" style={{ width: '120px', height: '40px' }} onClick={(event) => setShowConfirmationDialog({
                        active: true,
                        event,
                        acceptAction: handleGenerateInvoice,
                        title: 'Emitir NFSe',
                        message: 'Tem certeza que deseja emitir as Notas selecionadas?'
                    })} />
                    <Button text="Salvar" style={{ width: '120px', height: '40px' }} />
                    <Button secondary text="Excluir" style={{ width: '120px', height: '40px', backgroundColor: colorPalette.primary }} />
                </Box>
            </>
            }
        </>
    )
}

export const styles = {
    inputSection: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: 1.8,
        flexDirection: { xs: 'row', sm: 'row', md: 'row', lg: 'row' }
    },
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
