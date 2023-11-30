import { Box, Text } from "../atoms"

export const Forbidden = () => {
   return (
      <>
         <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
         }}>
            <Text style={{ fontSize: 35, fontWeight: 900 }}>
               Desculpe
            </Text>
            <Text>
               A seção não foi encontrada ou você não possui autorização para acessa-la.
            </Text>
         </Box>
      </>
   )
}