
import { Expenses } from "../..";
import { Box, Text } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { formatReal, formatTimeStampTimezone } from "../../../../../../helpers";

interface TableReportProps {
    data: Expenses[];
}

const TableReport: React.FC<TableReportProps> = ({ data = [] }) => {
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
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Descrição</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Dt Vencimento</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Dt Pagamento</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Débito</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Baixa efetuada?</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Dt Baixa</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Centro de Custo</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '55px' }}><Text bold>Tipo</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Conta</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data.map((item: Expenses, index: number) => {
                            return (
                                <tr key={index} style={{
                                    backgroundColor: colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.descricao || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {formatTimeStampTimezone(item?.dt_vencimento) || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{formatReal(item.valor)}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item.conta_pagamento ? 'Sim' : 'Não' || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light small>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.nome_cc || '-'}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.nome_tipo || '-'}</Text>
                                    </td>

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.nome_conta || '-'}</Text>
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

export default TableReport