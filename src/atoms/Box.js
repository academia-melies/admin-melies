import { Box as MaterialBox } from '@mui/material'

export const Box = (props) => {

   const { children } = props;
   
   return (
      <MaterialBox {...props}>
         {children}
      </MaterialBox>
   )
}