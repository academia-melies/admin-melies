import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../atoms"
import { CheckBoxComponent, PaginationTable, RadioItem, SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { Backdrop, TablePagination } from "@mui/material"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"
import { icons } from "../../../organisms/layout/Colors"
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatTimeStamp } from "../../../helpers"
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Link from "next/link"


export default function ReenrollmentsStudent(props) {
    const [students, setStudents] = useState([])
    const { setLoading, colorPalette, userPermissions, menuItemsList, alert, theme } = useAppContext()
    const [filterData, setFilterData] = useState('')
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const router = useRouter()
    const [isPermissionEdit, setIsPermissionEdit] = useState(false)
    const fetchPermissions = async () => {
        try {
            const actions = await checkUserPermissions(router, userPermissions, menuItemsList)
            setIsPermissionEdit(actions)
        } catch (error) {
            console.log(error)
            return error
        }
    }

    const filter = (item) => {
        const normalizeString = (str) => {
            return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        };

        const normalizedFilterData = normalizeString(filterData);
        const normalizedAluno = normalizeString(item?.nome);

        return normalizedAluno?.toLowerCase().includes(normalizedFilterData?.toLowerCase())
    };

    useEffect(() => {
        fetchPermissions()
        getStudents();
    }, []);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const getStudents = async () => {
        setLoading(true)
        try {
            const response = await api.get('/enrollment/list/students/reenrollment')
            const { data } = response;
            console.log(data)
            setStudents(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    const handleReenrollmentPos = async ({ classId, moduleCourse, userId }) => {
        try {
            setLoading(true)
            const response = await api.post(`/enrollment/create/pos-graduacao/reenrollment`, {
                classId, moduleCourse,
                userId: userId
            })
            if (response?.data?.success) {
                alert.success('Rematrícula realizada com sucesso!')
                await getStudents()
            } else {
                alert.error('Ocorreu um erro ao realizar sua Rematrícula. Entre em contato com o atendimento, ou tente novamente mais tarde.')
            }
        } catch (error) {
            console.log(error)
            return error
        } finally {
            setLoading(false)
        }
    }


    const priorityColor = (data) => ((data ? 'red' : 'green'))


    return (
        <>
            <SectionHeader
                title={`Rematrícular Alunos`}
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', justifyContent: 'flex-start', flexDirection: 'column' }}>
                <TextInput InputProps={{
                    style: {
                        backgroundColor: colorPalette?.secondary,
                        width: '800px'
                    }
                }}
                    placeholder="Buscar pelo nome" name='filterData' type="search" onChange={(event) => setFilterData(event.target.value)} value={filterData} sx={{ flex: 1 }} />

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', justifyContent: 'flex-start' }}>
                    {students?.filter(filter)?.length > 0 ?
                        <div style={{
                            borderRadius: '8px', overflow: 'auto', marginTop: '10px', flexWrap: 'nowrap', padding: '5px 12px',
                            backgroundColor: colorPalette?.secondary,
                            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
                        }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Id aluno</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '180px' }}><Text bold>Aluno</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '180px' }}><Text bold>Curso</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Turma</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Módulo a cursar</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '55px' }}><Text bold>Status</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Pós Graduação?</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>-</Text></th>
                                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>-</Text></th>
                                    </tr>
                                </thead>
                                <tbody style={{ flex: 1, }}>
                                    {students?.filter(filter)?.sort((a, b) => a.nome.localeCompare(b.nome))?.slice(startIndex, endIndex).map((item, index) => {
                                        return (
                                            <tr key={index} style={{
                                                backgroundColor: colorPalette?.secondary,
                                                opacity: 1,
                                                transition: 'opacity 0.3s, background-color 0.3s',
                                            }}>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>
                                                        {item?.id || '-'}
                                                    </Text>
                                                </td>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>
                                                        {item?.nome || '-'}
                                                    </Text>
                                                </td>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{item?.nome_curso}</Text>
                                                    {/* <TextInput disabled={!isPermissionEdit && true} name='dt_pagamento' onChange={(e) => handleChangeInstallmentDate(item?.id_parcela_matr, e.target.name, e.target.value)} value={(item?.dt_pagamento)?.split('T')[0] || ''} small type="date" sx={{ padding: '0px 8px' }} /> */}
                                                </td>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{item?.nome_turma}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{item?.modulo_cursando || '-'}</Text>
                                                </td>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '5px 12px' }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            height: 35,
                                                            padding: '5px 12px',
                                                            backgroundColor: colorPalette.primary,
                                                            gap: 1,
                                                            alignItems: 'center',
                                                            borderRadius: 2,
                                                            justifyContent: 'start',
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', backgroundColor: priorityColor(item?.reprovado), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                                        <Text small bold style={{ textAlign: 'center', flex: 1 }}>{item?.reprovado ? 'Reprovado (Cursar novamente)' : 'Aprovado'}</Text>
                                                    </Box>
                                                </td>
                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                                    <Text light small>{item?.pos_graduacao ? 'Sim' : 'Não'}</Text>
                                                </td>

                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '5px 12px' }}>
                                                    <Button
                                                        text={item?.pos_graduacao ? 'Rematrícular Pós' : 'Rematrícular'}
                                                        small
                                                        style={{ borderRadius: 2 }}
                                                        onClick={() => {
                                                            if (item?.pos_graduacao) {
                                                                handleReenrollmentPos({ classId: item?.turma_id, moduleCourse: item?.modulo_cursando, userId: item?.id })
                                                            } else {
                                                                window.open(`/administrative/users/${item?.id}/enrollStudent?classId=${item?.turma_id}&courseId=${item?.curso_id}&reenrollment=true`)
                                                            }
                                                        }} />
                                                </td>

                                                <td style={{ textAlign: 'center', borderBottom: `1px solid ${colorPalette.primary}`, padding: '5px 12px' }}>
                                                    <Button secondary
                                                        text='Perfil'
                                                        onClick={() => window.open(`/administrative/users/${item?.id}`, '_blank')}
                                                        small
                                                        style={{ borderRadius: 2 }} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                            </table>

                            <PaginationTable data={students?.filter(filter)}
                                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                            />

                        </div>
                        :
                        <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                            <Text bold>Não existem alunos para rematrícular</Text>
                        </Box>
                    }
                </Box>

            </Box>
        </>
    )
}

const styles = {
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
}