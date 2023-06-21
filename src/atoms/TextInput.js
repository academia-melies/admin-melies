import { TextField } from "@mui/material";
import { Colors } from "../organisms";


export const TextInput = (props) => {

   const { InputProps = {}, label = '', InputLabelProps = {} } = props;

   return (
      <TextField label={label}
         {...props}
         InputProps={{
            sx: { borderRadius: 2, fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' }, fontFamily: 'InterRegular',  ...InputProps?.style }
         }}
         InputLabelProps={{ 
            sx: { color: '#888' , fontSize: { xs: '14px', xm: '15px', md: '15px', lg: '15px' }, ...InputLabelProps?.style} 
         }}
      />
   )
}