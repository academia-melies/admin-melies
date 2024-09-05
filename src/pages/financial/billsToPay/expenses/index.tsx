import React, { useEffect, useState } from "react";
import { Box, ButtonIcon, Divider, Text } from "../../../../atoms";
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { Backdrop, CircularProgress } from "@mui/material";
import HeaderFilters from "./components/Header/HeaderFilters";
import { checkUserPermissions } from "../../../../validators/checkPermissionUser";
import { useRouter } from "next/router";
import TableExpenses  from "./components/Tables/TableExpenses";
import RecurrencyCompensation from "./Compensation/RecurrencyCompensation";
import RecurrencyExpenses from "./RecurrencyExpense/RecurrencyExpenses";
import ExpenseDetails from "./expenseDetails";

export interface DataFilters {
  label: string | null;
  value: number | string | null;
}

export interface FiltersField {
  forma_pagamento: string | null;
  tipo_data: string | null;
  data: string | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  account: string | null;
  costCenter: string | null;
  typeAccount: string | null;
  baixado: string | null;
}

export interface Account {
  nome_conta: string | null;
  id_conta: string | null;
  ativo: number;
}

export interface TypesAccount {
  nome_tipo: string | null;
  id_tipo: string | null;
  ativo: number;
}

export interface CostCenter {
  nome_cc: string | null;
  id_centro_custo: string | null;
  ativo: number;
}

export interface Users {
  perfil: string | null;
  nome: string | null;
  id: string;
  area: string | null;
}

export interface Expenses {
  id_despesa: string | null;
  descricao: string | null;
  responsavel_pagante: string | number | null;
  dt_vencimento: string | null;
  dt_pagamento: string | null;
  dt_baixa: string | null;
  valor_desp: string | number | null;
  n_parcela: string | number | null;
  forma_pagamento: string | null;
  referenceId: string | null;
  valor_liquido: number | null;
  status: string | null;
  tipo: string | null;
  conta_pagamento: string | number | null;
  centro_custo: string | null;
  nome_tipo: string | null;
  nome_conta: string | null;
  nome_cc: string | null;
}


export interface FetcherData {
  page?: number;
  limit?: number;
}

