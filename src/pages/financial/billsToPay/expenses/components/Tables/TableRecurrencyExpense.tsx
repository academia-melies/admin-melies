
import React, { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from "react";
import { Box, Button, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { CheckBoxComponent, CheckBoxTable, PaginationTable } from "../../../../../../organisms";
import { EditRecurrency, RecurrencyExpenses } from "../../RecurrencyExpense/RecurrencyExpenses";

interface TableRecurrencyExpensesProps {
    data: RecurrencyExpenses[];
    setData: Dispatch<SetStateAction<RecurrencyExpenses[]>>
    expensesSelected: string | null
    setExpensesSelected: Dispatch<SetStateAction<string | null>>
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    setPage: Dispatch<SetStateAction<number>>
    page: number
    expensesSelectedExclude: string | null
    setExpensesSelectedExclude: Dispatch<SetStateAction<string | null>>
    setEditRecurrency: Dispatch<SetStateAction<EditRecurrency>>
}

const TableRecurrencyExpense: React.FC<TableRecurrencyExpensesProps> = ({
    data = [],
    setData,
    expensesSelected,
    setExpensesSelected,
    limit,
    page,
    setPage,
    setLimit,
    expensesSelectedExclude,
    setExpensesSelectedExclude,
    setEditRecurrency
}) => {
    const { colorPalette, theme } = useAppContext()
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [selectExcludeAll, setSelectExcludeAll] = useState<boolean>(false);


    const groupSelect = useCallback((id: string | number | null) => [
        {
            value: id?.toString()
        },
    ], []);


    const toggleSelectAll = () => {
        if (selectAll) {
            setExpensesSelected(null);
            setSelectAll(false)
        } else {
            const initialValues = data.map(item => item.id_desp_recorrente)
            const concat = initialValues && initialValues.join(', ');
            setExpensesSelected(concat);
            setSelectAll(true)
        }
    };


    const toggleExcludeAll = () => {
        if (selectExcludeAll) {
            setExpensesSelectedExclude(null);
            setSelectExcludeAll(false)
        } else {
            const initialValues = data.map(item => item.id_desp_recorrente)
            const concat = initialValues && initialValues.join(', ');
            setExpensesSelectedExclude(concat);
            setSelectExcludeAll(true)
        }
    };

    return (
        <Box>
            <Box sx={{
                display: 'flex', gap: 1.75,
                maxHeight: { xs: '200px', sm: '200px', md: '350px', lg: '400px', xl: '580px' },
                overflow: 'auto', flexDirection: 'column'
            }}>
                <div style={{
                    borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap',
                    backgroundColor: colorPalette?.secondary,
                }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                                <th style={{ padding: '8px 5px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                        <Text bold xsmall>Excluir</Text>

                                        <CheckBoxComponent
                                            boxGroup={[{ value: 'allSelect' }]}
                                            valueChecked={'select'}
                                            horizontal={true}
                                            onSelect={() => toggleExcludeAll()}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 20 }}
                                        />
                                    </Box>
                                </th>
                                <th style={{ padding: '8px 5px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                        <Text bold xsmall>Efetivar</Text>
                                        <CheckBoxComponent
                                            boxGroup={[{ value: 'allSelect' }]}
                                            valueChecked={'select'}
                                            horizontal={true}
                                            onSelect={() => toggleSelectAll()}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 20 }}
                                        />
                                    </Box>
                                </th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Descrição</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Dia de Vencimento</Text></th>
                                <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Valor</Text></th>
                                <th style={{ padding: '8px 0px' }}><Text bold small></Text></th>
                            </tr>
                        </thead>
                        <tbody style={{ flex: 1, }}>
                            {data?.map((item, index) => {
                                const expensesId = item?.id_desp_recorrente
                                const selected = (expensesId && expensesSelected) && expensesSelected.includes(expensesId);
                                const selectedExclude = (expensesId && expensesSelectedExclude) && expensesSelectedExclude.includes(expensesId);
                                return (
                                    <tr key={index} style={{
                                        backgroundColor: selected ? colorPalette?.buttonColor + '66' : selectedExclude ? '#FFCCCC' : colorPalette?.secondary
                                    }}>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                                                <CheckBoxComponent
                                                    boxGroup={groupSelect(expensesId)}
                                                    valueChecked={expensesSelectedExclude}
                                                    onSelect={(value: string) => {
                                                        if (expensesId) {
                                                            setExpensesSelectedExclude(value);
                                                        }
                                                    }}
                                                    padding={0}
                                                    gap={0}
                                                    sx={{ display: 'flex', maxWidth: 20 }}
                                                />
                                            </Box>
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                                                <CheckBoxComponent
                                                    boxGroup={groupSelect(expensesId)}
                                                    valueChecked={expensesSelected}
                                                    onSelect={(value: string) => {
                                                        if (expensesId) {
                                                            setExpensesSelected(value);
                                                        }
                                                    }}
                                                    padding={0}
                                                    gap={0}
                                                    sx={{ display: 'flex', maxWidth: 20 }}
                                                />
                                            </Box>
                                        </td>

                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{item?.descricao}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{item?.dia_vencimento}</Text>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Text light small>{item?.valor}</Text>
                                        </td>

                                        <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                            <Button text="Editar" small style={{ borderRadius: 2 }} onClick={() => setEditRecurrency({ active: true, data: item.id_desp_recorrente })} />
                                        </td>

                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                </div>
            </Box>
        </Box >
    )
}

export default TableRecurrencyExpense
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
