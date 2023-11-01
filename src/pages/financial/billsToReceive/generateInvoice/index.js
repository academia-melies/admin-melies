import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
import { api } from "../../../../api/api"
import { useAppContext } from "../../../../context/AppContext"
import { SelectList } from "../../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../../helpers"
import { TablePagination } from "@mui/material"

export default function ListInvoices(props) {
    const [invoicesList, setInvoicesList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterPayment, setFilterPayment] = useState('todos')
    const [invoicesSelected, setInvoicesSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };
        const normalizedFilterData = normalizeString(filterData);
        const matchesFilterData = (
            normalizeString(item?.aluno)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()) ||
            normalizeString(item?.pagante)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
        );
        const matchesFilterActive = (
            filterAtive === 'todos' ||
            normalizeString(item?.status_parcela) === filterAtive
        );
        const matchesFilterPayment = (
            filterPayment === 'todos' ||
            item.forma_pagamento === filterPayment
        );

        return matchesFilterData && matchesFilterActive && matchesFilterPayment;
    };


    useEffect(() => {
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

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Estornada' && '#f0f0f0'))


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'Pendente', value: 'Pendente' },
        { label: 'Inativa', value: 'Inativa' },
        { label: 'Paga', value: 'Paga' },
        { label: 'Cancelada', value: 'Cancelada' },
        { label: 'Pagamento reprovado', value: 'Pagamento reprovado' },
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

    const totalValueToReceive = invoicesList
        ?.filter(item => item?.status_parcela === 'Pendente')
        ?.map(item => item?.valor_parcela)
        ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);



    return (
        <>
            <SectionHeader
                title={`Emissão NF-e (${invoicesList.filter(filter)?.length || '0'})`}
            />
            <ContentContainer>
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
                <SearchBar placeholder='Pesquise pelo pagante ou aluno' style={{ backgroundColor: colorPalette.inputColor, transition: 'background-color 1s', }} onChange={setFilterData} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'start', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                        <SelectList
                            data={listAtivo}
                            valueSelection={filterAtive}
                            onSelect={(value) => setFilterAtive(value)}
                            title="status"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'end' }}>
                        <Button secondary text="Limpar filtros" small style={{ width: 120, height: '30px' }} onClick={() => {
                            setFilterAtive('todos')
                            setFilterData('')
                        }} />
                    </Box>
                    <TablePagination
                        component="div"
                        count={invoicesList?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        style={{ color: colorPalette.textColor }}
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }}
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }}
                    />
                </Box>
            </ContentContainer>

            {invoicesList.length > 0 ?
                <div style={{ borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap', border: `1px solid ${colorPalette.textColor}` }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                        <thead>
                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                <th style={{ padding: '4px 0px', display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                    Selecionar
                                    <CheckBoxComponent
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
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Aluno</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Pagante</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>CPF</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Valor</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Vencimento</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '55px' }}>Nº parc.</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>C. Custo</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Parcela Paga</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '180px' }}>E-mail</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>CEP</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Endereço</th>
                                <th style={{ padding: '4px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Status BemPaggo</th>
                            </tr>
                        </thead>
                        <tbody style={{ flex: 1, }}>
                            {sortedInstallments?.filter(filter)?.slice(startIndex, endIndex).map((item, index) => {
                                const isSelected = invoicesSelected?.includes(item?.id_parcela_matr) || null;
                                const parcelPaying = (item?.status_parcela === 'Cancelada' || item?.status_parcela === 'Inativa') ? item?.status_parcela : (item?.dt_pagamento ? 'Sim' : 'Não');
                                const address = `${item?.rua}, ${item?.numero} - ${item?.bairro}, ${item?.cidade}-${item?.uf}`
                                return (
                                    <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary }}>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            <CheckBoxComponent
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
                                            {item?.aluno || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.pagante || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.cpf}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {formatter.format(item?.valor_parcela)}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            <TextInput name='vencimento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.vencimento)?.split('T')[0] || ''} small type="date" sx={{ padding: '0px 2px' }} />
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
                                                    gap: 2,
                                                    alignItems: 'center',
                                                    width: 100,
                                                    borderRadius: 2,
                                                    justifyContent: 'start',

                                                }}
                                            >
                                                <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.status_parcela), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                <Text small bold>{item?.status_parcela || ''}</Text>
                                            </Box>
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.email || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.cep || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {address}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                            {item?.status_gateway || '-'}
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
                <Box sx={{ display: 'flex', position: 'fixed', left: 280, bottom: 20, display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>Linhas selecionadas: </Text>
                    <Text bold>{invoicesSelected?.split(',')?.length}</Text>
                </Box>

                <Box sx={{ display: 'flex', position: 'fixed', right: 60, bottom: 20, display: 'flex', gap: 2 }}>
                    <Button text="Emitir NF" style={{ width: '120px', height: '40px' }} />
                    <Button text="Salvar" style={{ width: '120px', height: '40px' }} />
                    <Button secondary text="Excluir" style={{ width: '120px', height: '40px', backgroundColor: colorPalette.primary }} />
                </Box>
            </>
            }
        </>
    )
}
