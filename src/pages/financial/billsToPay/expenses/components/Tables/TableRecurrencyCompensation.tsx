
import React, { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from "react";
import { Box, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { CheckBoxTable, PaginationTable } from "../../../../../../organisms";
import { RecurrencyCompensation } from "../../Compensation/RecurrencyCompensation";

interface TableRecurrencyCompensationProps {
    data: RecurrencyCompensation[];
    setData: Dispatch<SetStateAction<RecurrencyCompensation[]>>
    compensationSelected: string | null
    setCompensationSelected: Dispatch<SetStateAction<string | null>>
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    setPage: Dispatch<SetStateAction<number>>
    page: number
    compensationSelectedExclude: string | null
    setCompensationSelectedExclude: Dispatch<SetStateAction<string | null>>
    editRecurrency: boolean
}

const TableCompensation: React.FC<TableRecurrencyCompensationProps> = ({
    data = [],
    setData,
    compensationSelected,
    setCompensationSelected,
    limit,
    page,
    setPage,
    setLimit,
    compensationSelectedExclude,
    setCompensationSelectedExclude,
    editRecurrency
}) => {
    const { colorPalette, theme } = useAppContext()
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [selectExcludeAll, setSelectExcludeAll] = useState<boolean>(false);

    const groupSelect = useCallback((id: string | number | null) => [
        {
            value: id?.toString()
        },
    ], []);

    const handleChangeExpenseData = useCallback((compensationId: string | null, field: string, value: string) => {

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

        setData(prevExpenses => {
            return prevExpenses?.map(compensation => {
                if (compensation.id_salario === compensationId) {
                    return { ...compensation, [field]: formattedValue };
                }
                return compensation;
            });
        });
    }, [setData]);

    const toggleSelectAll = () => {
        if (selectAll) {
            setCompensationSelected(null);
            setSelectAll(false)
        } else {
            const initialValues = data.map(item => item.id_salario)
            const concat = initialValues && initialValues.join(', ');
            setCompensationSelected(concat);
            setSelectAll(true)
        }
    };


    const toggleExcludeAll = () => {
        if (selectExcludeAll) {
            setCompensationSelectedExclude(null);
            setSelectExcludeAll(false)
        } else {
            const initialValues = data.map(item => item.id_salario)
            const concat = initialValues && initialValues.join(', ');
            setCompensationSelectedExclude(concat);
            setSelectExcludeAll(true)
        }
    };

    const handleChangePage = useCallback((newPage: number) => {
        setPage(newPage);
    }, [setPage]);

    const handleChangeRowsPerPage = useCallback((newLimit: number) => {
        setLimit(newLimit);
    }, [setPage]);

    return (
        <Box>
            <div style={{
                borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap',
                backgroundColor: colorPalette?.secondary,
            }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                            {editRecurrency && <th style={{ padding: '8px 5px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    <Text bold xsmall>Excluir</Text>
                                    <CheckBoxTable
                                        boxGroup={[{ value: 'allSelect' }]}
                                        valueChecked={'select'}
                                        horizontal={true}
                                        onSelect={() => toggleExcludeAll()}
                                        padding={0}
                                        gap={0}
                                        sx={{ display: 'flex', maxWidth: 25 }}
                                        onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                            e.stopPropagation(); // Impede a propagação do evento de clique
                                        }}
                                    />
                                </Box>
                            </th>}
                            {!editRecurrency && <th style={{ padding: '8px 5px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    <Text bold xsmall>Efetivar</Text>
                                    <CheckBoxTable
                                        boxGroup={[{ value: 'allSelect' }]}
                                        valueChecked={'select'}
                                        horizontal={true}
                                        onSelect={() => toggleSelectAll()}
                                        padding={0}
                                        gap={0}
                                        sx={{ display: 'flex', maxWidth: 25 }}
                                        onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                            e.stopPropagation(); // Impede a propagação do evento de clique
                                        }}
                                    />
                                </Box>
                            </th>}
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Funcionário</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Dia de Pagamento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Valor Líq</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data?.map((item, index) => {
                            const compensationId = item?.id_salario
                            const selected = (compensationId && compensationSelected) && compensationSelected.includes(compensationId);
                            const selectedExclude = (compensationId && compensationSelectedExclude) && compensationSelectedExclude.includes(compensationId);
                            return (
                                <tr key={index} style={{
                                    backgroundColor: selected ? colorPalette?.buttonColor + '66' : selectedExclude ? '#FFCCCC' : colorPalette?.secondary
                                }}>
                                    {editRecurrency && <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <CheckBoxTable
                                            boxGroup={groupSelect(compensationId)}
                                            valueChecked={compensationSelectedExclude}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (compensationId) {
                                                    setCompensationSelectedExclude(value);
                                                }
                                            }}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 25 }}
                                            onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                                e.stopPropagation(); // Impede a propagação do evento de clique
                                            }}
                                        />
                                    </td>}
                                    {!editRecurrency && <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <CheckBoxTable
                                            boxGroup={groupSelect(compensationId)}
                                            valueChecked={compensationSelected}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (compensationId) {
                                                    setCompensationSelected(value);
                                                }
                                            }}
                                            padding={0}
                                            gap={0}
                                            sx={{ display: 'flex', maxWidth: 25 }}
                                            onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                                e.stopPropagation(); // Impede a propagação do evento de clique
                                            }}
                                        />
                                    </td>}

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.funcionario}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.dia_pagamento}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>

                                        {(selected || editRecurrency) ? <TextInput
                                            name='valor_liquido'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(compensationId, e.target.name, e.target.value)}
                                            value={item?.valor_liquido || ''}
                                            small
                                            sx={{ padding: '0px 8px', width: 120 }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        /> :
                                            <Text light small>{item?.valor_liquido}</Text>}
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <PaginationTable
                        data={data}
                        count={data.length}
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

export default TableCompensation

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