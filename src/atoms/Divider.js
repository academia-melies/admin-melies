import { Box } from "./Box"

export const Divider = (props) => {

   const { distance = 1 } = props;

   return (
      <Box sx={{
         width: '100%',
         padding: `${8 * distance}px 0px`
      }}>
         <Box sx={{
            width: '100%',
            height: `1px`,
            backgroundColor: '#eaeaea'
         }} />
      </Box>
   )
}