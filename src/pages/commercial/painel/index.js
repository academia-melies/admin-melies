import React, { useState } from "react"
import { api } from "../../../api/api"
import { AnimatedNumbers, Box, Button, Divider, Text, TextInput } from "../../../atoms"
import { useAppContext } from "../../../context/AppContext"
import { PaginationTable, SectionHeader, SelectList } from "../../../organisms"
import { useRouter } from "next/router"
import { Avatar } from "@mui/material"
import { formatTimeStamp } from "../../../helpers"
import { icons } from "../../../organisms/layout/Colors"
import dynamic from "next/dynamic";
const GraphChart = dynamic(() => import('../../../organisms/graph/graph'), { ssr: false });

export default function CommercialPainel(props) {

    const { user, colorPalette, theme, setLoading, alert, notificationUser, permissionTop15 } = useAppContext()
    const [filters, setFilters] = useState({
        year: 2024,
        semestre: '2º Semestre',
        classId: 'todos',
        status: 'todos'
    })
    const [startSearch, setStartSearch] = useState(false)
    const [reportIndicators, setReportIndicators] = useState({})
    const [classes, setClasses] = useState([])
    const [graphIndicator, setGraphIndicator] = useState({})

    const filterFunctions = {
        status: (item) => filters.status === 'todos' || item?.status === filters.status,
        class: (item) => filters.classId === 'todos' || item.turma_id === parseInt(filters.classId),
    };



    const filter = (item) => {
        return (Object.values(filterFunctions).every(filterFunction => filterFunction(item)));
    };


    const getEnrollments = async () => {
        try {
            const response = await api.get(`/reports/commercial/enrollments?year=${filters?.year}&semester=${filters?.semestre}`)
            if (response?.data) {
                setReportIndicators(response?.data)
                const { enrollmentsToClassId, enrollmentsData } = response?.data

                const groupClasses = enrollmentsToClassId.map(classes => ({
                    label: classes?.nome_turma,
                    value: classes?.turma_id.toString()
                }));

                groupClasses.push({
                    label: 'Todas',
                    value: 'todos'
                })

                const groupedData = enrollmentsData.reduce((accumulator, currentValue) => {
                    const date = new Date(currentValue.dt_criacao).toISOString().split('T')[0]; // Obtém a data sem o horário
                    accumulator[date] = (accumulator[date] || 0) + 1; // Incrementa o contador para a data
                    return accumulator;
                }, {});

                const formattedData = Object.keys(groupedData).map(date => ({
                    x: date,
                    y: groupedData[date]
                }));

                setClasses(groupClasses)
                setGraphIndicator(formattedData)
            } else {
                setReportIndicators({})
            }
        } catch (error) {
            console.log(error)
            return error
        }
    }


    const handleFiltered = async () => {
        if (filters?.year && filters?.semestre) {
            try {
                setLoading(true)
                await getEnrollments()
                setFilters({
                    ...filters,
                    classId: 'todos',
                    status: 'todos'
                })
            } catch (error) {
                console.log(error)
                return error
            } finally {
                setLoading(false)
                setStartSearch(true)
            }
        } else {
            alert.info('Preencha o Ano e Semestre, antes de buscar.')
        }
    }

    const groupMonths = [
        { label: '1º Semestre', value: '1º Semestre' },
        { label: '2º Semestre', value: '2º Semestre' },
    ]

    const groupStatus = [
        { label: 'Todos', value: 'todos' },
        { label: 'Aguardando Assinatura', value: 'Pendente de assinatura do contrato' },
        { label: 'Aguardando Inicio', value: 'Aguardando início' },
    ]


    return (
        <>
            <SectionHeader
                title={`Painel Comercial`}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Box>
                    <Box sx={{
                        ...styles.filterSection, gap: 1, width: 'auto'
                    }}>
                        <TextInput label="Ano:" name='year' onChange={(e) => setFilters({ ...filters, year: e.target.value })} type="number" value={filters?.year || ''} sx={{ maxWidth: 200 }}
                            InputProps={{
                                style: {
                                    backgroundColor: colorPalette?.secondary,
                                    boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                                }
                            }} />

                        <SelectList clean={false} data={groupMonths} valueSelection={filters?.semestre} onSelect={(value) => setFilters({ ...filters, semestre: value })}
                            title="Semestre:" filterOpition="value"
                            sx={{
                                backgroundColor: colorPalette?.secondary,
                                boxShadow: theme ? `rgba(149, 157, 165, 0.27) 0px 6px 24px` : `0px 2px 8px rgba(255, 255, 255, 0.05)`,
                                color: colorPalette.textColor, maxWidth: 280
                            }}
                            inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
                        />

                        <Button text="Buscar" style={{ borderRadius: 2, width: 130 }} onClick={() => handleFiltered()} />
                    </Box>
                </Box >
                {startSearch && <>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{
                            display: 'flex', gap: 2, alignItems: 'center', width: '100%', borderRadius: 2,
                            padding: '12px 15px'
                        }}>

                            <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                    <Text large bold>Em Processo de Matrícula</Text>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url('/icons/andamento_icon.png')`,
                                        transition: '.3s',
                                        width: 35, height: 35,
                                        aspectRatio: '1/1'
                                    }} />
                                </Box>
                                <AnimatedNumbers value={reportIndicators?.emProcessoDeRequerimento || 0} />
                            </Box>

                            <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                    <Text large bold>Aguardando Assinatura</Text>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url('/icons/contrato_assinatura_icon.png')`,
                                        transition: '.3s',
                                        width: 35, height: 35,
                                        aspectRatio: '1/1'
                                    }} />
                                </Box>
                                <AnimatedNumbers value={reportIndicators?.aguardandoAssinatura || 0} />
                            </Box>

                            <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                    <Text large bold>Concluídas/Aguardando Inicio</Text>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url('/icons/contract_icon.png')`,
                                        transition: '.3s',
                                        width: 35, height: 35,
                                        aspectRatio: '1/1'
                                    }} />
                                </Box>
                                <AnimatedNumbers value={reportIndicators?.aguardandoInicio || 0} />
                            </Box>

                            <Box sx={{ ...styles.indicator, backgroundColor: colorPalette?.secondary }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                    <Text large bold>Cursando</Text>
                                    <Box sx={{
                                        ...styles.menuIcon,
                                        backgroundImage: `url('/icons/andamento_icon.png')`,
                                        transition: '.3s',
                                        width: 35, height: 35,
                                        aspectRatio: '1/1'
                                    }} />
                                </Box>
                                <AnimatedNumbers value={reportIndicators?.emAndamento || 0} />
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'flex', gap: 2, alignItems: 'start', width: '100%', borderRadius: 2,
                            padding: '12px 15px',
                            flexDirection: { xs: 'column-reverse', sm: 'column-reverse', md: 'column-reverse', lg: 'column-reverse', xl: 'row' }
                        }}>
                            <Box sx={{
                                ...styles.graph, width: '100%', padding: '30px 20px', height: '100%', backgroundColor: colorPalette?.secondary,
                                flexDirection: 'column', alignItems: 'start'
                            }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                    <Text large bold>Resumo das Matrículas por Aluno</Text>
                                </Box>

                                <Box sx={{ display: 'flex', width: '100%', gap: 2, justifyContent: 'center' }}>
                                    <ListFilters groupList={classes} title="Turma:" valueSelected={filters?.classId} setValue={(value) => setFilters({ ...filters, classId: value })} />
                                    <ListFilters groupList={groupStatus} title="Status:" valueSelected={filters?.status} setValue={(value) => setFilters({ ...filters, status: value })} />
                                </Box>
                                <Divider />
                                <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'flex-start', width: '100%', padding: '0px 15px' }}>
                                    <StudentForClass data={reportIndicators?.enrollmentsData?.filter(filter)} />
                                </Box>
                            </Box>

                            <Box sx={{
                                display: 'flex', gap: 2, alignItems: 'center', width: '100%', borderRadius: 2, flexDirection: 'column'
                            }}>
                                <Box sx={{
                                    ...styles.graph, width: '100%', padding: '30px 20px', height: 400, backgroundColor: colorPalette?.secondary,
                                    flexDirection: 'column', alignItems: 'start'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', justifyContent: 'center', width: '100%', }}>
                                        <Text large bold>Matrículas por dia</Text>
                                    </Box>
                                    <div style={{ width: '100%' }}>
                                        <GraphChart
                                            options={{
                                                xaxis: {
                                                    categories: graphIndicator?.map(item => formatTimeStamp(item?.x))// Formatando as datas
                                                },
                                                tooltip: {
                                                    y: {
                                                        formatter: function (value) {
                                                            return value;
                                                        }
                                                    }
                                                }
                                            }}
                                            type="bar"
                                            series={[{
                                                name: 'Matrículas no Dia',
                                                data: graphIndicator
                                            }]}
                                            height={300}
                                        />
                                    </div>
                                </Box>
                                <Box sx={{
                                    ...styles.graph, width: '100%', padding: '30px 20px', height: 'auto', backgroundColor: colorPalette?.secondary,
                                    flexDirection: 'column', alignItems: 'center'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', width: '100%', }}>
                                        <Text large bold>Matrículas Realizadas</Text>
                                    </Box>
                                    <TableIndicatorClasses reportIndicators={reportIndicators} data={reportIndicators?.enrollmentsToClassId} title={`NOVAS TURMAS DE GRADUAÇÃO E PÓS-GRADUAÇÃO ${filters?.year}.${filters?.semestre}`} />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </>
                }
            </Box>

        </>
    )
}

const TableIndicatorClasses = ({ data = [], title, reportIndicators }) => {

    const { setLoading, theme, colorPalette, user } = useAppContext()
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const router = useRouter()
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return (
        <div style={{
            borderRadius: '8px',
            backgroundColor: colorPalette?.secondary,
            border: `1px solid ${theme ? '#eaeaea' : '#404040'}`
        }}>
            <Box sx={{
                display: 'flex', width: '100%', justifyContent: 'center', padding: '8px 12px',
                borderBottom: `1px solid ${colorPalette.primary}`, backgroundColor: colorPalette?.buttonColor + '33'
            }}>
                <Text bold>{title}</Text>
            </Box>
            <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${colorPalette.primary}`, backgroundColor: colorPalette?.primary + '77' }}>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Turma</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Aguardando Assinatura</Text></th>
                        <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Aguardando Inicio</Text></th>
                        {/* <th style={{ padding: '8px 0px', minWidth: '100px' }}><Text bold>Em Andamento</Text></th> */}
                    </tr>
                </thead>
                <tbody style={{ flex: 1, }}>
                    {data?.slice(startIndex, endIndex).map((item, index) => (
                        <React.Fragment key={index}>
                            <tr style={{
                                backgroundColor: colorPalette?.secondary,
                                opacity: 1,
                                transition: 'opacity 0.3s, background-color 0.3s',
                                cursor: 'pointer',
                            }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = colorPalette?.primary + '77';
                                    e.currentTarget.style.opacity = '0.5';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = colorPalette?.secondary;
                                    e.currentTarget.style.opacity = '1';
                                }}>
                                <td style={{ textAlign: 'center', padding: '5px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text bold style={{ color: colorPalette?.buttonColor }}>{item?.nome_turma}</Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '5px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light small>
                                        {parseInt(item?.aguardandoAssinatura)}
                                    </Text>
                                </td>
                                <td style={{ textAlign: 'center', padding: '5px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light small>
                                        {parseInt(item?.aguardandoInicio)}
                                    </Text>
                                </td>
                                {/* <td style={{ textAlign: 'center', padding: '5px 12px',borderBottom: `1px solid ${colorPalette.primary}` }}>
                                    <Text light small>
                                        {parseInt(item?.emAndamento)}
                                    </Text>
                                </td> */}
                            </tr>
                        </React.Fragment>
                    ))}
                    <tr style={{ borderBottom: `1px solid ${colorPalette.primary}`, backgroundColor: colorPalette?.primary + '77' }}>
                        <td style={{ textAlign: 'center', padding: '5px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                            <Text bold >
                                Total:
                            </Text>
                        </td>
                        <td style={{ textAlign: 'center', padding: '5px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                            <Text bold >
                                {reportIndicators?.aguardandoAssinatura || 0}
                            </Text>
                        </td>
                        <td style={{ textAlign: 'center', padding: '5px 12px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                            <Text bold >
                                {reportIndicators?.aguardandoInicio || 0}
                            </Text>
                        </td>
                    </tr>
                </tbody>
            </table>
            <PaginationTable data={data}
                page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
            />
        </div>
    )

}


const StudentForClass = (props) => {
    const { data = [] } = props
    const router = useRouter()
    const { colorPalette, theme } = useAppContext()

    return (
        <Box sx={{
            display: 'flex', justifyContent: 'center', width: '100%', overflowY: 'auto', maxHeight: 650
        }}>
            {data.length > 0 ?
                <Box sx={{ borderRadius: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: 1, }}>
                    {data?.map((item, index) => {
                        const date = item?.dt_criacao?.split('T')[0]
                        const day = date?.split('-')[2]
                        const month = date?.split('-')[1]
                        const description = `${item?.nome_turma} ${item?.periodo} - ${item?.modalidade_curso}`
                        return (
                            <Box key={index} sx={{
                                display: 'flex',
                                backgroundColor: colorPalette?.primary,
                                position: 'relative',
                                boxShadow: 'none',
                                alignItems: 'center', width: '100%', padding: '10px',
                                borderRadius: 2,
                                gap: 2
                            }}>
                                <Avatar src={item?.location} sx={{
                                    height: { xs: 40, sm: 65, md: 65, lg: 65 },
                                    width: { xs: 40, sm: 65, md: 65, lg: 65 },
                                }} variant="circular"
                                />
                                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                                            <Text bold>Aluno:</Text>
                                            <Text light>{item?.aluno}</Text>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                                            <Text bold small>Turma:</Text>
                                            <Text light small>{description || ''}</Text>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: .5, alignItems: 'center' }}>
                                            <Text bold small>Data da matrícula:</Text>
                                            <Text light small>{formatTimeStamp(item?.dt_criacao, true) || ''}</Text>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box key={index} sx={{ display: 'flex', position: 'absolute', right: 5, bottom: 10 }}>
                                    <Text bold small>{item?.status}</Text>
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
                :
                <Box sx={{ backgroundColor: colorPalette.secondary, padding: '5px 10px' }}>
                    <Text >Não existem matrículas</Text>
                </Box>
            }
        </Box>
    )
}

const ListFilters = (props) => {
    const {
        valueSelected,
        setValue,
        groupList,
        title
    } = props
    const { colorPalette, theme } = useAppContext()
    const [showList, setShowList] = useState(false)

    const labelValue = groupList?.filter(item => item?.value === valueSelected)?.map(item => item.label);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 99, gap: .5 }}>
            <Text bold>{title}</Text>
            <Box sx={{
                display: 'flex',
                backgroundColor: colorPalette.primary,
                gap: 2,
                alignItems: 'center',
                width: 300,
                borderRadius: 2,
                padding: '8px 15px',
                justifyContent: 'space-between',
                "&:hover": {
                    opacity: 0.7,
                    cursor: 'pointer',
                }
            }} onClick={() => setShowList(!showList)}>
                <Text bold>{labelValue}</Text>
                <Box sx={{
                    ...styles.menuIcon,
                    backgroundImage: `url(${icons.gray_arrow_down})`,
                    // filter: theme ? 'brightness(0) invert(0)' : 'brightness(0) invert(1)',
                    transition: '.3s',
                    width: 13, height: 13,
                    aspectRatio: '1/1'
                }} />
            </Box>

            <Box sx={{
                display: showList ? 'flex' : 'none', flexDirection: 'column', gap: 0.5, marginTop: .5, position: 'absolute',
                top: 55,
                width: '100%',
                backgroundColor: colorPalette?.secondary,
                overflow: 'auto',
                boxShadow: `rgba(149, 157, 165, 0.17) 0px 6px 24px`,
                padding: '10px 10px'
            }}>
                {showList &&
                    groupList?.filter(item => item?.value !== valueSelected)?.map((item, index) => {
                        return (
                            <Box key={index} sx={{
                                display: 'flex',
                                height: 35,
                                width: '100%',
                                gap: 2,
                                alignItems: 'center',
                                padding: '0px 10px',
                                borderBottom: `1px solid ${colorPalette.primary}`,
                                // maxWidth: 200,
                                borderRadius: 2,
                                justifyContent: 'flex-start',
                                "&:hover": {
                                    opacity: 0.7,
                                    cursor: 'pointer',
                                }
                            }} onClick={() => {
                                setValue(item?.value)
                                setShowList(false)
                            }}>
                                <Text bold>{item?.label}</Text>
                            </Box>
                        )
                    })
                }
            </Box>
        </Box>
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
    indicator: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '33%',
        padding: '20px 20px',
        minHeight: 150,
        gap: 2,
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 'rgba(149, 157, 165, 0.4) 0px 6px 24px'
    },
    graph: {
        display: 'flex',
        // width: '50%', 
        padding: '15px 20px', height: 300,
        gap: 2,
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 'rgba(149, 157, 165, 0.4) 0px 6px 24px'
    },
    filterSection: {
        display: 'flex',
        justifyContent: 'flex-start',
        gap: 1.8,
        paddingLeft: 2,
        flexDirection: { xs: 'column', sm: 'column', md: 'row', lg: 'row' }
    }
}
