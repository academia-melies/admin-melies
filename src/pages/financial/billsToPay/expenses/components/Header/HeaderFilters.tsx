
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useAppContext } from "../../../../../../context/AppContext";
import { SelectList } from "../../../../../../organisms";
import { groupData } from "../../../../../../helpers/groupData";
import { Box, ButtonIcon, Text, TextInput } from "../../../../../../atoms";
import { FetcherData, FiltersField, Expenses, DataFilters } from "../..";
import Link from "next/link";
import { icons } from "../../../../../../organisms/layout/Colors";

interface Fields {
    label: string
    value: string
}

interface HeaderFiltersProps {
    filtersField: FiltersField
    setFiltersField: Dispatch<SetStateAction<FiltersField>>
    fetchReportData: ({ page, limit }: FetcherData) => Promise<void>
    setExpenses: Dispatch<SetStateAction<Expenses[]>>
    isPermissionEdit: boolean
    accountList: DataFilters[]
    costCenterList: DataFilters[]
    typesList: DataFilters[]
    setShowCompensation: Dispatch<SetStateAction<boolean>>
    setShowRecurrencyExpense: Dispatch<SetStateAction<boolean>>
    setShowExpenseDetails: Dispatch<SetStateAction<boolean>>

}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({
    filtersField, setFiltersField, fetchReportData,
    setExpenses, isPermissionEdit,
    accountList,
    costCenterList,
    typesList,
    setShowCompensation,
    setShowRecurrencyExpense,
    setShowExpenseDetails
}) => {

    const { colorPalette } = useAppContext()
    const [showFieldsFilter, setShowFieldsFilter] = useState<boolean>(false)
    const [showAddNew, setShowAddNew] = useState<boolean>(false)
    const [fieldersSelected, setFieldersSelected] = useState<string[]>(['baixado', 'tipo_data']);
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!showFieldsFilter) {

            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setShowFieldsFilter(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, []);

    const fields: Fields[] = [
        { label: 'Filtrar por Data', value: 'tipo_data' },
        { label: 'Status da Baixa', value: 'baixado' }, 
        { label: 'Centro de Custo', value: 'costCenter' },
        { label: 'Conta', value: 'account' },
        { label: 'Tipo de Conta', value: 'typeAccount' },
    ]

    const handleFieldClick = (fieldValue: string) => {
        setFieldersSelected((prevSelected) => {
            const isSelected = prevSelected.includes(fieldValue);
            if (isSelected) {
                return prevSelected.filter(item => item !== fieldValue);
            } else {
                return [...prevSelected, fieldValue];
            }
        });
    };

    return (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', padding: '20px 20px 10px 25px', }}>
            <Box sx={{ display: 'flex', position: 'relative', width: '50%', gap: 2 }}>
                <Box sx={{ ...styles.filterButton, backgroundColor: colorPalette?.secondary }}
                    onClick={() => setShowFieldsFilter(!showFieldsFilter)}>
                    <Text bold>Filtros</Text>
                    <Box sx={styles.iconFilter} />
                </Box>

                {showFieldsFilter &&
                    <div ref={containerRef}>
                        <Box sx={{ ...styles.containerFilter, backgroundColor: colorPalette?.secondary }}>
                            {fields?.map((item, index) => {
                                const isSelected = fieldersSelected.find(f => f.includes(item?.value))
                                return (
                                    <Box key={index} sx={{
                                        display: 'flex', gap: 1, alignItems: 'center', transition: '.3s',
                                        color: isSelected && colorPalette?.buttonColor,
                                        '&:hover': {
                                            color: colorPalette?.buttonColor,
                                            cursor: 'pointer'
                                        }
                                    }} onClick={() => {
                                        if (isSelected) {
                                            handleFieldClick(item?.value)
                                        } else {
                                            handleFieldClick(item?.value)
                                        }
                                    }}>
                                        <Box sx={{ ...styles.iconFilter, backgroundImage: `url(/icons/${isSelected ? 'remove_icon' : 'add_icon'}.png)` }} />
                                        <Text style={{ color: 'inherit' }}>{item?.label}</Text>
                                    </Box>
                                )
                            })}
                        </Box>
                    </div>
                }

                <Box sx={{ display: fieldersSelected?.length > 0 ? 'flex' : 'none', gap: 1 }}>
                    {fieldersSelected.map((field, index) => (
                        <Box key={index}>

                            {field === 'tipo_data' &&
                                <SelectList
                                    data={[
                                        { label: 'Vencimento', value: 'dt_vencimento' }
                                    ]}
                                    valueSelection={filtersField?.tipo_data}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, tipo_data: value })}
                                    title="Filtrar Data por:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }
                            {field === 'baixado' &&
                                <SelectList
                                    data={[
                                        { label: 'Sem Baixa', value: 'Sem Baixa' },
                                        { label: 'Com Baixa', value: 'Com Baixa' },
                                    ]}
                                    valueSelection={filtersField?.baixado}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, baixado: value })}
                                    title="Status da Baixa:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }

                            {field === 'account' &&
                                <SelectList
                                    data={accountList}
                                    valueSelection={filtersField?.account}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, account: value })}
                                    title="Conta:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary, minWidth: 200 }}
                                    clean={false}
                                />
                            }

                            {field === 'costCenter' &&
                                <SelectList
                                    data={costCenterList}
                                    valueSelection={filtersField?.costCenter}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, costCenter: value })}
                                    title="Centro de Custo:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }

                            {field === 'typeAccount' &&
                                <SelectList
                                    data={typesList}
                                    valueSelection={filtersField?.typeAccount}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, typeAccount: value })}
                                    title="Tipo:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }

                        </Box>
                    ))}

                    {filtersField?.tipo_data !== '' &&
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextInput
                                label="De:"
                                name='startDate'
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltersField({ ...filtersField, startDate: e.target.value })}
                                type="date"
                                value={(filtersField?.startDate)?.split('T')[0] || ''}
                                InputProps={{ style: { backgroundColor: colorPalette?.secondary } }}
                            />
                            <TextInput
                                label="Até:"
                                name='endDate'
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltersField({ ...filtersField, endDate: e.target.value })}
                                type="date"
                                value={(filtersField?.endDate)?.split('T')[0] || ''}
                                InputProps={{ style: { backgroundColor: colorPalette?.secondary } }}
                            />
                        </Box>}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>

                <TextInput
                    placeholder="Buscar por descrição"
                    name='search'
                    type="search"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFiltersField({ ...filtersField, search: e.target.value })}
                    value={filtersField?.search}
                    InputProps={{ style: { backgroundColor: colorPalette?.secondary, width: 270 } }}
                />

                <Box sx={{ ...styles.filterButton, backgroundColor: colorPalette?.secondary, gap: .5 }} onClick={() => {
                    setFieldersSelected(['baixado', 'tipo_data'])
                    setFiltersField({
                        forma_pagamento: '',
                        tipo_data: 'dt_vencimento',
                        data: '',
                        startDate: '',
                        endDate: '',
                        search: '',
                        account: '',
                        typeAccount: '',
                        costCenter: '',
                        baixado: 'Sem Baixa'
                    })
                    setExpenses([]);
                }}>
                    <Box sx={{ ...styles.iconFilter, backgroundImage: `url(/icons/clear-filter.png)` }} />
                    <Text light bold={fieldersSelected?.length > 0} style={{ color: fieldersSelected?.length > 0 && colorPalette?.buttonColor }}>Limpar</Text>
                </Box>
                <ButtonIcon text="Buscar" icon={'/icons/search_button.png'} color="#fff" onClick={() => fetchReportData({})} />
                {isPermissionEdit &&
                    <Box sx={{ display: 'flex', gap: .3, position: 'relative' }} onClick={() => setShowAddNew(!showAddNew)}>
                        <ButtonIcon
                            text="Novo"
                            icon={'/icons/wallet_add.png'}
                            color="#fff"
                            style={{ borderRadius: '12px 0px 0px 12px' }}
                        />
                        <Box sx={{
                            display: 'flex', width: '100%', heigth: '100%', backgroundColor: colorPalette.buttonColor, alignItems: 'center', justifyContent: 'center',
                            padding: '5px 8px', transition: '.3s', borderRadius: '0px 12px 12px 0px', "&:hover": {
                                opacity: 0.8,
                                cursor: 'pointer'
                            }
                        }} >
                            <Box sx={{
                                ...styles.menuIcon,
                                backgroundImage: `url(${icons.gray_arrow_down})`,
                                filter: 'brightness(0) invert(1)',
                            }} />
                        </Box>


                        <Box sx={{
                            display: showAddNew ? 'flex' : 'none',
                            gap: 1,
                            position: 'absolute',
                            top: 45,
                            backgroundColor: colorPalette.secondary,
                            right: 0,
                            flexDirection: 'column',
                            padding: '10px 0px',
                            boxShadow: `rgba(149, 157, 165, 0.27) 0px 6px 24px`,
                        }}>

                            <Box sx={{
                                ...styles.containerDropDown, "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer',
                                    backgroundColor: colorPalette.primary,
                                }
                            }} onClick={() => setShowExpenseDetails(true)}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(/icons/new_expense.png)`,
                                }} />

                                <Text light style={{ whiteSpace: 'nowrap' }}>Nova Despesa</Text>
                            </Box>

                            <Box sx={{
                                ...styles.containerDropDown, "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer',
                                    backgroundColor: colorPalette.primary,
                                }
                            }} onClick={() => setShowRecurrencyExpense(true)}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(/icons/expense_recurrency.png)`,
                                }} />

                                <Text light style={{ whiteSpace: 'nowrap' }}>Despesa Recorrente</Text>
                            </Box>

                            <Box sx={{
                                ...styles.containerDropDown, "&:hover": {
                                    opacity: 0.8,
                                    cursor: 'pointer',
                                    backgroundColor: colorPalette.primary,
                                }
                            }} onClick={() => setShowCompensation(true)}>
                                <Box sx={{
                                    ...styles.menuIcon,
                                    backgroundImage: `url(/icons/subscription-model.png)`,
                                }} />

                                <Text light style={{ whiteSpace: 'nowrap' }}>Salários</Text>
                            </Box>
                        </Box>
                    </Box>
                }
            </Box>
        </Box>
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
        aspectRatio: '1/1',
        width: 20,
        height: 20,
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
        justifyContent: 'center',
        gap: 2,
        minHeight: 50,
        alignItems: 'center'
    },
    headerFilterTwo: {
        display: 'flex',
        gap: 2,
        borderBottom: `1px solid #ccc`,
        width: '100%',
        margin: '15px 0px',
        padding: '0px 15px'
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
    },
    containerDropDown: {
        gap: 2,
        display: 'flex', width: '100%', heigth: '100%', alignItems: 'center', justifyContent: 'flex-start',
        padding: '10px 15px', transition: '.3s',
    }
}

export default HeaderFilters