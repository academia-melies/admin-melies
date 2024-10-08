import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, ButtonIcon, Divider, Text } from "../../../../atoms";
import * as XLSX from 'xlsx';
import { useAppContext } from "../../../../context/AppContext";
import { SectionHeader } from "../../../../organisms";
import { api } from "../../../../api/api";
import { formatReal } from "../../../../helpers";
import { CircularProgress } from "@mui/material";
import HeaderFilters from "./Components/Header/HeaderFilters";
import TableInstallments from "./Components/Tables/TableInvoices";

export interface DataFilters {
    label: string | null
    value: number | string | null
}

export interface FiltersField {
    tipo_data: string | null
    data: string | null
    startDate: string | null
    endDate: string | null
    search: string | null
    status_nf: string | null
}

export interface Account {
    nome_conta: string | null
    id_conta: string | null
    ativo: number
}

export interface TypesAccount {
    nome_tipo: string | null
    id_tipo: string | null
    ativo: number
}

export interface CostCenter {
    nome_cc: string | null
    id_centro_custo: string | null
    ativo: number
}

export interface Users {
    perfil: string | null
    nome: string | null
    id: string
    area: string | null
}

export interface Installments {
    id_parcela_matr: string | null,
    usuario_id: string | number | null
    pagante: string | number | null
    cpf: string | null
    vencimento: string | null
    dt_pagamento: string | null
    dt_baixa: string | null
    valor_parcela: number | null
    n_parcela: string | number | null
    forma_pagamento: string | null
    referenceId: string | null
    valor_liquido: number | null
    status_parcela: string | null
    status_nfse: string | null
    url_nfse_pdf: string | null
    conta: string | null
    conta_id: string | number | null
    nome_cc: string | null
    nf_emitida: number
    nome_turma: string | null
    modulo: number | null
    aluno: string | null
    cobranca_emitida: string

}

export interface FetcherData {
    page?: number
    limit?: number
}

export interface InvoicesDetails {
    total: number,
    totalPages: number,
    currentPage: number
}

