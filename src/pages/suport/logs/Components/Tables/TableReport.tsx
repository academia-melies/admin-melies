
import Link from "next/link";
import { LogsError } from "../..";
import { Box, ButtonIcon, Text } from "../../../../../atoms";
import { useAppContext } from "../../../../../context/AppContext";
import { formatReal, formatTelephone, formatTimeStampTimezone } from "../../../../../helpers";

interface TableReportProps {
    data: LogsError[];
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
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Mensagem</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Referência</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Origem</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Status do Erro</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '55px' }}><Text bold>Usuário Responsável</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Dt Erro</Text></th>
                            {/* <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold></Text></th> */}
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data.map((item: LogsError, index: number) => {
                            return (
                                <tr key={index} style={{
                                    backgroundColor: colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.message_erro || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.stack_error || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.origem || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.status_code || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.responsavel || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {formatTimeStampTimezone(item?.dt_criacao, true) || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {/* <Link href={`/suport/logs/${item.id_log_erro}`} target="_blank">
                                            <ButtonIcon text="Visualizar" icon="/icons/warning.png" small/>
                                        </Link> */}
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