export interface ExpensesDetails {
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function Expenses() {
  const [expensesList, setExpenses] = useState<Expenses[]>([]);
  const [expensesDetails, setExpensesDetails] = useState<ExpensesDetails>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
  });
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [accountList, setAccountList] = useState<DataFilters[]>([]);
  const [typesList, setTypesList] = useState<DataFilters[]>([]);
  const [costCenterList, setCostCenterList] = useState<DataFilters[]>([]);
  const [filtersField, setFiltersField] = useState<FiltersField>({
    forma_pagamento: "",
    tipo_data: "dt_vencimento",
    data: "",
    startDate: "",
    endDate: "",
    search: "",
    account: "",
    costCenter: "",
    typeAccount: "",
    baixado: "Sem Baixa",
  });
  const [expensesSelected, setExpensesSelected] = useState<string | null>(null);
  const [expensesSelectedExclude, setExpensesSelectedExclude] = useState<string | null>(null);
  const [showCompensation, setShowCompensation] = useState<boolean>(false);
  const [showExpenses, setShowExpenses] = useState<boolean>(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState<boolean>(false);

  const [limit, setLimit] = useState<number>(15);
  const [page, setPage] = useState<number>(0);
  const [isPermissionEdit, setIsPermissionEdit] = useState<boolean>(false);
  const [filterAbaData, setFilterAbaData] = useState<string>("relatorio_geral");


  const router = useRouter();
  const { userPermissions, menuItemsList } = useAppContext();

  const fetchPermissions = async () => {
    try {
      const actions = await checkUserPermissions(
        router,
        userPermissions,
        menuItemsList
      );
      setIsPermissionEdit(actions);
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  const { colorPalette, alert, setLoading, user } = useAppContext();

  const fetchReportData: ({
    page,
    limit,
  }: FetcherData) => Promise<void> = async ({
    page = 0,
    limit = 15,
  }: FetcherData) => {
      setLoadingData(true);
      try {
        const response = await api.get("/expenses/filters", {
          params: {
            date: {
              startDate: filtersField.startDate,
              endDate: filtersField.endDate,
            },
            paymentForm: filtersField.forma_pagamento,
            search: filtersField.search,
            page: page || 0, // exemplo
            limit: limit || 15, // exemplo
            dateType: filtersField.tipo_data,
            typeAccount: filtersField.typeAccount,
            account: filtersField.account,
            costCenter: filtersField.costCenter,
            baixado: filtersField.baixado,
          },
        });

        const { data, total, totalPages, currentPage } = response.data;
        if (data.length > 0) {
          setExpenses(
            data.map((item: Expenses) => {
              const value =
                typeof item.valor_desp === "string"
                  ? formatterLiquidValue(parseFloat(item.valor_desp))
                  : formatterLiquidValue(item.valor_desp);
              return {
                ...item,
                valor_desp: value,
              };
            })
          );

          setExpensesDetails({ total, totalPages, currentPage });
        } else {
          setExpenses(data);
          setExpensesDetails({ total, totalPages, currentPage });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do relatório:", error);
      } finally {
        setLoadingData(false);
      }
    };

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

  const fetchFilters = async () => {
    const [costCenterResponse, accountsResponse, typesResponse] =
      await Promise.all([
        api.get<CostCenter[]>(`/costCenters`),
        api.get<Account[]>(`/accounts`),
        api.get<TypesAccount[]>(`/account/types`),
      ]);

    const costCenterData = costCenterResponse.data;
    const groupCostCenter = costCenterData
      ?.filter((item) => item.ativo === 1)
      ?.map((cc) => ({
        label: cc.nome_cc,
        value: cc?.id_centro_custo,
      }));

    setCostCenterList(groupCostCenter);

    const accountsData = accountsResponse.data;
    const groupAccounts = accountsData
      ?.filter((item) => item.ativo === 1)
      ?.map((cc) => ({
        label: cc.nome_conta,
        value: cc?.id_conta,
      }));

    setAccountList(groupAccounts);

    const typesData = typesResponse.data;
    const groupTypes = typesData
      ?.filter((item) => item.ativo === 1)
      ?.map((cc) => ({
        label: cc.nome_tipo || "",
        value: cc?.id_tipo,
      }));
    setTypesList(groupTypes);
  };

  useEffect(() => {
    fetchPermissions();
    fetchFilters();
  }, []);

  const calculationTotal = (data: Expenses[]): number => {
    const total = data
      .map((item) => {
        if (typeof item.valor_desp === "number") {
          return item.valor_desp;
        } else if (typeof item.valor_desp === "string") {
          const numericValue = parseFloat(
            item.valor_desp.replace(/\./g, "").replace(",", ".")
          );
          return isNaN(numericValue) ? 0 : numericValue;
        }
        return 0;
      })
      .reduce((acc, curr) => acc + curr, 0);
    return total;
  };

  const handleUpdateExpenses = async () => {
    if (expensesSelected || expensesSelectedExclude) {
      try {
        setLoading(true);
        let statusOk = false;

        const isToCancel = expensesSelectedExclude ? expensesSelectedExclude
          .split(",")
          .map((id) => parseInt(id.trim(), 10)) : []

        const isToUpdate = expensesSelected && expensesSelected.split(",").map((id) => parseInt(id.trim(), 10));
        const expensesSelect = isToUpdate && expensesList
          ?.filter((item) => item.id_despesa &&
            (isToUpdate.includes(parseInt(item.id_despesa)) && !isToCancel.includes(parseInt(item.id_despesa))))

        if (isToCancel && isToCancel.length > 0) {
          for (const idDelte of isToCancel) {
            const response = await api.delete(`/expense/delete/${idDelte}`);
            if (response.status !== 200) {
              statusOk = false;
            } else {
              statusOk = true
            }
          }
        }

        if (expensesSelect && expensesSelect.length > 0) {
          for (let expense of expensesSelect) {
            const response = await api.patch(`/expense/update/processData`, {
              expenseData: expense,
              userRespId: user?.id,
            });
            const { success } = response?.data;
            if (!success) {
              statusOk = false;
            } else {
              statusOk = true
            }
          }
        }

        if (statusOk) {
          alert.success("Todas as despesas foram atualizadas.");
          setExpensesSelected(null);
          setExpensesSelectedExclude(null);
          fetchReportData({ page, limit });
          return;
        }

        alert.error("Tivemos um problema ao atualizar despesas.");
      } catch (error) {
        alert.error("Tivemos um problema no servidor.");
        console.log(error);
        return error;
      } finally {
        setLoading(false);
      }
      setLoading(false);
    } else {
      alert.info("Selecione as parcelas que desejam atualizar.");
    }
  };

  return (
    <>
      <SectionHeader title="Contas a Pagar - Despesas" />
      <Box
        sx={{
          ...styles.sectionContainer,
          backgroundColor: colorPalette.secondary,
        }}
      >
        <HeaderFilters
          filtersField={filtersField}
          setFiltersField={setFiltersField}
          fetchReportData={fetchReportData}
          setExpenses={setExpenses}
          isPermissionEdit={isPermissionEdit}
          accountList={accountList}
          typesList={typesList}
          costCenterList={costCenterList}
          setShowCompensation={setShowCompensation}
          setShowRecurrencyExpense={setShowExpenses}
          setShowExpenseDetails={setShowExpenseDetails}
        />
        <Divider distance={0} />
        {loadingData && (
          <Box sx={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        )}
        <Box sx={styles.headerFilterTwo}>
          <Box sx={{ display: "flex", gap: 2, padding: '5px 0px' }}>
            <ButtonIcon icon="/icons/subscription-model.png" filter color="#fff" text="Salários Padrão" onClick={() => setShowCompensation(true)} />
            <ButtonIcon icon="/icons/expense_recurrency.png" filter color="#fff" text="Despesas Recorrentes" onClick={() => setShowExpenses(true)} />
          </Box>
        </Box>

        <Backdrop open={showCompensation} sx={{ zIndex: 999, paddingTop: 5 }}>
          <RecurrencyCompensation setShow={setShowCompensation} />
        </Backdrop>

        <Backdrop open={showExpenses} sx={{ zIndex: 999, paddingTop: 5 }}>
          <RecurrencyExpenses setShow={setShowExpenses} />
        </Backdrop>

        <Backdrop open={showExpenseDetails} sx={{ zIndex: 999, paddingTop: 5 }}>
          <ExpenseDetails setShow={setShowExpenseDetails} fetchData={fetchReportData} />
        </Backdrop>

        {expensesList.length > 0 ? (
          <Box sx={{ opacity: loadingData ? 0.6 : 1 }}>
            <TableExpenses
              data={expensesList}
              expensesSelected={expensesSelected}
              expensesSelectedExclude={expensesSelectedExclude}
              setExpensesSelected={setExpensesSelected}
              setExpensesSelectedExclude={setExpensesSelectedExclude}
              setData={setExpenses}
              setLimit={setLimit}
              limit={limit}
              page={page}
              setPage={setPage}
              fetchReportData={fetchReportData}
              expensesDetails={expensesDetails}
              accountList={accountList}
              costCenterList={costCenterList}
              typesList={typesList}
            />

            <Box sx={styles.boxValueTotally}>
              <ButtonIcon
                disabled={(expensesSelected || expensesSelectedExclude) ? false : true}
                text="Processar"
                icon={"/icons/process.png"}
                color="#fff"
                onClick={() => handleUpdateExpenses()}
              />
              <Box>
                <Text title light>
                  Total Pendente:{" "}
                </Text>
                <Text title bold>
                  {formatReal(calculationTotal(expensesList))}
                </Text>
              </Box>
            </Box>
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
      </Box>
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
    padding: "10px 15px",
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