export default function Installments() {
    const [invoicesList, setInvoicesList] = useState<Installments[]>([])
    const [invoicesDetails, setInvoicesDetails] = useState<InvoicesDetails>({
        total: 0,
        totalPages: 0,
        currentPage: 1
    })
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [filtersField, setFiltersField] = useState<FiltersField>({
        tipo_data: '',
        data: '',
        startDate: '',
        endDate: '',
        search: '',
        status_nf: ''
    })
    const [invoicesSelected, setInvoicesSelected] = useState<string | null>(null);
    const [limit, setLimit] = useState(20);
    const [page, setPage] = useState(0);

    const { colorPalette, alert, setLoading, user } = useAppContext()

    const fetchReportData: ({ page, limit }: FetcherData) => Promise<void> = async ({ page = 0, limit = 20 }: FetcherData) => {
        setLoadingData(true)
        try {
            const response = await api.get('/student/installments/invoices/filters', {
                params: {
                    date: {
                        startDate: filtersField.startDate,
                        endDate: filtersField.endDate
                    },
                    search: filtersField.search,
                    page: page || 0, // exemplo
                    limit: limit || 20,    // exemplo
                    dateType: filtersField.tipo_data,
                    status_nf: filtersField.status_nf
                }
            });

            const { data, total, totalPages, currentPage } = response.data

            console.log(data)
            setInvoicesList(data)
            setInvoicesDetails({ total, totalPages, currentPage })

        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
        } finally {
            setLoadingData(false)
        }
    };

    const calculationTotal = (data: Installments[]): number => {
        const total = data
            .map(item => {
                return typeof item.valor_parcela === 'number' ? item.valor_parcela : 0
            })
            .reduce((acc, curr) => acc + curr, 0)
        return total
    }

    const handleGenerateInvoice = async () => {
        if (verifyExistsNfse()) {
            try {
                setLoading(true)
                const selectedIds = invoicesSelected?.split(',').map(id => parseInt(id.trim(), 10));
                let installmentData = invoicesList?.filter(item => item?.id_parcela_matr && selectedIds?.includes(parseInt(item.id_parcela_matr)));
                const response = await api.post(`/nfse/create/${user?.id}`, { installmentData })
                const { msg, pagante } = response.data;
                if (response?.status === 201) {
                    alert.success('Notas enviadas para processamento.')
                    await fetchReportData({ page, limit })
                    setInvoicesSelected(null)
                } else {
                    alert.error(`Ocorreu um erro ao processar a Nota Fiscal de ${pagante}, erro: ${msg}`)
                    return
                }
            } catch (error) {
                console.log(error)
                alert.error('Ocorreu um erro ao enviar notas para processamento. Tente novamente mais tarde.')
                return error
            } finally {
                setLoading(false)
            }
        }
    }

    const verifyExistsNfse = () => {
        const selectedIds = invoicesSelected?.split(',').map(id => parseInt(id.trim(), 10));
        let installmentData = invoicesList?.filter(item => item?.id_parcela_matr && selectedIds?.includes(parseInt(item.id_parcela_matr)));
        let [verifyNfseExists] = installmentData?.map(item => item.nf_emitida)
        if (verifyNfseExists) {
            alert.error('Você selecionou alguma nota que já possui NFSe gerada. Selecione apenas notas que ainda não foram emitidas. ')
            return false
        }
        return true
    }

    return (
        <>
            <SectionHeader title="Emissão de NF-e" />
            <Box sx={{ ...styles.sectionContainer, backgroundColor: colorPalette.secondary, }}>
                <HeaderFilters
                    filtersField={filtersField}
                    setFiltersField={setFiltersField}
                    fetchReportData={fetchReportData}
                    setInvoicesList={setInvoicesList}
                />
                <Divider distance={0} />
                {loadingData &&
                    <Box sx={styles.loadingContainer}>
                        <CircularProgress />
                    </Box>}
                {invoicesList && invoicesList.length > 0 ?
                    <Box sx={{ opacity: loadingData ? .6 : 1 }}>
                        <TableInstallments
                            data={invoicesList}
                            invoicesSelected={invoicesSelected}
                            setInvoicesSelected={setInvoicesSelected}
                            setData={setInvoicesList}
                            setLimit={setLimit}
                            limit={limit}
                            page={page}
                            setPage={setPage}
                            fetchReportData={fetchReportData}
                            invoicesDetails={invoicesDetails}
                        />

                        <Box sx={styles.boxValueTotally}>
                            <ButtonIcon text="Processar" icon={'/icons/process.png'} color="#fff" onClick={() => handleGenerateInvoice()} />
                            <Box>
                                <Text title light>Total Pendente: </Text>
                                <Text title bold>{formatReal(calculationTotal(invoicesList))}</Text>
                            </Box>
                        </Box>
                    </Box>
                    :
                    <Box sx={{ ...styles.emptyData, opacity: loadingData ? .6 : 1, }}>
                        <Text bold small light>Nenhum Dados.</Text>
                        <Text large light>Pesquise ultilizando os filtros acima.</Text>
                        <Box sx={styles.noResultsImage} />
                    </Box>}
            </Box>
        </>
    )
}


const styles = {
    sectionContainer: {
        display: 'flex',
        gap: 2,
        borderRadius: 2,
        flexDirection: 'column',
        border: `1px solid lightgray`
    },
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
    iconFilter: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        ascpectRatio: '1/1',
        width: 16,
        height: 16,
        backgroundImage: `url(/icons/filter.png)`,
    },
    filterButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 15px',
        borderRadius: 2,
        border: '1px solid lightgray',
        transition: '.3s',
        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        }
    },
    containerFiltered: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '8px 15px',
        borderRadius: 2,
        border: '1px solid lightgray',
    },
    containerFilter: {
        display: 'flex',
        gap: 1,
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
        padding: '12px 20px',
        border: `1px solid lightgray`,
        position: 'absolute', top: 45, left: 0,
        zIndex: 9999
    },
    filterField: {
        display: 'flex',
        gap: 2,
        padding: '8px 5px',
        '&:hover': {
            opacity: .8,
            cursor: 'pointer'
        }
    },
    boxValueTotally: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        gap: 3,
        minHeight: 60,
        padding: '15px 20px',
        alignItems: 'center'
    },
    headerFilterTwo: {
        display: 'flex',
        gap: 2,
        borderBottom: `1px solid #ccc`,
        width: '100%',
        margin: '15px 0px',
        padding: '0px 15px',
        justifyContent: 'space-between'
    },
    emptyData: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noResultsImage: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 350, height: 250,
        backgroundImage: `url('/background/no_results.png')`,
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        heigth: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    }
}