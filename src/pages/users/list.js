import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Box, ContentContainer, Text } from "../../atoms"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { Colors, SearchBar, SectionHeader, Table_V1 } from "../../organisms"
import { api } from "../../api/api"

export default function ListUsers(props) {

   const [usersList, setUsers] = useState([])
   const [filterData, setFilterData] = useState('')

   const router = useRouter()
   const filter = (item) => item?.NOME?.toLowerCase().includes(filterData?.toLowerCase());
   const theme = useTheme()

   const getUsers = async () => {
      try {
         const response = await api.get('/users')

         console.log(response)
         // setUsers(data)
      } catch (error) {
         console.log(error)
      }
   }

   useEffect(() => {
      getUsers()
   }, [])


   const users = [
      {
         ID: '1',
         LOGIN: "marcus.silva",
         NOME: "Marcus Silva",
         EMAIL: "marcus.silva@outlook.com",
         NASCIMENTO: new Date("2000-01-01T02:00:00.000Z"),
         TELEFONE: "11961819664",
         PERFIL: "funcionario",
         CPF: "48028447864",
         NACIONALIDADE: "Brasileiro",
         ESTADO_CIVIL: "casado",
         CONJUGE: "Dallila-Almeida",
         EMAIL_CORPORATIVO: "marcus.silva@melies.com.br",
         DEPENDENTE: 1,
      },
      {
         ID: '2',
         LOGIN: "joao.silva",
         NOME: "João Silva",
         EMAIL: "joao.silva@outlook.com",
         NASCIMENTO: new Date('1995-11-01T02:00:00.000Z'),
         TELEFONE: "11961819668",
         PERFIL: "aluno",
         CPF: "50028447852",
         NACIONALIDADE: "Brasileiro",
         ESTADO_CIVIL: "Soleiro",
         CONJUGE: "",
         EMAIL_CORPORATIVO: "joao.silva@melies.com.br",
         DEPENDENTE: 0,
      }
   ]

   const column = [
      { key: 'ID', label: 'ID' },
      { key: 'NOME', label: 'Nome' },
      { key: 'EMAIL', label: 'E-mail' },
      { key: 'TELEFONE', label: 'Telefone' },
      { key: 'PERFIL', label: 'Perfil' },
      { key: 'CPF', label: 'CPF' },
      { key: 'NASCIMENTO', label: 'Nascimento' },
      { key: 'NACIONALIDADE', label: 'Nascionalidade' },
      { key: 'ESTADO_CIVIL', label: 'Estado Civil' },
      { key: 'CONJUGE', label: 'Conjuge' },
      { key: 'EMAIL_CORPORATIVO', label: 'Email Meliés' },
      { key: 'DEPENDENTE', label: 'Dependente' },

   ];

   return (
      <>
         <SectionHeader
            title={`Usuários (${users.length})`}
            newButton
            newButtonAction={() => router.push(`/users/new`)}
         />
         <Box>
            <Text secundary bold style={{ margin: '0px 5px 5px 5px', }}>Buscar por usuario: </Text>
            <SearchBar placeholder='João, Robert, Renato, etc.' style={{ padding: '15px' }} onChange={setFilterData} />
         </Box>
         <Table_V1 data={users?.filter(filter)} columns={column} />
      </>
   )
}

const styles = {
   contentContainer: {
      display: "flex",
      textAlign: 'center',
      justifyContent: 'space-around',
      backgroundColor: Colors.backgroundPrimary,
      padding: 8
   },
   bodyContainer: {
      width: '100%',
   },
   title: {
      width: '50%'
   },
}