
import { ActivityComplementary, ActivityComplementaryArq } from "../..";
import { Box, Button, ContentContainer, Divider, Text, TextInput } from "../../../../../atoms";
import { useAppContext } from "../../../../../context/AppContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatTimeStampTimezone } from "../../../../../helpers";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { api } from "../../../../../api/api";
import { Backdrop } from "@mui/material";
import { icons } from "../../../../../organisms/layout/Colors";
import Link from "next/link";

interface TableReportProps {
    data: ActivityComplementary[];
    setData: Dispatch<SetStateAction<ActivityComplementary[]>>
}

interface ShowFiles {
    active: boolean
    item?: ActivityComplementaryArq[];
}

interface ShowDescription {
    active: boolean
    description: string | null
}

interface ShowComentary {
    active: boolean
    item: ActivityComplementary | null
    commentary: string | null
    onlyRead: boolean
}

interface UpdateActivityProps {
    activityId: number | string | null
    aprovved: number
    commentary: string | null
}

const TableReport: React.FC<TableReportProps> = ({ data = [], setData }) => {
    const { colorPalette, setLoading, alert, user } = useAppContext()
    const [showFiles, setShowFiles] = useState<ShowFiles>({ active: false, item: [] })
    const [showDescription, setShowDescription] = useState<ShowDescription>({ active: false, description: '' })
    const [showComentaryReprovved, setShowComentaryReprovved] = useState<ShowComentary>({ active: false, item: null, commentary: '', onlyRead: false })
    const [activityMarked, setActivityMarked] = useState<(string | number)[]>([])

    const statusColor = (data: string | null) => (
        (data === 'Reprovado' && 'red') ||
        (data === 'Aprovado' && 'green') ||
        (data === 'Aguardando Aprovação' && 'yellow')
    )

    const handleUpdateAprovvedActivity = async ({ activityId, aprovved, commentary = null }: UpdateActivityProps) => {
        setLoading(true)
        try {
            const activityData = {
                aprovado: aprovved,
                comentario: commentary,
                aprovado_por: user?.id
            }
            const response = await api.patch(`/atividade-complementar/update/aprovved/${activityId}`, { activityData })
            if (response?.status === 200) {
                alert.success('Atividade Complementar atualizada com sucesso.');
                setShowComentaryReprovved({ active: false, item: null, commentary: '', onlyRead: false })
                setShowFiles({ active: false, item: [] })
                setData(prevValues =>
                    prevValues.map(item =>
                        item.id_ativ_complementar === activityId
                            ? {
                                ...item,
                                aprovado: aprovved,
                                comentario: commentary,
                                aprovado_por: user?.id
                            }
                            : item
                    )
                );
                return
            }
            alert.error('Tivemos um problema ao atualizar Atividade Complementar.');
        } catch (error) {
            alert.error('Tivemos um problema ao atualizar Atividade Complementar.');
        } finally {
            setLoading(false)
        }
    }

    const handleMark = (value: string | number) => {
        const alreadySelected = activityMarked.some(m => m === value);
        const updatedSelected = alreadySelected ? activityMarked.filter(activity => activity !== value)
            : [...activityMarked, value];
        setActivityMarked(updatedSelected)
    };

    return (
        <Box>
            <div style={{
                borderRadius: '8px', overflow: 'auto', flexWrap: 'nowrap',
                backgroundColor: colorPalette?.secondary,
            }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', overflow: 'auto', }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${colorPalette.primary}` }}>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold></Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Aluno</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Atividade</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Título</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Descrição</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Qnt Horas</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Data de Envio</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Módulo</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Arquivos</Text></th>
                            <th style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Situação</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Comentários</Text></th>
                            <th style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisBold' }}><Text bold>Ações</Text></th>
                        </tr>
                    </thead>
                    <tbody style={{ flex: 1, }}>
                        {data.map((item: ActivityComplementary, index: number) => {
                            const status = item?.aprovado === null && 'Aguardando Aprovação' || item.aprovado === 1 && 'Aprovado' || item.aprovado === 0 && 'Reprovado' || null
                            const selected = activityMarked && activityMarked.includes(item.id_ativ_complementar)
                            return (
                                <tr key={`${item}-${index}`} style={{
                                    backgroundColor: selected ? colorPalette?.buttonColor + '66' : colorPalette?.secondary
                                }}>
                                    <td style={{ textAlign: 'center', padding: '5px 5px', borderBottom: `1px solid ${colorPalette.primary}` }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                            <Box sx={{
                                                display: 'flex', gap: 1, width: 15, height: 15, border: '1px solid', borderRadius: '2px',
                                                backgroundColor: 'lightgray', alignItems: 'center', justifyContent: 'center',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer'
                                                }
                                            }} onClick={() => handleMark(item.id_ativ_complementar)}>
                                                {selected &&
                                                    <Box sx={{
                                                        ...styles.menuIcon,
                                                        width: 15, height: 15,
                                                        backgroundImage: `url('/icons/checkbox-icon.png')`,
                                                        transition: '.3s',
                                                    }} />
                                                }
                                            </Box>
                                        </Box>
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.aluno || '-'}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.atividade || item.tipo_atv || '-'}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.titulo || '-'}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.descricao ? <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Button small text="Ler" style={{ padding: '6px 5px', borderRadius: 2, width: 80 }}
                                                onClick={() => setShowDescription({ active: true, description: item.descricao })} />
                                        </Box>
                                            :
                                            "-"}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.carga_hr || '-'}h
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {formatTimeStampTimezone(item.dt_criacao, true) || '-'}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.modulo_semestre || '-'}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item.arquivos && item.arquivos.length > 0 ? <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Button small text="abrir" style={{ padding: '6px 5px', borderRadius: 2, width: 80 }}
                                                onClick={() => setShowFiles({ active: true, item: item.arquivos })} />
                                        </Box>
                                            :
                                            "-"}
                                    </td>

                                    <td style={{ fontSize: '14px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                height: 30,
                                                backgroundColor: colorPalette.primary,
                                                width: 100,
                                                alignItems: 'center',
                                                borderRadius: 2,
                                                justifyContent: 'start',

                                            }}
                                        >
                                            <Box sx={{ display: 'flex', backgroundColor: statusColor(status), padding: '0px 5px', height: '100%', borderRadius: '8px 0px 0px 8px' }} />
                                            <Text small bold style={{ textAlign: 'center', flex: 1 }}>{status}</Text>
                                        </Box>
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center', border: '1px solid lightgray' }}>
                                        {item?.comentario ?
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Button small text="vizualizar" style={{ padding: '6px 5px', borderRadius: 2, width: 120 }}
                                                    onClick={() => setShowComentaryReprovved({ active: true, item: item, commentary: '', onlyRead: true })} />
                                            </Box>
                                            : '-'}
                                    </td>
                                    <td style={{ fontSize: '13px', padding: '8px 10px', border: '1px solid lightgray' }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                            <Box sx={{
                                                display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                border: `1px solid green`,
                                                transition: '.3s',
                                                backgroundColor: item?.aprovado === 1 ? 'green' : 'trasnparent', borderRadius: 2,
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer',
                                                    transform: 'scale(1.03, 1.03)'
                                                },
                                            }} onClick={() => {
                                                if (item?.aprovado !== 1) {
                                                    handleUpdateAprovvedActivity({
                                                        activityId: item.id_ativ_complementar,
                                                        aprovved: 1,
                                                        commentary: null
                                                    })
                                                }
                                            }}>
                                                {item?.aprovado !== 1 && <CheckCircleIcon style={{ color: 'green', fontSize: 13 }} />}
                                                <Text bold style={{ color: item?.aprovado === 1 ? '#fff' : 'green' }}>{
                                                    item?.aprovado === 1 ? "Aprovado" : "Aprovar"
                                                }</Text>
                                            </Box>
                                            <Box sx={{
                                                display: 'flex', gap: 1.5, alignItems: 'center', padding: '5px 8px',
                                                border: `1px solid red`,
                                                backgroundColor: item?.aprovado === 0 ? 'red' : 'trasnparent', borderRadius: 2,
                                                transition: '.3s',
                                                "&:hover": {
                                                    opacity: 0.8,
                                                    cursor: 'pointer',
                                                    transform: 'scale(1.03, 1.03)'
                                                },
                                            }} onClick={() => {
                                                if (item.aprovado !== 0) {
                                                    setShowComentaryReprovved({ active: true, item: item, commentary: '', onlyRead: false })
                                                }
                                            }}>
                                                {item?.aprovado !== 0 && <CancelIcon style={{ color: 'red', fontSize: 13 }} />}
                                                <Text bold style={{ color: item?.aprovado === 0 ? '#fff' : 'red' }}>{
                                                    item?.aprovado === 0 ? "Reprovado" : "Reprovar"
                                                }</Text>
                                            </Box>
                                        </Box>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Backdrop open={showComentaryReprovved?.active}>
                <ContentContainer>
                    <Box sx={styles.containerModal} >
                        <Text bold large>Motivo da Reprovação</Text>
                        <Box sx={styles.menuIcon} onClick={() => setShowComentaryReprovved({ active: false, item: null, commentary: '', onlyRead: false })} />
                    </Box>
                    <Divider />

                    {showComentaryReprovved?.onlyRead &&
                        <Box sx={styles.buttonReprovved}>
                            <CancelIcon style={{ color: 'red', fontSize: 13 }} />
                            <Text bold style={{ color: 'red' }}>Reprovado</Text>
                        </Box>
                    }
                    <Box sx={styles.containerInputs}>
                        <Box sx={styles.inputBox}>
                            <Text bold>Atividade:</Text>
                            <Text light>{showComentaryReprovved?.item?.atividade}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={styles.inputBox}>
                            <Text bold>Título:</Text>
                            <Text light>{showComentaryReprovved?.item?.titulo}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={styles.inputBox}>
                            <Text bold>Horas:</Text>
                            <Text light>{showComentaryReprovved?.item?.carga_hr}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={styles.inputBox}>
                            <Text bold>Data do envio:</Text>
                            <Text light>{formatTimeStampTimezone(showComentaryReprovved?.item?.dt_criacao, true)}</Text>
                        </Box>
                        <Divider distance={0} />
                        <Box sx={styles.inputCol}>
                            <Text bold>Motivo/Comentário:</Text>
                            {showComentaryReprovved?.onlyRead ?
                                <Text light>{showComentaryReprovved?.item?.comentario}</Text>
                                :
                                <TextInput
                                    placeholder='Escreva o motivo da reprovação'
                                    name='comentario'
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setShowComentaryReprovved({ ...showComentaryReprovved, commentary: e.target.value })}
                                    value={showComentaryReprovved?.commentary || ''}
                                    multiline
                                    maxRows={8}
                                    rows={4}
                                />
                            }
                        </Box>
                    </Box>
                    {!showComentaryReprovved?.onlyRead &&
                        <>
                            <Divider />
                            <Box sx={{ display: 'flex', width: '100%', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
                                <Button small text="Enviar" onClick={() => {
                                    if (showComentaryReprovved?.commentary === '') {
                                        alert.info('Preencha o campo de comentário/motivo antes de reprovar.')
                                    } else {
                                        if (showComentaryReprovved && showComentaryReprovved?.item?.id_ativ_complementar) {
                                            handleUpdateAprovvedActivity({ activityId: showComentaryReprovved.item.id_ativ_complementar, aprovved: 0, commentary: showComentaryReprovved?.commentary })
                                        }
                                    }
                                }} />
                                <Button secondary small text="Cancelar" onClick={() => setShowComentaryReprovved({ active: false, item: null, commentary: '', onlyRead: false })} />
                            </Box>
                        </>
                    }
                </ContentContainer>
            </Backdrop>


            <Backdrop open={showFiles?.active}>
                <ContentContainer>
                    <Box sx={styles.containerModal} >
                        <Text bold title>Arquivos Anexados</Text>
                        <Box sx={styles.menuIcon} onClick={() => setShowFiles({ active: false, item: [] })} />
                    </Box>
                    <Divider />
                    <Box sx={styles.containerFiles}>
                        {showFiles?.item?.map((item, index) => {
                            const nameFile = item?.name_file || '';
                            const typePdf = item?.name_file?.includes('pdf') || null;
                            const fileUrl = item?.location || '';
                            return (
                                <Link key={index} href={fileUrl} target="_blank">
                                    <Box sx={{ ...styles.fileBox, backgroundColor: colorPalette.primary, }} >
                                        <Box sx={styles.fileTitle} >
                                            <Text small>{decodeURI(nameFile)}</Text>
                                        </Box>
                                        <Box sx={{ ...styles.imageFile, backgroundImage: `url('${typePdf ? '/icons/pdf_icon.png' : fileUrl}')` }} />
                                    </Box>
                                </Link>
                            )
                        })}
                    </Box>
                </ContentContainer>
            </Backdrop>


            <Backdrop open={showDescription?.active}>
                <ContentContainer>
                    <Box sx={styles.containerModal}>
                        <Text bold title>Descrição</Text>
                        <Box sx={styles.menuIcon} onClick={() => setShowDescription({ active: false, description: '' })} />
                    </Box>
                    <Divider />
                    <Box sx={styles.containerDescription}>
                        <Text light style={{ whiteSpace: 'pre-line' }} >{showDescription?.description}</Text>
                    </Box>
                </ContentContainer>
            </Backdrop>

        </Box>
    )
}

