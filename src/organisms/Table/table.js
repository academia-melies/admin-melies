import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import React from "react";
import { Colors } from "../layout/Colors";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatTimeStamp } from "../../helpers";

export const Table_V1 = (props) => {

    const {
        data = [],
        columns = []
    } = props;

    const router = useRouter();

    const handleRowClick = (id) => {
        router.push(`/users/${id}`);
    };

    return (
        <>
            <Paper>
                <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow style={{ backgroundColor: Colors.backgroundSecundary }}>
                                {columns.map((column) => (
                                    <TableCell key={column?.key} sx={styles.cell}>{column.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.map((row) => (
                                <TableRow key={row.id} onClick={() => handleRowClick(row.ID)}
                                    sx={styles.bodyRow}>
                                    {columns.map((column) => (
                                        row[column?.key] ? 
                                        <TableCell key={`${row.id}-${column.key}`} sx={styles.bodyCell}>
                                            {typeof row[column.key] === 'object' &&
                                                row[column?.key || '-'] instanceof Date ? (
                                                formatTimeStamp(row[column?.key || '-'])
                                            ) : (
                                                row[column?.key || '-']
                                            )}
                                        </TableCell>
                                        :
                                        <TableCell sx={styles.bodyCell}>---</TableCell>
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
        textAlign: 'center'
    },
    bodyCell: {
        textAlign: 'center'
    },
    bodyRow: {
        "&:hover": {
            backgroundColor: Colors.background + '77',
            cursor: 'pointer'
        }
    }
}