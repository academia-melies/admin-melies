
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { FiltersField, TableData } from "../..";
import { Box, ButtonIcon, Text, TextInput } from "../../../../../../atoms";
import { useAppContext } from "../../../../../../context/AppContext";
import { SelectList } from "../../../../../../organisms";
import { groupData } from "../../../../../../helpers/groupData";
import { DataFilters } from "../../../expenses";

interface Fields {
    label: string
    value: string
}

interface HeaderFiltersProps {
    filtersField: FiltersField
    setFiltersField: Dispatch<SetStateAction<FiltersField>>
    fetchReportData: () => Promise<void>
    setReportData: Dispatch<SetStateAction<TableData[]>>
}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({
    filtersField, setFiltersField, fetchReportData,
    setReportData,
}) => {

    const { colorPalette } = useAppContext()
    const [showFieldsFilter, setShowFieldsFilter] = useState<boolean>(false)
    const [fieldersSelected, setFieldersSelected] = useState<string[]>([]);
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
        { label: 'Status', value: 'status' },
        { label: 'Filtrar por Data', value: 'tipo_data' },
        { label: 'Curso', value: 'curso' },
        { label: 'Turma', value: 'turma' },
        { label: 'Forma de Pagamento', value: 'forma_pagamento' },
        { label: 'Centro de Custo', value: 'centro_custo' },
        { label: 'Conta', value: 'conta' },
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

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextInput
                        label="Ano Base:"
                        name='year'
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setFiltersField({ ...filtersField, year: e.target.value })}
                        type="number"
                        value={filtersField?.year || ''}
                        InputProps={{ style: { backgroundColor: colorPalette?.secondary } }}
                    />
                </Box>

            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ ...styles.filterButton, backgroundColor: colorPalette?.secondary, gap: .5 }} onClick={() => {
                    setFiltersField({
                        year: 2024
                    })
                    setReportData([]);
                }}>
                    <Box sx={{ ...styles.iconFilter, backgroundImage: `url(/icons/clear-filter.png)` }} />
                    <Text light bold={fieldersSelected?.length > 0} style={{ color: fieldersSelected?.length > 0 && colorPalette?.buttonColor }}>Limpar</Text>
                </Box>
                <ButtonIcon text="Buscar" icon={'/icons/search_button.png'} color="#fff" onClick={() => fetchReportData()} />
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
    }
}

export default HeaderFilters