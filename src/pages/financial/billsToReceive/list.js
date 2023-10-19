import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { formatTimeStamp } from "../../../helpers"
import { TablePagination } from "@mui/material"

export default function ListBillsToPay(props) {
    const [installmentsList, setInstallmentsList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterPayment, setFilterPayment] = useState('todos')
    const [installmentsSelected, setInstallmentsSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    // const filter = (item) => {
    //     const normalizeString = (str) => {
    //         return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //     };
    //     const normalizedFilterData = normalizeString(filterData);

    //     if (filterAtive === 'todos') {
    //         return (normalizeString(item?.aluno)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())) || (normalizeString(item?.pagante)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()));
    //     } else {
    //         return normalizeString(item?.ativo) === filterAtive && (normalizeString(item?.aluno)?.toLowerCase().includes(normalizedFilterData?.toLowerCase())) || (normalizeString(item?.pagante)?.toLowerCase().includes(normalizedFilterData?.toLowerCase()));
    //     }
    // };
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

    const priorityColor = (data) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Pagamento reprovado' || data === 'Não Autorizado') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
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
        ?.filter(item => (item?.status_parcela === 'Cancelada') || (item?.status_parcela === 'Inativa'))
        ?.map(item => item?.valor_parcela)
        ?.reduce((acc, currentValue) => acc + (currentValue || 0), 0);

    return (
        <>
            <SectionHeader
                title={`Contas a receber (${installmentsList.filter(filter)?.length || '0'})`}
            />
            <ContentContainer>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                </Box>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <SearchBar placeholder='Pesquise pelo pagante ou aluno' style={{ backgroundColor: colorPalette.inputColor, transition: 'background-color 1s', }} onChange={setFilterData} />
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
                        <SelectList
                            data={listPayment}
                            valueSelection={filterPayment}
                            onSelect={(value) => setFilterPayment(value)}
                            title="tipo de pagamento"
                            filterOpition="value"
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                            clean={false}
                        />

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

            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
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

                    <Text>Pagamentos aprovados (Cartão):</Text>
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
                    <Text>Total cancelado:</Text>
                    <Text bold>{formatter.format(totalValueCanceled) || 'R$ 0,00'}</Text>
                </Box>

            </Box>

            {installmentsList.length > 0 ?
                <div style={{ borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap', border: `1px solid ${colorPalette.textColor}` }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                        <thead>
                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff' }}>
                                <th style={{ padding: '8px 0px', display: 'flex', color: colorPalette.textColor, backgroundColor: colorPalette.primary, fontSize: '9px', flexDirection: 'column', fontFamily: 'MetropolisBold', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                                    Selecionar
                                    <CheckBoxComponent
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
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Pagante</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Aluno</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Vencimento</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Data de Pagamento</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Valor</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '55px' }}>Nº parc.</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '180px' }}>Protestada</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>C. Custo</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Forma de Pagamento</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Conta</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Obs</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Status BemPaggo</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Status Sistema</th>
                            </tr>
                        </thead>
                        <tbody style={{ flex: 1, }}>
                            {sortedInstallments?.filter(filter)?.slice(startIndex, endIndex).map((item, index) => {
                                const isSelected = installmentsSelected?.includes(item?.id_parcela_matr) || null;
                                return (
                                    <tr key={index} style={{ backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary }}>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <CheckBoxComponent
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
                                            <TextInput name='vencimento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.vencimento)?.split('T')[0] || ''} small type="date" sx={{ padding: '0px 8px' }} />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <TextInput name='dt_pagamento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.dt_pagamento)?.split('T')[0] || ''} small type="date" sx={{ padding: '0px 8px' }} />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {formatter.format(item?.valor_parcela)}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.n_parcela || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <RadioItem valueRadio={item?.parc_protestada} group={groupProstated} horizontal={true} onSelect={(value) => handleChangeInstallmentDate(item?.id_parcela_matr, 'parc_protestada', parseInt(value))} />
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
                                                name='obs_pagamento'
                                                onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)}
                                                value={item?.obs_pagamento || ''}
                                                sx={{ padding: '0px 8px' }}
                                            />
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            {item?.status_gateway || '-'}
                                        </td>
                                        <td style={{ fontSize: '13px', flex: 1, padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
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
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                    <TablePagination
                        component="div"
                        count={installmentsList?.filter(filter)?.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        style={{ color: colorPalette.textColor }}
                        backIconButtonProps={{ style: { color: colorPalette.textColor } }}
                        nextIconButtonProps={{ style: { color: colorPalette.textColor } }}
                    />
                </div>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não existem parcelas a receber</Text>
                </Box>
            }

            {installmentsSelected && <>
                <Box sx={{ display: 'flex', position: 'fixed', left: 280, bottom: 20, display: 'flex', gap: 2 }}>
                    <Button text="Baixar" style={{ width: '120px', height: '40px' }} />
                    <Button secondary text="Restaurar parcelas" style={{ width: '200px', height: '40px', backgroundColor: colorPalette.primary }} />
                    <Button secondary text="Excluir" style={{ width: '120px', height: '40px', backgroundColor: colorPalette.primary }} />
                </Box>
                <Box sx={{ display: 'flex', position: 'fixed', right: 60, bottom: 20, display: 'flex', gap: 2 }}>
                    <Button text="Salvar" style={{ width: '120px', height: '40px' }} />
                </Box>
            </>
            }
        </>
    )
}
