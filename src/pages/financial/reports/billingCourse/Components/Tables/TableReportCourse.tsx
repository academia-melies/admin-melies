
import { InstallmentsCourse } from "../..";
import { Box, Text } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { formatReal } from "../../../../../../helpers";

interface TableReportCourseProps {
    data: InstallmentsCourse[];
}

export const TableReportCourse: React.FC<TableReportCourseProps> = ({ data = [] }) => {
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
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Curso</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: '100px' }}><Text bold>Valor</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data.map((item: InstallmentsCourse, index: number) => {
                            return (
                                <tr key={index} style={{
                                    backgroundColor: colorPalette?.secondary,
                                    opacity: 1,
                                }}>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {item?.nome_curso || '-'}
                                        </Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>
                                            {formatReal(item?.valor) || '-'}
                                        </Text>
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