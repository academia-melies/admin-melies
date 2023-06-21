import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import React from "react";
import { Colors } from "../layout/Colors";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatTimeStamp } from "../../helpers";
import { Box } from "../../atoms";
import { useAppContext } from "../../context/AppContext";

export const Table_V1 = (props) => {

    const {
        data = [],
        columns = [],
        avatar = false
    } = props;

    const { colorPalette, theme } = useAppContext()
    const router = useRouter();
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[1]

    const handleRowClick = (id) => {
        router.push(`/${pathname}/${id}`);
    };

    const getRowBackground = (index) => {
        if (theme) {
            return index % 2 === 0 ? '#F2F4F8' : '#FFF';
        } else {
            return index % 2 === 0 ? '#0E0D15' : '#221F32';
        }
    };

    return (
        <>
            <Paper>
                <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: colorPalette.buttonColor, transition: 'background-color 1s', }}>
                                {columns.map((column) => (
                                    <TableCell key={column?.key} sx={{ ...styles.cell, minWidth: column?.key !== 'id' && '140px' }}>{column.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {/* {data?.map((row) => (
                                <TableRow key={row.id} onClick={() => handleRowClick(row.id)}
                                    sx={styles.bodyRow}>
                                    {columns.map((column) => (
                                        row[column?.key] ?
                                            <Tooltip title={row[column.key]} arrow>
                                                <TableCell key={`${row.id}-${column.key}`} sx={{
                                                    ...styles.bodyCell,
                                                    maxWidth: '140px',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                }}>
                                                    {column.key === 'nome' && <Avatar sx={{ width: 27, height: 27, fontSize: 14 }} src={row[column.avatarUrl]} />}
                                                    {typeof row[column.key] === 'object' &&
                                                        row[column?.key || '-'] instanceof Date ? (
                                                        formatTimeStamp(row[column?.key || '-'])
                                                    ) : (
                                                        row[column?.key || '-']
                                                    )}
                                                </TableCell>
                                            </Tooltip>
                                            :
                                            <TableCell sx={styles.bodyCell}>---</TableCell>
                                    ))}
                                </TableRow>
                            ))} */}
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
                                    }}
                                >
                                    <Tooltip title={row[column.key]} arrow>
                                        {row[column?.key] ? (

                                            <Box
                                                sx={{
                                                    maxWidth: '160px',
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
                                    </Tooltip>
                                </TableCell>
                            ))}
                        </TableRow>
                            ))}

                    </TableBody>
                </Table>
            </TableContainer>
        </Paper >
        </>
    )
}

const styles = {
    cell: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    bodyCell: {
        textAlign: 'center',
        // borderTop: '1px solid lightGray',

    },
    bodyRow: {
        textOverflow: 'ellipsis',

    }
}