
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { DataFilters, FetcherData, Receiveds, ReceivedDetails } from "../..";
import { Box, Button, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { CheckBoxTable, PaginationTable, RadioItem, SelectList } from "../../../../../../organisms";
import Link from "next/link";

interface TableReceivedsProps {
    data: Receiveds[];
    setData: Dispatch<SetStateAction<Receiveds[]>>
    receivedSelected: string | null
    setReceivedSelected: Dispatch<SetStateAction<string | null>>
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    setPage: Dispatch<SetStateAction<number>>
    page: number
    fetchReportData: ({ page, limit }: FetcherData) => Promise<void>
    receivedDetails: ReceivedDetails
    accountList: DataFilters[]
    costCentersList: DataFilters[]
    receivedSelectedExclude: string | null
    setReceivedSelectedExclude: Dispatch<SetStateAction<string | null>>
}

const TableReceiveds: React.FC<TableReceivedsProps> = ({ data = [], setData, receivedSelected, setReceivedSelected,
    limit, page, setPage, setLimit, fetchReportData,
    receivedDetails, accountList, receivedSelectedExclude, setReceivedSelectedExclude, costCentersList
}) => {
    const { colorPalette } = useAppContext()

    const groupSelect = (id: string | number | null) => [
        {
            value: id?.toString()
        },
    ]

    const handleChangeReceivedData = (receivedId: string | null, field: string, value: string) => {

        let formattedValue = value
        if (field === 'valor') {
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
            return prevInstallments?.map(received => {
                if (received.id_recebiveis === receivedId) {
                    return { ...received, [field]: formattedValue };
                }
                return received;
            });
        });
    };

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
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Descrição</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Dt Pagamento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Dt Baixa</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Centro de Custo</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Conta</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Pago?</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '80px' }}><Text bold></Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data?.map((item, index) => {
                            const isSelected = item.id_recebiveis && receivedSelected?.includes(item.id_recebiveis) || null;
                            return (
                                <tr key={index} style={{
                                    backgroundColor: isSelected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <CheckBoxTable
                                            boxGroup={groupSelect(item?.id_recebiveis)}
                                            valueChecked={receivedSelectedExclude}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (item?.id_recebiveis) {
                                                    setReceivedSelectedExclude(value);
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
                                            boxGroup={groupSelect(item?.id_recebiveis)}
                                            valueChecked={receivedSelected}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (item?.id_recebiveis) {
                                                    setReceivedSelected(value);
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
                                            {item?.descricao || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <TextInput
                                            placeholder='R$ 5,00'
                                            name='valor'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChangeReceivedData(item?.id_recebiveis, e.target.name, e.target.value)}
                                            value={item?.valor}
                                            sx={{ width: '120px', }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }} />
                                    </td>
                                    <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <TextInput
                                            name='dt_pagamento'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeReceivedData(item?.id_recebiveis, e.target.name, e.target.value)}
                                            value={(item?.dt_pagamento)?.split('T')[0] || ''}
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
                                        <TextInput
                                            name='dt_baixa'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeReceivedData(item?.id_recebiveis, e.target.name, e.target.value)}
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
                                    <td style={{ textAlign: 'center', padding: '0px 8px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <SelectList
                                            clean={false}
                                            data={costCentersList}
                                            valueSelection={item?.centro_custo_id}
                                            onSelect={(value: string) => handleChangeReceivedData(item?.id_recebiveis, 'centro_custo_id', value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                            style={{ fontSize: '11px', height: 30 }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '0px 8px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <SelectList
                                            clean={false}
                                            data={accountList}
                                            valueSelection={item?.conta_id}
                                            onSelect={(value: string) => handleChangeReceivedData(item?.id_recebiveis, 'conta_id', value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                            style={{ fontSize: '11px', height: 30 }}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center', minWidth: 130, borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <RadioItem
                                            small
                                            valueRadio={item.status}
                                            horizontal={true}
                                            sx={{ gap: 0, flexDirection: 'row', width: '100%' }}
                                            group={[
                                                { label: 'Não', value: 'Pendente' },
                                                { label: 'Sim', value: 'Pago' }
                                            ]}
                                            onSelect={(value: string) => handleChangeReceivedData(item?.id_recebiveis, 'status', value)}
                                        />
                                    </td>
                                    <td style={{
                                        fontSize: '13px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`,
                                        padding: '0px 12px'
                                    }}>
                                        <Link href={`/financial/billsToReceive/billsReceived/${item?.id_recebiveis}`} target="_blank">
                                            <Button text="Ver" small style={{ borderRadius: 2, height: 20 }} />
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
                        count={receivedDetails.total}
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

export default TableReceiveds