
import { Installments } from "../..";
import { Box, Text } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { formatReal, formatTimeStampTimezone } from "../../../../../../helpers";

interface TableReportProps {
    data: Installments[];
}

export const TableReport: React.FC<TableReportProps> = ({ data = [] }) => {
    const { colorPalette, theme } = useAppContext()
    return (
        <Box>
            <div style={{
                borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap',
                backgroundColor: colorPalette?.secondary,
            }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Nome</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Dt Vencimento</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Dt Pagamento</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Crédito</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Parcela Paga?</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Nº Parcela</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Centro de Custo</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '55px' }}><Text bold>Forma de Pagamento</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Conta</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data.map((item: Installments, index: number) => {
                            return (
                                <tr key={index} style={{
                                    backgroundColor: colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.aluno || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {formatTimeStampTimezone(item?.vencimento) || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{formatReal(item.valor)}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item.dt_pagamento ? 'Sim' : 'Não' || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.n_parcela || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.c_custo || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.forma_pagamento || '-'}</Text>
                                    </td>

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.conta || '-'}</Text>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Box>
    )
}