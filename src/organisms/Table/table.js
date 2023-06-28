import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import React from "react";
import { useRouter } from "next/router";
import { formatTimeStamp } from "../../helpers";
import { Box } from "../../atoms";
import { useAppContext } from "../../context/AppContext";

export const Table_V1 = (props) => {

    const {
        data = [],
        columns = [],
        avatar = false,
        slug = ''
    } = props;

    console.log(data)

    const { colorPalette, theme } = useAppContext()
    const router = useRouter();
    // const pathname = router.pathname === '/' ? null : router.asPath.split('/')[1]

    const handleRowClick = (id) => {
        router.push(`/administrative/${slug}/${id}`);
    };

    const getRowBackground = (index) => {
        if (theme) {
            return index % 2 === 0 ? '#F2F4F8' : '#FFF';
        } else {
            return index % 2 === 0 ? '#0E0D15' : '#221F32';
        }
    };

    const ativo = data?.map((item) => item.ativo >= 1 ? 'green' : 'red')

    console.log(ativo)

    return (
        <>
            <Paper sx={{ backgroundColor: colorPalette.primary, transition: 'background-color 1s', }}>
                <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: colorPalette.buttonColor, transition: 'background-color 1s', }}>
                                {columns.map((column) => (
                                    <TableCell key={column?.key} sx={{ ...styles.cell, fontFamily: 'MetropolisBold', }}>{column.label}</TableCell>
                                ))}
                                <TableCell sx={{ ...styles.cell, fontFamily: 'MetropolisBold', }}>ativo</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.map((row, index) => (
                                <TableRow key={row.id} onClick={() => handleRowClick(row.id)} sx={{
                                    ...styles.bodyRow,
                                    transition: 'background-color 1s',
                                    backgroundColor: getRowBackground(index),
                                    "&:hover": {
                                        backgroundColor: colorPalette.primary + '99',
                                        cursor: 'pointer',
                                    },
                                }}>
                                    {columns.map((column) => (
                                        <Tooltip title={row[column.key]} arrow>
                                            <TableCell
                                                key={`${row.id}-${column.key}`}
                                                sx={{
                                                    ...styles.bodyCell,
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    maxWidth: '160px',
                                                    color: colorPalette.textColor,
                                                    transition: 'background-color 1s',
                                                    fontFamily: 'MetropolisRegular',
                                                }}
                                            >

                                                {row[column?.key] ? (

                                                    <Box
                                                        sx={{
                                                            // maxWidth: '160px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {column.key === 'nome' && <Avatar sx={{ width: 27, height: 27, fontSize: 14 }} src={row[column.avatarUrl]} />}
                                                        {typeof row[column.key] === 'object' &&
                                                            row[column?.key || '-'] instanceof Date ? (
                                                            formatTimeStamp(row[column?.key || '-'])
                                                        ) : (
                                                            row[column?.key || '-']
                                                        )}
                                                    </Box>

                                                ) : (
                                                    <TableCell sx={{ border: 'none', padding: '2px', transition: 'background-color 1s', color: colorPalette.textColor }}>---</TableCell>
                                                )}
                                            </TableCell>
                                        </Tooltip>
                                    ))}
                                    <TableCell>
                                        <IconStatus
                                            style={{ backgroundColor: row.ativo >= 1 ? 'green' : 'red', boxShadow: row.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper >
        </>
    )
}

export const IconStatus = (props) => {

    const { style = {} } = props
    return (
        <Box sx={{ width: 16.5, height: 16.5, padding: '0px 10px', borderRadius: 30, justifyContent: 'center', alignItems: 'center', }}>
            <Box sx={{ width: 16, height: 16, borderRadius: 30, ...style }} />
        </Box>
    );
}

const styles = {
    cell: {
        color: '#fff',
        fontWeight: 'bold',
    },
    bodyCell: {
        textAlign: 'center',
    },
    bodyRow: {
        textOverflow: 'ellipsis',
    }
}