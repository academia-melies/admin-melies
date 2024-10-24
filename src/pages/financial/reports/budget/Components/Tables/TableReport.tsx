
import React from "react";
import { TableData } from "../..";
import { Box, Text } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { formatReal, formatTimeStampTimezone } from "../../../../../../helpers";
import { icons } from "../../../../../../organisms/layout/Colors";

interface TableReportProps {
    data: TableData[]
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
                        <tr style={{ border: `1px solid ${colorPalette.primary}`, }}>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>2024</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Jan</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Fev</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Mar</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Abr</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Mai</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Jun</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Jul</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Ago</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Set</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Out</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Nov</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Dez</Text></th>
                            <th style={{ backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', minWidth: 120, border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Total Prev FY</Text></th>
                            <th style={{ padding: '12px 8px', minWidth: 120, border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold>Total Real YTD</Text></th>

                        </tr>
                        <tr style={{ border: `1px solid ${colorPalette.primary}` }}>
                            <th style={{ padding: '12px 20px', border: `1px solid ${colorPalette.primary}`, textAlign: 'start' }}><Text bold>Receita</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Previsto</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}` }}><Text bold>Real</Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold></Text></th>
                            <th style={{ padding: '12px 8px', border: `1px solid ${colorPalette.primary}`, backgroundColor: 'lightgray' }}><Text bold></Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data.map((item: TableData, index: number) => {
                            const isTitle = item.categoria ? true : false
                            const subCategoryArray = item?.centro_custos || []
                            const destac = isTitle && subCategoryArray.length === 0
                            return (
                                <React.Fragment key={index}>
                                    <tr style={{
                                        backgroundColor: colorPalette?.secondary,
                                        opacity: 1,
                                    }}>
                                        <td style={{ padding: '5px 20px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: isTitle ? 'start' : 'center', }}>
                                                <Text bold={isTitle} light={!isTitle} small>
                                                    {item?.categoria || item.subCategoria || '-'}
                                                </Text>
                                                {(isTitle && subCategoryArray.length > 0) && <Box sx={{ ...styles.iconFilter, backgroundImage: `url(${icons.gray_arrow_down})` }} />}
                                            </Box>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_jan)}</Text></td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_jan)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_fev)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_fev)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_mar)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_mar)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_abr)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_abr)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_mai)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_mai)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_jun)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_jun)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_jul)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_jul)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_ago)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_ago)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_set)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_set)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_out)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_out)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_nov)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_nov)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.previsto_dez)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.real_dez)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{formatReal(item.total_prev_fy)}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small> {formatReal(item.total_real_ytd)}</Text>
                                        </td>
                                    </tr>
                                    {subCategoryArray.length > 0 &&
                                        subCategoryArray.map((subItem, subIndex) => (
                                            <tr key={subIndex} style={{
                                                backgroundColor: colorPalette?.secondary,
                                                opacity: 1,
                                            }}>
                                                <td style={{ padding: '5px 20px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: isTitle ? 'start' : 'center', }}>
                                                        <Text bold={subItem?.categoria} light={!subItem?.categoria} small>
                                                            {subItem?.categoria || subItem.subCategoria || '-'}
                                                        </Text>
                                                        {subItem?.categoria && <Box sx={{ ...styles.iconFilter, backgroundImage: `url(${icons.gray_arrow_down})` }} />}
                                                    </Box>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_jan)}</Text></td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_jan)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_fev)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_fev)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_mar)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_mar)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_abr)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_abr)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_mai)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_mai)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_jun)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_jun)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_jul)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_jul)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_ago)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_ago)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_set)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_set)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_out)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_out)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_nov)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_nov)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(subItem.previsto_dez)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(subItem.real_dez)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{formatReal(item.total_prev_fy)}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', padding: '5px', border: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small> {formatReal(item.total_real_ytd)}</Text>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Box >
    )
}
const styles = {
    iconFilter: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ascpectRatio: '1/1',
        width: 12,
        height: 12,
        backgroundImage: `url(/icons/filter.png)`,
    },
}

export default TableReport