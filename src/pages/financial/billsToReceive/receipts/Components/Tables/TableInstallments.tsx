
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { DataFilters, FetcherData, Installments, InstallmentsDetails } from "../..";
import { Box, Button, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { formatTimeStampTimezone } from "../../../../../../helpers";
import { CheckBoxTable, PaginationTable, RadioItem, SelectList } from "../../../../../../organisms";
import { Tooltip } from "@mui/material";
import Link from "next/link";

interface TableInstallmentsProps {
    data: Installments[];
    setData: Dispatch<SetStateAction<Installments[]>>
    installmentsSelected: string | null
    setInstallmentsSelected: Dispatch<SetStateAction<string | null>>
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    setPage: Dispatch<SetStateAction<number>>
    page: number
    fetchReportData: ({ page, limit }: FetcherData) => Promise<void>
    installmentsDetails: InstallmentsDetails
    accountList: DataFilters[]
    installmentsSelectedExclude: string | null
    setInstallmentsSelectedExclude: Dispatch<SetStateAction<string | null>>
}

const TableInstallments: React.FC<TableInstallmentsProps> = ({ data = [], setData, installmentsSelected, setInstallmentsSelected,
    limit, page, setPage, setLimit, fetchReportData,
    installmentsDetails, accountList, installmentsSelectedExclude, setInstallmentsSelectedExclude
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
                            <th style={{ padding: '8px 10px' }}><Text bold>Excluir</Text></th>
                            <th style={{ padding: '8px 10px' }}><Text bold>Efetivar</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Pagante</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Aluno</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Vencimento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Pagamento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Dt Baixa</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor Líq</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '55px' }}><Text bold>Parc.</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>C.Custo</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Forma</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Conta</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '120px' }}><Text bold>Paga?</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '80px' }}><Text bold></Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data?.map((item, index) => {
                            const isSelected = item.id_parcela_matr && installmentsSelected?.includes(item.id_parcela_matr) || null;
                            const responsiblePay = item?.responsavel_pagante ? item?.responsavel_pagante : item?.aluno;
                            const chargeGenerated = parseInt(item?.cobranca_emitida) > 0;
                            return (
                                <tr key={index} style={{
                                    backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <CheckBoxTable
                                            boxGroup={groupSelect(item?.id_parcela_matr)}
                                            valueChecked={installmentsSelectedExclude}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (item?.id_parcela_matr) {
                                                    setInstallmentsSelectedExclude(value);
                                                }
                                            }}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 25 }}
                                            onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                                e.stopPropagation(); // Impede a propagação do evento de clique
                                            }}
                                        />
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <CheckBoxTable
                                            boxGroup={groupSelect(item?.id_parcela_matr)}
                                            valueChecked={installmentsSelected}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (item?.id_parcela_matr) {
                                                    setInstallmentsSelected(value);
                                                }
                                            }}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 25 }}
                                            onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                                e.stopPropagation(); // Impede a propagação do evento de clique
                                            }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {responsiblePay || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.aluno || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {!chargeGenerated ?
                                            <TextInput
                                                name='vencimento'
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)}
                                                value={(item?.vencimento)?.split('T')[0] || ''}
                                                small type="date"
                                                sx={{ padding: '0px 8px' }}
                                                InputProps={{
                                                    style: {
                                                        fontSize: '11px', height: 30
                                                    }
                                                }}
                                            />
                                            : (chargeGenerated ?
                                                <Box sx={{ display: 'flex', gap: .5, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text light small>
                                                        {formatTimeStampTimezone(item?.vencimento)}
                                                    </Text>
                                                    <Tooltip title={"Cobrança gerada na BemPaggo"}>
                                                        <div>
                                                            <Box sx={{
                                                                ...styles.menuIcon,
                                                                width: 12,
                                                                height: 12,
                                                                aspectRatio: '1/1',
                                                                backgroundColor: '#fff',
                                                                backgroundImage: `url('/icons/about.png')`,
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    opacity: 0.8
                                                                }
                                                            }} />
                                                        </div>
                                                    </Tooltip>
                                                </Box>
                                                :
                                                <Text light small>
                                                    {formatTimeStampTimezone(item?.vencimento)}
                                                </Text>
                                            )
                                        }

                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <TextInput
                                            name='dt_baixa'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)}
                                            value={(item?.dt_baixa)?.split('T')[0] || ''}
                                            small type="date"
                                            sx={{ padding: '0px 8px' }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item.valor_parcela ? formatter.format(item.valor_parcela) : item.valor_parcela}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <TextInput
                                            placeholder='R$ 5,00'
                                            name='valor_liquido'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)}
                                            value={item?.valor_liquido}
                                            sx={{ width: '120px', }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }} />
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.n_parcela || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.nome_turma}-{item.modulo}MÓD</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.forma_pagamento || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0px 8px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <SelectList
                                            clean={false}
                                            data={accountList}
                                            valueSelection={item?.conta_id}
                                            onSelect={(value: string) => handleChangeInstallmentDate(item?.id_parcela_matr, 'conta_id', value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                            style={{ fontSize: '11px', height: 30 }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', minWidth: 130, borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <RadioItem
                                            small
                                            valueRadio={item.status_parcela}
                                            horizontal={true}
                                            sx={{ gap: 0, flexDirection: 'row', width: '100%' }}
                                            group={[
                                                { label: 'Não', value: 'Pendente' },
                                                { label: 'Sim', value: 'Pago' }
                                            ]}
                                            onSelect={(value: string) => handleChangeInstallmentDate(item?.id_parcela_matr, 'status_parcela', value)}
                                        />
                                    </td>
                                    <td style={{
                                        fontSize: '13px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`,
                                        padding: '0px 12px'
                                    }}>
                                        <Link href={`/financial/billsToReceive/receipts/${item?.id_parcela_matr}`} target="_blank">
                                            <Button text="Ver" small style={{ borderRadius: 2 }} />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <PaginationTable
                        data={data}
                        count={installmentsDetails.total}
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