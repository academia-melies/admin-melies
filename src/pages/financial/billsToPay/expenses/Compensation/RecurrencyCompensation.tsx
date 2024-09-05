import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Box, Button, ContentContainer, Divider, Text } from "../../../../../atoms";
import { useAppContext } from "../../../../../context/AppContext";
import { api } from "../../../../../api/api";
import { Backdrop, CircularProgress } from "@mui/material";
import { icons } from "../../../../../organisms/layout/Colors";
import MonthsSelect from "../Components/Modal/Months";
import Compensation from "./[id]";
import TableRecurrencyCompensation from "../Components/Tables/TableRecurrencyCompensation";

export interface RecurrencyCompensationProps {
    setShow: Dispatch<SetStateAction<boolean>>
}

export interface RecurrencyCompensation {
    id_salario: string | null
    funcionario: string
    dia_pagamento: number | string | null
    valor_liquido: string | number | null;
    valor_bruto: string | number | null;
}

const RecurrencyCompensation = ({ setShow }: RecurrencyCompensationProps) => {
    const [recurrencyCompensation, setRecurrencyCompensation] = useState<RecurrencyCompensation[]>([])
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [compensationSelected, setCompensationSelected] = useState<string | null>(null);
    const [showNewRecurrencyCompensation, setShowNewRecurrencyCompensation] = useState<boolean>(false);
    const [editRecurrency, setEditRecurrency] = useState<boolean>(false);
    const [showMonths, setShowMonths] = useState<boolean>(false);
    const [monthReleaseSelected, setMonthReleaseSelected] = useState<string | null>(null)
    const [compensationSelectedExclude, setCompensationSelectedExclude] = useState<string | null>(null);
    const { alert, user } = useAppContext()
    const [limit, setLimit] = useState<number>(15);
    const [page, setPage] = useState<number>(0);

    const fetchRecurrency = async () => {
        try {
            setLoadingData(true)
            setEditRecurrency(false)
            setCompensationSelected(null)
            setCompensationSelectedExclude(null)

            const recurrencyCompensation = await api.get<RecurrencyCompensation[]>(`/expenses/compensation/recurrency/list`)
            const { data } = recurrencyCompensation

            if (data?.length > 0) {
                setRecurrencyCompensation(
                    data.sort((a, b) => a.funcionario.localeCompare(b.funcionario))
                        ?.map((item: RecurrencyCompensation) => {
                            const valueLiquid =
                                typeof item.valor_liquido === "string"
                                    ? formatterLiquidValue(parseFloat(item.valor_liquido))
                                    : formatterLiquidValue(item.valor_liquido);

                            const valueBruto =
                                typeof item.valor_bruto === "string"
                                    ? formatterLiquidValue(parseFloat(item.valor_bruto))
                                    : formatterLiquidValue(item.valor_bruto);
                            return {
                                ...item,
                                valor_liquido: valueLiquid,
                                valor_bruto: valueBruto
                            };
                        }));
            } else {
                setRecurrencyCompensation([])
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingData(false)
        }
    }

    const formatterLiquidValue = (value: number | null) => {
        if (value === null) return "";
        // Converte o valor para número com precisão suficiente
        const numberValue = typeof value === "string" ? parseFloat(value) : value;

        if (isNaN(numberValue)) return "";

        // Converte o valor para string com 2 casas decimais
        const valueString = numberValue.toFixed(2);

        // Separa a parte inteira e a parte decimal
        const [integerPart, decimalPart] = valueString.split(".");

        // Adiciona o separador de milhares
        const formattedIntegerPart = integerPart.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            "."
        );

        // Formata o valor com a parte decimal
        const formattedValue = `${formattedIntegerPart},${decimalPart}`;

        return formattedValue;
    };

    useEffect(() => {
        fetchRecurrency()
    }, []);


    const handleUpdateCompensations = async () => {
        try {
            setLoadingData(true)

            let success = true
            const isToCancel = compensationSelectedExclude ? compensationSelectedExclude.split(",").map((id) => parseInt(id.trim(), 10)) : []
            if (isToCancel && isToCancel.length > 0) {
                for (const idDelte of isToCancel) {
                    const response = await api.delete(`/expense/compensation/recurrency/delete/${idDelte}`);
                    if (response.status !== 200) {
                        success = false;
                    }
                }
            }

            const filteredCompensations = recurrencyCompensation.filter((compensation) => {
                const compensationId = compensation?.id_salario ? parseInt(compensation.id_salario, 10) : null;
                return compensationId !== null && !isToCancel.includes(compensationId);
            });

            if (filteredCompensations && filteredCompensations.length > 0) {
                for (let compensation of filteredCompensations) {
                    if (compensation?.valor_liquido) {
                        const updateCompensations = await api.patch(`/expense/compensation/recurrency/update/${compensation?.id_salario}`,
                            { compensationData: compensation })
                        if (updateCompensations?.status !== 200) {
                            success = false
                        }
                    }
                }
            }

            if (success) {
                alert.success(`Salários atualizados.`)
                setShow(false)
                setEditRecurrency(false)
                setCompensationSelected(null)
                setCompensationSelectedExclude(null)
                setShowMonths(false)
                setMonthReleaseSelected(null)
                await fetchRecurrency()
            } else {
                alert.success(`Ocorreu um erro ao atualizar salários.`)
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    const handleCreateRecurrencyPayroll = async () => {
        try {
            setLoadingData(true)
            let successStatus = true;

            const isToUpdate = compensationSelected && compensationSelected.split(",").map((id) => parseInt(id.trim(), 10));

            if (isToUpdate && isToUpdate.length > 0) {
                for (let recurrencyId of isToUpdate) {

                    const response = await api.post(`/expense/compensation/recurrency/release/padronizado/create`,
                        { recurrencyId, monthSelected: monthReleaseSelected, userResp: user?.id })

                        console.log(response)
                    const { success } = response.data
                    if (!success) { successStatus = false }
                }

                if (successStatus) {
                    alert.success('Despesas recorrentes cadastradas.');
                    setShow(false)
                    setCompensationSelected(null)
                    setCompensationSelectedExclude(null)
                    setShowMonths(false)
                    setMonthReleaseSelected(null)
                    setEditRecurrency(false)
                    await fetchRecurrency()
                } else {
                    alert.error('Erro ao lançar despesas recorrentes.');
                }
            } else {
                alert.error('Erro ao lançar despesas recorrentes.');
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoadingData(false)
        }
    }

    return (
        <>
            <ContentContainer sx={{ zIndex: 9999 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', zIndex: 9999, gap: 4, alignItems: 'center' }}>
                    <Text bold large>Folha de Pagamento</Text>
                    <Box sx={{
                        ...styles.menuIcon,
                        backgroundImage: `url(${icons.gray_close})`,
                        transition: '.3s',
                        zIndex: 99999,
                        "&:hover": {
                            opacity: 0.8,
                            cursor: 'pointer'
                        }
                    }} onClick={() => {
                        setShow(false)
                    }} />
                </Box>
                <Divider distance={0} />
                {loadingData && (
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress />
                    </Box>
                )}
                {recurrencyCompensation.length > 0 ? (
                    <Box sx={{ opacity: loadingData ? 0.6 : 1 }}>

                        <TableRecurrencyCompensation
                            data={recurrencyCompensation}
                            compensationSelected={compensationSelected}
                            compensationSelectedExclude={compensationSelectedExclude}
                            setCompensationSelected={setCompensationSelected}
                            setCompensationSelectedExclude={setCompensationSelectedExclude}
                            setData={setRecurrencyCompensation}
                            setLimit={setLimit}
                            limit={limit}
                            page={page}
                            setPage={setPage}
                            editRecurrency={editRecurrency}
                        />
                    </Box>
                ) : (
                    <Box sx={{ ...styles.emptyData, opacity: loadingData ? 0.6 : 1 }}>
                        <Text bold small light>
                            Nenhum Dados.
                        </Text>
                        <Text large light>
                            Pesquise ultilizando os filtros acima.
                        </Text>
                        <Box sx={styles.noResultsImage} />
                    </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'space-between' }}>
                    {compensationSelected && compensationSelected?.length > 0 &&
                        <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text>Selecione o mês de lancamento:</Text>
                            <Button secondary text="Selecionar" style={{ height: '30px', borderRadius: '6px' }}
                                onClick={() => setShowMonths(true)} />
                        </Box>}
                    {(monthReleaseSelected && monthReleaseSelected?.length > 0 && compensationSelected && compensationSelected?.length > 0) &&
                        <Button text="Lançar"
                            style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() =>
                                handleCreateRecurrencyPayroll()} />
                    }
                    {!compensationSelected && <Box sx={{ display: 'flex', gap: 1 }}>
                        {(!editRecurrency) ? <Button secondary text="Editar Salários" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => setEditRecurrency(true)} />
                            :
                            <Button cancel text="Cancelar" style={{ height: '30px', borderRadius: '6px' }}
                                onClick={() => setEditRecurrency(false)} />
                        }
                        {editRecurrency && <Button text="Processar" style={{ height: '30px', borderRadius: '6px' }}
                            onClick={() => handleUpdateCompensations()} />}
                    </Box>}
                    <Button text="Novo" style={{ height: '30px', borderRadius: '6px' }}
                        onClick={() => setShowNewRecurrencyCompensation(true)}
                    />
                </Box>

                <Backdrop open={showMonths} sx={{ zIndex: 999, paddingTop: 5 }}>
                    <MonthsSelect
                        setShow={setShowMonths}
                        setMonthSelected={setMonthReleaseSelected}
                        monthSelected={monthReleaseSelected}
                        show={showMonths}
                    />
                </Backdrop>

                <Backdrop open={showNewRecurrencyCompensation} sx={{ zIndex: 9999, paddingTop: 5 }}>
                    <Compensation setShow={setShowNewRecurrencyCompensation} fetchData={fetchRecurrency} />
                </Backdrop>
            </ContentContainer>
        </>
    );
}

const styles = {
    sectionContainer: {
        display: "flex",
        gap: 2,
        borderRadius: 2,
        flexDirection: "column",
        border: `1px solid lightgray`,
    },
    containerRegister: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1.5,
        padding: "40px",
    },
    menuIcon: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: 15,
        height: 15,
    },
    iconFilter: {
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        ascpectRatio: "1/1",
        width: 16,
        height: 16,
        backgroundImage: `url(/icons/filter.png)`,
    },
    filterButton: {
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "8px 15px",
        borderRadius: 2,
        border: "1px solid lightgray",
        transition: ".3s",
        "&:hover": {
            opacity: 0.8,
            cursor: "pointer",
        },
    },
    containerFiltered: {
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "8px 15px",
        borderRadius: 2,
        border: "1px solid lightgray",
    },
    containerFilter: {
        display: "flex",
        gap: 1,
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
        padding: "12px 20px",
        border: `1px solid lightgray`,
        position: "absolute",
        top: 45,
        left: 0,
        zIndex: 9999,
    },
    filterField: {
        display: "flex",
        gap: 2,
        padding: "8px 5px",
        "&:hover": {
            opacity: 0.8,
            cursor: "pointer",
        },
    },
    boxValueTotally: {
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        gap: 3,
        minHeight: 60,
        padding: "15px 20px",
        alignItems: "center",
    },
    headerFilterTwo: {
        display: "flex",
        gap: 2,
        borderBottom: `1px solid #ccc`,
        width: "100%",
        margin: "15px 0px",
        padding: "0px 15px",
        justifyContent: "space-between",
    },
    emptyData: {
        display: "flex",
        flexDirection: "column",
        gap: 1,
        marginTop: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    noResultsImage: {
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: 350,
        height: 250,
        backgroundImage: `url('/background/no_results.png')`,
    },
    loadingContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        heigth: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
};

export default RecurrencyCompensation
