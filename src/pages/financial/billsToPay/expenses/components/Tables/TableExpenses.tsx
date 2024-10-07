
import React, { ChangeEvent, Dispatch, SetStateAction, useCallback } from "react";
import { DataFilters, Expenses, ExpensesDetails, FetcherData } from "../..";
import { Box, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { CheckBoxTable, PaginationTable, SelectList } from "../../../../../../organisms";
import { Tooltip } from "@mui/material";
import { groupData } from "../../../../../../helpers/groupData";
import { formatTimeStampTimezone } from "../../../../../../helpers";

interface TableExpensesProps {
    data: Expenses[];
    setData: Dispatch<SetStateAction<Expenses[]>>
    expensesSelected: string | null
    setExpensesSelected: Dispatch<SetStateAction<string | null>>
    limit: number
    setLimit: Dispatch<SetStateAction<number>>
    setPage: Dispatch<SetStateAction<number>>
    page: number
    fetchReportData: ({ page, limit }: FetcherData) => Promise<void>
    expensesDetails: ExpensesDetails
    accountList: DataFilters[]
    costCenterList: DataFilters[]
    typesList: DataFilters[]
    expensesSelectedExclude: string | null
    setExpensesSelectedExclude: Dispatch<SetStateAction<string | null>>
}

function TableExpenses({
    data = [],
    setData,
    expensesSelected,
    setExpensesSelected,
    limit,
    page,
    setPage,
    setLimit,
    fetchReportData,
    expensesDetails,
    accountList,
    expensesSelectedExclude,
    setExpensesSelectedExclude,
    costCenterList,
    typesList
}: TableExpensesProps) {
    const { colorPalette, theme } = useAppContext()


    const groupSelect = useCallback((id: string | number | null) => [
        {
            value: id?.toString()
        },
    ], []);

    const handleChangeExpenseData = useCallback((expenseId: string | null, field: string, value: string) => {

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
            return prevExpenses?.map(expense => {
                if (expense.id_despesa === expenseId) {
                    return { ...expense, [field]: formattedValue };
                }
                return expense;
            });
        });
    }, [setData]);

    const handleChangePage = useCallback((newPage: number) => {
        setPage(newPage);
        fetchReportData({ page: newPage })
    }, [setPage, fetchReportData]);

    const handleChangeRowsPerPage = useCallback((newLimit: number) => {
        setLimit(newLimit);
        fetchReportData({ limit: newLimit })
    }, [setPage, fetchReportData]);

    async function formattValue(value: string | number | null) {
        if (value && typeof value === 'string') {
            let formattValue = value?.replace(/\./g, '').replace(',', '.');
            return parseFloat(formattValue);
        } else { return value }
    }

    return (
        <Box>
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
                            <th style={{ padding: '8px 0px', minWidth: '60px' }}><Text bold small>Valor</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Vencimento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Pagamento</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Tipo</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>C.Custo</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '55px' }}><Text bold small>Conta.</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '80px' }}><Text bold small>Nº Nf</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '55px' }}><Text bold small>Dt Nf</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold small>Status</Text></th>
                            <th style={{ padding: '8px 0px', minWidth: '65px' }}><Text bold small>Baixado</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data?.map((item, index) => {
                            const expenseId = item?.id_despesa
                            const selected = (expenseId && expensesSelected) && expensesSelected.includes(expenseId);
                            const baixado = item?.dt_pagamento && item?.nome_conta
                            const selectedExclude = (expenseId && expensesSelectedExclude) && expensesSelectedExclude.includes(expenseId);
                            return (
                                <tr key={index} style={{
                                    backgroundColor: selected ? colorPalette?.buttonColor + '66' : selectedExclude ? '#FFCCCC' : colorPalette?.secondary
                                }}>
                                    <td style={{ fontSize: '13px', padding: '0px 5px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: `1px solid ${colorPalette.primary}` }}>
                                        <CheckBoxTable
                                            boxGroup={groupSelect(expenseId)}
                                            valueChecked={expensesSelectedExclude}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (expenseId) {
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
                                            boxGroup={groupSelect(expenseId)}
                                            valueChecked={expensesSelected}
                                            horizontal={true}
                                            onSelect={(value: string) => {
                                                if (expenseId) {
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
                                        {selected ? <TextInput
                                            name='descricao'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                            value={item?.descricao || ''}
                                            small fullWidth
                                            sx={{ minWidth: 200 }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        /> :
                                            <Text light small>{item?.descricao}</Text>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <TextInput
                                            name='valor_desp'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                            value={item?.valor_desp || ''}
                                            small
                                            sx={{ padding: '0px 8px', width: 120 }}
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        /> :
                                            <Text light small>{item?.valor_desp}</Text>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <TextInput
                                            name='dt_vencimento'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                            value={(item?.dt_vencimento)?.split('T')[0] || ''}
                                            small type="date"

                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        /> :
                                            <Text light small>{formatTimeStampTimezone(item?.dt_vencimento)}</Text>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <TextInput
                                            name='dt_pagamento'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                            value={(item?.dt_pagamento)?.split('T')[0] || ''}
                                            small type="date"

                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        />
                                            :
                                            <Text light small>{item?.dt_pagamento ? formatTimeStampTimezone(item?.dt_pagamento) : '-'}</Text>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ?
                                            <SelectList
                                                clean={false}
                                                data={typesList}
                                                valueSelection={item?.tipo}
                                                onSelect={(value: string) => handleChangeExpenseData(expenseId, 'tipo', value)}
                                                filterOpition="value" sx={{ color: colorPalette.textColor }}
                                                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                                                style={{ fontSize: '11px', height: 30, width: 120 }}
                                            />
                                            : <Text light small>{item?.nome_tipo || '-'}</Text>}
                                    </td>

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <SelectList
                                            fullWidth
                                            clean={false} data={costCenterList} valueSelection={item?.centro_custo}
                                            onSelect={(value: string) => handleChangeExpenseData(expenseId, 'centro_custo', value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor }}
                                            inputStyle={{
                                                color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold',
                                                height: 30
                                            }}
                                            style={{ fontSize: '11px', height: 30, width: 120 }}
                                        /> : <Text light small>{item?.nome_cc || '-'}</Text>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <SelectList
                                            fullWidth
                                            clean={false}
                                            data={accountList}
                                            valueSelection={item?.conta_pagamento}
                                            onSelect={(value: string) => handleChangeExpenseData(expenseId, 'conta_pagamento', value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                            style={{ fontSize: '11px', height: 30, width: 120 }}
                                        />
                                            : <Text light small>{item?.nome_conta || '-'}</Text>}
                                    </td>

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <TextInput
                                            name='n_nfe'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                            value={item?.n_nfe || ''}
                                            small
                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        /> :
                                            <Text light small>{item?.n_nfe || '-'}</Text>}
                                    </td>

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <TextInput
                                            name='dt_nfe'
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleChangeExpenseData(expenseId, e.target.name, e.target.value)}
                                            value={(item?.dt_nfe)?.split('T')[0] || ''}
                                            small type="date"

                                            InputProps={{
                                                style: {
                                                    fontSize: '11px', height: 30
                                                }
                                            }}
                                        /> :
                                            <Text light small>{item?.dt_nfe ? formatTimeStampTimezone(item?.dt_nfe) : '-'}</Text>}
                                    </td>

                                    <td style={{ textAlign: 'center', padding: '5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        {selected ? <SelectList
                                            fullWidth
                                            clean={false}
                                            data={groupData.statusExpense}
                                            valueSelection={item?.status}
                                            onSelect={(value: string) => handleChangeExpenseData(expenseId, 'status', value)}
                                            filterOpition="value" sx={{ color: colorPalette.textColor }}
                                            inputStyle={{ color: colorPalette.textColor, fontSize: '11px', fontFamily: 'MetropolisBold', height: 30 }}
                                            style={{ fontSize: '11px', height: 30, width: 120 }}
                                        />
                                            : <Text light small>{item?.status}</Text>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '5px', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                            <Tooltip title={baixado ? 'Despesa com baixa' : "Despesa aguardando baixa"}>
                                                <div>
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        width: 13,
                                                        height: 13,
                                                        aspectRatio: '1/1',
                                                        backgroundImage: baixado ? `url('/icons/check_around_icon.png')` : `url('/icons/remove_icon.png')`,
                                                        transition: '.3s',
                                                    }} />
                                                </div>
                                            </Tooltip>
                                        </Box>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <Box sx={{ marginTop: 5, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                    <PaginationTable
                        data={data}
                        count={expensesDetails.total}
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

export default TableExpenses

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