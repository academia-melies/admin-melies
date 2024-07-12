import { Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Tooltip, Avatar } from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { formatTimeStamp } from "../../helpers";
import { Box, Button, Text } from "../../atoms";
import { useAppContext } from "../../context/AppContext";
import { icons } from "../layout/Colors";
import { PaginationTable } from "../pagination/Pagination";

export const Table_V1 = (props) => {

    const {
        isPermissionEdit,
        data = [],
        columns = [],
        avatar = false,
        screen = '',
        columnId,
        columnActive = true,
        onSelect = () => { },
        center = false,
        routerPush = true,
        sx = {},
        filters = [],
        onFilter = false,
        tolltip = false,
        onDelete = false,
        onPress = () => { },
        query = ``,
        route = false,
        enrollmentsCount = false,
        targetBlank
    } = props;


    const { colorPalette, theme, setShowConfirmationDialog } = useAppContext()
    const router = useRouter();
    const menu = router.pathname === '/' ? null : router.asPath.split('/')[1]
    const subMenu = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleRowClick = (id) => {
        if (route) {
            if (targetBlank) {
                window.open(`/${route}/${id}${query}`, '_blank');
                return;
            }
            router.push(`/${route}/${id}${query}`);
            return
        }
        if (targetBlank) {
            window.open(`/${menu}/${subMenu}/${id}${query}`, '_blank');
            return;
        }
        router.push(`/${menu}/${subMenu}/${id}${query}`);
    };

    const getRowBackground = (index) => {
        if (theme) {
            return index % 2 === 0 ? '#F2F4F8' : '#FFF';
        } else {
            return index % 2 === 0 ? '#0E0D15' : '#221F32';
        }
    };

    const priorityColor = (data) => ((data === 'Alta' && 'yellow') ||
        (data === 'Urgente' && 'red') ||
        (data === 'Média' && 'green') ||
        (data === 'Baixa' && 'blue'))

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return (
        <>
            <Box sx={{
                backgroundColor: colorPalette.secondary, transition: 'background-color 1s',
                border: `1px solid ${theme ? '#eaeaea' : '#404040'}`, ...sx
            }}>
                <TableContainer sx={{ borderRadius: '8px', overflow: 'auto' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ borderBottom: `2px solid ${colorPalette.buttonColor}` }}>
                                {columns.map((column) => (
                                    <TableCell key={column?.key} sx={{ ...styles.cell, fontFamily: 'MetropolisBold', }}>

                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Text bold>{column.label}</Text>
                                            {onFilter &&
                                                <Box sx={{
                                                    ...styles.menuIcon,
                                                    backgroundImage: `url(${icons.gray_arrow_down})`,
                                                    transform: filters?.filterName === column?.key ? filters?.filterOrder === 'asc' ? 'rotate(-0deg)' : 'rotate(-180deg)' : 'rotate(-0deg)',
                                                    transition: '.3s',
                                                    width: 17,
                                                    height: 17,

                                                    "&:hover": {
                                                        opacity: 0.8,
                                                        cursor: 'pointer'
                                                    },
                                                }}
                                                    onClick={() => onPress({
                                                        filterName: column?.key,
                                                        filterOrder: filters?.filterOrder === 'asc' ? 'desc' : 'asc'
                                                    })} />
                                            }
                                        </Box>
                                    </TableCell>
                                ))}
                                {columnActive &&
                                    <TableCell sx={{ ...styles.cell, fontFamily: 'MetropolisBold', }}> <Text bold>Status</Text></TableCell>
                                }
                                {onDelete &&
                                    <TableCell sx={{ ...styles.cell, fontFamily: 'MetropolisBold', }}></TableCell>
                                }
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ flex: 1, padding: 5, backgroundColor: colorPalette.secondary }}>
                            {data?.slice(startIndex, endIndex)?.map((row, index) => (
                                <TableRow key={row.id} onClick={() => {
                                    routerPush ? handleRowClick(row[columnId])
                                        : onSelect(row[columnId])
                                }} sx={{
                                    ...styles.bodyRow,
                                    "&:hover": {
                                        cursor: 'pointer',
                                        backgroundColor: colorPalette.primary + '88'
                                    },
                                }}>
                                    {columns.map((column) => (
                                        <Tooltip key={`${column}-${row}`} title={tolltip ? '' : column.date ? formatTimeStamp(row[column?.key]) : row[column?.key || '-']} arrow>
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
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        {column.avatar && <Avatar sx={{ width: 27, height: 27, fontSize: 14 }} src={row[column?.avatarUrl || '']} />}

                                                        {typeof row[column.key] === 'object' && row[column?.key || '-'] instanceof Date ? (
                                                            formatTimeStamp(row[column?.key || '-'])
                                                        ) : (
                                                            column.task ? (
                                                                <Box
                                                                    sx={{
                                                                        display: 'flex',
                                                                        backgroundColor: getRowBackground(index + 1),
                                                                        height: 30,
                                                                        gap: 2,
                                                                        alignItems: 'center',
                                                                        width: 100,
                                                                        borderRadius: 2,
                                                                        justifyContent: 'start',
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', backgroundColor: priorityColor(row[column.key]), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                                    <Text small bold>{row[column.key]}</Text>
                                                                </Box>
                                                            ) : (
                                                                column.price ? formatter.format(row[column?.key]) : column.date ? formatTimeStamp(row[column?.key]) :
                                                                    <Text style={{
                                                                        maxWidth: column.matricula && '180px', textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                    }}>
                                                                        {row[column?.key || '-']}
                                                                    </Text>

                                                            )
                                                        )}
                                                        {(enrollmentsCount && row?.total_matriculas_em_andamento > 0 && column?.matricula) &&
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ textAlign: 'center', color: colorPalette?.buttonColor }} bold>M</Text>
                                                            </Box>
                                                        }
                                                    </Box>
                                                ) : (
                                                    <TableCell sx={{ border: 'none', padding: '2px', transition: 'background-color 1s', color: colorPalette.textColor }}>---</TableCell>
                                                )}
                                            </TableCell>
                                        </Tooltip>
                                    ))}

                                    {columnActive && <TableCell>
                                        <IconStatus
                                            style={{ backgroundColor: row.ativo >= 1 ? 'green' : 'red', boxShadow: row.ativo >= 1 ? `#2e8b57 0px 6px 24px` : `#900020 0px 6px 24px`, }}
                                        />
                                    </TableCell>
                                    }
                                    {onDelete &&
                                        <TableCell>
                                            <Button small text="deletar" style={{
                                                backgroundColor: 'red',
                                                color: '#fff',
                                                transition: 'background-color 1s',
                                                "&:hover": {
                                                    backgroundColor: 'red' + 'dd',
                                                    cursor: 'pointer'
                                                },
                                                width: '80px',
                                                borderRadius: '5px'
                                            }} onClick={() => {
                                                onSelect(row[columnId])
                                            }} />
                                        </TableCell>
                                    }
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>

                <PaginationTable data={data}
                    page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                />
            </Box >
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
        fontWeight: 'bold',
    },
    bodyCell: {
        textAlign: 'center',
    },
    bodyRow: {
        textOverflow: 'ellipsis',

    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,

    },
}