const styles = {
    containerModal: {
        display: 'flex', gap: 3, padding: '0px 12px', borderRadius: 2, alignItems: 'center', justifyContent: 'space-between'
    },
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 15,
        height: 15,
        aspectRatio: '1:1',
        backgroundImage: `url(${icons.gray_close})`,
        transition: '.3s',
        zIndex: 9999,
        "&:hover": {
            opacity: 0.8,
            cursor: 'pointer'
        }
    },
    buttonReprovved: {
        display: 'flex', gap: 1.5, alignItems: 'center',
        padding: '5px 8px',
        border: `1px solid red`,
        backgroundColor: 'trasnparent',
        borderRadius: 2
    },
    containerInputs: {
        display: 'flex', gap: 1, flexDirection: 'column', marginTop: 3, maxWidth: 500
    },
    containerDescription: {
        display: 'flex', maxWidth: 500, maxHeight: 500, overflowY: 'auto'
    },
    inputBox: {
        display: 'flex', gap: .5, alignItems: 'center'
    },
    inputCol: {
        display: 'flex',
        gap: .5,
        alignItems: 'start',
        flexDirection: 'column'
    },
    containerFiles: {
        display: 'flex',
        gap: 1,
        flexDirection: 'row',
        marginTop: 3,
        maxWidth: 500,
        flexWrap: 'wrap'
    },
    fileBox: {
        display: 'flex',
        gap: 1,
        padding: '5px 12px',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    fileTitle: {
        display: 'flex',
        gap: 1,
        padding: '0px 12px',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    imageFile: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        width: { xs: 200, sm: 350, md: 350, lg: 180, xl: 180 },
        aspectRatio: '1/1',
    }
}

export default TableReport