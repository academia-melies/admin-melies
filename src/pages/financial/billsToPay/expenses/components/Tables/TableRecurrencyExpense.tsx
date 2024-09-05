
import React, { ChangeEvent, Dispatch, SetStateAction, useCallback } from "react";
import { Box, Button, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { CheckBoxTable, PaginationTable } from "../../../../../../organisms";
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

 const TableRecurrencyExpense: React.FC <TableRecurrencyExpensesProps> = ({
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


    const groupSelect = useCallback((id: string | number | null) => [
        {
            value: id?.toString()
        },
    ], []);

    const handleChangeExpenseData = useCallback((expensesId: string | null, field: string, value: string) => {

        let formattedValue = value
        if (field === 'valor_desp') {
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

        setData(prevExpenses => {
            return prevExpenses?.map(compensation => {
                if (compensation.id_desp_recorrente === expensesId) {
                    return { ...compensation, [field]: formattedValue };
                }
                return compensation;
            });
        });
    }, [setData]);

    const handleChangePage = useCallback((newPage: number) => {
        setPage(newPage);
    }, [setPage]);

    const handleChangeRowsPerPage = useCallback((newLimit: number) => {
        setLimit(newLimit);
    }, [setPage]);

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
                                <th style={{ padding: '8px 5px' }}><Text bold small>Excluir</Text></th>
                                <th style={{ padding: '8px 5px' }}><Text bold small>Efetivar</Text></th>
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
                                            <CheckBoxTable
                                                boxGroup={groupSelect(expensesId)}
                                                valueChecked={expensesSelectedExclude}
                                                horizontal={true}
                                                onSelect={(value: string) => {
                                                    if (expensesId) {
                                                        setExpensesSelectedExclude(value);
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
                                                boxGroup={groupSelect(expensesId)}
                                                valueChecked={expensesSelected}
                                                horizontal={true}
                                                onSelect={(value: string) => {
                                                    if (expensesId) {
                                                        setExpensesSelected(value);
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
