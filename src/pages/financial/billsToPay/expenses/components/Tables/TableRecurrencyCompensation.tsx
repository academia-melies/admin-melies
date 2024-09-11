
import React, { ChangeEvent, Dispatch, SetStateAction, useCallback, useState } from "react";
import { Box, Button, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { CheckBoxComponent, CheckBoxTable } from "../../../../../../organisms";
import { RecurrencyCompensation } from "../../Compensation/RecurrencyCompensation";
import { EditRecurrency } from "../../RecurrencyExpense/RecurrencyExpenses";

interface TableRecurrencyCompensationProps {
    data: RecurrencyCompensation[];
    setData: Dispatch<SetStateAction<RecurrencyCompensation[]>>
    compensationSelected: string | null
    setCompensationSelected: Dispatch<SetStateAction<string | null>>
    compensationSelectedExclude: string | null
    setCompensationSelectedExclude: Dispatch<SetStateAction<string | null>>
    setEditRecurrency: Dispatch<SetStateAction<EditRecurrency>>
}

const TableCompensation: React.FC<TableRecurrencyCompensationProps> = ({
    data = [],
    setData,
    compensationSelected,
    setCompensationSelected,
    compensationSelectedExclude,
    setCompensationSelectedExclude,
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


    return (
        <Box>
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
                                        onSelect={() => toggleExcludeAll()}
                                        padding={0}
                                        gap={0}
                                        sx={{ display: 'flex', maxWidth: 20 }}
                                    />
                                </Box>
                            </th>
                            {<th style={{ padding: '8px 5px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    <Text bold xsmall>Efetivar</Text>

                                    <CheckBoxComponent
                                        boxGroup={[{ value: 'allSelect' }]}
                                        valueChecked={'select'}
                                        onSelect={() => toggleSelectAll()}
                                        padding={0}
                                        gap={0}
                                        sx={{ display: 'flex', maxWidth: 20 }}
                                    />
                                </Box>
                            </th>}
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Funcionário</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Dia de Pagamento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Valor Líq</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}></th>
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
                                    <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                                            <CheckBoxComponent
                                                valueChecked={compensationSelectedExclude}
                                                boxGroup={groupSelect(compensationId)}
                                                onSelect={(value: string) => {
                                                    if (compensationId) {
                                                        setCompensationSelectedExclude(value);
                                                    }
                                                }}
                                                padding={0}
                                                gap={0}
                                                sx={{ display: 'flex', maxWidth: 20 }}
                                            />
                                        </Box>
                                    </td>
                                    {<td style={{ fontSize: '13px', maxWidth: 25, padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>

                                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', }}>
                                            <CheckBoxComponent
                                                boxGroup={groupSelect(compensationId)}
                                                valueChecked={compensationSelected}
                                                onSelect={(value: string) => {
                                                    if (compensationId) {
                                                        setCompensationSelected(value);
                                                    }
                                                }}
                                                padding={0}
                                                gap={0}
                                                sx={{ display: 'flex', maxWidth: 20 }}
                                            />
                                        </Box>
                                    </td>}

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.funcionario}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Text light small>{item?.dia_pagamento}</Text>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>

                                        {(selected) ? <TextInput
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
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Button text="Editar" small style={{ borderRadius: 2 }} onClick={() => setEditRecurrency({ active: true, data: compensationId })} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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