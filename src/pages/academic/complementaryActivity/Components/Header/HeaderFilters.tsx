
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ClassCenter, CourseCenter, FiltersField, ActivityComplementary, InstallmentsClasses, InstallmentsCourse } from "../..";
import { Box, ButtonIcon, Text, TextInput } from "../../../../../atoms";
import { useAppContext } from "../../../../../context/AppContext";
import { SelectList } from "../../../../../organisms";
import { groupData } from "../../../../../helpers/groupData";
import { DataFilters } from "../../../../financial/reports/expenses";

interface Fields {
    label: string
    value: string
}

interface HeaderFiltersProps {
    filtersField: FiltersField
    setFiltersField: Dispatch<SetStateAction<FiltersField>>
    fetchReportData: () => Promise<void>
    setReportData: Dispatch<SetStateAction<ActivityComplementary[]>>
    classesList: DataFilters[]
    coursesList: DataFilters[]
}

const HeaderFilters: React.FC<HeaderFiltersProps> = ({
    filtersField, setFiltersField, fetchReportData,
    setReportData,
    classesList,
    coursesList
}) => {

    const { colorPalette } = useAppContext()
    const [showFieldsFilter, setShowFieldsFilter] = useState<boolean>(false)
    const [fieldersSelected, setFieldersSelected] = useState<string[]>(['status', 'curso']);
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
        { label: 'Filtrar por Data', value: 'data' },
        { label: 'Status', value: 'status' },
        { label: 'Curso', value: 'curso' },
        { label: 'Turma', value: 'turma' },
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

                            {field === 'status' &&
                                <SelectList
                                    data={groupData.statusActivityComplementary}
                                    valueSelection={filtersField?.status}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, status: value })}
                                    title="Status:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }

                            {field === 'curso' &&
                                <SelectList
                                    data={coursesList}
                                    valueSelection={filtersField?.course}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, course: value })}
                                    title="Curso:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }

                            {field === 'turma' &&
                                <SelectList
                                    data={classesList}
                                    valueSelection={filtersField?.classId}
                                    onSelect={(value: string) => setFiltersField({ ...filtersField, classId: value })}
                                    title="Turma:"
                                    filterOpition="value"
                                    style={{ backgroundColor: colorPalette?.secondary }}
                                    clean={false}
                                />
                            }

                            {field === 'data' &&
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
                                </Box>
                            }
                        </Box>

                    ))}

                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ ...styles.filterButton, backgroundColor: colorPalette?.secondary, gap: .5 }} onClick={() => {
                    setFieldersSelected(['status', 'curso'])
                    setFiltersField({
                        status: 'Aguardando validação',
                        tipo_data: '',
                        data: '',
                        startDate: '',
                        endDate: '',
                        classId: '',
                        course: ''
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