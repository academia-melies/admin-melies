import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, Text } from "../../../atoms"
import { SearchBar, SectionHeader, Table_V1 } from "../../../organisms"
import { api } from "../../../api/api"
import { useAppContext } from "../../../context/AppContext"
import { SelectList } from "../../../organisms/select/SelectList"

export default function ListPriceCourses(props) {
    const [pricesCourseList, setPricesCourseList] = useState([])
    const [filterData, setFilterData] = useState('')
    const { setLoading, colorPalette } = useAppContext()
    const [filterAtive, setFilterAtive] = useState('todos')
    const router = useRouter()
    const pathname = router.pathname === '/' ? null : router.asPath.split('/')[2]
    const filter = (item) => {
        if (filterAtive === 'todos') {
            return item?.curso?.toLowerCase().includes(filterData?.toLowerCase());
        } else {
            return item?.ativo === filterAtive && (item?.curso?.toLowerCase().includes(filterData?.toLowerCase()));
        }
    };

    useEffect(() => {
        getPricesCourse();
    }, []);

    const getPricesCourse = async () => {
        setLoading(true)
        try {
            const response = await api.get('/coursePrices')
            const { data } = response;
            let pricesFormatted = data?.map(item => ({
                ...item,
                valor_total_curso: formatter.format(item.valor_total_curso),
                valor_parcelado_curso: formatter.format(item.valor_parcelado_curso),
                valor_avista_curso: formatter.format(item.valor_avista_curso),
            }));

            setPricesCourseList(pricesFormatted)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const column = [
        { key: 'id_valor_curso', label: 'ID' },
        { key: 'nivel_curso', label: 'Nível' },
        { key: 'curso', label: 'Curso' },
        { key: 'modalidade_curso', label: '-' },
        { key: 'valor_total_curso', label: 'Valor Total' },
        { key: 'n_parcelas', label: 'Parcelas' },
        { key: 'valor_parcelado_curso', label: 'Valor parcelado' },
        { key: 'valor_avista_curso', label: 'á vista (desconto 5%)' }
    ];

    const listAtivo = [
        { label: 'Todos', value: 'todos' },
        { label: 'ativo', value: 1 },
        { label: 'inativo', value: 0 },
    ]

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <>
            <SectionHeader
                title={`Valores dos Cursos (${pricesCourseList.filter(filter)?.length || '0'})`}
                newButton
                newButtonAction={() => router.push(`/financial/${pathname}/new`)}
            />
            <Text bold>Buscar por: </Text>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center', flexDirection: 'row' }}>
                <SearchBar placeholder='Artes visuais, Desenvolvimento de Games ...' style={{ padding: '15px', }} onChange={setFilterData} />
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
            {pricesCourseList.length > 0 ?
                <Table_V1 data={pricesCourseList?.filter(filter)} columns={column} columnId={'id_valor_curso'} />
                :
                <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', padding: '80px 40px 0px 0px' }}>
                    <Text bold>Não conseguimos encontrar Valores cadastrados</Text>
                </Box>
            }
        </>
    )
}
