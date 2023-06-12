import { useTheme } from "@mui/system"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { api } from '../../api/api'
import { ContentContainer } from "../../atoms"
import { useAppContext } from "../../context/AppContext"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import { Colors, SectionHeader, Table } from "../../organisms"

export default function ListUsers(props) {

   const { setLoading, permissions = [] } = useAppContext()
   const router = useRouter()
   const { showPartnersOnly = false } = props;

   const [users, setUsers] = useState([])

   const theme = useTheme()
   const userIsAdmin = permissions.includes('Admin') || permissions.includes('Marketing');

   useEffect(() => { getUsers() }, [])

   const getUsers = async () => {
      setLoading(true)
      await api.get(`/user/list?showPartnersOnly=${showPartnersOnly}`)
         .then(response => {
            const { data } = response
            setUsers(data)
         })
         .catch(error => {
            console.log(error)
         })
         .finally(() => setLoading(false));
   }

   const tableContent = {
      header: [
         { text: 'Nome' },
         { text: 'Empresa' },
         { text: 'Ativo' }
      ],
      fields: [
         'name',
         'companyId.name',
         'active'
      ]
   }

   return (
      <>
         {userIsAdmin ?
            <>
               <SectionHeader
                  title={`Usuários (${users?.length})`}
                  newButton
                  newButtonAction={() => router.push(`/users/new?isPartner=${showPartnersOnly}`)}
               />
               <ContentContainer>
                  <Table data={users} tableContent={tableContent} to={'/users/'} />
               </ContentContainer>
            </>
            :
            <Forbidden />
         }
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