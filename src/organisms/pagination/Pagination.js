import { Pagination } from "@mui/material"
import { Box, Button, Text } from "../../atoms"
import { SelectList } from "../select/SelectList"
import { useAppContext } from "../../context/AppContext"
import { icons } from "../layout/Colors"

export const PaginationTable = (props) => {
    const {
        data = [], page, setPage, rowsPerPage, setRowsPerPage
    } = props
    const { colorPalette, theme } = useAppContext()
    const filteredAndSorted = data?.length;
    const totalPages = Math.ceil((filteredAndSorted) / rowsPerPage);


    const handlePrevPage = () => {
        setPage(page - 1);
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const rows = [
        { label: 10, value: 10 },
        { label: 15, value: 15 },
        { label: 20, value: 20 },
        { label: 25, value: 25 },
        { label: 50, value: 50 },
        { label: 100, value: 100 },
    ]

    return (
        <Box sx={{
            display: 'flex', gap: 2, alignItems: 'center', padding: '15px 12px', width: '100%', justifyContent: 'space-between',
        }}>
            <Box sx={{
                display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center',
                opacity: (page + 1) === 1 ? .3 : 1,
                borderRadius: 2, padding: '8px 12px', border: `1px solid`,
                "&:hover": {
                    opacity: (page + 1) !== 1 && 0.8,
                    cursor: (page + 1) !== 1 && 'pointer'
                }
            }} onClick={() => (page + 1) !== 1 && handlePrevPage()}>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url('/icons/arrow_right_icon.png')`,
                    width: 13,
                    height: 13,
                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                    transform: 'rotate(180deg)',
                    transition: 'background-color 1s',
                }} onClick={() => router.push('/')} />
                <Text light bold>Anterior</Text>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Text light>Mostrando:</Text>
                    <SelectList
                        minWidth={80}
                        data={rows}
                        valueSelection={rowsPerPage}
                        onSelect={(value) => setRowsPerPage(value)}
                        filterOpition="value"
                        inputStyle={{ color: colorPalette.textColor, fontSize: '15px', width: 80, height: 40 }}
                        clean={false}
                        sx={{ backgroundColor: colorPalette.secondary, width: 80, height: 40 }}
                    />
                    <Text>de <strong>{filteredAndSorted}</strong> Items.</Text>
                </Box>
                <Pagination
                    variant="outlined"
                    count={totalPages}
                    page={page + 1}
                    // onChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    sx={{ color: colorPalette?.textColor }}
                />
            </Box>
            <Box sx={{
                display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center',
                borderRadius: 2, padding: '8px 12px', border: `1px solid`,
                opacity: (page + 1) === totalPages ? .3 : 1,
                "&:hover": {
                    opacity: (page + 1) !== totalPages && 0.8,
                    cursor: (page + 1) !== totalPages && 'pointer'
                }
            }} onClick={() => (page + 1) !== totalPages && handleNextPage()}>
                <Text light bold>Próximo</Text>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url('/icons/arrow_right_icon.png')`,
                    width: 13,
                    height: 13,
                    filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                    transition: 'background-color 1s',
                }} onClick={() => router.push('/')} />
            </Box>
        </Box>
    )
}


const styles = {
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,

    },
}