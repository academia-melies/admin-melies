import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../atoms"
import { CheckBoxComponent, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../../organisms"
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
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const [filterPayment, setFilterPayment] = useState('todos')
    const [installmentsSelected, setInstallmentsSelected] = useState(null);
    const [allSelected, setAllSelected] = useState();
    const router = useRouter()
    const [page, setPage] = useState(0);
    const [showFilterMobile, setShowFilterMobile] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(10);
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
        fetchPermissions()
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

    useEffect(() => {
        setShowFilterMobile(false)
    }, [filterPayment, filterAtive])

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
                title={`Contas a receber (${installmentsList.filter(filter)?.length || '0'})`}
            />
            <ContentContainer sx={{ display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                    <Text bold large>Filtros</Text>
                </Box>
                <TextInput placeholder="Buscar pelo pagante ou aluno" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />
                <Box sx={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
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
                    <Text>Total cancelado/Estornado:</Text>
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
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Pagante</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Aluno</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Vencimento</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Data de Pagamento</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Valor</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '55px' }}>Nº parc.</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>C. Custo</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Forma de Pagamento</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Conta</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Obs</th>
                                {/* <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>Status BemPaggo</th> */}
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '120px' }}>Status Sistema</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '100px' }}>ID BemPaggo</th>
                                <th style={{ padding: '8px 0px', fontSize: '14px', fontFamily: 'MetropolisBold', minWidth: '180px' }}>Protestada</th>
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
                </div>
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não existem parcelas a receber</Text>
                </Box>
            }

            {(installmentsSelected && isPermissionEdit) && <>
                <Box sx={{ display: 'flex', position: 'fixed', 
                left: { xs: 20, sm: 20, md: 280, lg: 280, xl: 280 }, bottom: 20, display: 'flex', gap: 2, flexWrap: 'wrap'  }}>
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
