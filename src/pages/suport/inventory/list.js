import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"
import { icons } from "../../../organisms/layout/Colors"
import { api } from "../../../api/api"
import { checkUserPermissions } from "../../../validators/checkPermissionUser"

export default function ListInventory(props) {
    const [inventoryList, setInventoryList] = useState([])
    const [filterData, setFilterData] = useState('')
    const [showInventoryTable, setShowInventoryTable] = useState({});
    const [roomSelected, setRoomSelected] = useState();
    const [showResume, setShowResume] = useState(false);
    const [lengthData, setLengthData] = useState()
    const [rooms, setRooms] = useState([])
    const { setLoading, colorPalette, userPermissions, menuItemsList } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
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
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.sala?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.sala?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    const toggleGridTable = (index) => {
        setShowInventoryTable(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    useEffect(() => {
        fetchPermissions()
        getInventory();
        listSchoolRooms()
    }, []);

    const getInventory = async () => {
        setLoading(true)
        try {
            const response = await api.get('/inventoryItems')
            const { data = [] } = response;
            setInventoryList(data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function listSchoolRooms() {
        try {
            const response = await api.get(`/schoolRooms`)
            const { data } = response
            const groupRooms = data.map(room => ({
                label: room.sala,
                value: room?.id_sala
            }));

            setRooms(groupRooms);
        } catch (error) {
        }
    }

    const column = [
        { key: 'id_inventario_item', label: 'ID' },
        { key: 'nome_ativo', label: 'Nome' },
        // { key: 'tipo_ativo', label: 'Item/Ativo' },
        { key: 'observacoes_ativo', label: 'Especificações' },
        { key: 'patrimonio', label: 'Patrimônio' },
        { key: 'memoria', label: 'Memória' },
        { key: 'processador', label: 'Processador' },
        { key: 'placa_video', label: 'Placa de Video' },

    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    return (
        <>
            <SectionHeader
                title={`Inventário (${inventoryList?.filter(filter).reduce((total, item) => total + item.items_inventario.length, 0) || '0'})`}
                newButton={isPermissionEdit}
                newButtonAction={() => router.push(`/suport/${pathname}/new`)}
            />
            <TableResume
                roomSelected={roomSelected}
                setRoomSelected={setRoomSelected}
                inventoryList={inventoryList}
                rooms={rooms}
            />


            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Computador, monitor..' style={{ padding: '15px', }} onChange={setFilterData} />
                <SelectList
                    data={listAtivo}
                    valueSelection={filterAtive}
                    onSelect={(value) => setFilterAtive(value)}
                    title="status"
                    filterOpition="value"
                    sx={{ backgroundColor: colorPalette.secondary, color: colorPalette.textColor, flex: 1 }}
                    inputStyle={{ color: colorPalette.textColor, fontSize: '15px' }}
                    clean={false}
                />
            </Box>
            {
                inventoryList ? (
                    inventoryList.filter(filter).map((item, index) => {
                        const inventoryData = item.items_inventario;
                        const name = item.sala;
                        const inventoryItemsRooms = {};
                        inventoryData.forEach((inventory) => {
                            const room = inventory.room;
                            if (!inventoryItemsRooms[room]) {
                                inventoryItemsRooms[room] = [];
                            }
                            inventoryItemsRooms[room].push(inventory);
                        });

                        return (
                            <ContentContainer key={`${item}-${index}`}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 4,
                                        "&:hover": {
                                            opacity: 0.8,
                                            cursor: 'pointer'
                                        }
                                    }}
                                    onClick={() => toggleGridTable(index)}
                                >
                                    <Box>
                                        <Text bold>{name}</Text>
                                        <Text small>{item?.andar}</Text>
                                    </Box>
                                    <Box
                                        sx={{
                                            ...styles.menuIcon,
                                            backgroundImage: `url(${icons.gray_arrow_down})`,
                                            transform: showInventoryTable[index] ? 'rotate(0)' : 'rotate(-90deg)',
                                            transition: '.3s',
                                            width: 17,
                                            height: 17
                                        }}
                                    />
                                </Box>
                                {showInventoryTable[index] && (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {Object.entries(inventoryItemsRooms).map(([room, inventoryItems]) => (
                                            <Box key={`room-${room}`}>
                                                <Table_V1
                                                    data={inventoryItems}
                                                    columns={column}
                                                    columnId={'id_inventario_item'}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </ContentContainer>
                        );
                    })
                ) : (
                    <Text>Não encontrei disciplinas vinculadas a grade</Text>
                )
            }
        </>
    )
}

const styles = {
    menuIcon: {
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: 20,
        height: 20,
    }
}

export const TableResume = (props) => {
    const {
        roomSelected,
        setRoomSelected,
        inventoryList = [],
        rooms
    } = props

    const { setLoading, colorPalette } = useAppContext()


    return (
        <ContentContainer sx={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Text bold style={{ color: colorPalette.buttonColor }}>Resumo de ativos por sala</Text>
            </Box>
            <SelectList fullWidth data={rooms} valueSelection={roomSelected} onSelect={(value) => setRoomSelected(value)}
                title="Sala de aula" filterOpition="value" sx={{ color: colorPalette.textColor, flex: 1 }}
                inputStyle={{ color: colorPalette.textColor, fontSize: '15px', fontFamily: 'MetropolisBold' }}
            />
            {roomSelected &&
                <Box>
                    {
                        inventoryList?.filter(item => item.id_sala === roomSelected).map((item, index) => {
                            const inventoryData = item.items_inventario;
                            const itemCountByType = {};

                            inventoryData.forEach(inventory => {
                                const activeType = inventory.tipo_ativo;
                                if (itemCountByType[activeType]) {
                                    itemCountByType[activeType]++;
                                } else {
                                    itemCountByType[activeType] = 1;
                                }
                            })

                            return (
                                <div style={{ borderRadius: '8px', overflow: 'hidden', marginTop: '10px', border: `1px solid ${colorPalette.textColor}` }} key={index}>
                                    <table key={`${index}-${item}`} style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: colorPalette.buttonColor, color: '#fff', }}>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Ativo</th>
                                                <th style={{ padding: '8px 10px', fontFamily: 'MetropolisBold' }}>Quantidade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(itemCountByType).map(([tipoAtivo, count]) => (
                                                <tr key={tipoAtivo}>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor }}>{tipoAtivo}</td>
                                                    <td style={{ padding: '8px 10px', fontFamily: 'MetropolisRegular', color: colorPalette.textColor, textAlign: 'center' }}>{count}</td>
                                                </tr>
                                            ))}
                                            {Object.keys(itemCountByType).length === 0 && (
                                                <tr>
                                                    <td colSpan="2" style={{ textAlign: 'center', padding: '8px', border: '1px solid gray' }}>Essa sala não possui ativos</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        })
                    }
                    {inventoryList?.filter(item => item.id_sala === roomSelected).length === 0 && (
                        <Text small>Essa sala não possui ativos</Text>
                    )}
                </Box >
            }
        </ContentContainer >
    )
}
