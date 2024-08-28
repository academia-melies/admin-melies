
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Box, Button, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { formatTimeStampTimezone } from "../../../../../../helpers";
import { CheckBoxComponent, PaginationTable } from "../../../../../../organisms";
import Link from "next/link";
import { DataFilters, FetcherData, Installments, InvoicesDetails } from "../..";

interface TableInstallmentsProps {
    data: Installments[];
    setData: Dispatch<SetStateAction<Installments[]>>
    invoicesSelected: string | null
    setInvoicesSelected: Dispatch<SetStateAction<string | null>>
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    setPage: Dispatch<SetStateAction<number>>
    page: number
    fetchReportData: ({ page, limit }: FetcherData) => Promise<void>
    invoicesDetails: InvoicesDetails
}

const TableInstallments: React.FC<TableInstallmentsProps> = ({ data = [], setData, invoicesSelected, setInvoicesSelected,
    limit, page, setPage, setLimit, fetchReportData,
    invoicesDetails
}) => {
    const { colorPalette, theme } = useAppContext()

    const groupSelect = (id: string | number | null) => [
        {
            value: id?.toString()
        },
    ]

    const handleChangeInstallmentDate = (installmentId: string | null, field: string, value: string) => {

        let formattedValue = value
        if (field === 'valor_liquido') {
            const rawValue = value.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

            if (rawValue === '') {
                formattedValue = '';
            } else {
                let intValue = rawValue.slice(0, -2) || '0'; // Parte inteira
                const decimalValue = rawValue.slice(-2).padStart(2, '0');; // Parte decimal

                if (intValue === '0' && rawValue.length > 2) {
                    intValue = '';
                }

                const formattedValueCoin = `${parseInt(intValue, 10).toLocaleString()},${decimalValue}`; // Adicionando o separador de milhares
                formattedValue = formattedValueCoin;

            }
        }

        setData(prevInstallments => {
            return prevInstallments?.map(installment => {
                if (installment.id_parcela_matr === installmentId) {
                    return { ...installment, [field]: formattedValue };
                }
                return installment;
            });
        });
    };

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const priorityColor = (data: string | null) => (
        ((data === 'Pendente' || data === 'Em processamento') && 'yellow') ||
        ((data === 'Cancelada' || data === 'Cancelado' || data === 'Pagamento reprovado' || data === 'Não Autorizado' || data === 'Estornada') && 'red') ||
        (data === 'Pago' && 'green') ||
        (data === 'Aprovado' && 'blue') ||
        (data === 'Inativa' && '#f0f0f0') ||
        (data === 'Erro com o pagamento' && 'red') ||
        (data === 'Estornada' && '#f0f0f0'))


    const handleChangePage = (newPage: number) => {
        setPage(newPage);
        fetchReportData({ page: newPage })
    };

    const handleChangeRowsPerPage = (newLimit: number) => {
        setLimit(newLimit);
        fetchReportData({ limit: newLimit })
    };

    return (
        <Box>
            <div style={{
                borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap',
                backgroundColor: colorPalette?.secondary,
            }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                            <th style={{ padding: '8px 10px' }}><Text bold>Efetivar</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Resp. Pagante</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Aluno</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>CPF</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Vencimento</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Pagamento</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '55px' }}><Text bold>Nº parc.</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>C. Custo</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Parcela Paga</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '100px' }}><Text bold>Emissão NFSe</Text></th>
                            <th style={{ padding: '4px 0px', minWidth: '80px' }}><Text bold>NFSe PDF</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data?.map((item, index) => {
                            const isSelected = item?.id_parcela_matr && invoicesSelected?.includes(item?.id_parcela_matr) || null;
                            return (
                                <tr key={index} style={{
                                    backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>

                                        <CheckBoxComponent
                                            boxGroup={groupSelect(item?.id_parcela_matr)}
                                            valueChecked={invoicesSelected}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (item?.id_parcela_matr) {
                                                    setInvoicesSelected(value);
                                                }
                                            }}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 25 }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small>{item?.pagante || item?.aluno || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small>{item?.aluno || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small>{item?.cpf}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small>{item?.valor_parcela ? formatter.format(item?.valor_parcela) : item?.valor_parcela}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small light>{item?.vencimento ? formatTimeStampTimezone(item?.vencimento) : '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small light>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small>{item?.n_parcela || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        <Text small> {item?.nome_cc || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
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
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
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

                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '0px 5px', }}>
                                        {item?.url_nfse_pdf ?
                                            <Link href={item?.url_nfse_pdf || ''} target="_blank">
                                                <Button bold small style={{ height: 25, borderRadius: 2 }} text="Abrir pdf" />
                                            </Link> : '-'
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <PaginationTable
                        data={data}
                        count={invoicesDetails.total}
                        page={page}
                        setPage={handleChangePage}
                        rowsPerPage={limit}
                        setRowsPerPage={handleChangeRowsPerPage}
                    />
                </Box>
            </div>
        </Box >
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

export default TableInstallments